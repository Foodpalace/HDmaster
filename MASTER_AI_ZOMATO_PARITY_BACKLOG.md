# Order King — Zomato-parity and beyond backlog

This backlog is an engineering source-of-truth for the Master AI. Existing working functionality must be preserved. No item is considered complete from a design-only implementation; completion requires code, tests, and evidence from the relevant environment.

## P0 — production-critical parity

- [ ] Complete LIVE canonical order lifecycle: PENDING → CONFIRMED → PREPARING → READY → RIDER_ASSIGNED → PICKED_UP → ON_THE_WAY → ARRIVING → DELIVERED.
- [ ] Complete LIVE customer cancellation through HDmaster authority for every eligible state.
- [ ] Secure rider identity; riderId must never be trusted from an arbitrary client request.
- [ ] Complete rider offer lifecycle: offer, accept, decline, expiry, reassignment, escalation.
- [ ] Complete rider transition lifecycle including pickup, on-the-way, arriving and delivered.
- [ ] Production delivery OTP verification and failure/retry handling.
- [ ] LIVE rider GPS ingestion, freshness, authorization, storage and customer-facing tracking.
- [ ] Real-time customer order tracking and ETA updates.
- [ ] Production dispatch matcher with availability, zone, distance, ETA, capacity and active-order constraints.
- [ ] Automatic dispatch recovery and reassignment.
- [ ] Restaurant acceptance timeout, rejection reasons and escalation.
- [ ] Full restaurant OOS controls: item, variant, category and scheduled reactivation.
- [ ] Kitchen Display System with prep queue, timers, SLA alerts and ready workflow.
- [ ] Payment lifecycle verification: intent/authorization/capture/webhook/failure/retry/reconciliation.
- [ ] Full refund lifecycle: preview/approval/execution/reconciliation/audit.
- [ ] Settlement lifecycle for restaurants and riders, including reconciliation and dispute handling.
- [ ] Unified notification outbox with retries, idempotency, delivery status and critical alerts.
- [ ] Full customer → restaurant → rider → payment → delivery E2E verification.

## P1 — customer marketplace parity

- [ ] Location and address intelligence.
- [ ] Restaurant discovery and serviceability.
- [ ] Food and restaurant search.
- [ ] Filters, sorting and availability-aware ranking.
- [ ] Personalized recommendations.
- [ ] Complete menu variants, add-ons and modifier groups.
- [ ] Cart price/availability revalidation.
- [ ] Coupon and promotion validation at checkout.
- [ ] Dynamic delivery/service/packaging/tax calculation.
- [ ] COD and online payment recovery.
- [ ] Order history, reorder and favorites.
- [ ] Ratings and verified reviews.
- [ ] Customer complaint/support workflows.
- [ ] Call/contact privacy controls where required.
- [ ] Multilingual customer experience.

## P1 — restaurant/partner parity

- [ ] Partner onboarding and KYC.
- [ ] Outlet management and multi-outlet support.
- [ ] Menu/category/item/variant/add-on management.
- [ ] Price and availability scheduling.
- [ ] Online/offline controls and operational-hour scheduling.
- [ ] Order acceptance/rejection/prep-time/ready controls.
- [ ] KDS and kitchen performance.
- [ ] POS/integration webhook framework.
- [ ] Partner settlement/invoice/commission transparency.
- [ ] Promotions and campaign controls.
- [ ] Partner analytics and growth intelligence.
- [ ] Partner support and complaints.
- [ ] Partner AI operations copilot.

## P1 — rider parity

- [ ] Onboarding/KYC/approval.
- [ ] Secure authentication and device/session management.
- [ ] Availability and online/offline state.
- [ ] GPS heartbeat and location privacy.
- [ ] Offer engine and acceptance metrics.
- [ ] Navigation/pickup/delivery workflow.
- [ ] Pickup and delivery verification.
- [ ] Cash collection where applicable.
- [ ] Earnings/incentives/settlements.
- [ ] Rider support and complaints.
- [ ] Rider AI copilot.

## P2 — marketplace economics

- [ ] Coupon engine.
- [ ] Restaurant/platform/shared promotion funding.
- [ ] Free-delivery campaigns.
- [ ] Campaign budgets and guardrails.
- [ ] Promotion abuse prevention.
- [ ] Delivery pricing engine.
- [ ] Surge and demand/supply pricing controls.
- [ ] Merchant commission engine.
- [ ] Transparent settlement breakdown.
- [ ] Unit economics and profitability reporting.

## P2 — search, recommendation and growth

- [ ] Typo-tolerant search.
- [ ] Synonym and intent search.
- [ ] Natural-language food discovery.
- [ ] Local-language search.
- [ ] Quality/availability/ETA-aware ranking.
- [ ] Personalized ranking.
- [ ] Reorder intelligence.
- [ ] Trending/local discovery.
- [ ] Restaurant growth recommendations.
- [ ] Customer retention/cohort intelligence.
- [ ] Experimentation framework with guardrails.

## P2 — support, trust and risk

- [ ] Canonical complaint model.
- [ ] Severity and SLA engine.
- [ ] Evidence and audit trail.
- [ ] Refund/dispute orchestration.
- [ ] Fraud and abuse signals.
- [ ] Account/payment/order risk scoring.
- [ ] Suspicious activity detection.
- [ ] Human escalation queues.
- [ ] Safety/legal escalation paths.

## P2 — reliability and platform

- [ ] Unified observability for APIs, queues, payments, webhooks, dispatch and notifications.
- [ ] Error budgets and SLO monitoring.
- [ ] Retry/dead-letter/replay controls.
- [ ] Database consistency and migration verification.
- [ ] Backup and disaster-recovery verification.
- [ ] Performance/load testing.
- [ ] Rate limits and abuse controls.
- [ ] Secrets and credential isolation.
- [ ] Multi-city and multi-zone production validation.
- [ ] Deployment health checks and rollback evidence.

## Master AI — all-rounder operating layer

### Internal capabilities

- [ ] Unified tool registry covering orders, restaurants, riders, customers, finance, analytics, support, risk, engineering and platform operations.
- [ ] Real tool implementations connected to canonical HDmaster data.
- [ ] Server-side RBAC and tenant-scope enforcement at every tool boundary.
- [ ] Data-mode enforcement: SIMULATED/SANDBOX/PRODUCTION.
- [ ] Safe action execution with idempotency and validation.
- [ ] Financial action confirmation and owner approval controls.
- [ ] Audit record for every AI tool call and action.
- [ ] Structured response protocol: STATUS → CAUSE → ACTION → RESULT → RISK → OWNER REQUIRED.
- [ ] Evidence-aware answers that distinguish facts, calculations, recommendations and uncertainty.
- [ ] Cross-team orchestration and task delegation.
- [ ] AI incident commander.
- [ ] AI health center.
- [ ] AI daily/weekly/monthly operating reports.
- [ ] AI action queue: AUTO-FIXED / NEEDS APPROVAL / CRITICAL / MONITORING / COMPLETED.

### Elite engineering capabilities

- [ ] Repository inspection.
- [ ] Architecture inspection.
- [ ] Git status/history/diff analysis.
- [ ] Code search and dependency analysis.
- [ ] CI inspection.
- [ ] Failed-CI diagnosis.
- [ ] Root-cause analysis.
- [ ] Minimal safe patch generation.
- [ ] Authorized patch application.
- [ ] Typecheck/test/lint/build execution.
- [ ] Targeted regression tests.
- [ ] E2E and contract-test execution.
- [ ] Deployment verification.
- [ ] Post-deployment monitoring.
- [ ] Rollback planning/execution where authorized.
- [ ] Engineering task creation and prioritization.
- [ ] Security and performance review.
- [ ] Technical-debt detection.

### Strategy/accounting/operations capabilities

- [ ] CEO strategy and scenario analysis.
- [ ] Marketplace unit economics.
- [ ] Demand/supply planning.
- [ ] Restaurant growth strategy.
- [ ] Rider supply strategy.
- [ ] Financial/accounting review.
- [ ] Ledger/reconciliation analysis.
- [ ] Settlement controls.
- [ ] Promotion ROI analysis.
- [ ] Forecasting.
- [ ] KPI/OKR monitoring.
- [ ] Root-cause analysis of business deterioration.
- [ ] Evidence-based action plans.

### External development/integration capabilities

- [ ] Payment providers.
- [ ] Maps/geolocation providers.
- [ ] Messaging/notification providers.
- [ ] POS integrations.
- [ ] Search/indexing services.
- [ ] AI model providers.
- [ ] Cloud/deployment services.
- [ ] External API health and contract monitoring.
- [ ] Provider failure/fallback orchestration.
- [ ] Webhook verification and replay safety.

### AI safety

- [ ] Prompt-injection defenses.
- [ ] Treat customer/restaurant/rider content and external API content as untrusted.
- [ ] Tool authorization independent of model instructions.
- [ ] PII minimization and scoped retrieval.
- [ ] Secret redaction.
- [ ] Cross-tenant leakage tests.
- [ ] Financial-action safeguards.
- [ ] AI red-team evaluations.
- [ ] Model/tool abuse rate limits.
- [ ] Human escalation for high-risk actions.

## Definition of done

A feature is only marked complete after:

1. Implementation exists in the correct repository.
2. Canonical business authority is preserved.
3. Authorization and tenant scope are enforced.
4. Failure and retry behavior are implemented.
5. Tests cover normal and adverse paths.
6. Typecheck/lint/build/tests pass where applicable.
7. LIVE/SANDBOX/SIMULATED behavior is explicitly verified.
8. Audit/evidence exists for consequential actions.
9. Deployment status is verified independently.
10. No unsupported production-readiness claim is made.
