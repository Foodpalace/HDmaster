export type LedgerKind =
  | "food_value"
  | "restaurant_funded_discount"
  | "platform_funded_discount"
  | "commission"
  | "payment_fee"
  | "delivery_fee"
  | "service_fee"
  | "tax"
  | "other_deduction"
  | "restaurant_settlement"
  | "rider_base"
  | "rider_distance"
  | "rider_incentive"
  | "rider_adjustment"
  | "cash_collected"
  | "refund";

export type LedgerLine = {
  kind: LedgerKind;
  source: string;
  ruleKey: string;
  amountPaise: number;
  note?: string;
};

export type OrderEconomicsInput = {
  foodPaise: number;
  restaurantDiscountPaise: number;
  platformDiscountPaise: number;
  deliveryFeePaise: number;
  serviceFeePaise: number;
  taxPaise: number;
  commissionBps: number;
  paymentFeeBps: number;
  riderBasePaise: number;
  riderDistancePaise: number;
  riderIncentivePaise: number;
  cashCollectedPaise: number;
  refundPaise?: number;
  otherDeductionPaise?: number;
  otherDeductionRule?: string;
};

export type OrderEconomics = {
  commissionPaise: number;
  paymentFeePaise: number;
  restaurantSettlementPaise: number;
  riderPayablePaise: number;
  platformRevenuePaise: number;
  variableCostPaise: number;
  contributionPaise: number;
  customerTotalPaise: number;
  lines: LedgerLine[];
  label: "ACTUAL" | "MODEL";
};

function roundPaise(n: number): number {
  return Math.round(n);
}

export function calculateOrderEconomics(input: OrderEconomicsInput): OrderEconomics {
  const netFood = Math.max(0, input.foodPaise - input.restaurantDiscountPaise);
  const commissionPaise = roundPaise((netFood * input.commissionBps) / 10000);
  const chargeable =
    netFood - input.platformDiscountPaise + input.deliveryFeePaise + input.serviceFeePaise;
  const paymentFeePaise = roundPaise((Math.max(0, chargeable) * input.paymentFeeBps) / 10000);
  const other = input.otherDeductionPaise ?? 0;
  const restaurantSettlementPaise = Math.max(
    0,
    netFood - commissionPaise - other + input.platformDiscountPaise,
  );
  const riderGross = input.riderBasePaise + input.riderDistancePaise + input.riderIncentivePaise;
  const riderPayablePaise = riderGross; // cash collected is a reconciliation, not a wage cut
  const customerTotalPaise =
    netFood -
    input.platformDiscountPaise +
    input.deliveryFeePaise +
    input.serviceFeePaise +
    input.taxPaise;

  const platformRevenuePaise = commissionPaise + input.deliveryFeePaise + input.serviceFeePaise;
  const refund = input.refundPaise ?? 0;
  const variableCostPaise =
    riderGross + paymentFeePaise + input.platformDiscountPaise + refund;
  const contributionPaise = platformRevenuePaise - variableCostPaise;

  const lines: LedgerLine[] = [
    {
      kind: "food_value",
      source: "order.items",
      ruleKey: "food_value",
      amountPaise: input.foodPaise,
    },
    {
      kind: "restaurant_funded_discount",
      source: "promotion",
      ruleKey: "restaurant_funded_discount",
      amountPaise: -input.restaurantDiscountPaise,
    },
    {
      kind: "platform_funded_discount",
      source: "promotion",
      ruleKey: "platform_funded_discount",
      amountPaise: -input.platformDiscountPaise,
    },
    {
      kind: "commission",
      source: "settings.commission_bps",
      ruleKey: `commission_bps:${input.commissionBps}`,
      amountPaise: -commissionPaise,
    },
    {
      kind: "payment_fee",
      source: "settings.payment_fee_bps",
      ruleKey: `payment_fee_bps:${input.paymentFeeBps}`,
      amountPaise: -paymentFeePaise,
    },
    {
      kind: "delivery_fee",
      source: "zone.delivery_fee",
      ruleKey: "delivery_fee",
      amountPaise: input.deliveryFeePaise,
    },
    {
      kind: "service_fee",
      source: "settings.service_fee",
      ruleKey: "service_fee",
      amountPaise: input.serviceFeePaise,
    },
    {
      kind: "tax",
      source: "tax.gst_estimate",
      ruleKey: "tax",
      amountPaise: input.taxPaise,
    },
    {
      kind: "restaurant_settlement",
      source: "formula.restaurant_settlement",
      ruleKey: "net_food - commission - other + platform_discount",
      amountPaise: restaurantSettlementPaise,
    },
    {
      kind: "rider_base",
      source: "settings.rider_base",
      ruleKey: "rider_base",
      amountPaise: input.riderBasePaise,
    },
    {
      kind: "rider_distance",
      source: "settings.rider_distance",
      ruleKey: "rider_distance",
      amountPaise: input.riderDistancePaise,
    },
    {
      kind: "rider_incentive",
      source: "campaign",
      ruleKey: "rider_incentive",
      amountPaise: input.riderIncentivePaise,
    },
    {
      kind: "cash_collected",
      source: "order.payment_method",
      ruleKey: "cod_cash",
      amountPaise: input.cashCollectedPaise,
    },
  ];
  if (other) {
    lines.push({
      kind: "other_deduction",
      source: "authorized_deduction",
      ruleKey: input.otherDeductionRule ?? "other",
      amountPaise: -other,
      note: "Authorized deduction — never opaque",
    });
  }
  if (refund) {
    lines.push({
      kind: "refund",
      source: "support.refund",
      ruleKey: "refund",
      amountPaise: -refund,
    });
  }

  return {
    commissionPaise,
    paymentFeePaise,
    restaurantSettlementPaise,
    riderPayablePaise,
    platformRevenuePaise,
    variableCostPaise,
    contributionPaise,
    customerTotalPaise,
    lines,
    label: "ACTUAL",
  };
}

export function restaurantPayableFromLines(lines: LedgerLine[]): number {
  const settlement = lines.find((l) => l.kind === "restaurant_settlement");
  return settlement?.amountPaise ?? 0;
}
