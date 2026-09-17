# Order King — Zomato-parity master backlog

Order King is built as a separate marketplace. Zomato is used only as an observable benchmark for marketplace depth, operational maturity and India-local requirements. This backlog does not copy Zomato branding, proprietary implementation or protected assets.

## P0 — production marketplace authority

- [ ] Canonical order lifecycle: customer → restaurant → dispatch → rider → delivery → refund/dispute.
- [ ] Restaurant accept/reject/timeout/inaction handling with reason codes and escalation.
- [ ] Item, variant, add-on, category and schedule-level OOS.
- [ ] Restaurant online/offline controls with reason, schedule and audit.
- [ ] Kitchen prep state, KPT/ETA capture and overdue escalation.
- [ ] Secure rider identity binding; rider cannot choose another rider ID.
- [ ] READY → offer → accept/decline/expire → rider assigned → pickup → transit → arrival → delivered.
- [ ] Delivery OTP and proof-of-delivery lifecycle.
- [ ] LIVE rider GPS ingestion, freshness and stale-location handling.
- [ ] Customer realtime tracking and ETA from canonical dispatch/location data.
- [ ] Dispatch scoring: distance, zone, workload, acceptance, reliability, vehicle/capacity and freshness.
- [ ] Re-dispatch, no-response, rider timeout and delivery-failure recovery.
- [ ] Idempotency and race-condition protection for every order mutation.
- [ ] Full payment lifecycle: authorize/capture/fail/refund/partial-refund/retry/reconcile.
- [ ] Immutable double-entry ledger for every financial movement.
- [ ] Merchant settlement preview → approval → payout → reconciliation → exception workflow.
- [ ] Rider earnings, adjustments and settlement reconciliation.
- [ ] Complaint/case system with SLA, severity, evidence, owner, escalation and resolution audit.
- [ ] Refund policy engine with guarded execution and reconciliation.
- [ ] Unified notifications: customer, restaurant, rider, support and finance.

## P1 — restaurant/partner OS

- [ ] Full menu CRUD with moderation/status lifecycle.
- [ ] Categories, variants, add-ons, dietary labels, descriptions, nutrition/serving metadata where required.
- [ ] Price, tax, fee and charge configuration with effective dates.
- [ ] Menu import/export and safe bulk operations.
- [ ] Menu sync status, callback/webhook handling and failure recovery.
- [ ] Restaurant hours, holiday exceptions and temporary closure.
- [ ] Order relay/status/fetch webhook reliability.
- [ ] Order rejection reason catalogue and operational analytics.
- [ ] Cooking instructions and merchant notes.
- [ ] Bulk-order handling.
- [ ] Self-logistics support without bypassing HDmaster canonical order state.
- [ ] Call/contact masking architecture where legally and technically applicable.
- [ ] Partner dashboard: orders, KPT, acceptance, cancellation, complaints, sales, settlement and menu health.
- [ ] Partner AI copilot with real tool execution under restaurant scope.

## P1 — customer marketplace

- [ ] Geospatial serviceability by city/zone/radius/polygon.
- [ ] Search by restaurant, dish, cuisine and natural-language intent.
- [ ] Filters: cuisine, dietary, price, delivery time, rating, offers, availability.
- [ ] Ranking using availability, distance, ETA, quality, conversion and personalization signals.
- [ ] Restaurant profile, hours, delivery fee, minimum order and serviceability.
- [ ] Menu variants/add-ons/OOS/schedules rendered consistently across apps.
- [ ] Cart validation against current menu/price/OOS state.
- [ ] Address validation and delivery-location snapshot.
- [ ] Payment retries and failure recovery.
- [ ] COD lifecycle and abuse/risk controls.
- [ ] Coupons, offers, wallet/loyalty and promotion-funder transparency.
- [ ] Order tracking timeline and realtime ETA.
- [ ] Cancellation policy based on canonical state and configured merchant/customer rules.
- [ ] Rating/review lifecycle with verified-order linkage and moderation.
- [ ] Customer support, refunds and complaint escalation.
- [ ] Personalized recommendations and repeat-order flows.

## P1 — dispatch and logistics

- [ ] Geospatial distance matrix and travel-time estimation.
- [ ] Rider eligibility and serviceability engine.
- [ ] Offer batching/stacking where operationally safe.
- [ ] Dynamic dispatch rebalance.
- [ ] Restaurant pickup readiness prediction.
- [ ] Delivery ETA prediction.
- [ ] Rider workload and capacity balancing.
- [ ] Zone-level supply/demand monitoring.
- [ ] Peak-hour dispatch policy.
- [ ] Failed-delivery recovery and customer communication.
- [ ] Rider incentives/earnings/penalties with ledger traceability.
- [ ] Dispatch simulation environment that can never mutate LIVE production data.

## P1 — financial core

- [ ] Order-level gross/net revenue breakdown.
- [ ] Commission calculation and versioned contracts.
- [ ] Platform-funded vs merchant-funded promotion allocation.
- [ ] Taxes/fees/rounding policy and ledger reconciliation.
- [ ] Payment gateway reconciliation.
- [ ] Refund and chargeback/dispute lifecycle.
- [ ] Merchant settlement statements.
- [ ] Rider settlement statements.
- [ ] Financial period close and exception reporting.
- [ ] Finance-role isolation and minimum-necessary PII.
- [ ] Financial AI preview/approval/execute/reconcile/audit pipeline.

## P1 — reliability, security and compliance

- [ ] API authentication and authorization matrix across all apps.
- [ ] Tenant/org/city/area isolation tests.
- [ ] Secure service-token use; no caller-controlled identity substitution.
- [ ] Input validation and output validation at every external boundary.
- [ ] Prompt-injection resistance and untrusted-content isolation.
- [ ] Rate limits and abuse controls.
- [ ] Structured audit trail for AI and business mutations.
- [ ] Secret management and secret-leak scanning.
- [ ] Dependency/security finding workflow.
- [ ] Observability: logs, metrics, traces, alerts and SLOs.
- [ ] Queue/retry/dead-letter strategy for webhooks and notifications.
- [ ] Database transaction and concurrency tests.
- [ ] Backup/restore and disaster-recovery verification.
- [ ] Production migration safety and rollback strategy.
- [ ] Privacy/data-retention controls appropriate to Indian operations.
- [ ] Local tax/regulatory/legal review before production claims; do not encode legal assumptions as facts.

## P1 — Master AI: operating system, not chat

- [ ] Replace snapshot-only chat with real Responses API/tool-calling loop.
- [ ] Governed registry for every tool with permission, scope, risk and audit metadata.
- [ ] Read tools execute against HDmaster canonical data.
- [ ] Low-risk writes require authorization, idempotency and verification.
- [ ] Financial tools require preview/validation/approval/execute/reconcile/audit.
- [ ] High-risk engineering/production actions require explicit approval.
- [ ] Engineering agent: inspect → reproduce → root cause → patch → targeted test → typecheck → test → lint → build → CI → deploy verification.
- [ ] Repository inspection and GitHub operations through scoped credentials.
- [ ] CI diagnosis from actual logs, never inferred status.
- [ ] Web research with source retrieval and source-aware answers.
- [ ] Code execution in isolated tooling for calculations and engineering diagnostics.
- [ ] File/document/image analysis with access control and PII minimization.
- [ ] Specialist team orchestration: architecture, backend, frontend, mobile, database, SRE, security, QA, AI/ML, finance, operations, growth, support, UX and compliance review.
- [ ] Model routing by task: fast, reasoning, coding, vision and retrieval.
- [ ] Context retrieval, compaction and caching for long-running work.
- [ ] Persistent task state and resumable work without fabricating progress.
- [ ] Action receipts with exact tool, target, authorization, result and verification evidence.
- [ ] AI memory limited to authorized Order King operational context.
- [ ] Prompt-injection evaluations and regression suite.
- [ ] AI quality/evaluation dashboard.
- [ ] Cost/latency budgets and model fallback policy.
- [ ] Multilingual operation: English, Hindi, Bengali, Assamese architecture; never translate IDs, money, OTPs or canonical statuses.

## P2 — growth, intelligence and marketplace advantage

- [ ] Personalized home feed and recommendations.
- [ ] Merchant growth recommendations.
- [ ] Campaign measurement and attribution.
- [ ] Cohort/retention/LTV analysis.
- [ ] Demand forecasting.
- [ ] Supply forecasting.
- [ ] Pricing/delivery-fee experiments with guardrails.
- [ ] Fraud/risk scoring and case management.
- [ ] A/B testing with experiment auditability.
- [ ] Marketplace health scorecards.
- [ ] CEO command-center brief generated from verified data.
- [ ] Natural-language BI over ledger/order/dispatch/support data.

## P2 — quality and release gate

Every production feature is complete only when the applicable evidence exists:

`REAL_DATA → REAL_PERMISSION → REAL_EXECUTION → REAL_VERIFICATION → AUDIT_TRAIL`

Engineering acceptance:

`REPRODUCE → ROOT_CAUSE → MINIMAL_PATCH → TARGETED_TEST → TYPECHECK → TEST → LINT → BUILD → CI_VERIFY → DEPLOY_VERIFY → MONITOR`

No item is marked complete merely because code exists. LIVE credentials, third-party approvals, external accounts, legal review and production traffic are separately verified dependencies.
