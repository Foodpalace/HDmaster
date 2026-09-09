# Order status map (Roshoi)

Canonical marketplace vocabulary used by **customer** and **partner** apps:

`CART → CHECKOUT → PLACED → ACCEPTED → PREPARING → READY → RIDER_ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED`

Failure / money paths: `REJECTED`, `CANCELLED`, `FAILED_PAYMENT`, `DELIVERY_FAILED`, `REFUNDED`, `PARTIAL_REFUND`.

## Who owns each transition

| From | To | Actors |
|------|-----|--------|
| PLACED | ACCEPTED / REJECTED | restaurant, admin |
| PLACED | CANCELLED | customer (early), admin, system |
| ACCEPTED | PREPARING | restaurant, admin |
| PREPARING | READY | restaurant, admin |
| READY | RIDER_ASSIGNED | rider, system, simulated_rider, admin |
| RIDER_ASSIGNED | PICKED_UP | rider, system, simulated_rider |
| PICKED_UP | ON_THE_WAY | rider, system, simulated_rider |
| ON_THE_WAY | DELIVERED | rider, system, simulated_rider |

When partner marks **READY**, partners insert into `rider_dispatch_queue` (see `Roshoi-partners` `api-orders.ts`).

## HDmaster ops aliases

HDmaster historically used a richer ops set. Bridge module:
`src/lib/roshoi/orders/status-bridge.ts`

| Marketplace | HDmaster ops |
|-------------|--------------|
| PLACED | PENDING |
| ACCEPTED | CONFIRMED |
| PREPARING | PREPARING |
| READY | READY |
| RIDER_ASSIGNED | RIDER_ASSIGNED |
| PICKED_UP | PICKED_UP |
| ON_THE_WAY | ON_THE_WAY / ARRIVING |
| DELIVERED | DELIVERED |
| REJECTED | RESTAURANT_REJECTED |
| FAILED_PAYMENT | PAYMENT_FAILED |
| CANCELLED | CANCELLED |
| DELIVERY_FAILED | DELIVERY_FAILED / CUSTOMER_UNAVAILABLE |
| REFUNDED | REFUNDED |

## Rider delivery states

Rider app uses a finer **delivery** state machine (`OFFERED`, `ACCEPTED`, `ARRIVING_AT_RESTAURANT`, …). Map to marketplace order status via `toMarketplaceOrderStatus` in riders (`src/lib/rider/order-status-bridge.ts`).

## Simulated E2E path (no live money)

1. Customer `placeOrder` → `PLACED`
2. Partner `transitionOrder(accept|preparing|ready)` → `READY` + dispatch queue
3. Partner `advanceSimulatedRider` or customer `advanceSimulatedOrder` → through to `DELIVERED`
4. Rider engine can accept simulated offers independently in sim data mode

Do not use live payment providers or real SMS without explicit approval.
