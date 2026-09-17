import type { DataMode } from "@/lib/roshoi/types";
import type { Permission } from "@/lib/roshoi/permissions";

/**
 * Master AI operating model.
 *
 * This is an execution/governance contract for the AI operating layer. It does
 * not grant permissions and it does not replace server-side authorization.
 * Every action must still pass the canonical RBAC, data-mode, tenant-scope,
 * idempotency, validation and audit checks at the execution boundary.
 */
export type MasterAiTeam =
  | "CEO_STRATEGY"
  | "OPERATIONS"
  | "FINANCE_ACCOUNTING"
  | "MARKETPLACE"
  | "DISPATCH"
  | "CUSTOMER_EXPERIENCE"
  | "PARTNER_EXPERIENCE"
  | "RIDER_EXPERIENCE"
  | "DATA_BI"
  | "RISK_FRAUD"
  | "SECURITY"
  | "SOFTWARE_ARCHITECTURE"
  | "BACKEND"
  | "FRONTEND"
  | "MOBILE"
  | "QA_TESTING"
  | "SRE_DEVOPS"
  | "DATABASE"
  | "INTEGRATIONS"
  | "AI_ML"
  | "PROMPT_SECURITY"
  | "LOCALIZATION"
  | "GROWTH"
  | "PRODUCT"
  | "COMPLIANCE"
  | "RELEASE"
  | "DOCUMENTATION";

export type MasterAiWorkClass =
  | "OBSERVE"
  | "ANALYZE"
  | "PLAN"
  | "IMPLEMENT"
  | "TEST"
  | "VERIFY"
  | "RELEASE"
  | "MONITOR"
  | "ESCALATE";

export type MasterAiActionRisk = "READ" | "LOW_RISK_WRITE" | "FINANCIAL" | "HIGH_RISK" | "EMERGENCY";

export type MasterAiExecutionPolicy = {
  risk: MasterAiActionRisk;
  confirmationRequired: boolean;
  ownerApprovalRequired: boolean;
  auditRequired: boolean;
  reversible: boolean;
  productionAllowed: boolean;
};

export type MasterAiTeamDefinition = {
  id: MasterAiTeam;
  mission: string;
  capabilities: readonly string[];
  canOwn: readonly MasterAiWorkClass[];
};

export const MASTER_AI_TEAMS: readonly MasterAiTeamDefinition[] = [
  { id: "CEO_STRATEGY", mission: "Executive strategy, priorities, scenarios and decision support.", capabilities: ["strategy", "scenario planning", "unit economics", "OKRs", "cross-team prioritization"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "VERIFY", "ESCALATE"] },
  { id: "OPERATIONS", mission: "Marketplace operational control from order placement through delivery.", capabilities: ["SLA management", "incident response", "restaurant operations", "rider operations", "capacity planning"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "VERIFY", "MONITOR", "ESCALATE"] },
  { id: "FINANCE_ACCOUNTING", mission: "Financial truth, accounting controls, reconciliation and settlement integrity.", capabilities: ["double-entry review", "payment reconciliation", "refund controls", "settlements", "commission", "promotion funding", "profitability"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "VERIFY", "ESCALATE"] },
  { id: "MARKETPLACE", mission: "Customer, restaurant and marketplace product economics and flow quality.", capabilities: ["discovery", "search", "menu", "cart", "checkout", "pricing", "promotions", "conversion"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "MONITOR"] },
  { id: "DISPATCH", mission: "Rider supply, matching, offers, reassignment and delivery optimization.", capabilities: ["matching", "ETA", "batching", "capacity", "geospatial optimization", "dispatch recovery"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "MONITOR"] },
  { id: "CUSTOMER_EXPERIENCE", mission: "Customer support, trust, retention and end-to-end experience.", capabilities: ["support", "complaints", "refund workflows", "retention", "journey analysis", "AI support"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "MONITOR", "ESCALATE"] },
  { id: "PARTNER_EXPERIENCE", mission: "Restaurant/merchant tooling, onboarding, menu, orders and settlements.", capabilities: ["partner onboarding", "KYC workflow", "menu operations", "KDS", "analytics", "settlements", "partner AI"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "MONITOR"] },
  { id: "RIDER_EXPERIENCE", mission: "Rider app, delivery workflow, earnings and rider support.", capabilities: ["offers", "navigation", "GPS", "pickup", "OTP", "delivery proof", "earnings", "rider AI"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "MONITOR"] },
  { id: "DATA_BI", mission: "Canonical metrics, reporting, experimentation and decision intelligence.", capabilities: ["GMV", "AOV", "retention", "cohorts", "profitability", "forecasting", "data quality"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "VERIFY", "MONITOR"] },
  { id: "RISK_FRAUD", mission: "Fraud, abuse, anomaly detection and operational risk controls.", capabilities: ["fraud signals", "abuse detection", "anomaly detection", "risk scoring", "case management"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "VERIFY", "MONITOR", "ESCALATE"] },
  { id: "SECURITY", mission: "Application, identity, data and AI security.", capabilities: ["RBAC", "tenant isolation", "secret safety", "threat modeling", "security testing", "incident response"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "TEST", "VERIFY", "MONITOR", "ESCALATE"] },
  { id: "SOFTWARE_ARCHITECTURE", mission: "System design, contracts, boundaries and technical integrity.", capabilities: ["architecture review", "API contracts", "state machines", "dependency design", "technical debt"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY"] },
  { id: "BACKEND", mission: "Server-side implementation and canonical business services.", capabilities: ["APIs", "domain services", "validation", "transactions", "idempotency", "integration services"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY"] },
  { id: "FRONTEND", mission: "Web command-center and marketplace interfaces.", capabilities: ["UX", "accessibility", "responsive UI", "state management", "performance", "error recovery"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY"] },
  { id: "MOBILE", mission: "Customer, partner and rider mobile application engineering.", capabilities: ["offline recovery", "push", "GPS", "deep links", "mobile performance", "release readiness"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY"] },
  { id: "QA_TESTING", mission: "Functional, integration, regression, security and production-path verification.", capabilities: ["unit tests", "integration tests", "E2E", "contract tests", "failure injection", "regression"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "TEST", "VERIFY", "MONITOR"] },
  { id: "SRE_DEVOPS", mission: "CI/CD, reliability, observability, deployments and recovery.", capabilities: ["CI", "deployment", "health checks", "logging", "metrics", "alerts", "rollback", "DR"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "RELEASE", "MONITOR", "ESCALATE"] },
  { id: "DATABASE", mission: "Schema, migrations, query safety, consistency and data lifecycle.", capabilities: ["migrations", "indexes", "transactions", "integrity", "backups", "recovery", "performance"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "MONITOR"] },
  { id: "INTEGRATIONS", mission: "Payment, messaging, maps, POS and external service integrations.", capabilities: ["webhooks", "OAuth/service auth", "retries", "idempotency", "provider failover", "contract verification"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "MONITOR"] },
  { id: "AI_ML", mission: "AI models, tool use, retrieval, evaluation, routing and cost/quality control.", capabilities: ["tool calling", "RAG", "model routing", "evaluation", "memory", "forecasting", "recommendations"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY", "MONITOR"] },
  { id: "PROMPT_SECURITY", mission: "Prompt injection resistance and AI authorization boundaries.", capabilities: ["untrusted-input handling", "tool isolation", "instruction hierarchy", "exfiltration defense", "AI red teaming"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "TEST", "VERIFY", "MONITOR", "ESCALATE"] },
  { id: "LOCALIZATION", mission: "Language, locale, currency, regional behavior and translation quality.", capabilities: ["English", "Hindi", "Bengali", "Assamese-ready architecture", "locale safety", "translation QA"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "IMPLEMENT", "TEST", "VERIFY"] },
  { id: "GROWTH", mission: "Acquisition, conversion, retention, promotions and merchant growth intelligence.", capabilities: ["funnel optimization", "campaign analysis", "segmentation", "experimentation", "merchant growth"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "VERIFY", "MONITOR"] },
  { id: "PRODUCT", mission: "Product discovery, requirements, prioritization and release outcomes.", capabilities: ["requirements", "roadmaps", "acceptance criteria", "UX research", "release criteria"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "VERIFY", "ESCALATE"] },
  { id: "COMPLIANCE", mission: "Policy, auditability, privacy, KYC and regulated-process controls.", capabilities: ["audit", "privacy", "KYC", "retention", "policy checks", "evidence"], canOwn: ["OBSERVE", "ANALYZE", "PLAN", "VERIFY", "ESCALATE"] },
  { id: "RELEASE", mission: "Release governance and evidence-based production promotion.", capabilities: ["release gates", "artifact verification", "deployment evidence", "rollback readiness"], canOwn: ["OBSERVE", "VERIFY", "RELEASE", "MONITOR", "ESCALATE"] },
  { id: "DOCUMENTATION", mission: "Living technical, operational and audit documentation.", capabilities: ["runbooks", "API docs", "architecture records", "change records", "incident reports"], canOwn: ["OBSERVE", "ANALYZE", "IMPLEMENT", "VERIFY", "MONITOR"] },
];

export const MASTER_AI_WORKFLOW: readonly MasterAiWorkClass[] = [
  "OBSERVE",
  "ANALYZE",
  "PLAN",
  "IMPLEMENT",
  "TEST",
  "VERIFY",
  "RELEASE",
  "MONITOR",
  "ESCALATE",
];

export const MASTER_AI_EXECUTION_POLICIES: Record<MasterAiActionRisk, MasterAiExecutionPolicy> = {
  READ: { risk: "READ", confirmationRequired: false, ownerApprovalRequired: false, auditRequired: true, reversible: true, productionAllowed: true },
  LOW_RISK_WRITE: { risk: "LOW_RISK_WRITE", confirmationRequired: false, ownerApprovalRequired: false, auditRequired: true, reversible: true, productionAllowed: true },
  FINANCIAL: { risk: "FINANCIAL", confirmationRequired: true, ownerApprovalRequired: false, auditRequired: true, reversible: false, productionAllowed: true },
  HIGH_RISK: { risk: "HIGH_RISK", confirmationRequired: true, ownerApprovalRequired: true, auditRequired: true, reversible: false, productionAllowed: false },
  EMERGENCY: { risk: "EMERGENCY", confirmationRequired: false, ownerApprovalRequired: true, auditRequired: true, reversible: false, productionAllowed: false },
};

export type MasterAiTask = {
  taskId: string;
  objective: string;
  team: MasterAiTeam;
  workClass: MasterAiWorkClass;
  risk: MasterAiActionRisk;
  requiredPermission: Permission;
  dataMode: DataMode;
  evidenceRequired: boolean;
};

export function getMasterAiTeam(id: MasterAiTeam): MasterAiTeamDefinition {
  const team = MASTER_AI_TEAMS.find((candidate) => candidate.id === id);
  if (!team) throw new Error(`Unknown Master AI team: ${id}`);
  return team;
}

export function executionPolicyForRisk(risk: MasterAiActionRisk): MasterAiExecutionPolicy {
  return MASTER_AI_EXECUTION_POLICIES[risk];
}
