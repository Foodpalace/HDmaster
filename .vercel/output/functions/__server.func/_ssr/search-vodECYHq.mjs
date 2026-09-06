//#region node_modules/.nitro/vite/services/ssr/assets/search-vodECYHq.js
var MODULE_ALIASES = {
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
	dispatch: "dispatch"
};
function parseCommand(raw) {
	const q = raw.trim().toLowerCase();
	if (!q) return {
		type: "unknown",
		raw
	};
	const delayed = /delay/.test(q);
	const minutes = q.match(/(\d+)\s*min/)?.[1];
	const city = q.match(/in\s+([a-z]+)/)?.[1];
	if (/unresolved|open ticket|support/.test(q) && /ticket|support/.test(q)) return {
		type: "tickets",
		unresolved: true
	};
	if (/payout/.test(q) && /pending|rider/.test(q)) return {
		type: "riders",
		payoutsPending: true
	};
	if (/available rider/.test(q)) return {
		type: "riders",
		available: true
	};
	if (/cancellation/.test(q)) return {
		type: "restaurants",
		cancellationsGt: Number(q.match(/(\d+)/)?.[1] ?? 10)
	};
	if (delayed || /order/.test(q)) {
		if (delayed || /order/.test(q)) return {
			type: "orders",
			delayed: delayed || void 0,
			city: city && city !== "the" ? city : void 0,
			minutes: minutes ? Number(minutes) : void 0
		};
	}
	if (/contribution|finance|settlement|gmv/.test(q)) return { type: "finance" };
	const open = q.match(/^(?:open|show|find)\s+(.+)/);
	if (open) {
		const rest = open[1] ?? "";
		for (const [alias, mod] of Object.entries(MODULE_ALIASES)) if (rest.startsWith(alias)) return {
			type: "open",
			module: mod,
			query: rest.slice(alias.length).trim()
		};
	}
	for (const [alias, mod] of Object.entries(MODULE_ALIASES)) if (q.includes(alias)) return {
		type: "open",
		module: mod,
		query: raw
	};
	return {
		type: "unknown",
		raw
	};
}
function cityIdFromSlug(slug) {
	if (!slug) return void 0;
	const s = slug.toLowerCase();
	if (s.includes("silchar")) return "city_silchar";
	if (s.includes("karimganj") || s.includes("sribhumi")) return "city_karimganj";
	if (s.startsWith("city_")) return s;
	return `city_${s}`;
}
function intentPath(intent) {
	switch (intent.type) {
		case "orders": {
			const p = new URLSearchParams();
			if (intent.delayed) p.set("delayed", "1");
			if (intent.city) p.set("city", intent.city);
			if (intent.minutes) p.set("minutes", String(intent.minutes));
			const q = p.toString();
			return q ? `/app/orders?${q}` : "/app/orders";
		}
		case "restaurants": return "/app/restaurants";
		case "riders": return intent.payoutsPending ? "/app/settlements?party=rider" : "/app/riders";
		case "tickets": return "/app/support?status=OPEN";
		case "finance": return "/app/finance";
		case "open": return `/app/${intent.module}`;
		default: return "/app";
	}
}
//#endregion
export { intentPath as n, parseCommand as r, cityIdFromSlug as t };
