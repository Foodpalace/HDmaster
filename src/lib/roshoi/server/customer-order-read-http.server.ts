import { ensureWorkspace } from "@/lib/roshoi/server/workspace.server";
import { requirePermission } from "@/lib/roshoi/rbac";
import { getSql } from "@/lib/db";

function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function serviceUserId(request: Request): string { const authorization = request.headers.get("authorization")?.trim(); const token = process.env.ROSHOI_SERVICE_TOKEN?.trim(); const userId = process.env.ROSHOI_SERVICE_USER_ID?.trim(); if (!token || !userId || authorization !== `Bearer ${token}`) throw new Error("Unauthorized"); return userId; }

export async function handleCustomerOrderReadHttp(request: Request): Promise<Response> {
  try {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    const ws = await ensureWorkspace(serviceUserId(request));
    requirePermission(ws.ctx, "modify_orders", { orgId: ws.ctx.orgId, cityId: ws.ctx.cityId });
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId")?.trim();
    const customerRef = url.searchParams.get("customerRef")?.trim();
    if (!orderId || !customerRef) return json({ error: "orderId and customerRef are required" }, 400);
    const sql = await getSql();
    const rows = await sql<{ id: string; public_id: string | null; status: string; payment_status: string; payment_method: string; total_paise: number; placed_at: string; data_mode: string; customer_ref: string; restaurant_id: string; restaurant_name: string; restaurant_slug: string; delivery_otp: string | null; delivery_address_json: string | null }>`
      select o.id, null::text as public_id, o.status, o.payment_status, o.payment_method, o.total_paise, o.placed_at::text, o.data_mode,
             c.display_ref as customer_ref, r.id as restaurant_id, r.name as restaurant_name, r.slug as restaurant_slug,
             o.delivery_otp, o.delivery_address_json
      from orders o join customers c on c.id=o.customer_id join restaurants r on r.id=o.restaurant_id
      where o.id=${orderId} and o.org_id=${ws.ctx.orgId} and c.display_ref=${customerRef} limit 1`;
    if (!rows[0]) return json({ data: null });
    const items = await sql<{ name: string; qty: number; unit_paise: number }>`select name, qty, unit_paise from order_items where order_id=${orderId} and org_id=${ws.ctx.orgId} order by id`;
    const events = await sql<{ to_status: string; created_at: string; note: string | null }>`select to_status, created_at::text, note from order_events where order_id=${orderId} and org_id=${ws.ctx.orgId} order by created_at`;
    return json({ data: { ...rows[0], items, events } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return json({ error: message, code: message === "Unauthorized" ? "UNAUTHORIZED" : "BAD_REQUEST" }, message === "Unauthorized" ? 401 : 400);
  }
}
