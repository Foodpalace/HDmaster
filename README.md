# Roshoi Core

**Integration Core + Admin / CEO Command Center**

This is the central brain of the Roshoi multi-vendor food delivery platform.

## Role

- Single source of truth for orders, payments, ledger, restaurants, riders, customers
- Admin / CEO operations dashboard
- Shared backend logic used by:
  - Customer App
  - Restaurant / Partner App
  - Rider App

## Architecture

- Modern stack: React 19 + TanStack Start + TypeScript + Kysely + Better Auth
- Money handled as integer paise (no floating point)
- Strong order state machine
- Organization-scoped multi-tenant design
- Audit logs are append-only

## Key Domains

- Orders & State Machine
- Finance / Ledger / Settlements
- RBAC & Permissions
- Cities, Zones, Restaurants, Riders, Customers
- Tickets, KYC, Risk, Promotions

## Status

Active development. Core schema and domain logic are established.  
Focus: stability, correctness, and clean integration with the three frontend apps.

## Related Repos

- `roshi-customers` → Customer ordering app
- `Roshoi-parners` → Restaurant / Partner portal
- `roshoi-riders` → Rider app

---

Built with care. Do not break the core.
