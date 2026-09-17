import type { DataMode } from "@/lib/roshoi/types";
import type { Permission } from "@/lib/roshoi/permissions";

export type AiToolRisk = "READ" | "LOW_RISK_WRITE" | "FINANCIAL" | "HIGH_RISK" | "EMERGENCY";
export type AiToolAvailability = "READ_ONLY" | "WRITE" | "APPROVAL_REQUIRED";
export type AiToolScope = "ORG" | "CITY" | "AREA" | "OWNER";

export type MasterAiToolSpec = {
  name: string;
  description: string;
  requiredPermission: Permission;
  allowedRoles: readonly string[];
  dataScope: AiToolScope;
  availableIn: readonly DataMode[];
  risk: AiToolRisk;
  availability: AiToolAvailability;
  confirmationRequired: boolean;
  auditRequired: boolean;
  reversible: boolean;
  financialImpact: boolean;
};

const ALL_READ_ROLES = ["SUPER_ADMIN", "CEO", "COO", "AREA_MANAGER", "ANALYST", "AUDITOR"] as const;
const OPS_ROLES = ["SUPER_ADMIN", "CEO", "COO", "AREA_MANAGER"] as const;
const FINANCE_ROLES = ["SUPER_ADMIN", "CEO", "COO", "FINANCE"] as const;
const SUPPORT_ROLES = ["SUPER_ADMIN", "CEO", "COO", "CUSTOMER_SUPPORT", "RESTAURANT_SUPPORT", "RIDER_SUPPORT"] as const;
const ENGINEERING_ROLES = ["SUPER_ADMIN", "CEO", "COO"] as const;
const LIVE = ["SIMULATED", "PRODUCTION"] as const;

const read = (
  name: string,
  description: string,
  requiredPermission: Permission,
  allowedRoles: readonly string[] = ALL_READ_ROLES,
  dataScope: AiToolScope = "ORG",
  financialImpact = false,
): MasterAiToolSpec => ({
  name, description, requiredPermission, allowedRoles, dataScope,
  availableIn: LIVE, risk: "READ", availability: "READ_ONLY",
  confirmationRequired: false, auditRequired: true, reversible: true, financialImpact,
});

const write = (
  name: string,
  description: string,
  requiredPermission: Permission,
  risk: AiToolRisk,
  confirmationRequired: boolean,
  allowedRoles: readonly string[] = OPS_ROLES,
  financialImpact = false,
): MasterAiToolSpec => ({
  name, description, requiredPermission, allowedRoles, dataScope: "ORG",
  availableIn: LIVE, risk, availability: confirmationRequired ? "APPROVAL_REQUIRED" : "WRITE",
  confirmationRequired, auditRequired: true, reversible: risk !== "EMERGENCY", financialImpact,
});

/**
 * Master AI policy registry. This is the capability contract for the
 * operating AI and engineering agent. Registry policy never grants access;
 * every implementation must still pass live RBAC, tenant scope, data-mode,
 * validation, idempotency and audit checks before execution.
 */
export const MASTER_AI_TOOL_REGISTRY = {
  // Orders
  get_order: read("get_order", "Inspect a canonical order and authorized timeline.", "view_orders"),
  search_orders: read("search_orders", "Search canonical orders by authorized operational filters.", "view_orders"),
  list_recent_orders: read("list_recent_orders", "List recent orders for the authorized scope.", "view_orders"),
  list_delayed_orders: read("list_delayed_orders", "Identify orders exceeding operational thresholds.", "view_orders"),
  get_order_timeline: read("get_order_timeline", "Read the canonical order event timeline.", "view_orders"),
  get_order_events: read("get_order_events", "Read audited events for an order.", "view_audit_logs"),
  explain_order: read("explain_order", "Explain an order state using verified system events and calculations.", "view_orders"),
  cancel_order: write("cancel_order", "Request cancellation through the canonical order state machine.", "cancel_orders", "HIGH_RISK", true),
  reassign_order: write("reassign_order", "Request an authorized rider reassignment.", "modify_orders", "LOW_RISK_WRITE", false),
  retry_order_operation: write("retry_order_operation", "Retry a safe idempotent order operation after diagnosis.", "modify_orders", "LOW_RISK_WRITE", false),
  mark_intervention_required: write("mark_intervention_required", "Flag an order for human operational intervention.", "modify_orders", "LOW_RISK_WRITE", false),

  // Restaurants
  get_restaurant: read("get_restaurant", "Inspect an authorized restaurant and operational health.", "view_restaurants"),
  restaurant_health: read("restaurant_health", "Calculate restaurant operational health from verified data.", "view_restaurants"),
  restaurant_orders: read("restaurant_orders", "Read restaurant order activity and status distribution.", "view_orders"),
  restaurant_complaints: read("restaurant_complaints", "Read restaurant-related complaint cases.", "manage_support", SUPPORT_ROLES),
  restaurant_menu_status: read("restaurant_menu_status", "Inspect menu, availability and synchronization status.", "view_restaurants"),
  restaurant_hours: read("restaurant_hours", "Inspect operational hours and online/offline state.", "view_restaurants"),
  restaurant_settlement: read("restaurant_settlement", "Inspect restaurant settlement status and deductions.", "view_finance", FINANCE_ROLES, "ORG", true),
  restaurant_performance: read("restaurant_performance", "Analyze restaurant sales, acceptance, prep and service metrics.", "view_analytics"),
  set_restaurant_online: write("set_restaurant_online", "Change an authorized restaurant online/offline state.", "view_restaurants", "LOW_RISK_WRITE", false),
  sync_restaurant_menu: write("sync_restaurant_menu", "Trigger a validated menu synchronization.", "manage_cms", "LOW_RISK_WRITE", false),

  // Riders / dispatch
  get_rider: read("get_rider", "Inspect an authorized rider and delivery-health information.", "view_riders"),
  rider_health: read("rider_health", "Calculate rider operational health from verified data.", "view_riders"),
  rider_active_orders: read("rider_active_orders", "Read a rider's active delivery workload.", "view_orders"),
  rider_location: read("rider_location", "Read the latest authorized rider location snapshot.", "view_riders"),
  rider_offer_status: read("rider_offer_status", "Inspect rider dispatch offers and expiry state.", "view_riders"),
  rider_earnings: read("rider_earnings", "Inspect verified rider earnings and settlement records.", "view_finance", FINANCE_ROLES, "ORG", true),
  rider_complaints: read("rider_complaints", "Read rider complaint cases and SLA state.", "manage_support", SUPPORT_ROLES),
  rider_performance: read("rider_performance", "Analyze rider acceptance, delivery and reliability metrics.", "view_analytics"),
  reassign_rider: write("reassign_rider", "Request reassignment of a delivery through canonical dispatch.", "modify_orders", "LOW_RISK_WRITE", false),

  // Customers / support
  get_customer: read("get_customer", "Inspect an authorized customer profile within scope.", "view_customers"),
  customer_orders: read("customer_orders", "Read authorized customer order history.", "view_orders"),
  customer_complaints: read("customer_complaints", "Read customer complaints and support history.", "manage_support", SUPPORT_ROLES),
  customer_refunds: read("customer_refunds", "Read authorized customer refund history.", "issue_refunds", SUPPORT_ROLES, "ORG", true),
  customer_payment_status: read("customer_payment_status", "Inspect customer payment status without exposing payment secrets.", "view_finance", FINANCE_ROLES, "ORG", true),
  customer_support_history: read("customer_support_history", "Read authorized support interactions.", "manage_support", SUPPORT_ROLES),
  create_support_case: write("create_support_case", "Create a canonical support case with SLA and audit metadata.", "manage_support", "LOW_RISK_WRITE", false, SUPPORT_ROLES),

  // Finance
  get_payment: read("get_payment", "Inspect a canonical payment record and lifecycle.", "view_finance", FINANCE_ROLES, "ORG", true),
  verify_payment: write("verify_payment", "Run a non-destructive payment verification/reconciliation check.", "view_finance", "LOW_RISK_WRITE", false, FINANCE_ROLES, true),
  get_ledger_entries: read("get_ledger_entries", "Read immutable financial ledger entries.", "view_finance", FINANCE_ROLES, "ORG", true),
  reconcile_payment: write("reconcile_payment", "Run an idempotent payment reconciliation operation.", "view_finance", "LOW_RISK_WRITE", false, FINANCE_ROLES, true),
  refund_preview: read("refund_preview", "Calculate a refund preview without moving money.", "issue_refunds", FINANCE_ROLES, "ORG", true),
  issue_refund: write("issue_refund", "Issue an authorized refund through the guarded financial workflow.", "issue_refunds", "FINANCIAL", true, FINANCE_ROLES, true),
  settlement_preview: read("settlement_preview", "Preview merchant settlement calculations.", "approve_settlements", FINANCE_ROLES, "ORG", true),
  settlement_status: read("settlement_status", "Inspect settlement state and reconciliation exceptions.", "view_finance", FINANCE_ROLES, "ORG", true),
  commission_breakdown: read("commission_breakdown", "Explain commission calculations from ledger-backed data.", "view_finance", FINANCE_ROLES, "ORG", true),
  promotion_funder_breakdown: read("promotion_funder_breakdown", "Explain promotion funding between platform and merchant.", "view_finance", FINANCE_ROLES, "ORG", true),

  // Analytics / BI
  daily_report: read("daily_report", "Build a daily operating report from actual HDmaster data.", "view_analytics"),
  weekly_report: read("weekly_report", "Build a weekly operating report from actual HDmaster data.", "view_analytics"),
  monthly_report: read("monthly_report", "Build a monthly operating report from actual HDmaster data.", "view_analytics"),
  revenue_report: read("revenue_report", "Calculate revenue from verified order and financial records.", "view_analytics", ALL_READ_ROLES, "ORG", true),
  GMV_report: read("GMV_report", "Calculate GMV from canonical orders.", "view_analytics", ALL_READ_ROLES, "ORG", true),
  AOV_report: read("AOV_report", "Calculate average order value from canonical orders.", "view_analytics"),
  order_success_rate: read("order_success_rate", "Calculate completed-order success rate.", "view_analytics"),
  cancellation_rate: read("cancellation_rate", "Calculate cancellation rate with scope and period.", "view_analytics"),
  refund_rate: read("refund_rate", "Calculate refund rate from financial records.", "view_analytics", ALL_READ_ROLES, "ORG", true),
  restaurant_acceptance_rate: read("restaurant_acceptance_rate", "Calculate restaurant acceptance and timeout metrics.", "view_analytics"),
  rider_acceptance_rate: read("rider_acceptance_rate", "Calculate rider offer acceptance metrics.", "view_analytics"),
  delivery_time_report: read("delivery_time_report", "Analyze prep, pickup and delivery durations.", "view_analytics"),
  customer_retention: read("customer_retention", "Calculate retention cohorts from actual customer orders.", "view_analytics"),
  cohort_report: read("cohort_report", "Build customer cohort analysis from verified data.", "view_analytics"),
  profitability_report: read("profitability_report", "Calculate contribution and profitability using ledger-backed inputs.", "view_finance", FINANCE_ROLES, "ORG", true),

  // Risk / support / command center
  get_support_tickets: read("get_support_tickets", "Inspect authorized support queues and ticket state.", "manage_support", SUPPORT_ROLES),
  get_risk_signals: read("get_risk_signals", "Inspect authorized fraud and operational risk signals.", "view_risk", ["SUPER_ADMIN", "CEO", "COO", "FRAUD", "AUDITOR"]),
  get_delivery_metrics: read("get_delivery_metrics", "Inspect delivery and delayed-order metrics.", "view_orders"),
  get_campaign_metrics: read("get_campaign_metrics", "Inspect authorized promotion performance.", "manage_promotions", ["SUPER_ADMIN", "CEO", "COO", "MARKETING"]),
  get_dashboard: read("get_dashboard", "Read the authorized command-center dashboard snapshot.", "view_analytics"),
  get_ceo_brief: read("get_ceo_brief", "Build an executive operating brief from authorized HDmaster data.", "access_CEO_dashboard", ["SUPER_ADMIN", "CEO"], "OWNER", true),

  // Engineering agent — inspection, diagnosis and verification
  get_repository_status: read("get_repository_status", "Inspect repository identity, branch and engineering health.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  get_git_status: read("get_git_status", "Inspect working-tree and branch state through authorized tooling.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  get_recent_commits: read("get_recent_commits", "Inspect recent engineering changes and provenance.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  inspect_file: read("inspect_file", "Read an authorized source/config file for diagnosis.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  search_code: read("search_code", "Search the authorized codebase for symbols, dependencies and failures.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  run_typecheck: write("run_typecheck", "Run the repository typecheck without changing source code.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
  run_tests: write("run_tests", "Run the repository test suite without changing source code.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
  run_lint: write("run_lint", "Run linting without changing source code.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
  run_build: write("run_build", "Run a production build verification without deploying.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
  inspect_ci: read("inspect_ci", "Inspect CI workflow state and required checks.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  inspect_failed_ci: read("inspect_failed_ci", "Inspect failed CI jobs and logs to establish root cause.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  diagnose_ci: write("diagnose_ci", "Produce a structured CI root-cause diagnosis from verified logs.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
  create_patch: write("create_patch", "Prepare a minimal source patch after root-cause analysis.", "access_AI", "HIGH_RISK", true, ENGINEERING_ROLES),
  apply_patch: write("apply_patch", "Apply an authorized engineering patch to the repository.", "access_AI", "HIGH_RISK", true, ENGINEERING_ROLES),
  run_targeted_test: write("run_targeted_test", "Run focused verification for an engineering change.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
  create_engineering_task: write("create_engineering_task", "Create a traceable engineering task with evidence and acceptance criteria.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
  inspect_dependencies: read("inspect_dependencies", "Inspect dependency manifests and lockfile provenance.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  inspect_security_findings: read("inspect_security_findings", "Inspect repository security findings and dependency risks.", "access_AI", ENGINEERING_ROLES, "OWNER"),

  // AI governance / observability
  inspect_ai_health: read("inspect_ai_health", "Inspect AI tool health, failures, latency and safety signals.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  inspect_ai_audit: read("inspect_ai_audit", "Inspect AI actions, confirmations, denials and audit records.", "access_AI", ENGINEERING_ROLES, "OWNER"),
  evaluate_ai_tool: write("evaluate_ai_tool", "Run a deterministic evaluation against an AI tool contract.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
  run_prompt_injection_test: write("run_prompt_injection_test", "Run security evaluations against untrusted AI inputs and tool boundaries.", "access_AI", "HIGH_RISK", true, ENGINEERING_ROLES),
  create_ai_evaluation_case: write("create_ai_evaluation_case", "Create a reproducible AI evaluation case and expected outcome.", "access_AI", "LOW_RISK_WRITE", false, ENGINEERING_ROLES),
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
