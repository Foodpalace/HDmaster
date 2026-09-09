/**
 * Bridge between HDmaster ops order statuses and marketplace statuses
 * used by customer + partner apps (PLACED / ACCEPTED / …).
 */

import {
  ORDER_STATUSES,
  type OrderStatus,
} from "./state-machine";

/** Marketplace vocabulary (customer + partner). */
export const MARKETPLACE_STATUSES = [
  "CART",
  "CHECKOUT",
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "RIDER_ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
  "REFUNDED",
  "PARTIAL_REFUND",
  "FAILED_PAYMENT",
  "DELIVERY_FAILED",
] as const;

export type MarketplaceStatus = (typeof MARKETPLACE_STATUSES)[number];

const OPS_TO_MARKETPLACE: Record<string, MarketplaceStatus> = {
  PENDING: "PLACED",
  CONFIRMED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  RIDER_ASSIGNED: "RIDER_ASSIGNED",
  PICKED_UP: "PICKED_UP",
  ON_THE_WAY: "ON_THE_WAY",
  ARRIVING: "ON_THE_WAY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  PAYMENT_FAILED: "FAILED_PAYMENT",
  RESTAURANT_REJECTED: "REJECTED",
  RIDER_CANCELLED: "CANCELLED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
  CUSTOMER_UNAVAILABLE: "DELIVERY_FAILED",
  REFUND_PENDING: "REFUNDED",
  REFUNDED: "REFUNDED",
  DISPUTED: "PARTIAL_REFUND",
  // Already marketplace-shaped (pass-through)
  PLACED: "PLACED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  FAILED_PAYMENT: "FAILED_PAYMENT",
  PARTIAL_REFUND: "PARTIAL_REFUND",
  CART: "CART",
  CHECKOUT: "CHECKOUT",
};

const MARKETPLACE_TO_OPS: Record<MarketplaceStatus, OrderStatus> = {
  CART: "PENDING",
  CHECKOUT: "PENDING",
  PLACED: "PENDING",
  ACCEPTED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  RIDER_ASSIGNED: "RIDER_ASSIGNED",
  PICKED_UP: "PICKED_UP",
  ON_THE_WAY: "ON_THE_WAY",
  DELIVERED: "DELIVERED",
  REJECTED: "RESTAURANT_REJECTED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  PARTIAL_REFUND: "DISPUTED",
  FAILED_PAYMENT: "PAYMENT_FAILED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
};

export function isMarketplaceStatus(value: string): value is MarketplaceStatus {
  return (MARKETPLACE_STATUSES as readonly string[]).includes(value);
}

export function toMarketplaceStatus(opsOrMarket: string): MarketplaceStatus | null {
  return OPS_TO_MARKETPLACE[opsOrMarket] ?? null;
}

export function toOpsStatus(market: MarketplaceStatus): OrderStatus {
  return MARKETPLACE_TO_OPS[market];
}

/** Happy-path steps a customer should see after place. */
export const MARKETPLACE_TRACK: MarketplaceStatus[] = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "RIDER_ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
];

export function assertKnownOpsStatus(status: string): asserts status is OrderStatus {
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`Unknown ops order status: ${status}`);
  }
}
