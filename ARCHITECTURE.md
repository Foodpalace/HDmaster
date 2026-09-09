# Roshoi Core – Architecture

## Purpose
HDmaster is the single Integration Core + Admin Command Center for the entire Roshoi platform.

## Principles

1. One canonical order
2. One canonical payment record
3. One immutable financial ledger (append-only)
4. One canonical restaurant, rider, and customer identity
5. Money always in integer paise
6. Strong state machines for orders, restaurants, riders
7. Organization-scoped multi-tenancy
8. Audit logs are never updated or deleted

## Order Status Flow (Core)

PENDING → CONFIRMED → PREPARING → READY → RIDER_ASSIGNED → PICKED_UP → ON_THE_WAY → ARRIVING → DELIVERED

Terminal states include: CANCELLED, PAYMENT_FAILED, RESTAURANT_REJECTED, DELIVERY_FAILED, REFUNDED, etc.

## Data Modes
- SIMULATED (default for development)
- SANDBOX
- LIVE

## Key Folders

- `src/lib/roshoi/` → Domain logic (orders, finance, rbac, etc.)
- `migrations/` → Database schema
- `src/routes/` → App routes + API

## Frontend Apps (Consumers of this Core)

- Customers
- Partners (Restaurants)
- Riders

This core must remain stable and correct. All other apps depend on it.
