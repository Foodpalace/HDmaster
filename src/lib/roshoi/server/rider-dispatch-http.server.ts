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

/**
 * The rider app is a trusted server-to-server caller. Its public client never
 * gets the service token. The rider identity is therefore carried as a
 * server-added header and resolved to the HDmaster rider row; a query-string
 * rider id is deliberately not accepted.
 */
async function resolveRiderId(request: Request, orgId: string) {
  const riderUserId = request.headers.get("x-order-king-rider-user-id")?.trim();
  if (!riderUserId) throw new Error("Rider identity is required");
  const sql = await getSql();
  const rows = await sql<{ id: string }>`select id from riders where org_id=${orgId} and user_id=${riderUserId} and data_mode='PRODUCTION' and status in ('ACTIVE','ONLINE','BUSY') limit 1`;
  if (!rows[0]) throw new Error("Rider identity is not bound to an active LIVE rider");
  return rows[0].id;
}

export async function handleRiderOffersHttp(request: Request): Promise<Response> {
  try {
    const userId = serviceUserId(request);
    const ws = await ensureWorkspace(userId);
    requirePermission(ws.ctx, "modify_orders", { orgId: ws.ctx.orgId, cityId: ws.ctx.cityId });
    const riderId = await resolveRiderId(request, ws.ctx.orgId);
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
      with candidate as (
        select da.id as offer_id, da.order_id, da.rider_id
        from dispatch_assignments da
        join orders o on o.id=da.order_id
        join riders r on r.id=da.rider_id
        where da.id=${body.offerId}
          and da.org_id=${ws.ctx.orgId}
          and da.rider_id=${riderId}
          and da.status='OFFERED'
          and da.offered_at > now()-interval '30 seconds'
          and o.org_id=${ws.ctx.orgId}
          and o.data_mode='PRODUCTION'
          and o.status='READY'
          and o.rider_id is null
          and r.org_id=${ws.ctx.orgId}
          and r.data_mode='PRODUCTION'
          and r.status in ('ACTIVE','ONLINE','BUSY')
          and r.online=1
          and r.active_order_id is null
        for update of da, o, r
      ),
      order_claim as (
        update orders o set rider_id=c.rider_id, status='RIDER_ASSIGNED'
        from candidate c
        where o.id=c.order_id and o.org_id=${ws.ctx.orgId} and o.data_mode='PRODUCTION' and o.status='READY' and o.rider_id is null
        returning o.id, c.rider_id, c.offer_id
      ),
      rider_claim as (
        update riders r set active_order_id=oc.id
        from order_claim oc
        where r.id=oc.rider_id and r.org_id=${ws.ctx.orgId} and r.data_mode='PRODUCTION' and r.online=1 and r.active_order_id is null
        returning r.id, oc.id as order_id, oc.offer_id
      ),
      assignment_claim as (
        update dispatch_assignments da set status='ACCEPTED', responded_at=now()
        from rider_claim rc
        where da.id=rc.offer_id and da.org_id=${ws.ctx.orgId} and da.rider_id=${riderId} and da.status='OFFERED'
        returning da.order_id
      )
      select order_id from assignment_claim`;
    if (!accepted[0]) return json({ error: "Offer is no longer available or rider/order was already claimed", code: "OFFER_GONE" }, 409);

    const orderId = accepted[0].order_id;
    await sql`insert into order_events (id,org_id,order_id,actor_employee_id,from_status,to_status,action,note) values (${nid("ev")},${ws.ctx.orgId},${orderId},${ws.ctx.employeeId},'READY','RIDER_ASSIGNED','rider.offer_accepted',${body.reason ?? null})`;
    const result = { offerId: body.offerId, orderId, riderId, decision: "ACCEPT" as const, status: "ACCEPTED" };
    await sql`insert into idempotency_keys (key,org_id,employee_id,action,response_json) values (${idempotencyKey},${ws.ctx.orgId},${ws.ctx.employeeId},'rider.offer_accept',${JSON.stringify(result)}) on conflict (key) do nothing`;
    return json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return json({ error: message, code: message === "Unauthorized" ? "UNAUTHORIZED" : "BAD_REQUEST" }, message === "Unauthorized" ? 401 : 400);
  }
}
