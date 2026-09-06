import type { Permission } from "./permissions";

export type NavItem = {
  id: string;
  path: string;
  i18n: string;
  permission: Permission | Permission[];
  icon:
    | "layout"
    | "crown"
    | "radio"
    | "receipt"
    | "bike"
    | "map"
    | "utensils"
    | "users"
    | "user"
    | "shield"
    | "lifeBuoy"
    | "wallet"
    | "scale"
    | "calculator"
    | "percent"
    | "gift"
    | "megaphone"
    | "panels"
    | "chart"
    | "file"
    | "alert"
    | "spark"
    | "id"
    | "palette"
    | "flag"
    | "settings"
    | "bell"
    | "scroll"
    | "activity";
};

export type NavGroup = { id: string; i18n: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    id: "today",
    i18n: "groups.today",
    items: [{ id: "dashboard", path: "/app", i18n: "nav.dashboard", permission: "view_analytics", icon: "layout" }],
  },
  {
    id: "executive",
    i18n: "groups.executive",
    items: [{ id: "ceo", path: "/app/ceo", i18n: "nav.ceo", permission: "access_CEO_dashboard", icon: "crown" }],
  },
  {
    id: "operations",
    i18n: "groups.operations",
    items: [
      { id: "live", path: "/app/live", i18n: "nav.live", permission: "view_orders", icon: "radio" },
      { id: "orders", path: "/app/orders", i18n: "nav.orders", permission: "view_orders", icon: "receipt" },
      { id: "dispatch", path: "/app/dispatch", i18n: "nav.dispatch", permission: "view_orders", icon: "bike" },
      { id: "zones", path: "/app/zones", i18n: "nav.zones", permission: "manage_delivery_zones", icon: "map" },
    ],
  },
  {
    id: "network",
    i18n: "groups.network",
    items: [
      { id: "restaurants", path: "/app/restaurants", i18n: "nav.restaurants", permission: "view_restaurants", icon: "utensils" },
      { id: "riders", path: "/app/riders", i18n: "nav.riders", permission: "view_riders", icon: "bike" },
      { id: "customers", path: "/app/customers", i18n: "nav.customers", permission: "view_customers", icon: "users" },
      { id: "kyc", path: "/app/kyc", i18n: "nav.kyc", permission: "view_kyc", icon: "shield" },
    ],
  },
  {
    id: "support",
    i18n: "groups.support",
    items: [{ id: "support", path: "/app/support", i18n: "nav.support", permission: "manage_support", icon: "lifeBuoy" }],
  },
  {
    id: "finance",
    i18n: "groups.finance",
    items: [
      { id: "finance", path: "/app/finance", i18n: "nav.finance", permission: "view_finance", icon: "wallet" },
      { id: "settlements", path: "/app/settlements", i18n: "nav.settlements", permission: "view_finance", icon: "scale" },
      { id: "economics", path: "/app/economics", i18n: "nav.economics", permission: "view_finance", icon: "calculator" },
    ],
  },
  {
    id: "growth",
    i18n: "groups.growth",
    items: [
      { id: "promotions", path: "/app/promotions", i18n: "nav.promotions", permission: "manage_promotions", icon: "percent" },
      { id: "loyalty", path: "/app/loyalty", i18n: "nav.loyalty", permission: "manage_promotions", icon: "gift" },
      { id: "marketing", path: "/app/marketing", i18n: "nav.marketing", permission: "manage_cms", icon: "megaphone" },
      { id: "cms", path: "/app/cms", i18n: "nav.cms", permission: "manage_cms", icon: "panels" },
    ],
  },
  {
    id: "intelligence",
    i18n: "groups.intelligence",
    items: [
      { id: "analytics", path: "/app/analytics", i18n: "nav.analytics", permission: "view_analytics", icon: "chart" },
      { id: "reports", path: "/app/reports", i18n: "nav.reports", permission: "view_analytics", icon: "file" },
      { id: "risk", path: "/app/risk", i18n: "nav.risk", permission: "view_risk", icon: "alert" },
      { id: "ai", path: "/app/ai", i18n: "nav.ai", permission: "access_AI", icon: "spark" },
    ],
  },
  {
    id: "system",
    i18n: "groups.system",
    items: [
      { id: "employees", path: "/app/employees", i18n: "nav.employees", permission: "manage_users", icon: "id" },
      { id: "branding", path: "/app/branding", i18n: "nav.branding", permission: "manage_branding", icon: "palette" },
      { id: "flags", path: "/app/flags", i18n: "nav.flags", permission: "manage_feature_flags", icon: "flag" },
      { id: "settings", path: "/app/settings", i18n: "nav.settings", permission: "manage_platform_settings", icon: "settings" },
      { id: "notifications", path: "/app/notifications", i18n: "nav.notifications", permission: "manage_notifications", icon: "bell" },
      { id: "audit", path: "/app/audit", i18n: "nav.audit", permission: "view_audit_logs", icon: "scroll" },
      { id: "health", path: "/app/health", i18n: "nav.health", permission: "view_analytics", icon: "activity" },
    ],
  },
];

export function itemAllowed(item: NavItem, perms: readonly string[]): boolean {
  const need = Array.isArray(item.permission) ? item.permission : [item.permission];
  if (perms.includes("view_analytics") && item.id === "dashboard") return true;
  return need.some((p) => perms.includes(p));
}
