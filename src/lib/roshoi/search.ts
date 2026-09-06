export type SearchIntent =
  | { type: "orders"; delayed?: boolean; city?: string; minutes?: number }
  | { type: "restaurants"; cancellationsGt?: number; query?: string }
  | { type: "riders"; payoutsPending?: boolean; available?: boolean }
  | { type: "tickets"; unresolved?: boolean }
  | { type: "finance" }
  | { type: "open"; module: string; query?: string }
  | { type: "unknown"; raw: string };

const MODULE_ALIASES: Record<string, string> = {
  restaurant: "restaurants",
  restaurants: "restaurants",
  rider: "riders",
  riders: "riders",
  order: "orders",
  orders: "orders",
  customer: "customers",
  finance: "finance",
  ceo: "ceo",
  ticket: "support",
  support: "support",
  payout: "settlements",
  settlement: "settlements",
  zone: "zones",
  dispatch: "dispatch",
};

export function parseCommand(raw: string): SearchIntent {
  const q = raw.trim().toLowerCase();
  if (!q) return { type: "unknown", raw };

  const delayed = /delay/.test(q);
  const minutes = q.match(/(\d+)\s*min/)?.[1];
  const cityMatch = q.match(/in\s+([a-z]+)/);
  const city = cityMatch?.[1];

  if (/unresolved|open ticket|support/.test(q) && /ticket|support/.test(q)) {
    return { type: "tickets", unresolved: true };
  }
  if (/payout/.test(q) && /pending|rider/.test(q)) {
    return { type: "riders", payoutsPending: true };
  }
  if (/available rider/.test(q)) {
    return { type: "riders", available: true };
  }
  if (/cancellation/.test(q)) {
    const n = Number(q.match(/(\d+)/)?.[1] ?? 10);
    return { type: "restaurants", cancellationsGt: n };
  }
  if (delayed || /order/.test(q)) {
    if (delayed || /order/.test(q)) {
      return {
        type: "orders",
        delayed: delayed || undefined,
        city: city && city !== "the" ? city : undefined,
        minutes: minutes ? Number(minutes) : undefined,
      };
    }
  }
  if (/contribution|finance|settlement|gmv/.test(q)) {
    return { type: "finance" };
  }
  const open = q.match(/^(?:open|show|find)\s+(.+)/);
  if (open) {
    const rest = open[1] ?? "";
    for (const [alias, mod] of Object.entries(MODULE_ALIASES)) {
      if (rest.startsWith(alias)) {
        return { type: "open", module: mod, query: rest.slice(alias.length).trim() };
      }
    }
  }
  for (const [alias, mod] of Object.entries(MODULE_ALIASES)) {
    if (q.includes(alias)) return { type: "open", module: mod, query: raw };
  }
  return { type: "unknown", raw };
}

export function cityIdFromSlug(slug?: string): string | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  if (s.includes("silchar")) return "city_silchar";
  if (s.includes("karimganj") || s.includes("sribhumi")) return "city_karimganj";
  if (s.startsWith("city_")) return s;
  return `city_${s}`;
}

export function intentPath(intent: SearchIntent): string {
  switch (intent.type) {
    case "orders": {
      const p = new URLSearchParams();
      if (intent.delayed) p.set("delayed", "1");
      if (intent.city) p.set("city", intent.city);
      if (intent.minutes) p.set("minutes", String(intent.minutes));
      const q = p.toString();
      return q ? `/app/orders?${q}` : "/app/orders";
    }
    case "restaurants":
      return "/app/restaurants";
    case "riders":
      return intent.payoutsPending ? "/app/settlements?party=rider" : "/app/riders";
    case "tickets":
      return "/app/support?status=OPEN";
    case "finance":
      return "/app/finance";
    case "open":
      return `/app/${intent.module}`;
    default:
      return "/app";
  }
}
