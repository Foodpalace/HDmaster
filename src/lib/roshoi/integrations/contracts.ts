/**
 * Window 4 integration contracts.
 *
 * These TypeScript interfaces are the adapter boundary for future Window 5
 * Shared Core. Window 4 currently consumes a local simulated source through
 * the same shapes. Do not treat a connected adapter as live until the
 * corresponding window actually implements the endpoint.
 */

export type ContractAuth = {
  scheme: "bearer" | "session";
  audience: "admin";
  notes: string;
};

export type Window1CustomerOrder = {
  orderId: string;
  customerRef: string;
  status: string;
  paymentStatus: string;
  items: { name: string; qty: number; unitPaise: number }[];
  totalsPaise: { food: number; discount: number; delivery: number; tax: number; total: number };
  placedAt: string;
};

export type Window2Restaurant = {
  restaurantId: string;
  name: string;
  status: string;
  available: boolean;
  prepMinutes: number;
  menuVersion: string;
};

export type Window3Rider = {
  riderId: string;
  status: string;
  online: boolean;
  activeDeliveryId: string | null;
  lastFix?: { lat: number; lng: number; at: string };
};

export const WINDOW1_CONTRACT = {
  owner: "Window 1 — Customer system",
  auth: {
    scheme: "bearer" as const,
    audience: "admin" as const,
    notes: "Admin service credential issued by Window 5. Never a customer token.",
  },
  events: [
    "customer.registered",
    "order.placed",
    "order.cancelled_by_customer",
    "support.ticket.opened",
    "loyalty.updated",
  ],
  endpoints: [
    {
      method: "GET",
      path: "/v1/admin/customers/:id",
      auth: "admin",
      idempotent: true,
    },
    {
      method: "GET",
      path: "/v1/admin/orders",
      auth: "admin",
      idempotent: true,
    },
  ],
  errors: ["401", "403", "404", "409", "429"],
} as const;

export const WINDOW2_CONTRACT = {
  owner: "Window 2 — Restaurant / vendor system",
  events: [
    "restaurant.submitted",
    "restaurant.availability_changed",
    "order.accepted",
    "order.rejected",
    "order.preparing",
    "order.ready",
    "menu.updated",
  ],
  endpoints: [
    { method: "GET", path: "/v1/admin/restaurants", auth: "admin" },
    { method: "GET", path: "/v1/admin/restaurants/:id/menu", auth: "admin" },
    { method: "POST", path: "/v1/admin/restaurants/:id/status", auth: "admin" },
  ],
} as const;

export const WINDOW3_CONTRACT = {
  owner: "Window 3 — Rider / delivery partner system",
  events: [
    "rider.online",
    "rider.offline",
    "offer.sent",
    "offer.accepted",
    "offer.expired",
    "delivery.picked_up",
    "delivery.completed",
    "delivery.failed",
  ],
  endpoints: [
    { method: "GET", path: "/v1/admin/riders", auth: "admin" },
    { method: "GET", path: "/v1/admin/dispatch/unassigned", auth: "admin" },
    { method: "POST", path: "/v1/admin/dispatch/reassign", auth: "admin" },
  ],
  notes:
    "Window 4 monitors dispatch; Window 5 owns the dispatch engine. Admin reassignment is a request, not a second engine.",
} as const;

export const WINDOW5_CONTRACT = {
  owner: "Window 5 — Shared Core",
  owns: [
    "authentication",
    "users",
    "roles",
    "orders",
    "restaurants",
    "riders",
    "payments",
    "settlements",
    "dispatch",
    "notifications",
    "analytics",
    "AI",
    "risk",
    "audit",
    "configuration",
  ],
  adminApiPrefix: "/v1/admin",
  endpoints: [
    "GET /v1/admin/dashboard",
    "GET /v1/admin/orders",
    "GET /v1/admin/restaurants",
    "GET /v1/admin/riders",
    "GET /v1/admin/customers",
    "GET /v1/admin/support",
    "GET /v1/admin/analytics",
    "GET /v1/admin/finance",
    "GET /v1/admin/settlements",
    "GET /v1/admin/audit",
    "GET /v1/admin/settings",
    "GET /v1/admin/feature-flags",
    "GET /v1/admin/branding",
    "POST /v1/admin/ai",
  ],
} as const;

export interface MarketplaceSource {
  connected: boolean;
  label: "SIMULATED" | "WINDOW1" | "WINDOW2" | "WINDOW3" | "WINDOW5";
}
