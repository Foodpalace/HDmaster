import { requireUserId } from "@/lib/auth/verify.server";
import { ensureWorkspace, appendAudit } from "@/lib/roshoi/server/workspace.server";
import { ForbiddenError, requirePermission } from "@/lib/roshoi/rbac";
import { runMasterAi } from "@/lib/roshoi/ai/master-ai-runtime";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function resolveUserId(request: Request) {
  const authorization = request.headers.get("authorization")?.trim();
  const token = process.env.ROSHOI_SERVICE_TOKEN?.trim();
  const userId = process.env.ROSHOI_SERVICE_USER_ID?.trim();
  if (token && userId && authorization === `Bearer ${token}`) return userId;
  return requireUserId();
}

export async function handleMasterAiHttp(request: Request) {
  try {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const userId = await resolveUserId(request);
    const ws = await ensureWorkspace(userId);
    requirePermission(ws.ctx, "access_AI");

    const input = (await request.json()) as {
      question?: unknown;
      mode?: unknown;
      conversation?: unknown;
      reasoningEffort?: unknown;
    };
    const question = typeof input.question === "string" ? input.question.trim() : "";
    if (!question || question.length > 20_000) return json({ error: "question must be 1–20000 characters" }, 400);
    const mode = input.mode === "ceo" ? "ceo" : "ops";
    if (mode === "ceo") requirePermission(ws.ctx, "access_CEO_dashboard");

    const conversation = Array.isArray(input.conversation)
      ? input.conversation
          .filter((m): m is { role: "user" | "assistant"; content: string } =>
            !!m && typeof m === "object" && (m as { role?: unknown }).role !== undefined &&
            ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant") &&
            typeof (m as { content?: unknown }).content === "string")
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 20_000) }))
      : [];

    const requestedEffort = input.reasoningEffort;
    const reasoningEffort = requestedEffort === "low" || requestedEffort === "medium" || requestedEffort === "xhigh"
      ? requestedEffort
      : "high";

    const result = await runMasterAi(ws, { question, mode, conversation, reasoningEffort });
    await appendAudit({
      orgId: ws.ctx.orgId,
      employeeId: ws.ctx.employeeId,
      userId: ws.ctx.userId,
      roleKey: ws.ctx.actingRoleKey,
      action: "ai.master.request",
      targetType: "master_ai",
      targetId: mode,
      reason: JSON.stringify({ questionLength: question.length, toolCalls: result.ok ? result.toolCalls : [], status: result.ok ? "completed" : "failed" }),
    });
    return json(result, result.ok ? 200 : result.status);
  } catch (err) {
    if (err instanceof ForbiddenError) return json({ error: err.message, code: "FORBIDDEN" }, 403);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return json({ error: message, code: message === "Unauthorized" ? "UNAUTHORIZED" : "BAD_REQUEST" }, message === "Unauthorized" ? 401 : 400);
  }
}
