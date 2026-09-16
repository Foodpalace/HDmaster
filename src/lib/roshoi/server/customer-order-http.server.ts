import { requirePermission } from "@/lib/roshoi/rbac";
import { appendAudit, ensureWorkspace, nid } from "@/lib/roshoi/server/workspace.server";
import { getSql } from "@/lib/db";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function serviceUserId(request: Request): string {
  const authorization = request.headers.get("authorization")?.trim();
  const token = process.env.ROSHOI_SERVICE_TOKEN?.trim();
  const userId = process.env.ROSHOI_SERVICE_USER_ID?.trim();
  if (!token || !userId || authorization !== `Bearer ${token}`) throw new Error("Unauthorized");
  return userId;
}

type CustomerOrderInput = {
  customerRef: string;
  restaurantId: string;
  cityId: string;
  zoneId: string;
  paymentMethod: "COD" | "UPI_SANDBOX";
  foodPaise: number;
  restaurantDiscountPaise: number;
  platformDiscountPaise: number;
  deliveryFeePaise: number;
  serviceFeePaise: number;
  taxPaise: number;
  totalPaise: number;
  commissionPaise: number;
  address: { line1: string; area: string; landmark?: string; instructions?: string; label?: string; lat?: number; lng?: number };
  notes?: string;
  lines: { itemId: string; name: string; qty: number; unitPaise: number }[];
};

export async function handleCustomerOrderHttp(request: Request): Promise<Response> {
  try {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
    if (!idempotencyKey || idempotencyKey.length < 8) return json({ error: "Idempotency-Key is required", code: "IDEMPOTENCY_REQUIRED" }, 400);

    const userId = serviceUserId(request);
    const ws = await ensureWorkspace(userId);
    requirePermission(ws.ctx, "modify_orders", { orgId: ws.ctx.orgId, cityId: ws.ctx.cityId });
    const input = (await request.json()) as CustomerOrderInput;

    if (!input.customerRef || !input.restaurantId || !input.cityId || !input.zoneId || !input.lines?.length) {
      return json({ error: "customerRef, restaurantId, cityId, zoneId and lines are required", code: "INVALID_REQUEST" }, 400);
    }
    if (input.paymentMethod === "UPI_SANDBOX" && ws.dataMode === "PRODUCTION") {
      return json({ error: "Sandbox payment is not permitted in PRODUCTION", code: "PAYMENT_MODE_INVALID" }, 409);
    }
    if (input.totalPaise < 0 || input.foodPaise < 0 || input.lines.some((line) => line.qty <= 0 || line.unitPaise < 0)) {
      return json({ error: "Invalid monetary or quantity values", code: "INVALID_AMOUNT" }, 400);
    }

    const sql = await getSql();
    const duplicate = await sql<{ response_json: string }>`select response_json from idempotency_keys where key = ${idempotencyKey} and org_id = ${ws.ctx.orgId} limit 1`;
    if (duplicate[0]) return json({ data: JSON.parse(duplicate[0].response_json) });

    const restaurant = await sql<{ id: string; city_id: string; zone_id: string; status: string; data_mode: string; commission_bps: number }>`
      select id, city_id, zone_id, status, data_mode, commission_bps from restaurants where id = ${input.restaurantId} and org_id = ${ws.ctx.orgId} limit 1
    `;
    if (!restaurant[0]) return json({ error: "Restaurant not found", code: "RESTAURANT_NOT_FOUND" }, 404);
    if (restaurant[0].city_id !== input.cityId || restaurant[0].zone_id !== input.zoneId) return json({ error: "Restaurant serviceability mismatch", code: "SERVICEABILITY_MISMATCH" }, 409);
    if (!["ACTIVE", "OPEN"].includes(restaurant[0].status)) return json({ error: "Restaurant is not accepting orders", code: "RESTAURANT_UNAVAILABLE" }, 409);

    const menu = await sql<{ id: string; name: string; price_paise: number; available: number }[]>`select id, name, price_paise, available from menu_items where org_id = ${ws.ctx.orgId} and restaurant_id = ${input.restaurantId}`;
    const menuById = new Map(menu.map((item) => [item.id, item]));
    for (const line of input.lines) {
      const item = menuById.get(line.itemId);
      if (!item || !item.available) return json({ error: `Menu item unavailable: ${line.itemId}`, code: "MENU_ITEM_UNAVAILABLE" }, 409);
      if (item.price_paise !== line.unitPaise) return json({ error: `Menu price changed for ${item.name}; refresh the menu and retry`, code: "MENU_PRICE_CHANGED" }, 409);
    }

    const customerRows = await sql<{ id: string }>`select id from customers where org_id = ${ws.ctx.orgId} and display_ref = ${input.customerRef} limit 1`;
    let customerId = customerRows[0]?.id;
    if (!customerId) {
      customerId = nid("cus");
      await sql`insert into customers (id, org_id, city_id, display_ref, phone_masked, status, data_mode) values (${customerId}, ${ws.ctx.orgId}, ${input.cityId}, ${input.customerRef}, 'MASKED', 'ACTIVE', ${ws.dataMode})`;
    }

    const orderId = nid("ord");
    const paymentStatus = input.paymentMethod === "COD" ? "PENDING" : "AUTHORIZED_SANDBOX";
    const dataMode = ws.dataMode;
    await sql`insert into orders (id, org_id, city_id, zone_id, restaurant_id, customer_id, status, payment_status, payment_method, food_paise, restaurant_discount_paise, platform_discount_paise, delivery_fee_paise, service_fee_paise, tax_paise, total_paise, commission_paise, promised_at, placed_at, data_mode) values (${orderId}, ${ws.ctx.orgId}, ${input.cityId}, ${input.zoneId}, ${input.restaurantId}, ${customerId}, 'PENDING', ${paymentStatus}, ${input.paymentMethod}, ${input.foodPaise}, ${input.restaurantDiscountPaise}, ${input.platformDiscountPaise}, ${input.deliveryFeePaise}, ${input.serviceFeePaise}, ${input.taxPaise}, ${input.totalPaise}, ${input.commissionPaise}, now() + interval '45 minutes', now(), ${dataMode})`;

    for (const line of input.lines) {
      await sql`insert into order_items (id, org_id, order_id, menu_item_id, name, qty, unit_paise) values (${nid("oit")}, ${ws.ctx.orgId}, ${orderId}, ${line.itemId}, ${line.name}, ${line.qty}, ${line.unitPaise})`;
    }
    await sql`insert into order_events (id, org_id, order_id, actor_employee_id, from_status, to_status, action, note) values (${nid("ev")}, ${ws.ctx.orgId}, ${orderId}, ${ws.ctx.employeeId}, null, 'PENDING', 'customer.order_created', ${JSON.stringify({ customerRef: input.customerRef, address: input.address, notes: input.notes ?? null })})`;
    await appendAudit({ orgId: ws.ctx.orgId, employeeId: ws.ctx.employeeId, userId: ws.ctx.userId, roleKey: ws.ctx.actingRoleKey, action: "order.customer_created", targetType: "order", targetId: orderId, next: { status: "PENDING", customerId, restaurantId: input.restaurantId, dataMode }, reason: "Customer application order" });

    const result = { orderId, status: "PENDING", paymentStatus, totalPaise: input.totalPaise, dataMode };
    await sql`insert into idempotency_keys (key, org_id, employee_id, action, response_json) values (${idempotencyKey}, ${ws.ctx.orgId}, ${ws.ctx.employeeId}, 'order.customer_create', ${JSON.stringify(result)}) on conflict (key) do nothing`;
    return json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return json({ error: message, code: message === "Unauthorized" ? "UNAUTHORIZED" : "BAD_REQUEST" }, message === "Unauthorized" ? 401 : 400);
  }
}
