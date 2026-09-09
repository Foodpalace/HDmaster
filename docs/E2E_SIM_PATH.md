# Simulated end-to-end path (no live money)

## Status

Batches 1–3: marketplace status bridge merged.
Batches 4–6: sim dispatch consumer + track helpers on feature branches.

## Happy path (SIMULATED kitchens only)

1. **Customer** `placeOrder` → status `PLACED` (COD or UPI_SANDBOX).
2. **Partner** `transitionOrder(accept → preparing → ready)` → `READY`.
3. On READY, partner inserts `rider_dispatch_queue` (`status=queued`, `data_label=SIMULATED`).
4. **Rider** `SimulatedDispatch.enqueuePartnerRow` → exclusive offer → accept → delivery states.
5. Marketplace mapping: rider `ACCEPTED` → order `RIDER_ASSIGNED`, then `PICKED_UP` → `ON_THE_WAY` → `DELIVERED`.
6. Customer track UI uses `trackProgress(status)` (`src/lib/orders/track.ts`).

## Pure tests

| Package | File |
|---------|------|
| riders | `src/lib/rider/simulated-dispatch.test.ts` |
| riders | `src/lib/rider/marketplace-e2e-path.test.ts` |
| partners | `src/lib/dispatch/queue-contract.test.ts` |
| customers | `src/lib/orders/track.test.ts` |

## Not in this batch

- Live Window 5 shared-core dispatch
- Real SMS / UPI / card rails
- Production deploy
