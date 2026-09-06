import {
  AI_TOOLS,
  HIGH_RISK_PERMISSIONS,
  PERMISSION_SET,
  ROLE_PRESETS,
  type AiToolName,
  type Permission,
} from "./permissions.ts";

export type AccessContext = {
  userId: string;
  employeeId: string;
  orgId: string;
  roleKey: string;
  /** Acting role after Super Admin "view as". */
  actingRoleKey: string;
  permissions: readonly string[];
  cityId: string | null;
  areaId: string | null;
  status: string;
};

export class ForbiddenError extends Error {
  readonly status = 403;
  readonly code = "FORBIDDEN";
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function resolvePermissions(
  roleKey: string,
  customJson?: string | null,
): Permission[] {
  if (roleKey === "CUSTOM") {
    return parsePermissionList(customJson);
  }
  const preset = ROLE_PRESETS[roleKey];
  if (preset) return [...preset];
  return parsePermissionList(customJson);
}

export function parsePermissionList(raw?: string | null): Permission[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is Permission => typeof p === "string" && PERMISSION_SET.has(p));
  } catch {
    return [];
  }
}

export function hasPermission(ctx: AccessContext, perm: Permission): boolean {
  if (ctx.status !== "ACTIVE") return false;
  if (ctx.actingRoleKey === "SUPER_ADMIN" || ctx.roleKey === "SUPER_ADMIN") {
    if (ctx.actingRoleKey === "SUPER_ADMIN") return true;
  }
  return ctx.permissions.includes(perm);
}

export function canAccessResource(
  ctx: AccessContext,
  perm: Permission,
  resource?: { orgId?: string; cityId?: string | null; areaId?: string | null },
): boolean {
  if (resource?.orgId && resource.orgId !== ctx.orgId) return false;
  if (!hasPermission(ctx, perm)) return false;
  if (ctx.cityId && resource?.cityId && resource.cityId !== ctx.cityId) return false;
  if (ctx.areaId && resource?.areaId && resource.areaId !== ctx.areaId) return false;
  return true;
}

export function requirePermission(
  ctx: AccessContext,
  perm: Permission,
  resource?: { orgId?: string; cityId?: string | null; areaId?: string | null },
): void {
  if (!canAccessResource(ctx, perm, resource)) {
    throw new ForbiddenError(`Missing permission: ${perm}`);
  }
}

export function requireHighRisk(
  ctx: AccessContext,
  perm: Permission,
  reason: string | undefined,
  resource?: { orgId?: string; cityId?: string | null },
): void {
  requirePermission(ctx, perm, resource);
  if (HIGH_RISK_PERMISSIONS.has(perm) && (!reason || reason.trim().length < 3)) {
    throw new ForbiddenError("High-risk actions require a reason");
  }
}

export function assertSameOrg(ctx: AccessContext, orgId: string): void {
  if (ctx.orgId !== orgId) {
    throw new ForbiddenError("Cross-organization access is not allowed");
  }
}

export function cityScopeSql(ctx: AccessContext, alias = ""): { clause: string; params: string[] } {
  const col = alias ? `${alias}.city_id` : "city_id";
  if (!ctx.cityId) return { clause: "", params: [] };
  return { clause: ` and ${col} = $city`, params: [ctx.cityId] };
}

export function allowedAiTools(ctx: AccessContext): AiToolName[] {
  return (Object.keys(AI_TOOLS) as AiToolName[]).filter((tool) =>
    hasPermission(ctx, AI_TOOLS[tool]),
  );
}

export function canUseAiTool(ctx: AccessContext, tool: string): boolean {
  if (!(tool in AI_TOOLS)) return false;
  // Dashboard-shaped tools are available to analysts with view_analytics even
  // without the AI assistant permission. Everything else requires access_AI.
  if (!hasPermission(ctx, "access_AI") && tool !== "get_dashboard") return false;
  const required = AI_TOOLS[tool as AiToolName];
  if (!required) return false;
  if (tool === "get_ceo_brief") return hasPermission(ctx, "access_CEO_dashboard");
  if (tool === "get_financial_metrics") return hasPermission(ctx, "view_finance");
  return hasPermission(ctx, required);
}

export function denyAiLeakage(ctx: AccessContext, question: string): string | null {
  const q = question.toLowerCase();
  const financeHints =
    /contribution|gmv|commission|payout|settlement|profit|margin|revenue|loss-making|losing money/.test(
      q,
    );
  const ceoHints = /ceo|executive brief|what should management|forecast/.test(q);
  if (financeHints && !hasPermission(ctx, "view_finance")) {
    return "You do not have permission to view financial data.";
  }
  if (ceoHints && !hasPermission(ctx, "access_CEO_dashboard")) {
    return "You do not have permission to view executive intelligence.";
  }
  return null;
}

export function isHighRisk(perm: Permission): boolean {
  return HIGH_RISK_PERMISSIONS.has(perm);
}
