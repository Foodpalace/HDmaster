import type { DataMode } from "@/lib/roshoi/types";
import type { Permission } from "@/lib/roshoi/permissions";

export type AiToolRisk = "READ" | "LOW_RISK_WRITE" | "FINANCIAL" | "HIGH_RISK" | "EMERGENCY";
export type AiToolAvailability = "READ_ONLY" | "WRITE" | "APPROVAL_REQUIRED";

export type MasterAiToolSpec = {
  name: string;
  description: string;
  requiredPermission: Permission;
  allowedRoles: readonly string[];
  dataScope: "ORG" | "CITY" | "AREA" | "OWNER";
  availableIn: readonly DataMode[];
  risk: AiToolRisk;
  availability: AiToolAvailability;
  confirmationRequired: boolean;
  auditRequired: boolean;
  reversible: boolean;
  financialImpact: boolean;
};

const READ_ROLES = ["SUPER_ADMIN", "CEO", "COO", "AREA_MANAGER", "ANALYST", "AUDITOR"] as const;

/**
 * Master AI's policy registry. Tool implementations remain server-side and
 * must still pass the live RBAC checks before execution. This registry is
 * deliberately declarative so the UI/model layer cannot grant permissions.
 */
export const MASTER_AI_TOOL_REGISTRY = {
  get_order: {
    name: "get_order",
    description: "Inspect a canonical order and its authorized timeline.",
    requiredPermission: "view_orders",
    allowedRoles: READ_ROLES,
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: false,
  },
  get_restaurant: {
    name: "get_restaurant",
    description: "Inspect an authorized restaurant and operational health.",
    requiredPermission: "view_restaurants",
    allowedRoles: READ_ROLES,
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: false,
  },
  get_rider: {
    name: "get_rider",
    description: "Inspect an authorized rider and delivery-health information.",
    requiredPermission: "view_riders",
    allowedRoles: READ_ROLES,
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: false,
  },
  get_customer_metrics: {
    name: "get_customer_metrics",
    description: "Inspect customer metrics available to the current operator.",
    requiredPermission: "view_customers",
    allowedRoles: READ_ROLES,
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: false,
  },
  get_financial_metrics: {
    name: "get_financial_metrics",
    description: "Read financial metrics and profitability data.",
    requiredPermission: "view_finance",
    allowedRoles: ["SUPER_ADMIN", "CEO", "COO", "ANALYST", "AUDITOR", "FINANCE"],
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: true,
  },
  get_ceo_brief: {
    name: "get_ceo_brief",
    description: "Build the executive operating brief from authorized HDmaster data.",
    requiredPermission: "access_CEO_dashboard",
    allowedRoles: ["SUPER_ADMIN", "CEO"],
    dataScope: "OWNER",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: true,
  },
  get_support_tickets: {
    name: "get_support_tickets",
    description: "Inspect authorized support queues and ticket state.",
    requiredPermission: "manage_support",
    allowedRoles: ["SUPER_ADMIN", "CEO", "COO", "AREA_MANAGER", "CUSTOMER_SUPPORT", "RESTAURANT_SUPPORT", "RIDER_SUPPORT"],
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: false,
  },
  get_delivery_metrics: {
    name: "get_delivery_metrics",
    description: "Inspect delivery and delayed-order metrics.",
    requiredPermission: "view_orders",
    allowedRoles: READ_ROLES,
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: false,
  },
  get_campaign_metrics: {
    name: "get_campaign_metrics",
    description: "Inspect authorized promotion/campaign performance.",
    requiredPermission: "manage_promotions",
    allowedRoles: ["SUPER_ADMIN", "CEO", "COO", "MARKETING"],
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: true,
  },
  get_risk_signals: {
    name: "get_risk_signals",
    description: "Inspect authorized fraud and operational risk signals.",
    requiredPermission: "view_risk",
    allowedRoles: ["SUPER_ADMIN", "CEO", "COO", "FRAUD", "AUDITOR"],
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: false,
  },
  get_dashboard: {
    name: "get_dashboard",
    description: "Read the authorized command-center dashboard snapshot.",
    requiredPermission: "view_analytics",
    allowedRoles: ["SUPER_ADMIN", "CEO", "COO", "AREA_MANAGER", "ANALYST", "AUDITOR"],
    dataScope: "ORG",
    availableIn: ["SIMULATED", "PRODUCTION"],
    risk: "READ",
    availability: "READ_ONLY",
    confirmationRequired: false,
    auditRequired: true,
    reversible: true,
    financialImpact: false,
  },
} as const satisfies Record<string, MasterAiToolSpec>;

export type MasterAiToolName = keyof typeof MASTER_AI_TOOL_REGISTRY;

export function getMasterAiToolSpec(name: string): MasterAiToolSpec | null {
  return name in MASTER_AI_TOOL_REGISTRY
    ? MASTER_AI_TOOL_REGISTRY[name as MasterAiToolName]
    : null;
}

export function toolAvailableInMode(name: string, mode: DataMode): boolean {
  return getMasterAiToolSpec(name)?.availableIn.includes(mode) ?? false;
}
