import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { ForbiddenError, canUseAiTool, denyAiLeakage, allowedAiTools } from "@/lib/roshoi/rbac";
import { compareScenarios, commissionShock, type ScenarioInputs } from "@/lib/roshoi/finance/economics";
import { DEFAULT_SETTINGS, type PlatformSettings } from "@/lib/roshoi/types";
import type { OrderStatus } from "@/lib/roshoi/orders/state-machine";

async function workspace(userId: string, bearer?: string) {
  const { ensureWorkspace } = await import("@/lib/roshoi/server/workspace.server");
  return ensureWorkspace(userId, bearer);
}

function fail(err: unknown) {
  if (err instanceof ForbiddenError) {
    return { ok: false as const, error: err.message, status: 403 };
  }
  const message = err instanceof Error ? err.message : "Unexpected error";
  if (message === "Unauthorized") return { ok: false as const, error: message, status: 401 };
  return { ok: false as const, error: message, status: 400 };
}

export const bootstrapSession = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { serializeEmployee, getBranding } = await import("@/lib/roshoi/server/queries.server");
      const branding = await getBranding(ws.ctx);
      return {
        ok: true as const,
        employee: serializeEmployee(ws),
        branding,
        settings: ws.ctx.permissions.includes("manage_platform_settings") ? ws.settings : null,
        flags: (await (await import("@/lib/roshoi/server/queries.server")).loadRuntimeFlags(ws.ctx.orgId)).map((f) => ({
          key: f.key,
          on: f.state === "ON" || (f.state === "ROLLOUT_PERCENTAGE" && f.rolloutPct >= 100),
        })),
      };
    } catch (err) {
      return fail(err);
    }
  });

export const loadDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { dashboardPayload } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await dashboardPayload(ws) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadCeo = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { ceoBrief } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await ceoBrief(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadOrders = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { status?: string; delayed?: boolean; q?: string; restaurantId?: string; riderId?: string; payment?: string; cityId?: string; minutes?: number }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { listOrders } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listOrders(ws.ctx, data) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { getOrder } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await getOrder(ws.ctx, data) };
    } catch (err) {
      return fail(err);
    }
  });

export const actOnOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    orderId: string;
    action: "cancel" | "refund" | "assign_rider" | "transition" | "escalate";
    toStatus?: OrderStatus;
    riderId?: string;
    amountPaise?: number;
    reason: string;
    idempotencyKey?: string;
  }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { interveneOrder } = await import("@/lib/roshoi/server/queries.server");
      await interveneOrder(ws, data);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadRestaurants = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { q?: string; status?: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { listRestaurants } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listRestaurants(ws.ctx, data.q, data.status) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadRestaurant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { getRestaurant } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await getRestaurant(ws.ctx, data) };
    } catch (err) {
      return fail(err);
    }
  });

export const actRestaurant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: string; reason: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { setRestaurantStatus } = await import("@/lib/roshoi/server/queries.server");
      await setRestaurantStatus(ws, data.id, data.status, data.reason);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadRiders = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { q?: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { listRiders } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listRiders(ws.ctx, data.q) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadRider = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { getRider } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await getRider(ws.ctx, data) };
    } catch (err) {
      return fail(err);
    }
  });

export const actRider = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: string; reason: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { setRiderStatus } = await import("@/lib/roshoi/server/queries.server");
      await setRiderStatus(ws, data.id, data.status, data.reason);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadCustomers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { q?: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { listCustomers } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listCustomers(ws.ctx, data.q) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { getCustomer } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await getCustomer(ws.ctx, data) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadTickets = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { queue?: string; status?: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { listTickets } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listTickets(ws.ctx, data.queue, data.status) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { getTicket } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await getTicket(ws.ctx, data) };
    } catch (err) {
      return fail(err);
    }
  });

export const actTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    id: string;
    action: "assign" | "note" | "reply" | "resolve" | "reopen";
    body?: string;
    employeeId?: string;
    resolutionCode?: string;
    idempotencyKey?: string;
  }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { mutateTicket } = await import("@/lib/roshoi/server/queries.server");
      await mutateTicket(ws, data);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadFinance = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { financeSummary, profitability } = await import("@/lib/roshoi/server/queries.server");
      return {
        ok: true as const,
        data: { summary: await financeSummary(ws.ctx), profitability: await profitability(ws.ctx) },
      };
    } catch (err) {
      return fail(err);
    }
  });

export const loadSettlements = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { party: "RESTAURANT" | "RIDER" }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { settlementRows, listSettlementBatches } = await import("@/lib/roshoi/server/queries.server");
      const rows = await listSettlementBatches(ws.ctx, data.party).catch(() => settlementRows(ws.ctx, data.party));
      return { ok: true as const, data: rows };
    } catch (err) {
      return fail(err);
    }
  });

export const runEconomics = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { scenarios: ScenarioInputs[]; shockBps?: number }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { requirePermission } = await import("@/lib/roshoi/rbac");
      requirePermission(ws.ctx, "view_finance");
      const results = compareScenarios(data.scenarios);
      const shock =
        data.shockBps != null && data.scenarios[0]
          ? commissionShock(data.scenarios[0], data.shockBps)
          : null;
      return { ok: true as const, data: { results, shock, label: "MODEL" as const } };
    } catch (err) {
      return fail(err);
    }
  });

export const loadEmployees = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listEmployees } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listEmployees(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const inviteEmployeeFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    email: string;
    name: string;
    roleKey: string;
    department: string;
    cityId?: string | null;
    customPermissions?: string[];
  }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { inviteEmployee } = await import("@/lib/roshoi/server/queries.server");
      const invited = await inviteEmployee(ws, data);
      return { ok: true as const, id: invited.id };
    } catch (err) {
      return fail(err);
    }
  });

export const updateEmployeeFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    id: string;
    roleKey?: string;
    status?: string;
    cityId?: string | null;
    department?: string;
    customPermissions?: string[];
    assumedRoleKey?: string | null;
    mfaReady?: boolean;
    reason: string;
  }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { updateEmployee } = await import("@/lib/roshoi/server/queries.server");
      await updateEmployee(ws, data);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadAudit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { q?: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { listAudit } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listAudit(ws.ctx, data.q) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadFlags = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listFlags } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listFlags(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const setFlagFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { key: string; state: string; rolloutPct: number; reason: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { setFlag } = await import("@/lib/roshoi/server/queries.server");
      await setFlag(ws, data.key, data.state, data.rolloutPct, data.reason);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadBranding = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { getBranding } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await getBranding(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const saveBrandingFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { patch: Record<string, string>; reason: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { saveBranding } = await import("@/lib/roshoi/server/queries.server");
      await saveBranding(ws, data.patch, data.reason);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { getSettings } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await getSettings(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const saveSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { settings: PlatformSettings; reason: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { saveSettings } = await import("@/lib/roshoi/server/queries.server");
      await saveSettings(ws, data.settings, data.reason);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadPromos = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listPromotions, listLoyalty } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: { promotions: await listPromotions(ws.ctx), loyalty: await listLoyalty(ws.ctx) } };
    } catch (err) {
      return fail(err);
    }
  });

export const savePromoFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
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
  }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { savePromotion } = await import("@/lib/roshoi/server/queries.server");
      const promo = await savePromotion(ws, data);
      return { ok: true as const, id: promo.id, estimatedCostPaise: promo.estimatedCostPaise, label: promo.label };
    } catch (err) {
      return fail(err);
    }
  });

export const loadCms = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listCms } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listCms(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const saveCmsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; surface: string; slot: string; title: string; body: string; sponsored: boolean }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { saveCms } = await import("@/lib/roshoi/server/queries.server");
      const cms = await saveCms(ws, data);
      return { ok: true as const, id: cms.id };
    } catch (err) {
      return fail(err);
    }
  });

export const loadZones = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listZones, listCities } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: { zones: await listZones(ws.ctx), cities: await listCities(ws.ctx) } };
    } catch (err) {
      return fail(err);
    }
  });

export const saveZoneFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    id?: string;
    name: string;
    cityId: string;
    deliveryFeePaise: number;
    minOrderPaise: number;
    maxRadiusKm: number;
    etaMinutes: number;
  }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { saveZone } = await import("@/lib/roshoi/server/queries.server");
      const zone = await saveZone(ws, data);
      return { ok: true as const, id: zone.id };
    } catch (err) {
      return fail(err);
    }
  });

export const loadKyc = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listKyc } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listKyc(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const reviewKycFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: string; notes: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { reviewKyc } = await import("@/lib/roshoi/server/queries.server");
      await reviewKyc(ws, data.id, data.status, data.notes);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadRisk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listRisk } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listRisk(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listNotifications } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listNotifications(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadDispatch = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { dispatchBoard } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await dispatchBoard(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadLive = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { liveBoard } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await liveBoard(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const tickSim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { tickSimulation } = await import("@/lib/roshoi/server/queries.server");
      const tick = await tickSimulation(ws);
      return { ok: true as const, advanced: tick.advanced, label: tick.label };
    } catch (err) {
      return fail(err);
    }
  });

export const loadAnalytics = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { analyticsSeries } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await analyticsSeries(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const loadHealth = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { systemHealth } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await systemHealth(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const exportCsv = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: "orders" | "restaurants" | "riders" | "finance" }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { requirePermission } = await import("@/lib/roshoi/rbac");
      requirePermission(ws.ctx, "export_data");
      const q = await import("@/lib/roshoi/server/queries.server");
      let csv = "";
      if (data.kind === "orders") {
        requirePermission(ws.ctx, "view_orders");
        const rows = await q.listOrders(ws.ctx, { limit: 200 });
        csv = "id,status,restaurant,total_paise,placed_at,data_mode\n" + rows.map((r) => `${r.id},${r.status},${r.restaurant},${r.totalPaise},${r.placedAt},${r.data_mode}`).join("\n");
      } else if (data.kind === "restaurants") {
        const rows = await q.listRestaurants(ws.ctx);
        csv = "id,name,status,city,orders\n" + rows.map((r) => `${r.id},${r.name},${r.status},${r.cityId},${r.orderCount}`).join("\n");
      } else if (data.kind === "riders") {
        const rows = await q.listRiders(ws.ctx);
        csv = "id,name,status,online,kyc\n" + rows.map((r) => `${r.id},${r.name},${r.status},${r.online},${r.kycStatus}`).join("\n");
      } else {
        requirePermission(ws.ctx, "view_finance");
        const fin = await q.financeSummary(ws.ctx);
        csv = "metric,paise,label\nGMV," + fin.gmv + ",SIMULATED\ncontribution," + fin.contribution.total + ",ESTIMATE\n";
      }
      await (await import("@/lib/roshoi/server/workspace.server")).appendAudit({
        orgId: ws.ctx.orgId,
        employeeId: ws.ctx.employeeId,
        userId: ws.ctx.userId,
        roleKey: ws.ctx.actingRoleKey,
        action: "export.csv",
        targetType: "export",
        targetId: data.kind,
      });
      return { ok: true as const, csv, filename: `roshoi-${data.kind}.csv` };
    } catch (err) {
      return fail(err);
    }
  });

type ToolResult = { tool: string; label: "SIMULATED" | "ACTUAL" | "ESTIMATE"; data: unknown };

async function runAiTools(ws: Awaited<ReturnType<typeof workspace>>, names: string[]): Promise<ToolResult[]> {
  const q = await import("@/lib/roshoi/server/queries.server");
  const out: ToolResult[] = [];
  for (const tool of names) {
    if (!canUseAiTool(ws.ctx, tool)) continue;
    try {
      if (tool === "get_financial_metrics") {
        out.push({ tool, label: "SIMULATED", data: await q.financeSummary(ws.ctx) });
      } else if (tool === "get_ceo_brief") {
        out.push({ tool, label: "SIMULATED", data: await q.ceoBrief(ws.ctx) });
      } else if (tool === "get_order" || tool === "get_delivery_metrics") {
        out.push({ tool, label: "SIMULATED", data: await q.listOrders(ws.ctx, { delayed: true, limit: 15 }) });
      } else if (tool === "get_restaurant") {
        out.push({ tool, label: "SIMULATED", data: await q.listRestaurants(ws.ctx) });
      } else if (tool === "get_rider") {
        out.push({ tool, label: "SIMULATED", data: await q.listRiders(ws.ctx) });
      } else if (tool === "get_support_tickets") {
        out.push({ tool, label: "SIMULATED", data: await q.listTickets(ws.ctx) });
      } else if (tool === "get_risk_signals") {
        out.push({ tool, label: "SIMULATED", data: await q.listRisk(ws.ctx) });
      } else if (tool === "get_dashboard") {
        out.push({ tool, label: "SIMULATED", data: await q.dashboardPayload(ws) });
      } else if (tool === "get_campaign_metrics") {
        out.push({ tool, label: "SIMULATED", data: await q.listPromotions(ws.ctx) });
      } else if (tool === "get_customer_metrics") {
        out.push({ tool, label: "SIMULATED", data: await q.listCustomers(ws.ctx) });
      }
    } catch {
      /* tool skipped if unauthorized mid-flight */
    }
  }
  return out;
}

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { question: string; mode: "ops" | "ceo" }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { requirePermission } = await import("@/lib/roshoi/rbac");
      requirePermission(ws.ctx, "access_AI");
      if (data.mode === "ceo") requirePermission(ws.ctx, "access_CEO_dashboard");
      const leak = denyAiLeakage(ws.ctx, data.question);
      if (leak) return { ok: false as const, error: leak, status: 403 };
      const tools = allowedAiTools(ws.ctx);
      const snapshots = await runAiTools(ws, tools.slice(0, 8));
      const apiKey = process.env.XAI_API_KEY;
      const facts = JSON.stringify(snapshots).slice(0, 12000);
      const system = `You are the ${data.mode === "ceo" ? "CEO" : "operations"} assistant for Roshoi Command, a food-delivery marketplace OS for Karimganj/Sribhumi, Assam.
Rules:
- Use ONLY the provided tool snapshots. Never invent numbers.
- Label every figure ACTUAL, SIMULATED, ESTIMATE, FORECAST, or MODEL.
- If data is missing say "I don't have confirmed data for that."
- Cite like: "Based on N simulated orders…"
- Recommend actions; do not claim you executed high-risk operations.
- High-risk changes require human review: refunds, commission, suspensions, payouts, permission changes.
Current employee role: ${ws.ctx.actingRoleKey}. Data mode: ${ws.dataMode}.`;
      if (!apiKey) {
        const fallback = snapshots
          .map((s) => `${s.tool} (${s.label}): ${JSON.stringify(s.data).slice(0, 400)}`)
          .join("\n");
        return {
          ok: true as const,
          text:
            `AI provider is unavailable in this environment, so here is a deterministic briefing from authorized tools.\n\n` +
            `Question: ${data.question}\n\n${fallback.slice(0, 2500)}\n\nAll marketplace figures are SIMULATED until Window 5 is connected.`,
          tools: snapshots.map((s) => s.tool),
          provider: "deterministic",
        };
      }
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 700,
          messages: [
            { role: "system", content: system },
            { role: "user", content: `Question: ${data.question}\n\nAuthorized snapshots:\n${facts}` },
          ],
        }),
      });
      if (!res.ok) {
        return { ok: false as const, error: `xAI API error ${res.status}`, status: 502 };
      }
      const body = (await res.json()) as { choices: { message: { content: string } }[] };
      return {
        ok: true as const,
        text: body.choices[0]?.message.content ?? "I don't have confirmed data for that.",
        tools: snapshots.map((s) => s.tool),
        provider: "xai",
      };
    } catch (err) {
      return fail(err);
    }
  });

export const saveLoyaltyFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    id?: string;
    name: string;
    kind: string;
    earnBps: number;
    capPaise: number;
    status: string;
    abuseCapPerDay: number;
  }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { saveLoyalty } = await import("@/lib/roshoi/server/queries.server");
      const saved = await saveLoyalty(ws, data);
      return { ok: true as const, id: saved.id };
    } catch (err) {
      return fail(err);
    }
  });

export const loadCampaigns = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listCampaigns } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listCampaigns(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const saveCampaignFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    name: string;
    channel: string;
    audience: string;
    budgetPaise: number;
    status: string;
    notes?: string;
  }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { saveCampaign } = await import("@/lib/roshoi/server/queries.server");
      const saved = await saveCampaign(ws, data);
      return { ok: true as const, id: saved.id, estimatedCostPaise: saved.estimatedCostPaise };
    } catch (err) {
      return fail(err);
    }
  });

export const loadReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { reportsPayload } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await reportsPayload(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const approveSettlementFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; decision: "APPROVED" | "REJECTED"; reason: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { approveSettlement } = await import("@/lib/roshoi/server/queries.server");
      const result = await approveSettlement(ws, data.id, data.decision, data.reason);
      return { ok: true as const, note: result.note };
    } catch (err) {
      return fail(err);
    }
  });

export const queueNotificationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { channel: string; templateKey: string; audience: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { queueNotification } = await import("@/lib/roshoi/server/queries.server");
      const queued = await queueNotification(ws, data);
      return { ok: true as const, ...queued };
    } catch (err) {
      return fail(err);
    }
  });

export const updateCustomerFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status?: string; loyaltyTier?: string; reason: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const ws = await workspace(context.userId);
      const { updateCustomer } = await import("@/lib/roshoi/server/queries.server");
      await updateCustomer(ws, data);
      return { ok: true as const };
    } catch (err) {
      return fail(err);
    }
  });

export const loadCities = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const ws = await workspace(context.userId);
      const { listCities } = await import("@/lib/roshoi/server/queries.server");
      return { ok: true as const, data: await listCities(ws.ctx) };
    } catch (err) {
      return fail(err);
    }
  });

export const defaultEconomicsScenario = (): ScenarioInputs => ({
  name: "Current 10%",
  commissionBps: DEFAULT_SETTINGS.commissionBps,
  deliveryFeePaise: 3000,
  customerFeePaise: DEFAULT_SETTINGS.serviceFeePaise,
  riderPayoutPaise: DEFAULT_SETTINGS.riderBasePaise + DEFAULT_SETTINGS.riderDistancePaise,
  discountPaise: 800,
  platformSubsidyPaise: 0,
  paymentCostPaise: 450,
  refundRate: 0.03,
  supportCostPaise: 200,
  infrastructureCostPerDayPaise: 40_000,
  ordersPerDay: 90,
  aovPaise: 28_000,
  restaurantCount: 24,
  riderCount: 28,
});
