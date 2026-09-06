import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { commissionShock, runScenario } from "./economics.ts";
import { calculateOrderEconomics } from "./settlement.ts";

const base = {
  name: "A",
  commissionBps: 1000,
  deliveryFeePaise: 3000,
  customerFeePaise: 500,
  riderPayoutPaise: 3300,
  discountPaise: 0,
  platformSubsidyPaise: 0,
  paymentCostPaise: 400,
  refundRate: 0.02,
  supportCostPaise: 150,
  infrastructureCostPerDayPaise: 50_000,
  ordersPerDay: 120,
  aovPaise: 32_000,
  restaurantCount: 24,
  riderCount: 30,
};

describe("economics engine", () => {
  it("labels output as MODEL", () => {
    const r = runScenario(base);
    assert.equal(r.label, "MODEL");
    assert.ok(r.assumptions.length > 0);
  });

  it("10% vs 8% commission is an ESTIMATE delta", () => {
    const shock = commissionShock(base, 800);
    assert.equal(shock.label, "ESTIMATE");
    assert.ok(shock.contributionDeltaPaise < 0);
  });

  it("0% commission can be loss-making", () => {
    const zero = runScenario({ ...base, name: "0%", commissionBps: 0 });
    assert.ok(zero.contributionPerOrderPaise < runScenario(base).contributionPerOrderPaise);
  });
});

describe("settlement transparency", () => {
  it("every deduction has source, rule, amount", () => {
    const eco = calculateOrderEconomics({
      foodPaise: 40000,
      restaurantDiscountPaise: 2000,
      platformDiscountPaise: 1000,
      deliveryFeePaise: 3000,
      serviceFeePaise: 500,
      taxPaise: 200,
      commissionBps: 1000,
      paymentFeeBps: 180,
      riderBasePaise: 2500,
      riderDistancePaise: 800,
      riderIncentivePaise: 0,
      cashCollectedPaise: 0,
    });
    for (const line of eco.lines) {
      assert.ok(line.source);
      assert.ok(line.ruleKey);
      assert.equal(typeof line.amountPaise, "number");
    }
    assert.equal(eco.label, "ACTUAL");
    assert.equal(eco.commissionPaise, 3800);
  });

  it("does not invent opaque deductions", () => {
    const eco = calculateOrderEconomics({
      foodPaise: 10000,
      restaurantDiscountPaise: 0,
      platformDiscountPaise: 0,
      deliveryFeePaise: 0,
      serviceFeePaise: 0,
      taxPaise: 0,
      commissionBps: 1000,
      paymentFeeBps: 0,
      riderBasePaise: 0,
      riderDistancePaise: 0,
      riderIncentivePaise: 0,
      cashCollectedPaise: 0,
    });
    const kinds = eco.lines.map((l) => l.kind);
    assert.ok(!kinds.includes("other_deduction"));
  });
});
