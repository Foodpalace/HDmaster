import { r as __exportAll } from "../_runtime.mjs";
import { i as PERMISSION_SET, n as HIGH_RISK_PERMISSIONS, o as ROLE_PRESETS, t as AI_TOOLS } from "./permissions-CgAuzqYW.mjs";
import { c as __exportAll$1 } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rbac-DLs78-ty.js
var rbac_DLs78_ty_exports = /* @__PURE__ */ __exportAll({
	a: () => rbac_exports,
	c: () => resolvePermissions,
	i: () => denyAiLeakage,
	n: () => allowedAiTools,
	o: () => requireHighRisk,
	r: () => canUseAiTool,
	s: () => requirePermission,
	t: () => ForbiddenError
});
var rbac_exports = /* @__PURE__ */ __exportAll$1({
	ForbiddenError: () => ForbiddenError,
	allowedAiTools: () => allowedAiTools,
	canAccessResource: () => canAccessResource,
	canUseAiTool: () => canUseAiTool,
	denyAiLeakage: () => denyAiLeakage,
	hasPermission: () => hasPermission,
	parsePermissionList: () => parsePermissionList,
	requireHighRisk: () => requireHighRisk,
	requirePermission: () => requirePermission,
	resolvePermissions: () => resolvePermissions
});
var ForbiddenError = class extends Error {
	status = 403;
	code = "FORBIDDEN";
	constructor(message = "Forbidden") {
		super(message);
		this.name = "ForbiddenError";
	}
};
function resolvePermissions(roleKey, customJson) {
	if (roleKey === "CUSTOM") return parsePermissionList(customJson);
	const preset = ROLE_PRESETS[roleKey];
	if (preset) return [...preset];
	return parsePermissionList(customJson);
}
function parsePermissionList(raw) {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((p) => typeof p === "string" && PERMISSION_SET.has(p));
	} catch {
		return [];
	}
}
function hasPermission(ctx, perm) {
	if (ctx.status !== "ACTIVE") return false;
	if (ctx.actingRoleKey === "SUPER_ADMIN" || ctx.roleKey === "SUPER_ADMIN") {
		if (ctx.actingRoleKey === "SUPER_ADMIN") return true;
	}
	return ctx.permissions.includes(perm);
}
function canAccessResource(ctx, perm, resource) {
	if (resource?.orgId && resource.orgId !== ctx.orgId) return false;
	if (!hasPermission(ctx, perm)) return false;
	if (ctx.cityId && resource?.cityId && resource.cityId !== ctx.cityId) return false;
	if (ctx.areaId && resource?.areaId && resource.areaId !== ctx.areaId) return false;
	return true;
}
function requirePermission(ctx, perm, resource) {
	if (!canAccessResource(ctx, perm, resource)) throw new ForbiddenError(`Missing permission: ${perm}`);
}
function requireHighRisk(ctx, perm, reason, resource) {
	requirePermission(ctx, perm, resource);
	if (HIGH_RISK_PERMISSIONS.has(perm) && (!reason || reason.trim().length < 3)) throw new ForbiddenError("High-risk actions require a reason");
}
function allowedAiTools(ctx) {
	return Object.keys(AI_TOOLS).filter((tool) => hasPermission(ctx, AI_TOOLS[tool]));
}
function canUseAiTool(ctx, tool) {
	if (!(tool in AI_TOOLS)) return false;
	if (!hasPermission(ctx, "access_AI") && tool !== "get_dashboard") return false;
	const required = AI_TOOLS[tool];
	if (!required) return false;
	if (tool === "get_ceo_brief") return hasPermission(ctx, "access_CEO_dashboard");
	if (tool === "get_financial_metrics") return hasPermission(ctx, "view_finance");
	return hasPermission(ctx, required);
}
function denyAiLeakage(ctx, question) {
	const q = question.toLowerCase();
	const financeHints = /contribution|gmv|commission|payout|settlement|profit|margin|revenue|loss-making|losing money/.test(q);
	const ceoHints = /ceo|executive brief|what should management|forecast/.test(q);
	if (financeHints && !hasPermission(ctx, "view_finance")) return "You do not have permission to view financial data.";
	if (ceoHints && !hasPermission(ctx, "access_CEO_dashboard")) return "You do not have permission to view executive intelligence.";
	return null;
}
//#endregion
export { rbac_DLs78_ty_exports as a, resolvePermissions as c, denyAiLeakage as i, allowedAiTools as n, requireHighRisk as o, canUseAiTool as r, requirePermission as s, ForbiddenError as t };
