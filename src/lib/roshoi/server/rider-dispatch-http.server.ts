import { ensureWorkspace, nid } from "@/lib/roshoi/server/workspace.server";
import { requirePermission } from "@/lib/roshoi/rbac";
import { getSql } from "@/lib/db";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

function serviceUserId(request: Request): string {
  const authorization = request.headers.get("authorization")?.trim();
  const token = process.env.ROSHOI_SERVICE_TOKEN?.trim();
  const userId = process.env.ROSHOI_SERVICE_USER_ID?.trim();
  if (!token || !userId || authorization !== `Bearer ${token}`) throw new Error("Unauthorized");
  return userId;
}

export async function handleRiderOffersHttp(request: Request): Promise<Response> {
  try {
    const userId = serviceUserId(request);
    const ws = await ensureWorkspace(userId);
    requirePermission(ws.ctx, "modify_orders", { orgId: ws.ctx.orgId, cityId: ws.ctx.cityId });
    const url = new URL(request.url);
    const riderId = url.searchParams.get("riderId")?.trim();
    if (!riderId) return json({ error: "riderId is required" }, 400);
    const sql = await getSql();

    if (request.method === "GET") {
      const rows = await sql<{ id: string; order_id: string; score: number; distance_m: number | null; eta_seconds: number | null; offered_at: string; expires_at: string; restaurant_name: string; restaurant_address: string; zone_name: string; total_paise: number }>`
        select da.id, da.order_id, da.score, da.distance_m, da.eta_seconds, da.offered_at::text, (da.offered_at + interval '30 seconds')::text as expires_at,
               r.name as restaurant_name, r.address as restaurant_address, z.name as zone_name, o.total_paise
        from dispatch_assignments da join orders o on o.id=da.order_id join restaurants r on r.id=o.restaurant_id join zones z on z.id=o.zone_id
        where da.org_id=${ws.ctx.orgId} and da.rider_id=${riderId} and da.status='OFFERED' and o.data_mode='PRODUCTION' and o.status='READY'
          and da.offered_at > now() - interval '30 seconds' order by da.offered_at desc limit 5`;
      return json({ data: rows });
    }

    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
    if (!idempotencyKey || idempotencyKey.length < 8) return json({ error: "Idempotency-Key is required" }, 400);
    const body = (await request.json()) as { offerId: string; decision: "ACCEPT" | "DECLINE"; reason?: string };
    if (!body.offerId || !body.decision) return json({ error: "offerId and decision are required" }, 400);
    const existing = await sql<{ response_json: string }>`select response_json from idempotency_keys where key=${idempotencyKey} and org_id=${ws.ctx.orgId} limit 1`;
    if (existing[0]) return json({ data: JSON.parse(existing[0].response_json) });

    if (body.decision === "DECLINE") {
      const updated = await sql<{ id: string }>`update dispatch_assignments set status='DECLINED', responded_at=now() where id=${body.offerId} and org_id=${ws.ctx.orgId} and rider_id=${riderId} and status='OFFERED' returning id`;
      if (!updated[0]) return json({ error: "Offer is no longer available", code: "OFFER_GONE" }, 409);
      const result = { offerId: body.offerId, decision: "DECLINE" as const, status: "DECLINED" };
      await sql`insert into idempotency_keys (key,org_id,employee_id,action,response_json) values (${idempotencyKey},${ws.ctx.orgId},${ws.ctx.employeeId},'rider.offer_decline',${JSON.stringify(result)}) on conflict (key) do nothing`;
      return json({ data: result });
    }

    const accepted = await sql<{ order_id: string }>`
      with accepted as (
        update dispatch_assignments set status='ACCEPTED', responded_at=now()
        where id=${body.offerId} and org_id=${ws.ctx.orgId} and rider_id=${riderId} and status='OFFERED' and offered_at > now()-interval '30 seconds'
        returning order_id
      ),
      order_claim as (
        update orders o set rider_id=${riderId}, status='RIDER_ASSIGNED'
        from accepted a join riders r on r.id=${riderId} and r.org_id=${ws.ctx.orgId} and r.data_mode='PRODUCTION' and r.online=1 and r.active_order_id is null
        where o.id=a.order_id and o.org_id=${ws.ctx.orgId} and o.data_mode='PRODUCTION' and o.status='READY'
        returning o.id
      )
      select order_id from accepted where exists (select 1 from order_claim)`;
    if (!accepted[0]) return json({ error: "Offer is no longer available or rider/order was already claimed", code: "OFFER_GONE" }, 409);

    const orderId = accepted[0].order_id;
    await sql`update riders set active_order_id=${orderId} where id=${riderId} and org_id=${ws.ctx.orgId} and data_mode='PRODUCTION' and online=1 and active_order_id is null`;
    await sql`insert into order_events (id,org_id,order_id,actor_employee_id,from_status,to_status,action,note) values (${nid("ev")},${ws.ctx.orgId},${orderId},${ws.ctx.employeeId},'READY','RIDER_ASSIGNED','rider.offer_accepted',${body.reason ?? null})`;
    const result = { offerId: body.offerId, orderId, decision: "ACCEPT" as const, status: "ACCEPTED" };
    await sql`insert into idempotency_keys (key,org_id,employee_id,action,response_json) values (${idempotencyKey},${ws.ctx.orgId},${ws.ctx.employeeId},'rider.offer_accept',${JSON.stringify(result)}) on conflict (key) do nothing`;
    return json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return json({ error: message, code: message === "Unauthorized" ? "UNAUTHORIZED" : "BAD_REQUEST" }, message === "Unauthorized" ? 401 : 400);
  }
}
