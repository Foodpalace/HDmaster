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

export const ACTIVE_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "RIDER_ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "ARRIVING",
];

export const TERMINAL: ReadonlySet<OrderStatus> = new Set([
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
  "RESTAURANT_REJECTED",
  "DELIVERY_FAILED",
  "CUSTOMER_UNAVAILABLE",
  "REFUNDED",
]);

export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED", "PAYMENT_FAILED"],
  CONFIRMED: ["PREPARING", "CANCELLED", "RESTAURANT_REJECTED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["RIDER_ASSIGNED", "CANCELLED"],
  RIDER_ASSIGNED: ["PICKED_UP", "RIDER_CANCELLED", "CANCELLED"],
  PICKED_UP: ["ON_THE_WAY", "DELIVERY_FAILED"],
  ON_THE_WAY: ["ARRIVING", "DELIVERY_FAILED", "CUSTOMER_UNAVAILABLE"],
  ARRIVING: ["DELIVERED", "CUSTOMER_UNAVAILABLE", "DELIVERY_FAILED"],
  DELIVERED: ["DISPUTED", "REFUND_PENDING"],
  CANCELLED: ["REFUND_PENDING"],
  PAYMENT_FAILED: [],
  RESTAURANT_REJECTED: ["REFUND_PENDING"],
  RIDER_CANCELLED: ["READY", "CANCELLED"],
  DELIVERY_FAILED: ["REFUND_PENDING", "DISPUTED"],
  CUSTOMER_UNAVAILABLE: ["REFUND_PENDING", "DELIVERED"],
  REFUND_PENDING: ["REFUNDED", "DISPUTED"],
  REFUNDED: [],
  DISPUTED: ["REFUND_PENDING", "REFUNDED"],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid order transition ${from} → ${to}`);
  }
}

export function isDelayed(input: {
  status: string;
  promisedAt: string | null;
  now?: number;
}): boolean {
  if (!ACTIVE_FLOW.includes(input.status as OrderStatus)) return false;
  if (!input.promisedAt) return false;
  return new Date(input.promisedAt).getTime() < (input.now ?? Date.now());
}

export const RESTAURANT_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "ACTIVE",
  "PAUSED",
  "SUSPENDED",
  "CLOSED",
] as const;

export type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number];

export const RIDER_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "ONLINE",
  "BUSY",
  "OFFLINE",
  "SUSPENDED",
] as const;

export type RiderStatus = (typeof RIDER_STATUSES)[number];

export const TICKET_STATUSES = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING",
  "RESOLVED",
  "CLOSED",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const KYC_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "EXPIRED",
  "SUSPENDED",
] as const;
