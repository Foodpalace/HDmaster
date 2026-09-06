# Window 4 integration contracts

Roshoi Command (Window 4) is the administration, operations, finance-visibility,
and CEO intelligence surface. It does **not** own customer checkout, restaurant
POS, rider dispatch matching, or payout execution.

All marketplace figures in this window are labelled **SIMULATED** until the
corresponding window is actually connected. Do not treat adapters as live.

Authentication for admin APIs is the signed-in employee session (Better Auth)
plus server-side RBAC. Future Shared Core should issue an audience=`admin`
service credential; Window 4 must never use a customer, restaurant, or rider
token to call privileged APIs.

Idempotency: mutations that create tickets, refunds, or status changes should
carry an `Idempotency-Key` once Window 5 owns the write path. Window 4 currently
writes to its local operational store and records an append-only audit row.

---

## Window 1 — Customer system

Window 4 **consumes**:

| Event / endpoint | Direction | Auth | Notes |
|---|---|---|---|
| `customer.registered` | W1 → W4/W5 | service | Creates a customer reference, not a full PII dump |
| `order.placed` | W1 → core | service | Order enters `PENDING` |
| `order.cancelled_by_customer` | W1 → core | service | Only valid from `PENDING`/`CONFIRMED` per state machine |
| `GET /v1/admin/customers/:id` | W4 → core | admin | Masked phone, loyalty, order count |
| `GET /v1/admin/orders` | W4 → core | admin | Filter by city/status. Paginated |
| `support.ticket.opened` | W1 → W4 | service | Lands in customer support queue |
| `loyalty.updated` | W1 → core | service | Points/cashback with caps |

Window 4 **does not** modify Window 1 internals. Refunds and cancellations are
admin interventions on the shared order record, audited, permissioned.

Example order payload Window 4 expects:

```json
{
  "orderId": "ROS-KRM-0001",
  "customerRef": "C-1001",
  "status": "PENDING",
  "paymentStatus": "AUTHORIZED",
  "items": [{ "name": "Chicken biryani", "qty": 1, "unitPaise": 22000 }],
  "totalsPaise": { "food": 22000, "discount": 0, "delivery": 3000, "tax": 550, "total": 25550 },
  "placedAt": "2026-09-01T12:00:00+05:30",
  "cityId": "city_karimganj"
}
```

Errors: `401` unauthenticated, `403` missing permission or city isolation,
`404` unknown id, `409` illegal state transition, `429` rate limit.

---

## Window 2 — Restaurant / vendor system

Window 4 **consumes**: restaurant profile, menu, availability, preparation
status, restaurant-raised tickets, settlement statements.

Events: `restaurant.submitted`, `restaurant.availability_changed`,
`order.accepted`, `order.rejected`, `order.preparing`, `order.ready`,
`menu.updated`.

Admin actions (RBAC): approve, reject, suspend, reactivate. KYC status in
Window 4 is an **operator workflow**, not a claim of government verification.

---

## Window 3 — Rider / delivery partner system

Window 4 **monitors** dispatch. It does not implement a second matching engine.

Events: `rider.online`, `rider.offline`, `offer.sent`, `offer.accepted`,
`offer.expired`, `delivery.picked_up`, `delivery.completed`, `delivery.failed`.

`POST /v1/admin/dispatch/reassign` is a **request** to the future core dispatcher.
GPS is only shown when operationally permitted.

Earnings are read from the ledger. Administrators cannot arbitrarily edit rider
pay.

---

## Window 5 — Shared Core

Eventually owns: authentication, users, roles, orders, restaurants, riders,
payments, settlements, dispatch, notifications, analytics, AI, risk, audit,
configuration.

Window 4 already exposes the admin route family the core should honour:

- `GET /v1/admin/dashboard`
- `GET /v1/admin/orders`
- `GET /v1/admin/restaurants`
- `GET /v1/admin/riders`
- `GET /v1/admin/customers`
- `GET /v1/admin/support`
- `GET /v1/admin/analytics`
- `GET /v1/admin/finance`
- `GET /v1/admin/settlements`
- `GET /v1/admin/audit`
- `GET /v1/admin/settings`
- `GET /v1/admin/feature-flags`
- `GET /v1/admin/branding`
- `POST /v1/admin/ai`

Until those HTTP routes exist on core, Window 4 serves the same family locally
from session-authenticated `/v1/admin/*` handlers (`src/routes/v1/admin/`).
Mutations that create tickets, refunds, or status changes accept an
`Idempotency-Key` header. Audit logs remain append-only — there is no update
or delete API.

---

## State machine (orders)

Happy path: `PENDING → CONFIRMED → PREPARING → READY → RIDER_ASSIGNED → PICKED_UP → ON_THE_WAY → ARRIVING → DELIVERED`.

Illegal transitions are rejected server-side.

---

## Authorization tests Window 5 must preserve

1. Support cannot open the CEO financial dashboard.
2. Area managers cannot read another city.
3. Finance cannot change commission without `modify_financial_settings`.
4. Employees cannot change another employee’s permissions without `manage_roles`.
5. Cross-organization reads fail.
6. AI tools cannot return data outside the caller’s permissions.
7. Unauthorized refunds fail.
8. Audit log has no update/delete API.
