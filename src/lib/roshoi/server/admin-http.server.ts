import { requireUserId } from "@/lib/auth/verify.server";
import { ensureWorkspace, appendAudit, nid } from "@/lib/roshoi/server/workspace.server";
import { ForbiddenError, requirePermission } from "@/lib/roshoi/rbac";
import { assertCanonicalTransition, ORDER_CONTRACT_VERSION, type CanonicalOrderStatus } from "@/lib/roshoi/orders/canonical-contract";
import { getSql } from "@/lib/db";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function fail(err: unknown) {
  if (err instanceof ForbiddenError) return json({ error: err.message, code: "FORBIDDEN" }, 403);
  const message = err instanceof Error ? err.message : "Unexpected error";
  if (message === "Unauthorized") return json({ error: message, code: "UNAUTHORIZED" }, 401);
  return json({ error: message, code: "BAD_REQUEST" }, 400);
}

function splatOf(params: Record<string, string | undefined>): string {
  return (params._splat ?? params["$"] ?? Object.values(params)[0] ?? "").replace(/^\/+|\/+$/g, "");
}

async function resolveAdminUserId(request: Request): Promise<string> {
  const authorization = request.headers.get("authorization")?.trim();
  const configuredToken = process.env.ROSHOI_SERVICE_TOKEN?.trim();
  const configuredUserId = process.env.ROSHOI_SERVICE_USER_ID?.trim();
  if (configuredToken && configuredUserId && authorization === `Bearer ${configuredToken}`) return configuredUserId;
  return requireUserId();
}

async function transitionRestaurantOrder(
  ws: Awaited<ReturnType<typeof ensureWorkspace>>,
  input: {
    orderId: string;
    restaurantId: string;
    from: CanonicalOrderStatus;
    to: CanonicalOrderStatus;
    reason?: string;
    idempotencyKey: string;
    correlationId?: string;
  },
) {
  requirePermission(ws.ctx, "modify_orders", { orgId: ws.ctx.orgId, cityId: ws.ctx.cityId });
  assertCanonicalTransition({
    contractVersion: ORDER_CONTRACT_VERSION,
    orderId: input.orderId,
    from: input.from,
    to: input.to,
    actor: "restaurant",
    idempotencyKey: input.idempotencyKey,
    reason: input.reason,
    correlationId: input.correlationId,
  });
  if (input.to === "RESTAURANT_REJECTED" && (!input.reason || input.reason.trim().length < 3)) {
    throw new Error("Restaurant rejection requires a reason");
  }

  const sql = await getSql();
  const existing = await sql.query<{ response_json: string }>(
    `select response_json from idempotency_keys where key=$1 and org_id=$2 limit 1`,
    [input.idempotencyKey, ws.ctx.orgId],
  );
  if (existing[0]) {
    try {
      return JSON.parse(existing[0].response_json) as Record<string, unknown>;
    } catch {
      throw new Error("Stored idempotency response is corrupt");
    }
  }

  const orderRows = await sql.query<{
    id: string;
    status: CanonicalOrderStatus;
    restaurant_id: string;
    city_id: string;
    data_mode: string;
  }>(
    `select id, status, restaurant_id, city_id, data_mode from orders
     where id=$1 and org_id=$2 ${ws.ctx.cityId ? "and city_id=$3" : ""} limit 1`,
    ws.ctx.cityId ? [input.orderId, ws.ctx.orgId, ws.ctx.cityId] : [input.orderId, ws.ctx.orgId],
  );
  const order = orderRows[0];
  if (!order) throw new ForbiddenError("Order not found");
  if (order.restaurant_id !== input.restaurantId) throw new ForbiddenError("Restaurant isolation");
  if (order.status !== input.from) throw new Error(`Stale order state: expected ${input.from}, found ${order.status}`);

  const updated = await sql.query<{ id: string }>(
    `update orders set
       status=$4,
       reject_reason=case when $4='RESTAURANT_REJECTED' then $6 else reject_reason end,
       confirmed_at=case when $4='CONFIRMED' then now() else confirmed_at end,
       ready_at=case when $4='READY' then now() else ready_at end
     where id=$1 and org_id=$2 and restaurant_id=$3 and status=$5
     returning id`,
    [input.orderId, ws.ctx.orgId, input.restaurantId, input.to, input.from, input.reason ?? null],
  );
  if (!updated[0]) throw new Error("Order transition lost a concurrency race; retry with a fresh order state");

  await sql.query(
    `insert into order_events (id, org_id, order_id, actor_employee_id, from_status, to_status, action, note)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [nid("ev"), ws.ctx.orgId, input.orderId, ws.ctx.employeeId, input.from, input.to, `restaurant.${input.to.toLowerCase()}`, input.reason ?? null],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "order.restaurant_transition",
    targetType: "order",
    targetId: input.orderId,
    previous: { status: input.from, restaurantId: input.restaurantId },
    next: { status: input.to, actor: "restaurant" },
    reason: input.reason,
  });

  const result = {
    ok: true as const,
    contractVersion: ORDER_CONTRACT_VERSION,
    orderId: input.orderId,
    from: input.from,
    state: input.to,
    actor: "restaurant" as const,
    duplicate: false as const,
    dataMode: order.data_mode,
    dispatch: input.to === "READY" ? { status: "PENDING_MATCH" as const } : null,
  };
  await sql.query(
    `insert into idempotency_keys (key, org_id, employee_id, action, response_json)
     values ($1,$2,$3,$4,$5) on conflict (key) do nothing`,
    [input.idempotencyKey, ws.ctx.orgId, ws.ctx.employeeId, "order.restaurant_transition", JSON.stringify(result)],
  );
  return result;
}

export async function handleAdminHttp(
  request: Request,
  params: Record<string, string | undefined>,
): Promise<Response> {
  try {
    const userId = await resolveAdminUserId(request);
    const ws = await ensureWorkspace(userId);
    const q = await import("@/lib/roshoi/server/queries.server");
    const path = splatOf(params);
    const method = request.method.toUpperCase();
    const url = new URL(request.url);
    const idempotencyKey = request.headers.get("Idempotency-Key") ?? undefined;

    if (method === "GET" && path === "dashboard") return json({ data: await q.dashboardPayload(ws), label: "SIMULATED" });
    if (method === "GET" && path === "orders") {
      return json({ data: await q.listOrders(ws.ctx, {
        delayed: url.searchParams.get("delayed") === "1",
        status: url.searchParams.get("status") ?? undefined,
        cityId: url.searchParams.get("city") ?? undefined,
        minutes: url.searchParams.get("minutes") ? Number(url.searchParams.get("minutes")) : undefined,
      }) });
    }
    if (method === "GET" && path.startsWith("orders/")) return json({ data: await q.getOrder(ws.ctx, path.slice("orders/".length)) });
    if (method === "GET" && path === "restaurants") return json({ data: await q.listRestaurants(ws.ctx) });
    if (method === "GET" && path === "riders") return json({ data: await q.listRiders(ws.ctx) });
    if (method === "GET" && path === "customers") return json({ data: await q.listCustomers(ws.ctx) });
    if (method === "GET" && path.startsWith("customers/")) return json({ data: await q.getCustomer(ws.ctx, path.slice("customers/".length)) });
    if (method === "GET" && path === "support") return json({ data: await q.listTickets(ws.ctx) });
    if (method === "GET" && path === "analytics") return json({ data: await q.analyticsSeries(ws.ctx) });
    if (method === "GET" && path === "finance") return json({ data: { summary: await q.financeSummary(ws.ctx), profitability: await q.profitability(ws.ctx) } });
    if (method === "GET" && path === "settlements") return json({ data: await q.listSettlementBatches(ws.ctx, url.searchParams.get("party") === "RIDER" ? "RIDER" : "RESTAURANT") });
    if (method === "GET" && path === "audit") return json({ data: await q.listAudit(ws.ctx, url.searchParams.get("q") ?? undefined) });
    if (method === "GET" && path === "settings") return json({ data: await q.getSettings(ws.ctx) });
    if (method === "GET" && path === "feature-flags") return json({ data: await q.listFlags(ws.ctx) });
    if (method === "GET" && path === "branding") return json({ data: await q.getBranding(ws.ctx) });
    if (method === "GET" && path === "health") return json({ data: await q.systemHealth(ws.ctx) });
    if (method === "POST" && path === "ai") return json({ error: "Use the Command assistant surface for AI. HTTP AI is reserved for Window 5." }, 501);

    if (method === "POST" && /^orders\/.+\/transition$/.test(path)) {
      if (!idempotencyKey || idempotencyKey.length < 8) return json({ error: "Idempotency-Key header is required", code: "IDEMPOTENCY_REQUIRED" }, 400);
      const orderId = path.split("/")[1]!;
      const body = (await request.json()) as {
        restaurantId: string;
        from: CanonicalOrderStatus;
        to: CanonicalOrderStatus;
        reason?: string;
        correlationId?: string;
        contractVersion?: string;
      };
      if (body.contractVersion !== ORDER_CONTRACT_VERSION) return json({ error: "Unsupported order contract version", code: "CONTRACT_VERSION_UNSUPPORTED" }, 409);
      if (!body.restaurantId || !body.from || !body.to) return json({ error: "restaurantId, from and to are required", code: "INVALID_REQUEST" }, 400);
      return json({ data: await transitionRestaurantOrder(ws, { orderId, restaurantId: body.restaurantId, from: body.from, to: body.to, reason: body.reason, idempotencyKey, correlationId: body.correlationId }) });
    }

    if (method === "POST" && path === "dispatch/reassign") {
      const body = (await request.json()) as { orderId: string; riderId: string; reason: string };
      await q.interveneOrder(ws, { orderId: body.orderId, action: "assign_rider", riderId: body.riderId, reason: body.reason, idempotencyKey });
      return json({ ok: true, note: "Dispatch reassignment is a REQUEST to the core matcher. Applied locally in simulation only." });
    }
    if (method === "POST" && /^orders\/.+\/refund$/.test(path)) {
      const orderId = path.split("/")[1]!;
      const body = (await request.json()) as { reason: string; amountPaise?: number };
      await q.interveneOrder(ws, { orderId, action: "refund", reason: body.reason, amountPaise: body.amountPaise, idempotencyKey });
      return json({ ok: true, label: "SIMULATED" });
    }
    if (method === "POST" && /^orders\/.+\/cancel$/.test(path)) {
      const orderId = path.split("/")[1]!;
      const body = (await request.json()) as { reason: string };
      await q.interveneOrder(ws, { orderId, action: "cancel", reason: body.reason, idempotencyKey });
      return json({ ok: true, label: "SIMULATED" });
    }
    if (method === "POST" && path === "support") {
      const body = (await request.json()) as { id?: string; action: "assign" | "note" | "reply" | "resolve" | "reopen"; body?: string; resolutionCode?: string };
      if (!body.id) return json({ error: "Ticket id required" }, 400);
      await q.mutateTicket(ws, { ...body, id: body.id, idempotencyKey });
      return json({ ok: true });
    }
    if (method === "POST" && /^settlements\/.+\/approve$/.test(path)) {
      const id = path.split("/")[1]!;
      const body = (await request.json()) as { reason: string; decision?: "APPROVED" | "REJECTED" };
      const result = await q.approveSettlement(ws, id, body.decision ?? "APPROVED", body.reason);
      return json({ ok: true, note: result.note });
    }
    if (method === "PATCH" || method === "PUT" || method === "DELETE") {
      if (path.startsWith("audit")) return json({ error: "Audit log is append-only", code: "FORBIDDEN" }, 405);
    }
    return json({ error: "Not found", path: `/v1/admin/${path}` }, 404);
  } catch (err) {
    return fail(err);
  }
}