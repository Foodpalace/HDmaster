export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "RIDER_ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "ARRIVING",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
  "RESTAURANT_REJECTED",
  "RIDER_CANCELLED",
  "DELIVERY_FAILED",
  "CUSTOMER_UNAVAILABLE",
  "REFUND_PENDING",
  "REFUNDED",
  "DISPUTED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type TransitionActor =
  | "restaurant"
  | "customer"
  | "rider"
  | "admin"
  | "system"
  | "simulated_rider";

export const ACTIVE_FLOW: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PREPARING", "READY", "RIDER_ASSIGNED",
  "PICKED_UP", "ON_THE_WAY", "ARRIVING",
];

export const TERMINAL: ReadonlySet<OrderStatus> = new Set([
  "DELIVERED", "CANCELLED", "PAYMENT_FAILED", "RESTAURANT_REJECTED",
  "DELIVERY_FAILED", "CUSTOMER_UNAVAILABLE", "REFUNDED",
]);

const ACTOR_TRANSITIONS: Record<OrderStatus, Partial<Record<OrderStatus, TransitionActor[]>>> = {
  PENDING: { CONFIRMED: ["restaurant", "admin"], CANCELLED: ["customer", "admin", "system"], PAYMENT_FAILED: ["system", "admin"] },
  CONFIRMED: { PREPARING: ["restaurant", "admin"], CANCELLED: ["customer", "admin"], RESTAURANT_REJECTED: ["restaurant", "admin"] },
  PREPARING: { READY: ["restaurant", "admin"], CANCELLED: ["customer", "admin"] },
  READY: { RIDER_ASSIGNED: ["rider", "admin", "system", "simulated_rider"], CANCELLED: ["admin"] },
  RIDER_ASSIGNED: { PICKED_UP: ["rider", "admin", "system", "simulated_rider"], RIDER_CANCELLED: ["rider", "admin", "system"], CANCELLED: ["admin"] },
  PICKED_UP: { ON_THE_WAY: ["rider", "admin", "system", "simulated_rider"], DELIVERY_FAILED: ["rider", "admin", "system"] },
  ON_THE_WAY: { ARRIVING: ["rider", "admin", "system", "simulated_rider"], DELIVERY_FAILED: ["rider", "admin", "system"], CUSTOMER_UNAVAILABLE: ["rider", "admin", "system"] },
  ARRIVING: { DELIVERED: ["rider", "admin", "system", "simulated_rider"], CUSTOMER_UNAVAILABLE: ["rider", "admin", "system"], DELIVERY_FAILED: ["rider", "admin", "system"] },
  DELIVERED: { DISPUTED: ["customer", "admin", "system"], REFUND_PENDING: ["admin", "system"] },
  CANCELLED: { REFUND_PENDING: ["admin", "system"] },
  PAYMENT_FAILED: {},
  RESTAURANT_REJECTED: { REFUND_PENDING: ["admin", "system"] },
  RIDER_CANCELLED: { READY: ["admin", "system"], CANCELLED: ["admin", "system"] },
  DELIVERY_FAILED: { REFUND_PENDING: ["admin", "system"], DISPUTED: ["customer", "admin"] },
  CUSTOMER_UNAVAILABLE: { REFUND_PENDING: ["admin", "system"], DELIVERED: ["admin", "system"] },
  REFUND_PENDING: { REFUNDED: ["admin", "system"], DISPUTED: ["customer", "admin"] },
  REFUNDED: {},
  DISPUTED: { REFUND_PENDING: ["admin", "system"], REFUNDED: ["admin", "system"] },
};

export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = Object.fromEntries(
  ORDER_STATUSES.map((status) => [status, Object.keys(ACTOR_TRANSITIONS[status] ?? {})]),
) as Record<OrderStatus, OrderStatus[]>;

export function canTransition(from: OrderStatus, to: OrderStatus, actor?: TransitionActor): boolean {
  const allowed = ACTOR_TRANSITIONS[from]?.[to];
  return actor ? Boolean(allowed?.includes(actor)) : Boolean(allowed);
}

export function assertTransition(from: OrderStatus, to: OrderStatus, actor?: TransitionActor): void {
  if (!canTransition(from, to, actor)) {
    throw new Error(`Invalid order transition ${from} → ${to}${actor ? ` as ${actor}` : ""}`);
  }
}

export function isDelayed(input: { status: string; promisedAt: string | null; now?: number }): boolean {
  if (!ACTIVE_FLOW.includes(input.status as OrderStatus) || !input.promisedAt) return false;
  return new Date(input.promisedAt).getTime() < (input.now ?? Date.now());
}

export const RESTAURANT_STATUSES = ["DRAFT", "PENDING_REVIEW", "APPROVED", "ACTIVE", "PAUSED", "SUSPENDED", "CLOSED"] as const;
export type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number];
export const RIDER_STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED", "ONLINE", "BUSY", "OFFLINE", "SUSPENDED"] as const;
export type RiderStatus = (typeof RIDER_STATUSES)[number];
export const TICKET_STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export const KYC_STATUSES = ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED", "EXPIRED", "SUSPENDED"] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];
