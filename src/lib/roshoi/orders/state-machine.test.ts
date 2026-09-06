import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertTransition,
  canTransition,
  isDelayed,
} from "./state-machine.ts";

describe("order state machine", () => {
  it("allows the happy path", () => {
    const path = [
      ["PENDING", "CONFIRMED"],
      ["CONFIRMED", "PREPARING"],
      ["PREPARING", "READY"],
      ["READY", "RIDER_ASSIGNED"],
      ["RIDER_ASSIGNED", "PICKED_UP"],
      ["PICKED_UP", "ON_THE_WAY"],
      ["ON_THE_WAY", "ARRIVING"],
      ["ARRIVING", "DELIVERED"],
    ] as const;
    for (const [from, to] of path) {
      assert.equal(canTransition(from, to), true);
    }
  });

  it("rejects skipping to delivered", () => {
    assert.equal(canTransition("PENDING", "DELIVERED"), false);
    assert.throws(() => assertTransition("PENDING", "DELIVERED"));
  });

  it("rejects resurrecting a refunded order", () => {
    assert.equal(canTransition("REFUNDED", "CONFIRMED"), false);
  });

  it("allows refund only from terminal / failed states", () => {
    assert.equal(canTransition("PENDING", "REFUND_PENDING"), false);
    assert.equal(canTransition("ON_THE_WAY", "REFUND_PENDING"), false);
    assert.equal(canTransition("DELIVERED", "REFUND_PENDING"), true);
    assert.equal(canTransition("CANCELLED", "REFUND_PENDING"), true);
    assert.equal(canTransition("REFUND_PENDING", "REFUNDED"), true);
  });
});
