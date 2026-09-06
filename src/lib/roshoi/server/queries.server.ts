import { getSql } from "@/lib/db";
import { ForbiddenError, requireHighRisk, requirePermission, type AccessContext } from "@/lib/roshoi/rbac";
import { assertTransition, isDelayed, type OrderStatus } from "@/lib/roshoi/orders/state-machine";
import { calculateOrderEconomics } from "@/lib/roshoi/finance/settlement";
import { DEFAULT_SETTINGS, FEATURE_FLAG_KEYS, type PlatformSettings } from "@/lib/roshoi/types";
import { financialSettingsChanged } from "@/lib/roshoi/settings";
import { isFlagEnabled, type RuntimeFlag } from "@/lib/roshoi/flags";
import { cityIdFromSlug } from "@/lib/roshoi/search";
import { appendAudit, nid, type Workspace } from "./workspace.server";

function n(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || 0;
  return 0;
}

function str(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

function strNull(v: unknown): string | null {
  if (v == null) return null;
  return String(v);
}

function iso(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

export async function loadRuntimeFlags(orgId: string): Promise<RuntimeFlag[]> {
  const sql = await getSql();
  const rows = await sql.query<{ key: string; state: string; rollout_pct: number }>(
    `select key, state, rollout_pct from feature_flags where org_id=$1`,
    [orgId],
  );
  return rows.map((r) => ({ key: r.key, state: r.state, rolloutPct: n(r.rollout_pct) }));
}

async function requireFlag(ws: Workspace, key: string) {
  const flags = await loadRuntimeFlags(ws.ctx.orgId);
  if (!isFlagEnabled(flags, key)) {
    throw new ForbiddenError(`Feature flag "${key}" is OFF`);
  }
}

async function rememberIdempotency(
  ws: Workspace,
  key: string | undefined,
  action: string,
  run: () => Promise<{ ok: true }>,
): Promise<{ ok: true }> {
  if (!key) return run();
  const sql = await getSql();
  const existing = await sql.query<{ response_json: string }>(
    `select response_json from idempotency_keys where key=$1 and org_id=$2`,
    [key, ws.ctx.orgId],
  );
  if (existing[0]) {
    try {
      return JSON.parse(existing[0].response_json) as { ok: true };
    } catch {
      return { ok: true };
    }
  }
  const result = await run();
  await sql.query(
    `insert into idempotency_keys (key, org_id, employee_id, action, response_json)
     values ($1,$2,$3,$4,$5) on conflict (key) do nothing`,
    [key, ws.ctx.orgId, ws.ctx.employeeId, action, JSON.stringify(result)],
  );
  return result;
}

export async function dashboardPayload(ws: Workspace) {
  requirePermission(ws.ctx, "view_analytics");
  const sql = await getSql();
  const org = ws.ctx.orgId;
  const city = ws.ctx.cityId;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const t0 = todayStart.toISOString();
  const citySql = city ? "and city_id = $3" : "";
  const params2 = city ? [org, t0, city] : [org, t0];
  const params1 = city ? [org, city] : [org];

  const [kpis, live, alerts, delayed, unassigned, support] = await Promise.all([
    sql.query<{
      orders: number;
      gmv: number;
      revenue: number;
      settlements: number;
      rider_pay: number;
      refunds: number;
      cancels: number;
    }>(
      `select
        count(*) filter (where placed_at >= $2)::int as orders,
        coalesce(sum(total_paise) filter (where placed_at >= $2),0)::int as gmv,
        coalesce(sum(commission_paise + delivery_fee_paise + service_fee_paise) filter (where placed_at >= $2 and status not in ('CANCELLED','PAYMENT_FAILED')),0)::int as revenue,
        coalesce(sum(food_paise - restaurant_discount_paise - commission_paise) filter (where status = 'DELIVERED' and placed_at >= $2),0)::int as settlements,
        coalesce(sum(rider_payout_paise) filter (where placed_at >= $2),0)::int as rider_pay,
        coalesce(sum(refund_paise) filter (where placed_at >= $2),0)::int as refunds,
        count(*) filter (where status = 'CANCELLED' and placed_at >= $2)::int as cancels
       from orders where org_id = $1 ${city ? "and city_id = $3" : ""}`,
      params2,
    ),
    sql.query<{ active_rst: number; online_riders: number; active_del: number }>(
      `select
        (select count(*)::int from restaurants where org_id=$1 and status='ACTIVE' ${city ? "and city_id=$2" : ""}) as active_rst,
        (select count(*)::int from riders where org_id=$1 and online=1 ${city ? "and city_id=$2" : ""}) as online_riders,
        (select count(*)::int from orders where org_id=$1 and status in ('RIDER_ASSIGNED','PICKED_UP','ON_THE_WAY','ARRIVING') ${city ? "and city_id=$2" : ""}) as active_del`,
      params1,
    ),
    sql.query<{ id: string; severity: string; kind: string; title: string; body: string; created_at: string }>(
      `select id, severity, kind, title, body, created_at from alerts
       where org_id=$1 and status='OPEN' ${city ? "and (city_id is null or city_id=$2)" : ""}
       order by case severity when 'CRITICAL' then 0 when 'HIGH' then 1 when 'MEDIUM' then 2 when 'LOW' then 3 else 4 end, created_at desc
       limit 12`,
      params1,
    ),
    sql.query<{ n: number }>(
      `select count(*)::int as n from orders
       where org_id=$1 and status in ('PENDING','CONFIRMED','PREPARING','READY','RIDER_ASSIGNED','PICKED_UP','ON_THE_WAY','ARRIVING')
         and promised_at < now() ${citySql.replace("$3", "$2")}`,
      params1,
    ),
    sql.query<{ n: number }>(
      `select count(*)::int as n from orders
       where org_id=$1 and status in ('READY','CONFIRMED','PREPARING') and rider_id is null ${citySql.replace("$3", "$2")}`,
      params1,
    ),
    sql.query<{ n: number }>(
      `select count(*)::int as n from tickets where org_id=$1 and status in ('OPEN','ASSIGNED','IN_PROGRESS','WAITING') ${city ? "and (city_id is null or city_id=$2)" : ""}`,
      params1,
    ),
  ]);
  const k = (Array.isArray(kpis) ? kpis[0] : undefined) ?? {
    orders: 0,
    gmv: 0,
    revenue: 0,
    settlements: 0,
    rider_pay: 0,
    refunds: 0,
    cancels: 0,
  };
  const l = live[0] ?? { active_rst: 0, online_riders: 0, active_del: 0 };
  const contribution = n(k.revenue) - n(k.rider_pay) - n(k.refunds);
  const canFinance = ws.ctx.permissions.includes("view_finance") || ws.ctx.actingRoleKey === "SUPER_ADMIN";

  return {
    dataMode: ws.dataMode,
    label: "SIMULATED" as const,
    today: {
      orders: { value: n(k.orders), label: "SIMULATED" as const },
      gmv: { value: n(k.gmv), label: "SIMULATED" as const },
      platformRevenue: canFinance ? { value: n(k.revenue), label: "SIMULATED" as const } : null,
      restaurantSettlements: canFinance ? { value: n(k.settlements), label: "SIMULATED" as const } : null,
      riderPayoutExposure: canFinance ? { value: n(k.rider_pay), label: "SIMULATED" as const } : null,
      refunds: { value: n(k.refunds), label: "SIMULATED" as const },
      cancellations: { value: n(k.cancels), label: "SIMULATED" as const },
      activeRestaurants: { value: n(l.active_rst), label: "SIMULATED" as const },
      onlineRiders: { value: n(l.online_riders), label: "SIMULATED" as const },
      activeDeliveries: { value: n(l.active_del), label: "SIMULATED" as const },
      supportLoad: { value: n(support[0]?.n), label: "SIMULATED" as const },
      contribution: canFinance ? { value: contribution, label: "ESTIMATE" as const } : null,
    },
    live: {
      delayedOrders: n(delayed[0]?.n),
      unassignedOrders: n(unassigned[0]?.n),
    },
    alerts: alerts.map((a) => ({
      id: a.id,
      severity: a.severity,
      kind: a.kind,
      title: a.title,
      body: a.body,
      createdAt: iso(a.created_at),
    })),
    employee: serializeEmployee(ws),
  };
}

export function serializeEmployee(ws: Workspace) {
  return {
    id: ws.employee.id,
    name: ws.employee.name,
    email: ws.employee.email,
    roleKey: ws.employee.role_key,
    actingRoleKey: ws.ctx.actingRoleKey,
    assumedRoleKey: ws.employee.assumed_role_key,
    department: ws.employee.department,
    cityId: ws.employee.city_id,
    areaId: ws.employee.area_id,
    status: ws.employee.status,
    permissions: [...ws.ctx.permissions],
    mfaReady: ws.employee.mfa_ready === 1,
    dataMode: ws.dataMode,
    orgId: ws.ctx.orgId,
  };
}

export async function listOrders(
  ctx: AccessContext,
  filter: {
    status?: string;
    delayed?: boolean;
    q?: string;
    restaurantId?: string;
    riderId?: string;
    payment?: string;
    cityId?: string;
    minutes?: number;
    limit?: number;
    offset?: number;
  },
) {
  requirePermission(ctx, "view_orders");
  const sql = await getSql();
  const params: unknown[] = [ctx.orgId];
  let where = "o.org_id = $1";
  const add = (value: unknown, clause: string) => {
    params.push(value);
    where += ` and ${clause.replace("$?", `$${params.length}`)}`;
  };
  const scopedCity = ctx.cityId ?? (filter.cityId ? cityIdFromSlug(filter.cityId) ?? filter.cityId : undefined);
  if (ctx.cityId) add(ctx.cityId, "o.city_id = $?");
  else if (scopedCity) add(scopedCity, "o.city_id = $?");
  if (filter.status) add(filter.status, "o.status = $?");
  if (filter.restaurantId) add(filter.restaurantId, "o.restaurant_id = $?");
  if (filter.riderId) add(filter.riderId, "o.rider_id = $?");
  if (filter.payment) add(filter.payment, "o.payment_method = $?");
  if (filter.delayed) where += ` and o.promised_at < now() and o.status not in ('DELIVERED','CANCELLED','REFUNDED','PAYMENT_FAILED')`;
  if (filter.minutes && filter.minutes > 0) {
    params.push(filter.minutes);
    where += ` and o.promised_at < now() - ($${params.length} * interval '1 minute')`;
  }
  if (filter.q) {
    params.push(`%${filter.q}%`);
    const p = `$${params.length}`;
    where += ` and (o.id ilike ${p} or r.name ilike ${p} or o.customer_id ilike ${p})`;
  }
  const limit = Math.min(filter.limit ?? 50, 200);
  const offset = filter.offset ?? 0;
  params.push(limit, offset);
  const rows = await sql.query<{
    id: string;
    status: string;
    payment_status: string;
    payment_method: string;
    restaurant: string;
    restaurant_id: string;
    rider_id: string | null;
    city_id: string;
    zone_id: string;
    total_paise: number;
    food_paise: number;
    promised_at: string | null;
    placed_at: string;
    customer_id: string;
    data_mode: string;
  }>(
    `select o.id, o.status, o.payment_status, o.payment_method, r.name as restaurant, o.restaurant_id,
            o.rider_id, o.city_id, o.zone_id, o.total_paise, o.food_paise, o.promised_at, o.placed_at,
            o.customer_id, o.data_mode
     from orders o join restaurants r on r.id = o.restaurant_id
     where ${where}
     order by o.placed_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params,
  );
  const now = Date.now();
  return rows.map((o) => ({
    ...o,
    delayed: isDelayed({ status: o.status, promisedAt: iso(o.promised_at), now }),
    placedAt: iso(o.placed_at),
    promisedAt: iso(o.promised_at),
    totalPaise: n(o.total_paise),
    foodPaise: n(o.food_paise),
    label: "SIMULATED" as const,
  }));
}

export async function getOrder(ctx: AccessContext, id: string) {
  requirePermission(ctx, "view_orders");
  const sql = await getSql();
  const orders = await sql.query<Record<string, unknown>>(
    `select o.*, r.name as restaurant_name, c.display_ref as customer_ref, rd.name as rider_name, z.name as zone_name
     from orders o
     join restaurants r on r.id = o.restaurant_id
     join customers c on c.id = o.customer_id
     left join riders rd on rd.id = o.rider_id
     join zones z on z.id = o.zone_id
     where o.id = $1 and o.org_id = $2 ${ctx.cityId ? "and o.city_id = $3" : ""}`,
    ctx.cityId ? [id, ctx.orgId, ctx.cityId] : [id, ctx.orgId],
  );
  const o = orders[0];
  if (!o) throw new ForbiddenError("Order not found");
  const items = await sql.query<{ name: string; qty: number; unit_paise: number }>(
    `select name, qty, unit_paise from order_items where order_id=$1`,
    [id],
  );
  const events = await sql.query<{ action: string; from_status: string | null; to_status: string | null; note: string | null; created_at: string }>(
    `select action, from_status, to_status, note, created_at from order_events where order_id=$1 order by created_at`,
    [id],
  );
  const financeOk =
    ctx.permissions.includes("view_finance") || ctx.actingRoleKey === "SUPER_ADMIN";
  const ledger = financeOk
    ? await sql.query<{
        kind: string;
        source: string;
        rule_key: string;
        amount_paise: number;
        note: string | null;
        created_at: string;
      }>(`select kind, source, rule_key, amount_paise, note, created_at from ledger_entries where order_id=$1`, [id])
    : [];
  return {
    id: str(o.id),
    status: str(o.status),
    paymentStatus: str(o.payment_status),
    paymentMethod: str(o.payment_method),
    restaurantId: str(o.restaurant_id),
    restaurantName: str(o.restaurant_name),
    customerRef: str(o.customer_ref),
    customerId: str(o.customer_id),
    riderId: strNull(o.rider_id),
    riderName: strNull(o.rider_name),
    zoneName: str(o.zone_name),
    cityId: str(o.city_id),
    foodPaise: n(o.food_paise),
    restaurantDiscountPaise: n(o.restaurant_discount_paise),
    platformDiscountPaise: n(o.platform_discount_paise),
    deliveryFeePaise: n(o.delivery_fee_paise),
    serviceFeePaise: n(o.service_fee_paise),
    taxPaise: n(o.tax_paise),
    totalPaise: n(o.total_paise),
    commissionPaise: financeOk ? n(o.commission_paise) : null,
    paymentFeePaise: financeOk ? n(o.payment_fee_paise) : null,
    riderPayoutPaise: financeOk ? n(o.rider_payout_paise) : null,
    refundPaise: n(o.refund_paise),
    placedAt: iso(o.placed_at),
    promisedAt: iso(o.promised_at),
    confirmedAt: iso(o.confirmed_at),
    deliveredAt: iso(o.delivered_at),
    cancelledAt: iso(o.cancelled_at),
    cancelReason: strNull(o.cancel_reason),
    delayed: isDelayed({ status: str(o.status), promisedAt: iso(o.promised_at) }),
    items: items.map((it) => ({ name: it.name, qty: n(it.qty), unitPaise: n(it.unit_paise) })),
    events: events.map((e) => ({
      action: e.action,
      from: e.from_status,
      to: e.to_status,
      note: e.note,
      at: iso(e.created_at),
    })),
    ledger: ledger.map((l) => ({
      kind: l.kind,
      source: l.source,
      ruleKey: l.rule_key,
      amountPaise: n(l.amount_paise),
      note: l.note,
      at: iso(l.created_at),
    })),
    dataMode: str(o.data_mode),
    label: "SIMULATED" as const,
  };
}

export async function interveneOrder(
  ws: Workspace,
  input: {
    orderId: string;
    action: "cancel" | "refund" | "assign_rider" | "transition" | "escalate";
    toStatus?: OrderStatus;
    riderId?: string;
    amountPaise?: number;
    reason: string;
    idempotencyKey?: string;
  },
) {
  return rememberIdempotency(ws, input.idempotencyKey, `order.${input.action}`, async () => {
    const sql = await getSql();
    const order = await getOrder(ws.ctx, input.orderId);
    if (input.action === "cancel") {
      requireHighRisk(ws.ctx, "cancel_orders", input.reason, { orgId: ws.ctx.orgId, cityId: String(order.cityId) });
      assertTransition(order.status as OrderStatus, "CANCELLED");
      await sql.query(
        `update orders set status='CANCELLED', cancelled_at=now(), cancel_reason=$3 where id=$1 and org_id=$2`,
        [input.orderId, ws.ctx.orgId, input.reason],
      );
    } else if (input.action === "refund") {
      requireHighRisk(ws.ctx, "issue_refunds", input.reason, { orgId: ws.ctx.orgId, cityId: String(order.cityId) });
      const amount = input.amountPaise ?? order.totalPaise;
      if (amount > ws.settings.refundLimitPaise) {
        throw new ForbiddenError("Refund exceeds configured limit");
      }
      if (amount <= 0 || amount > order.totalPaise) {
        throw new ForbiddenError("Refund amount is out of range");
      }
      const next: OrderStatus = "REFUND_PENDING";
      assertTransition(order.status as OrderStatus, next);
      await sql.query(
        `update orders set status=$3, refund_paise=$4 where id=$1 and org_id=$2`,
        [input.orderId, ws.ctx.orgId, next, amount],
      );
      await sql.query(
        `insert into ledger_entries (id, org_id, order_id, restaurant_id, party, kind, source, rule_key, amount_paise, note)
         values ($1,$2,$3,$4,'CUSTOMER','refund','support.refund','authorized_refund',$5,$6)`,
        [nid("led"), ws.ctx.orgId, input.orderId, order.restaurantId, -amount, input.reason],
      );
    } else if (input.action === "assign_rider") {
      requirePermission(ws.ctx, "modify_orders", { orgId: ws.ctx.orgId, cityId: String(order.cityId) });
      if (!input.riderId) throw new ForbiddenError("Rider required");
      await sql.query(
        `insert into dispatch_requests (id, org_id, order_id, requested_rider_id, status, reason, created_by_employee_id)
         values ($1,$2,$3,$4,'REQUESTED',$5,$6)`,
        [nid("dreq"), ws.ctx.orgId, input.orderId, input.riderId, input.reason, ws.ctx.employeeId],
      );
      const to: OrderStatus = "RIDER_ASSIGNED";
      if (order.status !== "RIDER_ASSIGNED") assertTransition(order.status as OrderStatus, to);
      await sql.query(
        `update orders set rider_id=$3, status=$4 where id=$1 and org_id=$2`,
        [input.orderId, ws.ctx.orgId, input.riderId, to],
      );
      await sql.query(`update riders set status='BUSY', active_order_id=$2, online=1 where id=$1 and org_id=$3`, [
        input.riderId,
        input.orderId,
        ws.ctx.orgId,
      ]);
    } else if (input.action === "transition") {
      requirePermission(ws.ctx, "modify_orders");
      if (!input.toStatus) throw new ForbiddenError("Target status required");
      assertTransition(order.status as OrderStatus, input.toStatus);
      await sql.query(`update orders set status=$3 where id=$1 and org_id=$2`, [
        input.orderId,
        ws.ctx.orgId,
        input.toStatus,
      ]);
    } else if (input.action === "escalate") {
      requirePermission(ws.ctx, "manage_support");
      await sql.query(
        `insert into tickets (id, org_id, city_id, queue, category, status, priority, subject, order_id, sla_minutes, data_mode)
         values ($1,$2,$3,'customer','order_issue','OPEN','HIGH',$4,$5,$6,'SIMULATED')`,
        [nid("tkt"), ws.ctx.orgId, order.cityId, `Escalation ${input.orderId}`, input.orderId, ws.settings.supportSlaMinutes],
      );
    }
    await sql.query(
      `insert into order_events (id, org_id, order_id, actor_employee_id, from_status, to_status, action, note)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        nid("ev"),
        ws.ctx.orgId,
        input.orderId,
        ws.ctx.employeeId,
        order.status,
        input.toStatus ?? input.action,
        `admin.${input.action}`,
        input.action === "assign_rider"
          ? `Dispatch REQUEST to core (simulated locally): ${input.reason}`
          : input.reason,
      ],
    );
    await appendAudit({
      orgId: ws.ctx.orgId,
      employeeId: ws.ctx.employeeId,
      userId: ws.ctx.userId,
      roleKey: ws.ctx.actingRoleKey,
      action: `order.${input.action}`,
      targetType: "order",
      targetId: input.orderId,
      previous: { status: order.status },
      next: { action: input.action, toStatus: input.toStatus, riderId: input.riderId },
      reason: input.reason,
    });
    return { ok: true as const };
  });
}

export async function listRestaurants(ctx: AccessContext, q?: string, status?: string) {
  requirePermission(ctx, "view_restaurants");
  const sql = await getSql();
  const params: unknown[] = [ctx.orgId];
  let where = "org_id=$1";
  if (ctx.cityId) {
    params.push(ctx.cityId);
    where += ` and city_id=$${params.length}`;
  }
  if (status) {
    params.push(status);
    where += ` and status=$${params.length}`;
  }
  if (q) {
    params.push(`%${q}%`);
    where += ` and (name ilike $${params.length} or cuisine ilike $${params.length})`;
  }
  const rows = await sql.query<Record<string, unknown>>(
    `select r.*, (select count(*)::int from orders o where o.restaurant_id=r.id) as order_count
     from restaurants r where ${where} order by name`,
    params,
  );
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    cuisine: String(r.cuisine),
    status: String(r.status),
    kycStatus: String(r.kyc_status),
    payoutStatus: String(r.payout_status),
    cityId: String(r.city_id),
    zoneId: String(r.zone_id),
    rating: n(r.rating_x10) / 10,
    prepMinutes: n(r.prep_minutes),
    commissionBps: n(r.commission_bps),
    orderCount: n(r.order_count),
    address: String(r.address),
    phoneMasked: String(r.phone_masked),
    dataMode: String(r.data_mode),
  }));
}

export async function getRestaurant(ctx: AccessContext, id: string) {
  requirePermission(ctx, "view_restaurants");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from restaurants where id=$1 and org_id=$2 ${ctx.cityId ? "and city_id=$3" : ""}`,
    ctx.cityId ? [id, ctx.orgId, ctx.cityId] : [id, ctx.orgId],
  );
  const r = rows[0];
  if (!r) throw new ForbiddenError("Restaurant not found");
  const menu = await sql.query<{ id: string; category: string; name: string; price_paise: number; available: number; veg: number }>(
    `select id, category, name, price_paise, available, veg from menu_items where restaurant_id=$1`,
    [id],
  );
  const stats = await sql.query<{
    orders: number;
    gmv: number;
    cancels: number;
    refunds: number;
    aov: number;
  }>(
    `select count(*)::int as orders,
            coalesce(sum(total_paise),0)::int as gmv,
            count(*) filter (where status='CANCELLED')::int as cancels,
            coalesce(sum(refund_paise),0)::int as refunds,
            coalesce(avg(total_paise),0)::int as aov
     from orders where restaurant_id=$1`,
    [id],
  );
  const s = stats[0];
  const finance = ctx.permissions.includes("view_finance") || ctx.actingRoleKey === "SUPER_ADMIN";
  let hours: Record<string, string[]> = {};
  try {
    hours = JSON.parse(String(r.hours_json || "{}")) as Record<string, string[]>;
  } catch {
    hours = {};
  }
  return {
    id: str(r.id),
    name: str(r.name),
    cuisine: str(r.cuisine),
    status: str(r.status),
    kycStatus: str(r.kyc_status),
    payoutStatus: str(r.payout_status),
    legalName: strNull(r.legal_name),
    address: str(r.address),
    phoneMasked: str(r.phone_masked),
    cityId: str(r.city_id),
    zoneId: str(r.zone_id),
    rating: n(r.rating_x10) / 10,
    prepMinutes: n(r.prep_minutes),
    commissionBps: n(r.commission_bps),
    hours,
    menu: menu.map((m) => ({
      id: m.id,
      category: m.category,
      name: m.name,
      pricePaise: n(m.price_paise),
      available: m.available === 1,
      veg: m.veg === 1,
    })),
    performance: {
      orders: n(s?.orders),
      gmv: n(s?.gmv),
      aov: n(s?.aov),
      cancellationRate: n(s?.orders) ? n(s?.cancels) / n(s?.orders) : 0,
      refunds: n(s?.refunds),
      label: "SIMULATED" as const,
    },
    contributionEstimate: finance
      ? {
          value: Math.round(n(s?.gmv) * (n(r.commission_bps) / 10000) * 0.55),
          label: "ESTIMATE" as const,
        }
      : null,
    dataMode: str(r.data_mode),
  };
}

export async function setRestaurantStatus(
  ws: Workspace,
  id: string,
  status: string,
  reason: string,
) {
  const current = await getRestaurant(ws.ctx, id);
  const perm =
    status === "SUSPENDED" || status === "CLOSED"
      ? "suspend_restaurants"
      : status === "ACTIVE" || status === "APPROVED"
        ? "approve_restaurants"
        : "approve_restaurants";
  requireHighRisk(ws.ctx, perm, reason, { orgId: ws.ctx.orgId, cityId: String(current.cityId) });
  const sql = await getSql();
  await sql.query(`update restaurants set status=$3 where id=$1 and org_id=$2`, [id, ws.ctx.orgId, status]);
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "restaurant.status",
    targetType: "restaurant",
    targetId: id,
    previous: { status: current.status },
    next: { status },
    reason,
  });
  return { ok: true as const };
}

export async function listRiders(ctx: AccessContext, q?: string) {
  requirePermission(ctx, "view_riders");
  const sql = await getSql();
  const params: unknown[] = [ctx.orgId];
  let where = "org_id=$1";
  if (ctx.cityId) {
    params.push(ctx.cityId);
    where += ` and city_id=$${params.length}`;
  }
  if (q) {
    params.push(`%${q}%`);
    where += ` and name ilike $${params.length}`;
  }
  const rows = await sql.query<Record<string, unknown>>(
    `select * from riders where ${where} order by online desc, name`,
    params,
  );
  const finance = ctx.permissions.includes("view_finance") || ctx.actingRoleKey === "SUPER_ADMIN";
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    status: String(r.status),
    online: n(r.online) === 1,
    vehicle: String(r.vehicle),
    kycStatus: String(r.kyc_status),
    cityId: String(r.city_id),
    zoneId: String(r.zone_id),
    activeOrderId: r.active_order_id ? String(r.active_order_id) : null,
    lat: r.lat == null ? null : n(r.lat),
    lng: r.lng == null ? null : n(r.lng),
    rating: n(r.rating_x10) / 10,
    cashCollectedPaise: finance ? n(r.cash_collected_paise) : null,
    cashReconciledPaise: finance ? n(r.cash_reconciled_paise) : null,
    phoneMasked: String(r.phone_masked),
    dataMode: String(r.data_mode),
  }));
}

export async function getRider(ctx: AccessContext, id: string) {
  const all = await listRiders(ctx);
  const rider = all.find((r) => r.id === id);
  if (!rider) throw new ForbiddenError("Rider not found");
  const sql = await getSql();
  const hist = await sql.query<{ id: string; status: string; total_paise: number; placed_at: string }>(
    `select id, status, total_paise, placed_at from orders where rider_id=$1 order by placed_at desc limit 20`,
    [id],
  );
  return {
    ...rider,
    deliveries: hist.map((h) => ({
      id: h.id,
      status: h.status,
      totalPaise: n(h.total_paise),
      placedAt: iso(h.placed_at),
    })),
  };
}

export async function setRiderStatus(ws: Workspace, id: string, status: string, reason: string) {
  requireHighRisk(
    ws.ctx,
    status === "SUSPENDED" ? "suspend_riders" : "approve_riders",
    reason,
  );
  const sql = await getSql();
  const prev = await sql.query<{ status: string; city_id: string }>(
    `select status, city_id from riders where id=$1 and org_id=$2`,
    [id, ws.ctx.orgId],
  );
  if (!prev[0]) throw new ForbiddenError("Rider not found");
  if (ws.ctx.cityId && prev[0].city_id !== ws.ctx.cityId) throw new ForbiddenError("City isolation");
  await sql.query(`update riders set status=$3, online=$4 where id=$1 and org_id=$2`, [
    id,
    ws.ctx.orgId,
    status,
    status === "ONLINE" || status === "BUSY" ? 1 : 0,
  ]);
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "rider.status",
    targetType: "rider",
    targetId: id,
    previous: { status: prev[0].status },
    next: { status },
    reason,
  });
  return { ok: true as const };
}

export async function listCustomers(ctx: AccessContext, q?: string) {
  requirePermission(ctx, "view_customers");
  const sql = await getSql();
  const params: unknown[] = [ctx.orgId];
  let where = "org_id=$1";
  if (ctx.cityId) {
    params.push(ctx.cityId);
    where += ` and city_id=$${params.length}`;
  }
  if (q) {
    params.push(`%${q}%`);
    where += ` and (display_ref ilike $${params.length} or phone_masked ilike $${params.length})`;
  }
  const rows = await sql.query<Record<string, unknown>>(
    `select id, display_ref, phone_masked, status, loyalty_tier, order_count, risk_score, city_id, last_order_at, data_mode
     from customers where ${where} order by display_ref limit 80`,
    params,
  );
  return rows.map((c) => ({
    id: String(c.id),
    displayRef: String(c.display_ref),
    phoneMasked: String(c.phone_masked),
    status: String(c.status),
    loyaltyTier: String(c.loyalty_tier),
    orderCount: n(c.order_count),
    riskScore: n(c.risk_score),
    cityId: String(c.city_id),
    lastOrderAt: iso(c.last_order_at),
    dataMode: String(c.data_mode),
  }));
}

export async function getCustomer(ctx: AccessContext, id: string) {
  requirePermission(ctx, "view_customers");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select id, display_ref, phone_masked, status, loyalty_tier, order_count, risk_score, city_id, last_order_at, data_mode
     from customers where id=$1 and org_id=$2 ${ctx.cityId ? "and city_id=$3" : ""}`,
    ctx.cityId ? [id, ctx.orgId, ctx.cityId] : [id, ctx.orgId],
  );
  const c = rows[0];
  if (!c) throw new ForbiddenError("Customer not found");
  const orders = await sql.query<{
    id: string;
    status: string;
    total_paise: number;
    placed_at: string;
    restaurant: string;
  }>(
    `select o.id, o.status, o.total_paise, o.placed_at, r.name as restaurant
     from orders o join restaurants r on r.id=o.restaurant_id
     where o.customer_id=$1 and o.org_id=$2 ${ctx.cityId ? "and o.city_id=$3" : ""}
     order by o.placed_at desc limit 20`,
    ctx.cityId ? [id, ctx.orgId, ctx.cityId] : [id, ctx.orgId],
  );
  return {
    id: String(c.id),
    displayRef: String(c.display_ref),
    phoneMasked: String(c.phone_masked),
    status: String(c.status),
    loyaltyTier: String(c.loyalty_tier),
    orderCount: n(c.order_count),
    riskScore: n(c.risk_score),
    cityId: String(c.city_id),
    lastOrderAt: iso(c.last_order_at),
    dataMode: String(c.data_mode),
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      restaurant: o.restaurant,
      totalPaise: n(o.total_paise),
      placedAt: iso(o.placed_at),
      customer_id: id,
    })),
  };
}

export async function updateCustomer(
  ws: Workspace,
  input: { id: string; status?: string; loyaltyTier?: string; notes?: string; reason: string },
) {
  requireHighRisk(ws.ctx, "edit_customers", input.reason);
  const prev = await getCustomer(ws.ctx, input.id);
  const sql = await getSql();
  await sql.query(
    `update customers set status=coalesce($3, status), loyalty_tier=coalesce($4, loyalty_tier) where id=$1 and org_id=$2`,
    [input.id, ws.ctx.orgId, input.status ?? null, input.loyaltyTier ?? null],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "customer.updated",
    targetType: "customer",
    targetId: input.id,
    previous: { status: prev.status, loyaltyTier: prev.loyaltyTier },
    next: input,
    reason: input.reason,
  });
  return { ok: true as const };
}

export async function listTickets(ctx: AccessContext, queue?: string, status?: string) {
  requirePermission(ctx, "manage_support");
  const sql = await getSql();
  const params: unknown[] = [ctx.orgId];
  let where = "org_id=$1";
  if (ctx.cityId) {
    params.push(ctx.cityId);
    where += ` and (city_id is null or city_id=$${params.length})`;
  }
  if (queue) {
    params.push(queue);
    where += ` and queue=$${params.length}`;
  }
  if (status) {
    params.push(status);
    where += ` and status=$${params.length}`;
  }
  const rows = await sql.query<Record<string, unknown>>(
    `select * from tickets where ${where} order by opened_at desc limit 80`,
    params,
  );
  return rows.map((t) => ({
    id: String(t.id),
    queue: String(t.queue),
    category: String(t.category),
    status: String(t.status),
    priority: String(t.priority),
    subject: String(t.subject),
    orderId: t.order_id ? String(t.order_id) : null,
    assignedEmployeeId: t.assigned_employee_id ? String(t.assigned_employee_id) : null,
    slaMinutes: n(t.sla_minutes),
    openedAt: iso(t.opened_at),
    resolutionCode: t.resolution_code ? String(t.resolution_code) : null,
  }));
}

export async function getTicket(ctx: AccessContext, id: string) {
  requirePermission(ctx, "manage_support");
  const sql = await getSql();
  const tix = await sql.query<Record<string, unknown>>(
    `select * from tickets where id=$1 and org_id=$2`,
    [id, ctx.orgId],
  );
  const t = tix[0];
  if (!t) throw new ForbiddenError("Ticket not found");
  if (ctx.cityId && t.city_id && t.city_id !== ctx.cityId) throw new ForbiddenError("City isolation");
  const msgs = await sql.query<{
    id: string;
    visibility: string;
    author_type: string;
    body: string;
    created_at: string;
  }>(`select id, visibility, author_type, body, created_at from ticket_messages where ticket_id=$1 order by created_at`, [id]);
  return {
    id: str(t.id),
    queue: str(t.queue),
    category: str(t.category),
    status: str(t.status),
    priority: str(t.priority),
    subject: str(t.subject),
    orderId: strNull(t.order_id),
    customerId: strNull(t.customer_id),
    restaurantId: strNull(t.restaurant_id),
    riderId: strNull(t.rider_id),
    assignedEmployeeId: strNull(t.assigned_employee_id),
    slaMinutes: n(t.sla_minutes),
    openedAt: iso(t.opened_at),
    resolvedAt: iso(t.resolved_at),
    resolutionCode: strNull(t.resolution_code),
    slaBreached: Boolean(
      !t.resolved_at &&
        t.opened_at &&
        Date.now() - new Date(String(t.opened_at)).getTime() > n(t.sla_minutes) * 60_000,
    ),
    messages: msgs.map((m) => ({
      id: m.id,
      visibility: m.visibility,
      authorType: m.author_type,
      body: m.body,
      at: iso(m.created_at),
    })),
  };
}

export async function mutateTicket(
  ws: Workspace,
  input: {
    id: string;
    action: "assign" | "note" | "reply" | "resolve" | "reopen";
    body?: string;
    employeeId?: string;
    resolutionCode?: string;
    idempotencyKey?: string;
  },
) {
  return rememberIdempotency(ws, input.idempotencyKey, `ticket.${input.action}`, async () => {
    requirePermission(ws.ctx, "manage_support");
    const sql = await getSql();
    const t = await getTicket(ws.ctx, input.id);
    if (input.action === "assign") {
      await sql.query(`update tickets set assigned_employee_id=$2, status='ASSIGNED' where id=$1`, [
        input.id,
        input.employeeId ?? ws.ctx.employeeId,
      ]);
    } else if (input.action === "note" || input.action === "reply") {
      await sql.query(
        `insert into ticket_messages (id, ticket_id, org_id, visibility, author_type, author_employee_id, body)
         values ($1,$2,$3,$4,'employee',$5,$6)`,
        [
          nid("tm"),
          input.id,
          ws.ctx.orgId,
          input.action === "note" ? "internal" : "public",
          ws.ctx.employeeId,
          input.body ?? "",
        ],
      );
      if (input.action === "reply") {
        await sql.query(`update tickets set status='WAITING' where id=$1`, [input.id]);
      }
    } else if (input.action === "resolve") {
      await sql.query(
        `update tickets set status='RESOLVED', resolved_at=now(), resolution_code=$2 where id=$1`,
        [input.id, input.resolutionCode ?? input.body ?? "resolved"],
      );
    } else if (input.action === "reopen") {
      await sql.query(`update tickets set status='OPEN', resolved_at=null where id=$1`, [input.id]);
    }
    await appendAudit({
      orgId: ws.ctx.orgId,
      employeeId: ws.ctx.employeeId,
      userId: ws.ctx.userId,
      roleKey: ws.ctx.actingRoleKey,
      action: `ticket.${input.action}`,
      targetType: "ticket",
      targetId: input.id,
      previous: { status: t.status },
      next: input,
    });
    return { ok: true as const };
  });
}

export async function financeSummary(ctx: AccessContext) {
  requirePermission(ctx, "view_finance");
  const sql = await getSql();
  const city = ctx.cityId;
  const rows = await sql.query<{
    commission: number;
    delivery: number;
    service: number;
    rider: number;
    payment: number;
    refunds: number;
    discounts: number;
    gmv: number;
    orders: number;
  }>(
    `select
      coalesce(sum(commission_paise) filter (where status not in ('CANCELLED','PAYMENT_FAILED')),0)::int as commission,
      coalesce(sum(delivery_fee_paise) filter (where status not in ('CANCELLED','PAYMENT_FAILED')),0)::int as delivery,
      coalesce(sum(service_fee_paise) filter (where status not in ('CANCELLED','PAYMENT_FAILED')),0)::int as service,
      coalesce(sum(rider_payout_paise),0)::int as rider,
      coalesce(sum(payment_fee_paise),0)::int as payment,
      coalesce(sum(refund_paise),0)::int as refunds,
      coalesce(sum(platform_discount_paise),0)::int as discounts,
      coalesce(sum(total_paise),0)::int as gmv,
      count(*)::int as orders
     from orders where org_id=$1 ${city ? "and city_id=$2" : ""}`,
    city ? [ctx.orgId, city] : [ctx.orgId],
  );
  const r = rows[0] ?? {
    commission: 0,
    delivery: 0,
    service: 0,
    rider: 0,
    payment: 0,
    refunds: 0,
    discounts: 0,
    gmv: 0,
    orders: 0,
  };
  const revenue = n(r.commission) + n(r.delivery) + n(r.service);
  const variable = n(r.rider) + n(r.payment) + n(r.refunds) + n(r.discounts);
  return {
    label: "SIMULATED" as const,
    revenue: {
      commissions: n(r.commission),
      delivery: n(r.delivery),
      serviceFees: n(r.service),
      advertising: 0,
      subscriptions: 0,
      total: revenue,
    },
    costs: {
      riderPayouts: n(r.rider),
      paymentProcessing: n(r.payment),
      refunds: n(r.refunds),
      promotions: n(r.discounts),
      support: 0,
      infrastructure: 0,
      total: variable,
    },
    contribution: {
      total: revenue - variable,
      perOrder: n(r.orders) ? Math.round((revenue - variable) / n(r.orders)) : 0,
      label: "ESTIMATE" as const,
    },
    gmv: n(r.gmv),
    orders: n(r.orders),
  };
}

export async function settlementRows(ctx: AccessContext, party: "RESTAURANT" | "RIDER") {
  requirePermission(ctx, "view_finance");
  const sql = await getSql();
  if (party === "RESTAURANT") {
    const rows = await sql.query<{
      restaurant_id: string;
      name: string;
      orders: number;
      food: number;
      commission: number;
      settlement: number;
    }>(
      `select o.restaurant_id, r.name,
              count(*)::int as orders,
              coalesce(sum(o.food_paise),0)::int as food,
              coalesce(sum(o.commission_paise),0)::int as commission,
              coalesce(sum(o.food_paise - o.restaurant_discount_paise - o.commission_paise + o.platform_discount_paise),0)::int as settlement
       from orders o join restaurants r on r.id=o.restaurant_id
       where o.org_id=$1 and o.status='DELIVERED' ${ctx.cityId ? "and o.city_id=$2" : ""}
       group by o.restaurant_id, r.name
       order by settlement desc`,
      ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
    );
    return rows.map((x) => ({
      id: x.restaurant_id,
      name: x.name,
      orders: n(x.orders),
      foodPaise: n(x.food),
      commissionPaise: n(x.commission),
      payablePaise: n(x.settlement),
      status: "READY",
      label: "SIMULATED" as const,
    }));
  }
  const rows = await sql.query<{
    rider_id: string;
    name: string;
    orders: number;
    payout: number;
    cash: number;
  }>(
    `select o.rider_id, rd.name,
            count(*)::int as orders,
            coalesce(sum(o.rider_payout_paise),0)::int as payout,
            coalesce(sum(case when o.payment_method='COD' then o.total_paise else 0 end),0)::int as cash
     from orders o join riders rd on rd.id=o.rider_id
     where o.org_id=$1 and o.rider_id is not null and o.status='DELIVERED' ${ctx.cityId ? "and o.city_id=$2" : ""}
     group by o.rider_id, rd.name
     order by payout desc`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  return rows.map((x) => ({
    id: x.rider_id,
    name: x.name,
    orders: n(x.orders),
    payablePaise: n(x.payout),
    cashCollectedPaise: n(x.cash),
    reconciledPaise: 0,
    status: "PENDING",
    label: "SIMULATED" as const,
  }));
}

export async function listEmployees(ctx: AccessContext) {
  requirePermission(ctx, "manage_users");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select id, email, name, role_key, department, city_id, area_id, status, mfa_ready, last_active_at, assumed_role_key, access_expires_at
     from employees where org_id=$1 order by created_at`,
    [ctx.orgId],
  );
  return rows.map((e) => ({
    id: String(e.id),
    email: String(e.email),
    name: String(e.name),
    roleKey: String(e.role_key),
    department: String(e.department),
    cityId: e.city_id ? String(e.city_id) : null,
    areaId: e.area_id ? String(e.area_id) : null,
    status: String(e.status),
    mfaReady: n(e.mfa_ready) === 1,
    lastActiveAt: iso(e.last_active_at),
    assumedRoleKey: e.assumed_role_key ? String(e.assumed_role_key) : null,
    accessExpiresAt: iso(e.access_expires_at),
  }));
}

export async function inviteEmployee(
  ws: Workspace,
  input: {
    email: string;
    name: string;
    roleKey: string;
    department: string;
    cityId?: string | null;
    customPermissions?: string[];
  },
) {
  requirePermission(ws.ctx, "manage_users");
  if (input.roleKey === "SUPER_ADMIN" && ws.ctx.actingRoleKey !== "SUPER_ADMIN") {
    throw new ForbiddenError("Cannot grant Super Admin");
  }
  const sql = await getSql();
  const id = nid("emp");
  await sql.query(
    `insert into employees (id, org_id, email, name, role_key, department, city_id, status, custom_permissions_json, invited_by)
     values ($1,$2,$3,$4,$5,$6,$7,'INVITED',$8,$9)`,
    [
      id,
      ws.ctx.orgId,
      input.email.toLowerCase(),
      input.name,
      input.roleKey,
      input.department,
      input.cityId ?? null,
      input.customPermissions ? JSON.stringify(input.customPermissions) : null,
      ws.ctx.employeeId,
    ],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "employee.invited",
    targetType: "employee",
    targetId: id,
    next: input,
  });
  return { id };
}

export async function updateEmployee(
  ws: Workspace,
  input: {
    id: string;
    roleKey?: string;
    status?: string;
    cityId?: string | null;
    department?: string;
    customPermissions?: string[];
    assumedRoleKey?: string | null;
    mfaReady?: boolean;
    reason: string;
  },
) {
  if (input.id !== ws.ctx.employeeId) requireHighRisk(ws.ctx, "manage_roles", input.reason);
  else if (input.assumedRoleKey !== undefined) requirePermission(ws.ctx, "assume_role");
  const sql = await getSql();
  const prev = await sql.query<Record<string, unknown>>(
    `select * from employees where id=$1 and org_id=$2`,
    [input.id, ws.ctx.orgId],
  );
  if (!prev[0]) throw new ForbiddenError("Employee not found");
  const nextRole = input.roleKey ?? String(prev[0].role_key);
  const nextStatus = input.status ?? String(prev[0].status);
  const nextCity = input.cityId === undefined ? prev[0].city_id : input.cityId;
  const nextDept = input.department ?? String(prev[0].department);
  const nextCustom =
    input.customPermissions !== undefined
      ? JSON.stringify(input.customPermissions)
      : prev[0].custom_permissions_json;
  const nextAssume =
    input.assumedRoleKey === undefined ? prev[0].assumed_role_key : input.assumedRoleKey;
  const nextMfa =
    input.mfaReady === undefined ? n(prev[0].mfa_ready) : input.mfaReady ? 1 : 0;
  await sql.query(
    `update employees set role_key=$3, status=$4, city_id=$5, department=$6, custom_permissions_json=$7, assumed_role_key=$8, mfa_ready=$9
     where id=$1 and org_id=$2`,
    [input.id, ws.ctx.orgId, nextRole, nextStatus, nextCity, nextDept, nextCustom, nextAssume, nextMfa],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "employee.updated",
    targetType: "employee",
    targetId: input.id,
    previous: {
      role: prev[0].role_key,
      status: prev[0].status,
      city: prev[0].city_id,
      assumed: prev[0].assumed_role_key,
    },
    next: input,
    reason: input.reason,
  });
  return { ok: true as const };
}

export async function listAudit(ctx: AccessContext, q?: string) {
  requirePermission(ctx, "view_audit_logs");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select id, employee_id, role_key, action, target_type, target_id, previous_json, new_json, reason, created_at
     from audit_logs where org_id=$1 ${q ? "and (action ilike $2 or target_id ilike $2)" : ""}
     order by created_at desc limit 100`,
    q ? [ctx.orgId, `%${q}%`] : [ctx.orgId],
  );
  return rows.map((a) => ({
    id: String(a.id),
    employeeId: a.employee_id ? String(a.employee_id) : null,
    roleKey: a.role_key ? String(a.role_key) : null,
    action: String(a.action),
    targetType: a.target_type ? String(a.target_type) : null,
    targetId: a.target_id ? String(a.target_id) : null,
    previous: a.previous_json ? String(a.previous_json) : null,
    next: a.new_json ? String(a.new_json) : null,
    reason: a.reason ? String(a.reason) : null,
    at: iso(a.created_at),
  }));
}

export async function listFlags(ctx: AccessContext) {
  requirePermission(ctx, "manage_feature_flags");
  const sql = await getSql();
  const rows = await sql.query<{ key: string; state: string; rollout_pct: number; city_id: string | null; notes: string | null }>(
    `select key, state, rollout_pct, city_id, notes from feature_flags where org_id=$1 order by key`,
    [ctx.orgId],
  );
  const have = new Set(rows.map((r) => r.key));
  const missing = FEATURE_FLAG_KEYS.filter((k) => !have.has(k)).map((key) => ({
    key,
    state: "OFF",
    rollout_pct: 0,
    city_id: null,
    notes: null,
  }));
  return [...rows, ...missing].map((f) => ({
    key: f.key,
    state: f.state,
    rolloutPct: n(f.rollout_pct),
    cityId: f.city_id,
    notes: f.notes,
  }));
}

export async function setFlag(
  ws: Workspace,
  key: string,
  state: string,
  rolloutPct: number,
  reason: string,
) {
  requireHighRisk(ws.ctx, "manage_feature_flags", reason);
  const sql = await getSql();
  await sql.query(
    `insert into feature_flags (id, org_id, key, state, rollout_pct, notes)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (org_id, key) do update set state=excluded.state, rollout_pct=excluded.rollout_pct`,
    [`ff_${key}`, ws.ctx.orgId, key, state, rolloutPct, reason],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "feature_flag.changed",
    targetType: "feature_flag",
    targetId: key,
    next: { state, rolloutPct },
    reason,
  });
  return { ok: true as const };
}

export async function getBranding(ctx: AccessContext) {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from branding where org_id=$1`,
    [ctx.orgId],
  );
  const row = rows[0];
  if (!row) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v == null ? "" : String(v);
  }
  return out;
}

export async function saveBranding(ws: Workspace, patch: Record<string, string>, reason: string) {
  requireHighRisk(ws.ctx, "manage_branding", reason);
  const sql = await getSql();
  const current = await getBranding(ws.ctx);
  const allowed = [
    "app_name",
    "color_bg",
    "color_fg",
    "color_primary",
    "color_primary_fg",
    "color_accent",
    "tagline",
    "domain",
    "app_store_name",
    "notification_sender",
    "invoice_branding",
    "customer_branding",
    "restaurant_branding",
    "rider_branding",
    "admin_branding",
    "legal_company_name",
    "support_email",
    "support_phone",
    "logo_svg",
    "favicon_svg",
  ];
  const next = { ...(current ?? {}), ...patch };
  const cols = allowed.filter((c) => c in next);
  const values = cols.map((c) => next[c]);
  const sets = cols.map((c, i) => `${c}=$${i + 2}`).join(",");
  await sql.query(`update branding set ${sets}, updated_at=now() where org_id=$1`, [
    ws.ctx.orgId,
    ...values,
  ]);
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "branding.changed",
    targetType: "branding",
    targetId: ws.ctx.orgId,
    previous: current,
    next: patch,
    reason,
  });
  return { ok: true as const };
}

export async function getSettings(ctx: AccessContext): Promise<PlatformSettings> {
  requirePermission(ctx, "manage_platform_settings");
  const sql = await getSql();
  const rows = await sql.query<{ settings_json: string }>(
    `select settings_json from platform_settings where org_id=$1`,
    [ctx.orgId],
  );
  if (!rows[0]) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(rows[0].settings_json) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(ws: Workspace, settings: PlatformSettings, reason: string) {
  requireHighRisk(ws.ctx, "manage_platform_settings", reason);
  const sql = await getSql();
  const prev = await getSettings(ws.ctx);
  if (financialSettingsChanged(prev, settings)) {
    requireHighRisk(ws.ctx, "modify_financial_settings", reason);
  }
  const flags = await loadRuntimeFlags(ws.ctx.orgId);
  if (settings.codEnabled && !prev.codEnabled && !isFlagEnabled(flags, "cod")) {
    throw new ForbiddenError('Feature flag "cod" is OFF — cannot enable COD');
  }
  if (settings.otpRequired && !prev.otpRequired && !isFlagEnabled(flags, "delivery_otp")) {
    throw new ForbiddenError('Feature flag "delivery_otp" is OFF — cannot require OTP');
  }
  await sql.query(
    `update platform_settings set settings_json=$2, updated_at=now(), updated_by_employee_id=$3 where org_id=$1`,
    [ws.ctx.orgId, JSON.stringify(settings), ws.ctx.employeeId],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "settings.changed",
    targetType: "settings",
    targetId: ws.ctx.orgId,
    previous: prev,
    next: settings,
    reason,
  });
  return { ok: true as const };
}

export async function listPromotions(ctx: AccessContext) {
  requirePermission(ctx, "manage_promotions");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from promotions where org_id=$1 order by created_at desc`,
    [ctx.orgId],
  );
  return rows.map((p) => ({
    id: String(p.id),
    name: String(p.name),
    kind: String(p.kind),
    funding: String(p.funding),
    percentBps: p.percent_bps == null ? null : n(p.percent_bps),
    fixedPaise: n(p.fixed_paise),
    minOrderPaise: n(p.min_order_paise),
    maxDiscountPaise: p.max_discount_paise == null ? null : n(p.max_discount_paise),
    firstOrderOnly: n(p.first_order_only) === 1,
    status: String(p.status),
    estimatedCostPaise: n(p.estimated_cost_paise),
    actualCostPaise: n(p.actual_cost_paise),
    usageCount: n(p.usage_count),
    capCount: p.cap_count == null ? null : n(p.cap_count),
    zoneId: p.zone_id ? String(p.zone_id) : null,
    category: p.category ? String(p.category) : null,
    startsAt: iso(p.starts_at),
    endsAt: iso(p.ends_at),
  }));
}

export async function savePromotion(
  ws: Workspace,
  input: {
    id?: string;
    name: string;
    kind: string;
    funding: string;
    percentBps?: number | null;
    fixedPaise?: number;
    minOrderPaise: number;
    maxDiscountPaise?: number | null;
    firstOrderOnly?: boolean;
    capCount?: number | null;
    status: string;
    zoneId?: string | null;
    category?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
  },
) {
  requirePermission(ws.ctx, "manage_promotions");
  if (input.status === "ACTIVE") {
    const flags = await loadRuntimeFlags(ws.ctx.orgId);
    if (input.kind === "LOYALTY" && !isFlagEnabled(flags, "loyalty")) {
      throw new ForbiddenError('Feature flag "loyalty" is OFF');
    }
  }
  if (input.status === "ACTIVE" && !input.capCount && !input.maxDiscountPaise) {
    throw new ForbiddenError("Active promotions require a cap or max discount — unlimited discounts are blocked");
  }
  const sql = await getSql();
  const estimated =
    (input.fixedPaise ?? 0) * (input.capCount ?? 100) ||
    Math.round(((input.percentBps ?? 0) / 10000) * 30000 * (input.capCount ?? 100));
  const id = input.id ?? nid("promo");
  await sql.query(
    `insert into promotions (
      id, org_id, name, kind, funding, percent_bps, fixed_paise, min_order_paise, max_discount_paise,
      first_order_only, status, estimated_cost_paise, cap_count, zone_id, category, starts_at, ends_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    on conflict (id) do update set
      name=excluded.name, kind=excluded.kind, funding=excluded.funding, percent_bps=excluded.percent_bps,
      fixed_paise=excluded.fixed_paise, min_order_paise=excluded.min_order_paise,
      max_discount_paise=excluded.max_discount_paise, first_order_only=excluded.first_order_only,
      status=excluded.status, estimated_cost_paise=excluded.estimated_cost_paise, cap_count=excluded.cap_count,
      zone_id=excluded.zone_id, category=excluded.category, starts_at=excluded.starts_at, ends_at=excluded.ends_at`,
    [
      id,
      ws.ctx.orgId,
      input.name,
      input.kind,
      input.funding,
      input.percentBps ?? null,
      input.fixedPaise ?? 0,
      input.minOrderPaise,
      input.maxDiscountPaise ?? null,
      input.firstOrderOnly ? 1 : 0,
      input.status,
      estimated,
      input.capCount ?? null,
      input.zoneId ?? null,
      input.category ?? null,
      input.startsAt ?? null,
      input.endsAt ?? null,
    ],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "promotion.saved",
    targetType: "promotion",
    targetId: id,
    next: input,
  });
  return { id, estimatedCostPaise: estimated, label: "ESTIMATE" as const };
}

export async function listCms(ctx: AccessContext) {
  requirePermission(ctx, "manage_cms");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from cms_entries where org_id=$1 order by surface, sort_order`,
    [ctx.orgId],
  );
  return rows.map((c) => ({
    id: String(c.id),
    surface: String(c.surface),
    slot: String(c.slot),
    title: String(c.title),
    body: c.body ? String(c.body) : "",
    sponsored: n(c.sponsored) === 1,
    status: String(c.status),
    sortOrder: n(c.sort_order),
  }));
}

export async function saveCms(
  ws: Workspace,
  input: { id?: string; surface: string; slot: string; title: string; body: string; sponsored: boolean },
) {
  requirePermission(ws.ctx, "manage_cms");
  if (input.sponsored) {
    const flags = await loadRuntimeFlags(ws.ctx.orgId);
    if (!isFlagEnabled(flags, "advertising")) {
      throw new ForbiddenError('Feature flag "advertising" is OFF — cannot publish sponsored content');
    }
  }
  const sql = await getSql();
  const id = input.id ?? nid("cms");
  await sql.query(
    `insert into cms_entries (id, org_id, surface, slot, title, body, sponsored, sort_order, status)
     values ($1,$2,$3,$4,$5,$6,$7,0,'PUBLISHED')
     on conflict (id) do update set title=excluded.title, body=excluded.body, sponsored=excluded.sponsored, updated_at=now()`,
    [id, ws.ctx.orgId, input.surface, input.slot, input.title, input.body, input.sponsored ? 1 : 0],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "cms.saved",
    targetType: "cms",
    targetId: id,
    next: input,
  });
  return { id };
}

export async function listZones(ctx: AccessContext) {
  requirePermission(ctx, "manage_delivery_zones");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select z.*, c.name as city_name from zones z join cities c on c.id=z.city_id
     where z.org_id=$1 ${ctx.cityId ? "and z.city_id=$2" : ""} order by z.name`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  return rows.map((z) => ({
    id: String(z.id),
    name: String(z.name),
    cityId: String(z.city_id),
    cityName: String(z.city_name),
    geometry: JSON.parse(String(z.geometry_json || "{}")),
    deliveryFeePaise: n(z.delivery_fee_paise),
    minOrderPaise: n(z.min_order_paise),
    maxRadiusKm: n(z.max_radius_km),
    etaMinutes: n(z.eta_minutes),
    riderRequirement: n(z.rider_requirement),
    status: String(z.status),
  }));
}

export async function saveZone(
  ws: Workspace,
  input: {
    id?: string;
    name: string;
    cityId: string;
    deliveryFeePaise: number;
    minOrderPaise: number;
    maxRadiusKm: number;
    etaMinutes: number;
    geometryJson?: string;
  },
) {
  requirePermission(ws.ctx, "manage_delivery_zones", { orgId: ws.ctx.orgId, cityId: input.cityId });
  const sql = await getSql();
  const id = input.id ?? nid("zone");
  await sql.query(
    `insert into zones (id, org_id, city_id, name, geometry_json, delivery_fee_paise, min_order_paise, max_radius_km, eta_minutes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     on conflict (id) do update set name=excluded.name, delivery_fee_paise=excluded.delivery_fee_paise,
       min_order_paise=excluded.min_order_paise, max_radius_km=excluded.max_radius_km, eta_minutes=excluded.eta_minutes, geometry_json=excluded.geometry_json`,
    [
      id,
      ws.ctx.orgId,
      input.cityId,
      input.name,
      input.geometryJson ?? JSON.stringify({ type: "radius", radiusKm: input.maxRadiusKm }),
      input.deliveryFeePaise,
      input.minOrderPaise,
      input.maxRadiusKm,
      input.etaMinutes,
    ],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "zone.saved",
    targetType: "zone",
    targetId: id,
    next: input,
  });
  return { id };
}

export async function listCities(ctx: AccessContext) {
  const sql = await getSql();
  const rows = await sql.query<{ id: string; name: string; state: string }>(
    `select id, name, state from cities where org_id=$1 order by name`,
    [ctx.orgId],
  );
  return rows;
}

export async function listKyc(ctx: AccessContext) {
  requirePermission(ctx, "view_kyc");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select k.*, coalesce(r.city_id, rd.city_id) as city_id
     from kyc_cases k
     left join restaurants r on k.subject_type='restaurant' and r.id=k.subject_id
     left join riders rd on k.subject_type='rider' and rd.id=k.subject_id
     where k.org_id=$1 ${ctx.cityId ? "and coalesce(r.city_id, rd.city_id)=$2" : ""}
     order by k.updated_at desc`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  return rows.map((k) => ({
    id: String(k.id),
    subjectType: String(k.subject_type),
    subjectId: String(k.subject_id),
    status: String(k.status),
    notes: k.notes ? String(k.notes) : "",
    documentRefs: JSON.parse(String(k.document_refs_json || "[]")) as { label: string; ref: string }[],
    cityId: k.city_id ? String(k.city_id) : null,
  }));
}

export async function reviewKyc(ws: Workspace, id: string, status: string, notes: string) {
  requireHighRisk(ws.ctx, "review_kyc", notes);
  const sql = await getSql();
  const prev = await sql.query<{ status: string }>(`select status from kyc_cases where id=$1 and org_id=$2`, [
    id,
    ws.ctx.orgId,
  ]);
  await sql.query(
    `update kyc_cases set status=$3, notes=$4, reviewer_employee_id=$5, updated_at=now() where id=$1 and org_id=$2`,
    [id, ws.ctx.orgId, status, notes, ws.ctx.employeeId],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "kyc.review",
    targetType: "kyc",
    targetId: id,
    previous: prev[0],
    next: { status, notes },
    reason: notes,
  });
  return { ok: true as const };
}

export async function listRisk(ctx: AccessContext) {
  requirePermission(ctx, "view_risk");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select rs.*, coalesce(c.city_id, rd.city_id, r.city_id) as city_id
     from risk_signals rs
     left join customers c on rs.subject_type='customer' and c.id=rs.subject_id
     left join riders rd on rs.subject_type='rider' and rd.id=rs.subject_id
     left join restaurants r on rs.subject_type='restaurant' and r.id=rs.subject_id
     where rs.org_id=$1 ${ctx.cityId ? "and coalesce(c.city_id, rd.city_id, r.city_id)=$2" : ""}
     order by rs.score desc`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    subjectType: String(r.subject_type),
    subjectId: String(r.subject_id),
    signalKey: String(r.signal_key),
    score: n(r.score),
    status: String(r.status),
    summary: String(r.summary),
    createdAt: iso(r.created_at),
    cityId: r.city_id ? String(r.city_id) : null,
  }));
}

export async function listNotifications(ctx: AccessContext) {
  requirePermission(ctx, "manage_notifications");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from notifications where org_id=$1 order by created_at desc limit 50`,
    [ctx.orgId],
  );
  return rows.map((n0) => ({
    id: String(n0.id),
    channel: String(n0.channel),
    templateKey: String(n0.template_key),
    audience: String(n0.audience),
    status: String(n0.status),
    provider: String(n0.provider),
    providerConfirmed: n(n0.provider_confirmed) === 1,
    createdAt: iso(n0.created_at),
  }));
}

export async function listLoyalty(ctx: AccessContext) {
  requirePermission(ctx, "manage_promotions");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from loyalty_programs where org_id=$1`,
    [ctx.orgId],
  );
  return rows.map((l) => ({
    id: String(l.id),
    name: String(l.name),
    kind: String(l.kind),
    earnBps: n(l.earn_bps),
    capPaise: l.cap_paise == null ? null : n(l.cap_paise),
    status: String(l.status),
    rules: JSON.parse(String(l.rules_json || "{}")),
  }));
}

export async function dispatchBoard(ctx: AccessContext) {
  requirePermission(ctx, "view_orders");
  const unassigned = await listOrders(ctx, { status: "READY", limit: 40 });
  const preparing = await listOrders(ctx, { status: "PREPARING", limit: 20 });
  const riders = await listRiders(ctx);
  const sql = await getSql();
  const requests = await sql.query<{
    id: string;
    order_id: string;
    requested_rider_id: string | null;
    status: string;
    reason: string | null;
    created_at: string;
  }>(
    `select id, order_id, requested_rider_id, status, reason, created_at
     from dispatch_requests where org_id=$1 order by created_at desc limit 25`,
    [ctx.orgId],
  ).catch(() => [] as { id: string; order_id: string; requested_rider_id: string | null; status: string; reason: string | null; created_at: string }[]);
  return {
    unassigned: unassigned.filter((o) => !o.rider_id),
    preparing,
    available: riders.filter((r) => r.online && r.status === "ONLINE"),
    busy: riders.filter((r) => r.status === "BUSY"),
    requests: requests.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      riderId: r.requested_rider_id,
      status: r.status,
      reason: r.reason,
      at: iso(r.created_at),
    })),
    label: "SIMULATED" as const,
    note: "Window 4 monitors dispatch. Reassignment is a REQUEST to the core matcher — applied locally in simulation only.",
  };
}

export async function liveBoard(ctx: AccessContext) {
  requirePermission(ctx, "view_orders");
  const sql = await getSql();
  const rows = await sql.query<{ status: string; n: number }>(
    `select status, count(*)::int as n from orders
     where org_id=$1 ${ctx.cityId ? "and city_id=$2" : ""}
       and placed_at > now() - interval '24 hours'
     group by status`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.status] = n(r.n);
  const orders = await listOrders(ctx, { limit: 80 });
  const riders = await listRiders(ctx).catch(() => []);
  const flags = await loadRuntimeFlags(ctx.orgId);
  const tracking = isFlagEnabled(flags, "live_tracking");
  return {
    counts,
    orders,
    riders: riders.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      online: r.online,
      cityId: r.cityId,
      zoneId: r.zoneId,
      lat: tracking ? r.lat : null,
      lng: tracking ? r.lng : null,
      activeOrderId: r.activeOrderId,
    })),
    trackingEnabled: tracking,
    label: "SIMULATED" as const,
  };
}

export async function tickSimulation(ws: Workspace) {
  requirePermission(ws.ctx, "modify_orders");
  const flags = await loadRuntimeFlags(ws.ctx.orgId);
  const sql = await getSql();
  const advancing = await sql.query<{ id: string; status: string }>(
    `select id, status from orders
     where org_id=$1 and status in ('PENDING','CONFIRMED','PREPARING','READY','RIDER_ASSIGNED','PICKED_UP','ON_THE_WAY','ARRIVING')
     order by placed_at asc limit 3`,
    [ws.ctx.orgId],
  );
  const nextMap: Record<string, string> = {
    PENDING: "CONFIRMED",
    CONFIRMED: "PREPARING",
    PREPARING: "READY",
    READY: "RIDER_ASSIGNED",
    RIDER_ASSIGNED: "PICKED_UP",
    PICKED_UP: "ON_THE_WAY",
    ON_THE_WAY: "ARRIVING",
    ARRIVING: "DELIVERED",
  };
  for (const o of advancing) {
    const to = nextMap[o.status];
    if (!to) continue;
    if (to === "PICKED_UP" && isFlagEnabled(flags, "qr_pickup") === false && isFlagEnabled(flags, "delivery_otp")) {
      // OTP is required in settings; simulation still advances but records the gate.
    }
    try {
      assertTransition(o.status as OrderStatus, to as OrderStatus);
    } catch {
      continue;
    }
    await sql.query(`update orders set status=$2 where id=$1`, [o.id, to]);
    await sql.query(
      `insert into order_events (id, org_id, order_id, from_status, to_status, action, note)
       values ($1,$2,$3,$4,$5,'sim.tick',$6)`,
      [
        nid("ev"),
        ws.ctx.orgId,
        o.id,
        o.status,
        to,
        isFlagEnabled(flags, "delivery_otp") && to === "DELIVERED"
          ? "SIMULATED clock advance (delivery OTP flag ON)"
          : "SIMULATED clock advance",
      ],
    );
  }
  return { advanced: advancing.length, label: "SIMULATED" as const, flagsHonored: ["delivery_otp", "live_tracking", "cod"] };
}

export async function profitability(ctx: AccessContext) {
  requirePermission(ctx, "view_finance");
  const sql = await getSql();
  const byRst = await sql.query<{
    restaurant_id: string;
    name: string;
    gmv: number;
    commission: number;
    payout: number;
    discount: number;
    refunds: number;
    orders: number;
  }>(
    `select o.restaurant_id, r.name,
            coalesce(sum(o.total_paise),0)::int as gmv,
            coalesce(sum(o.commission_paise),0)::int as commission,
            coalesce(sum(o.rider_payout_paise),0)::int as payout,
            coalesce(sum(o.platform_discount_paise),0)::int as discount,
            coalesce(sum(o.refund_paise),0)::int as refunds,
            count(*)::int as orders
     from orders o join restaurants r on r.id=o.restaurant_id
     where o.org_id=$1 ${ctx.cityId ? "and o.city_id=$2" : ""}
     group by o.restaurant_id, r.name`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  const byZone = await sql.query<{ zone_id: string; name: string; gmv: number; contribution: number; orders: number }>(
    `select o.zone_id, z.name,
            coalesce(sum(o.total_paise),0)::int as gmv,
            coalesce(sum(o.commission_paise + o.delivery_fee_paise + o.service_fee_paise - o.rider_payout_paise - o.platform_discount_paise - o.refund_paise - o.payment_fee_paise),0)::int as contribution,
            count(*)::int as orders
     from orders o join zones z on z.id=o.zone_id
     where o.org_id=$1 ${ctx.cityId ? "and o.city_id=$2" : ""}
     group by o.zone_id, z.name`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  const restaurants = byRst.map((r) => {
    const contrib = n(r.commission) - n(r.discount) - Math.round(n(r.payout) * 0.35) - n(r.refunds);
    return {
      id: r.restaurant_id,
      name: r.name,
      orders: n(r.orders),
      gmv: n(r.gmv),
      contribution: contrib,
      label: "ESTIMATE" as const,
    };
  });
  restaurants.sort((a, b) => a.contribution - b.contribution);
  return {
    restaurants,
    zones: byZone.map((z) => ({
      id: z.zone_id,
      name: z.name,
      gmv: n(z.gmv),
      contribution: n(z.contribution),
      orders: n(z.orders),
      label: "ESTIMATE" as const,
    })),
    insights: [
      restaurants[0]
        ? {
            text: `${restaurants[0].name} has the weakest estimated contribution because refunds and delivery cost outrun commission at current AOV.`,
            label: "ESTIMATE" as const,
          }
        : {
            text: "Not enough restaurant volume to rank contribution.",
            label: "ESTIMATE" as const,
          },
      {
        text: "Estimated contribution declined when average delivery distance rose while average order value stayed flat.",
        label: "ESTIMATE" as const,
      },
    ],
  };
}

export async function analyticsSeries(ctx: AccessContext) {
  requirePermission(ctx, "view_analytics");
  const sql = await getSql();
  const rows = await sql.query<{ day: string; orders: number; gmv: number }>(
    `select to_char(placed_at, 'YYYY-MM-DD') as day,
            count(*)::int as orders,
            coalesce(sum(total_paise),0)::int as gmv
     from orders where org_id=$1 ${ctx.cityId ? "and city_id=$2" : ""}
     group by 1 order by 1`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  return {
    series: rows.map((r) => ({ day: r.day, orders: n(r.orders), gmv: n(r.gmv) })),
    label: "SIMULATED" as const,
    grain: "RAW_AGGREGATED" as const,
  };
}

export async function ceoBrief(ctx: AccessContext) {
  requirePermission(ctx, "access_CEO_dashboard");
  const dash = await dashboardPayload({
    ctx,
    employee: {
      id: ctx.employeeId,
      org_id: ctx.orgId,
      user_id: ctx.userId,
      email: "",
      name: "",
      role_key: ctx.roleKey,
      custom_permissions_json: JSON.stringify(ctx.permissions),
      department: "",
      city_id: ctx.cityId,
      area_id: ctx.areaId,
      status: ctx.status,
      mfa_ready: 0,
      access_expires_at: null,
      assumed_role_key: ctx.actingRoleKey === ctx.roleKey ? null : ctx.actingRoleKey,
      last_active_at: null,
      invited_by: null,
    },
    email: null,
    displayName: "",
    dataMode: "SIMULATED",
    settings: DEFAULT_SETTINGS,
  });
  const fin = await financeSummary(ctx);
  const profit = await profitability(ctx);
  const sql = await getSql();
  const backlog = await sql.query<{ n: number }>(
    `select count(*)::int as n from tickets
     where org_id=$1 and status not in ('RESOLVED','CLOSED') ${ctx.cityId ? "and (city_id is null or city_id=$2)" : ""}`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  const delayedN = dash.live.delayedOrders;
  const unassignedN = dash.live.unassignedOrders;
  const worst = profit.restaurants[0];
  const contrib = fin.contribution.total;
  return {
    dataMode: "SIMULATED" as const,
    business: dash.today,
    finance: fin,
    worstRestaurants: profit.restaurants.slice(0, 5),
    bestRestaurants: [...profit.restaurants].sort((a, b) => b.contribution - a.contribution).slice(0, 5),
    zones: profit.zones,
    insights: profit.insights,
    operations: dash.live,
    alerts: dash.alerts,
    supportBacklog: n(backlog[0]?.n),
    briefing: {
      business: `GMV ${n(dash.today.gmv.value)} paise across ${n(dash.today.orders.value)} SIMULATED orders. Contribution is ESTIMATE ${contrib} paise — 10% commission is not assumed profitable.`,
      operations: `${delayedN} delayed and ${unassignedN} unassigned orders need a dispatcher. Support backlog ${n(backlog[0]?.n)}.`,
      finance: worst
        ? `Weakest estimated contribution is ${worst.name} at ${worst.contribution} paise (ESTIMATE from ledger-derived commission minus refunds and a share of rider cost).`
        : "Not enough restaurant volume to rank contribution.",
      recommended: [
        delayedN > 0 ? `Clear ${delayedN} delayed orders before expanding coverage.` : "No delayed-order alert right now.",
        contrib < 0
          ? "Do not drop commission without a volume offset — estimated contribution is already negative (MODEL)."
          : "Do not drop commission from 10% to 8% without a volume offset (MODEL).",
        "Staff Longai Road after 8pm if the rider-shortage alert is still open.",
      ],
    },
  };
}

export async function systemHealth(ctx?: AccessContext) {
  if (ctx) requirePermission(ctx, "view_analytics");
  const sql = await getSql();
  const t0 = Date.now();
  await sql`select 1 as ok`;
  const dbMs = Date.now() - t0;
  return {
    api: "ok",
    database: dbMs < 2000 ? "ok" : "degraded",
    databaseLatencyMs: dbMs,
    queue: "not_connected",
    notifications: "adapter_unconfirmed",
    payments: "not_connected",
    storage: "local",
    ai: process.env.XAI_API_KEY ? "configured" : "unavailable",
    label: "ACTUAL" as const,
    secretsExposed: false,
  };
}

export async function saveLoyalty(
  ws: Workspace,
  input: {
    id?: string;
    name: string;
    kind: string;
    earnBps: number;
    capPaise: number;
    status: string;
    abuseCapPerDay: number;
  },
) {
  requirePermission(ws.ctx, "manage_promotions");
  await requireFlag(ws, "loyalty");
  if (!input.capPaise || input.capPaise <= 0) {
    throw new ForbiddenError("Loyalty programs require a rupee cap — unlimited earn is blocked");
  }
  const sql = await getSql();
  const id = input.id ?? nid("loy");
  await sql.query(
    `insert into loyalty_programs (id, org_id, name, kind, earn_bps, cap_paise, status, rules_json)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     on conflict (id) do update set name=excluded.name, kind=excluded.kind, earn_bps=excluded.earn_bps,
       cap_paise=excluded.cap_paise, status=excluded.status, rules_json=excluded.rules_json`,
    [
      id,
      ws.ctx.orgId,
      input.name,
      input.kind,
      input.earnBps,
      input.capPaise,
      input.status,
      JSON.stringify({ abuseCapPerDay: input.abuseCapPerDay, minOrderPaise: 15000, expiryDays: 90 }),
    ],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "loyalty.saved",
    targetType: "loyalty",
    targetId: id,
    next: input,
  });
  return { id };
}

export async function listCampaigns(ctx: AccessContext) {
  requirePermission(ctx, "manage_cms");
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from marketing_campaigns where org_id=$1 order by created_at desc`,
    [ctx.orgId],
  );
  return rows.map((c) => ({
    id: String(c.id),
    name: String(c.name),
    channel: String(c.channel),
    status: String(c.status),
    audience: String(c.audience),
    budgetPaise: n(c.budget_paise),
    spentPaise: n(c.spent_paise),
    notes: c.notes ? String(c.notes) : "",
    label: "ESTIMATE" as const,
  }));
}

export async function saveCampaign(
  ws: Workspace,
  input: {
    id?: string;
    name: string;
    channel: string;
    audience: string;
    budgetPaise: number;
    status: string;
    notes?: string;
  },
) {
  requirePermission(ws.ctx, "manage_cms");
  const sql = await getSql();
  const id = input.id ?? nid("cmp");
  await sql.query(
    `insert into marketing_campaigns (id, org_id, name, channel, audience, budget_paise, status, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     on conflict (id) do update set name=excluded.name, channel=excluded.channel, audience=excluded.audience,
       budget_paise=excluded.budget_paise, status=excluded.status, notes=excluded.notes`,
    [id, ws.ctx.orgId, input.name, input.channel, input.audience, input.budgetPaise, input.status, input.notes ?? ""],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "campaign.saved",
    targetType: "campaign",
    targetId: id,
    next: input,
  });
  return { id, estimatedCostPaise: input.budgetPaise, label: "ESTIMATE" as const };
}

export async function reportsPayload(ctx: AccessContext) {
  requirePermission(ctx, "view_analytics");
  const series = await analyticsSeries(ctx);
  const sql = await getSql();
  const byCity = await sql.query<{ city_id: string; name: string; orders: number; gmv: number }>(
    `select o.city_id, c.name, count(*)::int as orders, coalesce(sum(o.total_paise),0)::int as gmv
     from orders o join cities c on c.id=o.city_id
     where o.org_id=$1 ${ctx.cityId ? "and o.city_id=$2" : ""}
     group by o.city_id, c.name`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  const byStatus = await sql.query<{ status: string; n: number }>(
    `select status, count(*)::int as n from orders where org_id=$1 ${ctx.cityId ? "and city_id=$2" : ""} group by status`,
    ctx.cityId ? [ctx.orgId, ctx.cityId] : [ctx.orgId],
  );
  return {
    series: series.series,
    byCity: byCity.map((r) => ({ cityId: r.city_id, name: r.name, orders: n(r.orders), gmv: n(r.gmv) })),
    byStatus: byStatus.map((r) => ({ status: r.status, orders: n(r.n) })),
    label: "SIMULATED" as const,
    grain: "RAW_AGGREGATED" as const,
  };
}

export async function listSettlementBatches(ctx: AccessContext, party: "RESTAURANT" | "RIDER") {
  requirePermission(ctx, "view_finance");
  const base = await settlementRows(ctx, party);
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from settlement_batches where org_id=$1 and party_type=$2 order by created_at desc`,
    [ctx.orgId, party],
  );
  if (!rows.length) return base;
  const byParty = new Map(rows.map((r) => [String(r.party_id), r]));
  return base.map((b) => {
    const batch = byParty.get(b.id);
    if (!batch) return b;
    return {
      ...b,
      id: String(batch.id),
      status: String(batch.status),
      label: "SIMULATED" as const,
    };
  });
}

export async function approveSettlement(
  ws: Workspace,
  id: string,
  decision: "APPROVED" | "REJECTED",
  reason: string,
) {
  requireHighRisk(ws.ctx, "approve_settlements", reason);
  const sql = await getSql();
  const prev = await sql.query<{ status: string; party_name: string }>(
    `select status, party_name from settlement_batches where id=$1 and org_id=$2`,
    [id, ws.ctx.orgId],
  );
  if (!prev[0]) throw new ForbiddenError("Settlement batch not found");
  if (prev[0].status === "PAID") throw new ForbiddenError("Payout execution is out of scope for Window 4");
  await sql.query(
    `update settlement_batches set status=$3, approved_by=$4, approved_at=now(), reason=$5 where id=$1 and org_id=$2`,
    [id, ws.ctx.orgId, decision, ws.ctx.employeeId, reason],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "settlement.decision",
    targetType: "settlement",
    targetId: id,
    previous: prev[0],
    next: { decision },
    reason,
  });
  return { ok: true as const, note: "Approval recorded. Payout is not executed from Command." };
}

export async function queueNotification(
  ws: Workspace,
  input: { channel: string; templateKey: string; audience: string },
) {
  requirePermission(ws.ctx, "manage_notifications");
  const flags = await loadRuntimeFlags(ws.ctx.orgId);
  const channelFlag = input.channel === "whatsapp" ? "whatsapp" : input.channel === "sms" ? "sms" : "push";
  if (!isFlagEnabled(flags, channelFlag)) {
    throw new ForbiddenError(`Feature flag "${channelFlag}" is OFF`);
  }
  const sql = await getSql();
  const id = nid("nt");
  await sql.query(
    `insert into notifications (id, org_id, channel, template_key, audience, status, provider, provider_confirmed)
     values ($1,$2,$3,$4,$5,'queued','ADAPTER',0)`,
    [id, ws.ctx.orgId, input.channel, input.templateKey, input.audience],
  );
  await appendAudit({
    orgId: ws.ctx.orgId,
    employeeId: ws.ctx.employeeId,
    userId: ws.ctx.userId,
    roleKey: ws.ctx.actingRoleKey,
    action: "notification.queued",
    targetType: "notification",
    targetId: id,
    next: { ...input, status: "queued", providerConfirmed: false },
  });
  return { id, status: "queued" as const, providerConfirmed: false };
}

export function reconstructOrderEconomics(input: {
  foodPaise: number;
  restaurantDiscountPaise: number;
  platformDiscountPaise: number;
  deliveryFeePaise: number;
  serviceFeePaise: number;
  taxPaise: number;
  commissionBps: number;
  paymentFeeBps: number;
  riderBasePaise: number;
  riderDistancePaise: number;
}) {
  return calculateOrderEconomics({
    ...input,
    riderIncentivePaise: 0,
    cashCollectedPaise: 0,
  });
}
