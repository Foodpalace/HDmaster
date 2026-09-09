import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isMarketplaceStatus,
  MARKETPLACE_TRACK,
  toMarketplaceStatus,
  toOpsStatus,
} from "./status-bridge.ts";

describe("status-bridge", () => {
  it("maps ops PENDING/CONFIRMED to marketplace PLACED/ACCEPTED", () => {
    assert.equal(toMarketplaceStatus("PENDING"), "PLACED");
    assert.equal(toMarketplaceStatus("CONFIRMED"), "ACCEPTED");
    assert.equal(toMarketplaceStatus("ARRIVING"), "ON_THE_WAY");
    assert.equal(toMarketplaceStatus("RESTAURANT_REJECTED"), "REJECTED");
    assert.equal(toMarketplaceStatus("PAYMENT_FAILED"), "FAILED_PAYMENT");
  });

  it("round-trips marketplace happy path into ops statuses", () => {
    for (const step of MARKETPLACE_TRACK) {
      const ops = toOpsStatus(step);
      const back = toMarketplaceStatus(ops);
      assert.ok(back, `missing map for ${step}`);
      // ARRIVING collapses to ON_THE_WAY on the way back from ops; happy path uses ON_THE_WAY
      if (step === "ON_THE_WAY") {
        assert.equal(back, "ON_THE_WAY");
      } else if (step === "PLACED") {
        assert.equal(back, "PLACED");
      } else if (step === "ACCEPTED") {
        assert.equal(back, "ACCEPTED");
      } else {
        assert.equal(back, step);
      }
    }
  });

  it("recognizes marketplace statuses", () => {
    assert.equal(isMarketplaceStatus("PLACED"), true);
    assert.equal(isMarketplaceStatus("PENDING"), false);
  });

  it("passes through already-marketplace strings", () => {
    assert.equal(toMarketplaceStatus("PLACED"), "PLACED");
    assert.equal(toMarketplaceStatus("RIDER_ASSIGNED"), "RIDER_ASSIGNED");
  });
});
