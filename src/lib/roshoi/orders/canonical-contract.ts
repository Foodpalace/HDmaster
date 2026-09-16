/**
 * Roshoi canonical order contract.
 *
 * HDmaster is the only authority for order state. Customer, Partner and Rider
 * applications may display/adapt these values, but must not invent a second
 * authoritative state machine.
 */

import {
  ORDER_STATUSES,
  type OrderStatus,
  type TransitionActor,
  canTransition,
} from "./state-machine";

export const ORDER_CONTRACT_VERSION = "1" as const;

export const CANONICAL_ORDER_STATUSES = ORDER_STATUSES;
export type CanonicalOrderStatus = OrderStatus;
export type CanonicalTransitionActor = TransitionActor;

export const ORDER_EVENTS = [
  "ORDER_CREATED",
  "PAYMENT_AUTHORIZED",
  "PAYMENT_FAILED",
  "ORDER_CONFIRMED",
  "ORDER_REJECTED",
  "ORDER_PREPARING",
  "ORDER_READY",
  "RIDER_ASSIGNED",
  "ORDER_PICKED_UP",
  "ORDER_ON_THE_WAY",
  "ORDER_ARRIVING",
  "ORDER_DELIVERED",
  "DELIVERY_FAILED",
  "CUSTOMER_UNAVAILABLE",
  "ORDER_CANCELLED",
  "REFUND_PENDING",
  "REFUNDED",
  "ORDER_DISPUTED",
] as const;

export type OrderEventType = (typeof ORDER_EVENTS)[number];

export interface OrderTransitionCommand {
  contractVersion: typeof ORDER_CONTRACT_VERSION;
  orderId: string;
  from: CanonicalOrderStatus;
  to: CanonicalOrderStatus;
  actor: CanonicalTransitionActor;
  idempotencyKey: string;
  reason?: string;
  correlationId?: string;
}

export interface OrderEventEnvelope {
  contractVersion: typeof ORDER_CONTRACT_VERSION;
  eventId: string;
  eventType: OrderEventType;
  orderId: string;
  status: CanonicalOrderStatus;
  actor: CanonicalTransitionActor;
  occurredAt: string;
  idempotencyKey: string;
  correlationId?: string;
}

export function assertCanonicalTransition(command: OrderTransitionCommand): void {
  if (!command.orderId.trim()) throw new Error("orderId is required");
  if (!command.idempotencyKey.trim()) throw new Error("idempotencyKey is required");
  if (command.contractVersion !== ORDER_CONTRACT_VERSION) {
    throw new Error(`Unsupported order contract version: ${command.contractVersion}`);
  }
  if (!canTransition(command.from, command.to, command.actor)) {
    throw new Error(
      `Invalid canonical order transition ${command.from} → ${command.to} as ${command.actor}`,
    );
  }
}

/**
 * UI/application adapters use these labels only for presentation. They are
 * deliberately one-way so a client cannot silently become an order authority.
 */
export const MARKETPLACE_LABELS: Readonly<Record<CanonicalOrderStatus, string>> = {
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
  REFUND_PENDING: "REFUND_PENDING",
  REFUNDED: "REFUNDED",
  DISPUTED: "DISPUTED",
};
