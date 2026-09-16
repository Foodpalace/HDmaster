import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ORDER_CONTRACT_VERSION,
  MARKETPLACE_LABELS,
  assertCanonicalTransition,
  type OrderTransitionCommand,
} from "./canonical-contract.ts";

describe("canonical order contract", () => {
  const base: OrderTransitionCommand = {
    contractVersion: ORDER_CONTRACT_VERSION,
    orderId: "ord_1",
    from: "PENDING",
    to: "CONFIRMED",
    actor: "restaurant",
    idempotencyKey: "idem_1",
  };

  it("accepts valid actor-aware transitions", () => {
    assert.doesNotThrow(() => assertCanonicalTransition(base));
  });

  it("rejects invalid transitions", () => {
    assert.throws(() =>
      assertCanonicalTransition({ ...base, from: "DELIVERED", to: "PREPARING" }),
    );
  });

  it("requires idempotency", () => {
    assert.throws(() =>
      assertCanonicalTransition({ ...base, idempotencyKey: "" }),
    );
  });

  it("requires the supported contract version", () => {
    assert.throws(() =>
      assertCanonicalTransition({ ...base, contractVersion: "999" as typeof ORDER_CONTRACT_VERSION }),
    );
  });

  it("maps every canonical status to a presentation label", () => {
    const expected = [
      "PENDING", "CONFIRMED", "PREPARING", "READY", "RIDER_ASSIGNED",
      "PICKED_UP", "ON_THE_WAY", "ARRIVING", "DELIVERED", "CANCELLED",
      "PAYMENT_FAILED", "RESTAURANT_REJECTED", "RIDER_CANCELLED",
      "DELIVERY_FAILED", "CUSTOMER_UNAVAILABLE", "REFUND_PENDING",
      "REFUNDED", "DISPUTED",
    ] as const;
    for (const status of expected) assert.ok(MARKETPLACE_LABELS[status]);
  });
});
