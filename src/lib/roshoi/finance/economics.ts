export type ScenarioInputs = {
  name: string;
  commissionBps: number;
  deliveryFeePaise: number;
  customerFeePaise: number;
  riderPayoutPaise: number;
  discountPaise: number;
  platformSubsidyPaise: number;
  paymentCostPaise: number;
  refundRate: number;
  supportCostPaise: number;
  infrastructureCostPerDayPaise: number;
  ordersPerDay: number;
  aovPaise: number;
  restaurantCount: number;
  riderCount: number;
};

export type ScenarioResult = {
  name: string;
  label: "MODEL";
  revenuePerOrderPaise: number;
  variableCostPerOrderPaise: number;
  contributionPerOrderPaise: number;
  contributionPerDayPaise: number;
  breakEvenOrdersPerDay: number | null;
  breakEvenRestaurants: number | null;
  breakEvenRiders: number | null;
  breakEvenGmvPaise: number | null;
  assumptions: string[];
};

export function runScenario(input: ScenarioInputs): ScenarioResult {
  const commission = Math.round((input.aovPaise * input.commissionBps) / 10000);
  const revenuePerOrderPaise = commission + input.deliveryFeePaise + input.customerFeePaise;
  const expectedRefund = Math.round(input.aovPaise * input.refundRate);
  const variableCostPerOrderPaise =
    input.riderPayoutPaise +
    input.paymentCostPaise +
    input.discountPaise +
    input.platformSubsidyPaise +
    expectedRefund +
    input.supportCostPaise;
  const contributionPerOrderPaise = revenuePerOrderPaise - variableCostPerOrderPaise;
  const contributionPerDayPaise =
    contributionPerOrderPaise * input.ordersPerDay - input.infrastructureCostPerDayPaise;

  const breakEvenOrdersPerDay =
    contributionPerOrderPaise > 0
      ? Math.ceil(input.infrastructureCostPerDayPaise / contributionPerOrderPaise)
      : null;

  const ordersPerRestaurant =
    input.restaurantCount > 0 ? input.ordersPerDay / input.restaurantCount : 0;
  const contribPerRestaurant =
    ordersPerRestaurant * contributionPerOrderPaise;
  const breakEvenRestaurants =
    contribPerRestaurant > 0
      ? Math.ceil(input.infrastructureCostPerDayPaise / contribPerRestaurant)
      : null;

  const ordersPerRider = input.riderCount > 0 ? input.ordersPerDay / input.riderCount : 0;
  const contribPerRider = ordersPerRider * contributionPerOrderPaise;
  const breakEvenRiders =
    contribPerRider > 0
      ? Math.ceil(input.infrastructureCostPerDayPaise / contribPerRider)
      : null;

  const gmvPerDay = input.ordersPerDay * input.aovPaise;
  const contribPerGmv = gmvPerDay > 0 ? contributionPerDayPaise / gmvPerDay : 0;
  const breakEvenGmvPaise =
    contribPerGmv > 0
      ? Math.ceil(input.infrastructureCostPerDayPaise / contribPerGmv)
      : null;

  return {
    name: input.name,
    label: "MODEL",
    revenuePerOrderPaise,
    variableCostPerOrderPaise,
    contributionPerOrderPaise,
    contributionPerDayPaise,
    breakEvenOrdersPerDay,
    breakEvenRestaurants,
    breakEvenRiders,
    breakEvenGmvPaise,
    assumptions: [
      `Commission ${input.commissionBps / 100}% of AOV`,
      `Refund rate ${(input.refundRate * 100).toFixed(1)}% of AOV (MODEL)`,
      "Infrastructure cost treated as daily fixed (MODEL)",
      "Does not include income tax, depreciation, or unmodeled overhead",
      "Forecasts are estimates, not guaranteed results",
    ],
  };
}

export function compareScenarios(inputs: ScenarioInputs[]): ScenarioResult[] {
  return inputs.map(runScenario);
}

export function commissionShock(base: ScenarioInputs, nextBps: number): {
  from: ScenarioResult;
  to: ScenarioResult;
  contributionDeltaPaise: number;
  label: "ESTIMATE";
} {
  const from = runScenario(base);
  const to = runScenario({ ...base, name: `${nextBps / 100}% commission`, commissionBps: nextBps });
  return {
    from,
    to,
    contributionDeltaPaise: to.contributionPerDayPaise - from.contributionPerDayPaise,
    label: "ESTIMATE",
  };
}

export const COMMISSION_PRESETS_BPS = [0, 500, 800, 1000, 1200] as const;
