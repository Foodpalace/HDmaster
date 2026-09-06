//#region node_modules/.nitro/vite/services/ssr/assets/state-machine-C0WNCLu9.js
var ACTIVE_FLOW = [
	"PENDING",
	"CONFIRMED",
	"PREPARING",
	"READY",
	"RIDER_ASSIGNED",
	"PICKED_UP",
	"ON_THE_WAY",
	"ARRIVING"
];
var TRANSITIONS = {
	PENDING: [
		"CONFIRMED",
		"CANCELLED",
		"PAYMENT_FAILED"
	],
	CONFIRMED: [
		"PREPARING",
		"CANCELLED",
		"RESTAURANT_REJECTED"
	],
	PREPARING: ["READY", "CANCELLED"],
	READY: ["RIDER_ASSIGNED", "CANCELLED"],
	RIDER_ASSIGNED: [
		"PICKED_UP",
		"RIDER_CANCELLED",
		"CANCELLED"
	],
	PICKED_UP: ["ON_THE_WAY", "DELIVERY_FAILED"],
	ON_THE_WAY: [
		"ARRIVING",
		"DELIVERY_FAILED",
		"CUSTOMER_UNAVAILABLE"
	],
	ARRIVING: [
		"DELIVERED",
		"CUSTOMER_UNAVAILABLE",
		"DELIVERY_FAILED"
	],
	DELIVERED: ["DISPUTED", "REFUND_PENDING"],
	CANCELLED: ["REFUND_PENDING"],
	PAYMENT_FAILED: [],
	RESTAURANT_REJECTED: ["REFUND_PENDING"],
	RIDER_CANCELLED: ["READY", "CANCELLED"],
	DELIVERY_FAILED: ["REFUND_PENDING", "DISPUTED"],
	CUSTOMER_UNAVAILABLE: ["REFUND_PENDING", "DELIVERED"],
	REFUND_PENDING: ["REFUNDED", "DISPUTED"],
	REFUNDED: [],
	DISPUTED: ["REFUND_PENDING", "REFUNDED"]
};
function canTransition(from, to) {
	return TRANSITIONS[from]?.includes(to) ?? false;
}
function assertTransition(from, to) {
	if (!canTransition(from, to)) throw new Error(`Invalid order transition ${from} → ${to}`);
}
function isDelayed(input) {
	if (!ACTIVE_FLOW.includes(input.status)) return false;
	if (!input.promisedAt) return false;
	return new Date(input.promisedAt).getTime() < (input.now ?? Date.now());
}
//#endregion
export { assertTransition as n, isDelayed as r, ACTIVE_FLOW as t };
