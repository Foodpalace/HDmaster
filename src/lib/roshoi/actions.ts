import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { ForbiddenError, canUseAiTool, denyAiLeakage, allowedAiTools } from "@/lib/roshoi/rbac";
import { getMasterAiToolSpec, toolAvailableInMode } from "@/lib/roshoi/ai/tool-registry";
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
  .validator((input: { id: string; action: "assign" | "note" | "reply" | "resolve" | "reopen"; body?: string; employeeId?: string; resolutionCode?: string; idempotencyKey?: string }) => input)
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
      return { ok: true as const, data: { summary: await financeSummary(ws.ctx), profitability: await profitability(ws.ctx) } };
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
      const shock = data.shockBps != null && data.scenarios[0] ? commissionShock(data.scenarios[0], data.shockBps) : null;
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
  .validator((input: { email: string; name: string; roleKey: string; department: string; cityId?: string | null; customPermissions?: string[] }) => input)
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
  .validator((input: { id: string; roleKey?: string; status?: string; cityId?: string | null; department?: string; customPermissions?: string[]; assumedRoleKey?: string | null; mfaReady?: boolean; reason: string }) => input)
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

type ToolResult = { tool: string; label: "SIMULATED" | "ACTUAL" | "ESTIMATE"; data: unknown };

async function runAiTools(ws: Awaited<ReturnType<typeof workspace>>, names: string[]): Promise<ToolResult[]> {
  const q = await import("@/lib/roshoi/server/queries.server");
  const out: ToolResult[] = [];
  for (const tool of names) {
    const spec = getMasterAiToolSpec(tool);
    if (!spec || !toolAvailableInMode(tool, ws.dataMode) || !canUseAiTool(ws.ctx, tool)) continue;
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
      /* A failed tool must not contaminate the model context. */
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
      const snapshots = await runAiTools(ws, tools);
      const apiKey = process.env.XAI_API_KEY;
      const facts = JSON.stringify(snapshots).slice(0, 12000);
      const system = `You are the ${data.mode === "ceo" ? "CEO" : "operations"} assistant for Order King Command, the Order King food-delivery marketplace operating system.
Rules:
- Use ONLY the provided authorized tool snapshots. Never invent numbers.
- Preserve each tool's provenance label exactly. Never convert SIMULATED into ACTUAL.
- If data is missing say "I don't have confirmed data for that."
- Default format: STATUS, CAUSE, ACTION, RESULT, RISK, OWNER REQUIRED when applicable.
- Recommend actions; never claim an action was executed unless a real tool result confirms it.
- High-risk changes require human review: refunds, commission, suspensions, payouts, permission changes.
Current employee role: ${ws.ctx.actingRoleKey}. Data mode: ${ws.dataMode}.`;
      if (!apiKey) {
        const fallback = snapshots
          .map((s) => `${s.tool} (${s.label}): ${JSON.stringify(s.data).slice(0, 400)}`)
          .join("\n");
        return {
          ok: true as const,
          text: `AI provider is unavailable in this environment, so here is a deterministic briefing from authorized tools.\n\nQuestion: ${data.question}\n\n${fallback.slice(0, 2500)}`,
          tools: snapshots.map((s) => s.tool),
          provider: "deterministic",
          dataMode: ws.dataMode,
        };
      }
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 700,
          messages: [
            { role: "system", content: system },
            { role: "user", content: `Question: ${data.question}\n\nAuthorized snapshots:\n${facts}` },
          ],
        }),
      });
      if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}`, status: 502 };
      const body = (await res.json()) as { choices: { message: { content: string } }[] };
      return {
        ok: true as const,
        text: body.choices[0]?.message.content ?? "I don't have confirmed data for that.",
        tools: snapshots.map((s) => s.tool),
        provider: "xai",
        dataMode: ws.dataMode,
      };
    } catch (err) {
      return fail(err);
    }
  });
