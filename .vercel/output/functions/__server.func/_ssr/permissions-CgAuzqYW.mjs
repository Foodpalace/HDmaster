//#region node_modules/.nitro/vite/services/ssr/assets/permissions-CgAuzqYW.js
var PERMISSIONS = [
	"view_orders",
	"modify_orders",
	"cancel_orders",
	"issue_refunds",
	"view_customers",
	"edit_customers",
	"view_restaurants",
	"approve_restaurants",
	"suspend_restaurants",
	"view_riders",
	"approve_riders",
	"suspend_riders",
	"view_finance",
	"modify_financial_settings",
	"approve_settlements",
	"view_analytics",
	"manage_promotions",
	"manage_cms",
	"manage_users",
	"manage_roles",
	"manage_branding",
	"manage_feature_flags",
	"manage_delivery_zones",
	"manage_platform_settings",
	"access_AI",
	"access_CEO_dashboard",
	"export_data",
	"view_audit_logs",
	"manage_support",
	"view_kyc",
	"review_kyc",
	"view_risk",
	"manage_notifications",
	"assume_role"
];
var PERMISSION_SET = new Set(PERMISSIONS);
var HIGH_RISK_PERMISSIONS = /* @__PURE__ */ new Set([
	"issue_refunds",
	"cancel_orders",
	"modify_financial_settings",
	"approve_settlements",
	"suspend_restaurants",
	"suspend_riders",
	"manage_users",
	"manage_roles",
	"manage_branding",
	"manage_platform_settings",
	"approve_restaurants",
	"approve_riders",
	"review_kyc",
	"edit_customers"
]);
var SYSTEM_ROLES = [
	"SUPER_ADMIN",
	"CEO",
	"COO",
	"AREA_MANAGER",
	"RESTAURANT_OPS",
	"RIDER_OPS",
	"CUSTOMER_SUPPORT",
	"RESTAURANT_SUPPORT",
	"RIDER_SUPPORT",
	"FINANCE",
	"MARKETING",
	"FRAUD",
	"KYC",
	"CMS",
	"ANALYST",
	"AUDITOR",
	"CUSTOM"
];
var ALL = [...PERMISSIONS];
var READS = [
	"view_orders",
	"view_customers",
	"view_restaurants",
	"view_riders",
	"view_analytics",
	"view_kyc",
	"view_risk"
];
var ROLE_PRESETS = {
	SUPER_ADMIN: ALL,
	CEO: [
		...READS,
		"view_finance",
		"view_analytics",
		"access_AI",
		"access_CEO_dashboard",
		"export_data",
		"view_audit_logs",
		"manage_feature_flags",
		"manage_branding",
		"manage_platform_settings",
		"view_kyc",
		"view_risk",
		"assume_role"
	],
	COO: [
		...READS,
		"modify_orders",
		"cancel_orders",
		"view_finance",
		"view_analytics",
		"manage_promotions",
		"manage_delivery_zones",
		"manage_support",
		"access_AI",
		"export_data",
		"approve_restaurants",
		"approve_riders",
		"suspend_restaurants",
		"suspend_riders",
		"view_audit_logs",
		"view_kyc",
		"view_risk"
	],
	AREA_MANAGER: [
		"view_orders",
		"modify_orders",
		"cancel_orders",
		"view_customers",
		"view_restaurants",
		"view_riders",
		"view_analytics",
		"manage_support",
		"manage_delivery_zones",
		"access_AI",
		"approve_restaurants",
		"approve_riders"
	],
	RESTAURANT_OPS: [
		"view_restaurants",
		"approve_restaurants",
		"suspend_restaurants",
		"view_orders",
		"view_analytics",
		"view_kyc",
		"review_kyc",
		"manage_cms"
	],
	RIDER_OPS: [
		"view_riders",
		"approve_riders",
		"suspend_riders",
		"view_orders",
		"modify_orders",
		"view_analytics",
		"view_kyc",
		"review_kyc"
	],
	CUSTOMER_SUPPORT: [
		"view_orders",
		"modify_orders",
		"cancel_orders",
		"view_customers",
		"manage_support",
		"access_AI"
	],
	RESTAURANT_SUPPORT: [
		"view_restaurants",
		"view_orders",
		"manage_support",
		"view_kyc"
	],
	RIDER_SUPPORT: [
		"view_riders",
		"view_orders",
		"manage_support",
		"view_kyc"
	],
	FINANCE: [
		"view_finance",
		"approve_settlements",
		"view_orders",
		"view_restaurants",
		"view_riders",
		"view_analytics",
		"export_data",
		"view_audit_logs"
	],
	MARKETING: [
		"manage_promotions",
		"manage_cms",
		"view_analytics",
		"view_customers",
		"view_restaurants",
		"manage_notifications"
	],
	FRAUD: [
		"view_risk",
		"view_customers",
		"view_orders",
		"view_riders",
		"view_restaurants",
		"view_audit_logs",
		"access_AI"
	],
	KYC: [
		"view_kyc",
		"review_kyc",
		"view_restaurants",
		"view_riders"
	],
	CMS: ["manage_cms", "view_restaurants"],
	ANALYST: [
		"view_analytics",
		"view_orders",
		"view_restaurants",
		"view_riders",
		"view_customers",
		"view_finance",
		"export_data"
	],
	AUDITOR: [
		"view_audit_logs",
		"view_orders",
		"view_restaurants",
		"view_riders",
		"view_customers",
		"view_finance",
		"view_analytics",
		"view_kyc",
		"view_risk"
	],
	CUSTOM: []
};
var ROLE_LABELS = {
	SUPER_ADMIN: "Super Admin",
	CEO: "CEO / Founder",
	COO: "COO / Operations",
	AREA_MANAGER: "Area / City Manager",
	RESTAURANT_OPS: "Restaurant Operations",
	RIDER_OPS: "Rider Operations",
	CUSTOMER_SUPPORT: "Customer Support",
	RESTAURANT_SUPPORT: "Restaurant Support",
	RIDER_SUPPORT: "Rider Support",
	FINANCE: "Finance",
	MARKETING: "Marketing",
	FRAUD: "Fraud / Risk",
	KYC: "KYC / Compliance",
	CMS: "Content / CMS",
	ANALYST: "Analyst",
	AUDITOR: "Auditor",
	CUSTOM: "Custom role"
};
var AI_TOOLS = {
	get_order: "view_orders",
	get_restaurant: "view_restaurants",
	get_rider: "view_riders",
	get_customer_metrics: "view_customers",
	get_financial_metrics: "view_finance",
	get_ceo_brief: "access_CEO_dashboard",
	get_support_tickets: "manage_support",
	get_delivery_metrics: "view_orders",
	get_campaign_metrics: "manage_promotions",
	get_risk_signals: "view_risk",
	get_dashboard: "view_analytics"
};
//#endregion
export { ROLE_LABELS as a, PERMISSION_SET as i, HIGH_RISK_PERMISSIONS as n, ROLE_PRESETS as o, PERMISSIONS as r, SYSTEM_ROLES as s, AI_TOOLS as t };
