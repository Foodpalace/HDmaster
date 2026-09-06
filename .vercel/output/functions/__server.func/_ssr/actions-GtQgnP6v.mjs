import { i as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr2.mjs";
import { t as authMiddleware } from "./middleware-Ds3-lDV_.mjs";
import { i as denyAiLeakage, n as allowedAiTools, r as canUseAiTool, t as ForbiddenError } from "./rbac-DLs78-ty.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-GtQgnP6v.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function runScenario(input) {
	const revenuePerOrderPaise = Math.round(input.aovPaise * input.commissionBps / 1e4) + input.deliveryFeePaise + input.customerFeePaise;
	const expectedRefund = Math.round(input.aovPaise * input.refundRate);
	const variableCostPerOrderPaise = input.riderPayoutPaise + input.paymentCostPaise + input.discountPaise + input.platformSubsidyPaise + expectedRefund + input.supportCostPaise;
	const contributionPerOrderPaise = revenuePerOrderPaise - variableCostPerOrderPaise;
	const contributionPerDayPaise = contributionPerOrderPaise * input.ordersPerDay - input.infrastructureCostPerDayPaise;
	const breakEvenOrdersPerDay = contributionPerOrderPaise > 0 ? Math.ceil(input.infrastructureCostPerDayPaise / contributionPerOrderPaise) : null;
	const contribPerRestaurant = (input.restaurantCount > 0 ? input.ordersPerDay / input.restaurantCount : 0) * contributionPerOrderPaise;
	const breakEvenRestaurants = contribPerRestaurant > 0 ? Math.ceil(input.infrastructureCostPerDayPaise / contribPerRestaurant) : null;
	const contribPerRider = (input.riderCount > 0 ? input.ordersPerDay / input.riderCount : 0) * contributionPerOrderPaise;
	const breakEvenRiders = contribPerRider > 0 ? Math.ceil(input.infrastructureCostPerDayPaise / contribPerRider) : null;
	const gmvPerDay = input.ordersPerDay * input.aovPaise;
	const contribPerGmv = gmvPerDay > 0 ? contributionPerDayPaise / gmvPerDay : 0;
	const breakEvenGmvPaise = contribPerGmv > 0 ? Math.ceil(input.infrastructureCostPerDayPaise / contribPerGmv) : null;
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
			"Forecasts are estimates, not guaranteed results"
		]
	};
}
function compareScenarios(inputs) {
	return inputs.map(runScenario);
}
function commissionShock(base, nextBps) {
	const from = runScenario(base);
	const to = runScenario({
		...base,
		name: `${nextBps / 100}% commission`,
		commissionBps: nextBps
	});
	return {
		from,
		to,
		contributionDeltaPaise: to.contributionPerDayPaise - from.contributionPerDayPaise,
		label: "ESTIMATE"
	};
}
async function workspace(userId, bearer) {
	const { ensureWorkspace } = await import("./workspace.server-DJpercHs.mjs");
	return ensureWorkspace(userId, bearer);
}
function fail(err) {
	if (err instanceof ForbiddenError) return {
		ok: false,
		error: err.message,
		status: 403
	};
	const message = err instanceof Error ? err.message : "Unexpected error";
	if (message === "Unauthorized") return {
		ok: false,
		error: message,
		status: 401
	};
	return {
		ok: false,
		error: message,
		status: 400
	};
}
var bootstrapSession_createServerFn_handler = createServerRpc({
	id: "dfc147152adcfdb2e0501028862d01e04016b160b663b00ca66efa989f5bfc86",
	name: "bootstrapSession",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => bootstrapSession.__executeServer(opts));
var bootstrapSession = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(bootstrapSession_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { serializeEmployee, getBranding } = await import("./queries.server-C6BHYdre.mjs");
		const branding = await getBranding(ws.ctx);
		return {
			ok: true,
			employee: serializeEmployee(ws),
			branding,
			settings: ws.ctx.permissions.includes("manage_platform_settings") ? ws.settings : null,
			flags: (await (await import("./queries.server-C6BHYdre.mjs")).loadRuntimeFlags(ws.ctx.orgId)).map((f) => ({
				key: f.key,
				on: f.state === "ON" || f.state === "ROLLOUT_PERCENTAGE" && f.rolloutPct >= 100
			}))
		};
	} catch (err) {
		return fail(err);
	}
});
var loadDashboard_createServerFn_handler = createServerRpc({
	id: "4a76ca4357534811b3c3dc2c6fdf4564ed7721f9bed211eb29a2eb78866ad86b",
	name: "loadDashboard",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadDashboard.__executeServer(opts));
var loadDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadDashboard_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { dashboardPayload } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await dashboardPayload(ws)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadCeo_createServerFn_handler = createServerRpc({
	id: "d7dae7b1be4ff1b8a4e4dda69186a7ea225f5b8bdb9f866d983a5acf992bffdc",
	name: "loadCeo",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadCeo.__executeServer(opts));
var loadCeo = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadCeo_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { ceoBrief } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await ceoBrief(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadOrders_createServerFn_handler = createServerRpc({
	id: "6f0d8ef4599babd0a4f0035fc5de9220fed2957021ae26624d9815728fc9c66f",
	name: "loadOrders",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadOrders.__executeServer(opts));
var loadOrders = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(loadOrders_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { listOrders } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listOrders(ws.ctx, data)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadOrder_createServerFn_handler = createServerRpc({
	id: "cd1d282a40bad161eb89b7014529cb1d30c1a8893f87aceb1a801474fdfb0770",
	name: "loadOrder",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadOrder.__executeServer(opts));
var loadOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(loadOrder_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { getOrder } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await getOrder(ws.ctx, data)
		};
	} catch (err) {
		return fail(err);
	}
});
var actOnOrder_createServerFn_handler = createServerRpc({
	id: "0d4bed86214a1e67a45035c5506a680f4f7accf60c8968a8efe530a0a53ada52",
	name: "actOnOrder",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => actOnOrder.__executeServer(opts));
var actOnOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(actOnOrder_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { interveneOrder } = await import("./queries.server-C6BHYdre.mjs");
		await interveneOrder(ws, data);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadRestaurants_createServerFn_handler = createServerRpc({
	id: "896f6f6fc776298a879816eee05991046adc500832c53bc7e738243e54b00926",
	name: "loadRestaurants",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadRestaurants.__executeServer(opts));
var loadRestaurants = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(loadRestaurants_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { listRestaurants } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listRestaurants(ws.ctx, data.q, data.status)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadRestaurant_createServerFn_handler = createServerRpc({
	id: "5ff6cb1a647905c67db5a70fe69f1a8a4f4cad5ab6952759f2e2c216f7870c93",
	name: "loadRestaurant",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadRestaurant.__executeServer(opts));
var loadRestaurant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(loadRestaurant_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { getRestaurant } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await getRestaurant(ws.ctx, data)
		};
	} catch (err) {
		return fail(err);
	}
});
var actRestaurant_createServerFn_handler = createServerRpc({
	id: "d7ecbb3ebcfd68d8f872473d0cdbbb30924e0d003b25862f482f585dc948b22a",
	name: "actRestaurant",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => actRestaurant.__executeServer(opts));
var actRestaurant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(actRestaurant_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { setRestaurantStatus } = await import("./queries.server-C6BHYdre.mjs");
		await setRestaurantStatus(ws, data.id, data.status, data.reason);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadRiders_createServerFn_handler = createServerRpc({
	id: "98abfa2ea9a8e9d0a5a2b87c5516e4d85a7bdfb332f0fe1aac436fc91d752bbd",
	name: "loadRiders",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadRiders.__executeServer(opts));
var loadRiders = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(loadRiders_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { listRiders } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listRiders(ws.ctx, data.q)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadRider_createServerFn_handler = createServerRpc({
	id: "f9abe72b2605ccd63f4a7a62ded4763effceab82f9c7c751b3d86ddcaf150c6c",
	name: "loadRider",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadRider.__executeServer(opts));
var loadRider = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(loadRider_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { getRider } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await getRider(ws.ctx, data)
		};
	} catch (err) {
		return fail(err);
	}
});
var actRider_createServerFn_handler = createServerRpc({
	id: "9616b5e96e57ee94783151c5da450f0ea5dbdab3886e3a4249b2d34fb8d5f08f",
	name: "actRider",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => actRider.__executeServer(opts));
var actRider = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(actRider_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { setRiderStatus } = await import("./queries.server-C6BHYdre.mjs");
		await setRiderStatus(ws, data.id, data.status, data.reason);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadCustomers_createServerFn_handler = createServerRpc({
	id: "8740cbce8a9ad906c6fe89f427d056d3891f1167f3e131d98b0f94029fd832fa",
	name: "loadCustomers",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadCustomers.__executeServer(opts));
var loadCustomers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(loadCustomers_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { listCustomers } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listCustomers(ws.ctx, data.q)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadCustomer_createServerFn_handler = createServerRpc({
	id: "7837cd488e24aa6679cb4a2c0f65989909b26d887baec338c9cd5fa35be1a9fb",
	name: "loadCustomer",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadCustomer.__executeServer(opts));
var loadCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(loadCustomer_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { getCustomer } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await getCustomer(ws.ctx, data)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadTickets_createServerFn_handler = createServerRpc({
	id: "56159d00c607061466be791f40f2e3b742e1e5ff8307d5aaaf249b7b511ce2d2",
	name: "loadTickets",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadTickets.__executeServer(opts));
var loadTickets = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(loadTickets_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { listTickets } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listTickets(ws.ctx, data.queue, data.status)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadTicket_createServerFn_handler = createServerRpc({
	id: "9a4270cd41d12920194e3469667c6004f2e23ae44a29705bf4a6a5d1d9c0a18b",
	name: "loadTicket",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadTicket.__executeServer(opts));
var loadTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(loadTicket_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { getTicket } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await getTicket(ws.ctx, data)
		};
	} catch (err) {
		return fail(err);
	}
});
var actTicket_createServerFn_handler = createServerRpc({
	id: "059532e864d74219170545a18385e8446fc5be3c12aa07f202e7f6f53a67a31c",
	name: "actTicket",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => actTicket.__executeServer(opts));
var actTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(actTicket_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { mutateTicket } = await import("./queries.server-C6BHYdre.mjs");
		await mutateTicket(ws, data);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadFinance_createServerFn_handler = createServerRpc({
	id: "c359c5273166443756c590360b5645eb466589d6e4fd42c963ef2cc3db9053bd",
	name: "loadFinance",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadFinance.__executeServer(opts));
var loadFinance = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadFinance_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { financeSummary, profitability } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: {
				summary: await financeSummary(ws.ctx),
				profitability: await profitability(ws.ctx)
			}
		};
	} catch (err) {
		return fail(err);
	}
});
var loadSettlements_createServerFn_handler = createServerRpc({
	id: "76ce2fecae68b8f4428797ec7eddde0943ddffc28eb9392e3145a7960d010acb",
	name: "loadSettlements",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadSettlements.__executeServer(opts));
var loadSettlements = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(loadSettlements_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { settlementRows, listSettlementBatches } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listSettlementBatches(ws.ctx, data.party).catch(() => settlementRows(ws.ctx, data.party))
		};
	} catch (err) {
		return fail(err);
	}
});
var runEconomics_createServerFn_handler = createServerRpc({
	id: "660be725e9ad72d1a6b1608fb4f72b2d7ede397fff4cfffb4696753f29f959b3",
	name: "runEconomics",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => runEconomics.__executeServer(opts));
var runEconomics = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runEconomics_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { requirePermission } = await import("./rbac-DLs78-ty.mjs").then((n) => n.a).then((n) => n.a);
		requirePermission(ws.ctx, "view_finance");
		return {
			ok: true,
			data: {
				results: compareScenarios(data.scenarios),
				shock: data.shockBps != null && data.scenarios[0] ? commissionShock(data.scenarios[0], data.shockBps) : null,
				label: "MODEL"
			}
		};
	} catch (err) {
		return fail(err);
	}
});
var loadEmployees_createServerFn_handler = createServerRpc({
	id: "b51298b7ada2d002f90721ddc83d145e62c1820a82626257033d2862045b7963",
	name: "loadEmployees",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadEmployees.__executeServer(opts));
var loadEmployees = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadEmployees_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listEmployees } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listEmployees(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var inviteEmployeeFn_createServerFn_handler = createServerRpc({
	id: "38dc65fa31993f9c7d4ad9fa773e3e3f9b8be30aedf18ffe4c11713b2a81dc11",
	name: "inviteEmployeeFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => inviteEmployeeFn.__executeServer(opts));
var inviteEmployeeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(inviteEmployeeFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { inviteEmployee } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			id: (await inviteEmployee(ws, data)).id
		};
	} catch (err) {
		return fail(err);
	}
});
var updateEmployeeFn_createServerFn_handler = createServerRpc({
	id: "15a4e3c619198d4c4032e55a4c8592291047647a2fbf61f38f6a0ee7767eacf0",
	name: "updateEmployeeFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => updateEmployeeFn.__executeServer(opts));
var updateEmployeeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(updateEmployeeFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { updateEmployee } = await import("./queries.server-C6BHYdre.mjs");
		await updateEmployee(ws, data);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadAudit_createServerFn_handler = createServerRpc({
	id: "c70b3737cc90cb6a3cffd2a7eb65cbfaa1e949b9fb978ea23eed48eae0bbf72d",
	name: "loadAudit",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadAudit.__executeServer(opts));
var loadAudit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(loadAudit_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { listAudit } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listAudit(ws.ctx, data.q)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadFlags_createServerFn_handler = createServerRpc({
	id: "4a6e1b67ad336894d4c2b9728126c5db8a9a7cf06aacbcf5f15a9d57e1ef659f",
	name: "loadFlags",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadFlags.__executeServer(opts));
var loadFlags = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadFlags_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listFlags } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listFlags(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var setFlagFn_createServerFn_handler = createServerRpc({
	id: "59087d450124feb9c8353ee7bbda8f1b6c0a64970ccfc42cdb032e6ff3a15eca",
	name: "setFlagFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => setFlagFn.__executeServer(opts));
var setFlagFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setFlagFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { setFlag } = await import("./queries.server-C6BHYdre.mjs");
		await setFlag(ws, data.key, data.state, data.rolloutPct, data.reason);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadBranding_createServerFn_handler = createServerRpc({
	id: "192793802dfa55798d44ce0c7d78b84c4a51d367fffbd62a31480353f5313ff4",
	name: "loadBranding",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadBranding.__executeServer(opts));
var loadBranding = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadBranding_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { getBranding } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await getBranding(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var saveBrandingFn_createServerFn_handler = createServerRpc({
	id: "55298299f4cc092d62453fd09b393981d067c853e005729ad1bd9a0825216c69",
	name: "saveBrandingFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => saveBrandingFn.__executeServer(opts));
var saveBrandingFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveBrandingFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { saveBranding } = await import("./queries.server-C6BHYdre.mjs");
		await saveBranding(ws, data.patch, data.reason);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadSettings_createServerFn_handler = createServerRpc({
	id: "7e4347130f3376dc6d41ea9432dae6bf038cae03990650703acfa25a45cb6534",
	name: "loadSettings",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadSettings.__executeServer(opts));
var loadSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadSettings_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { getSettings } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await getSettings(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var saveSettingsFn_createServerFn_handler = createServerRpc({
	id: "778c77e1e02825db68ef5d0847264d3e09c9ba40c8a6044b6f17c85310122e52",
	name: "saveSettingsFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => saveSettingsFn.__executeServer(opts));
var saveSettingsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveSettingsFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { saveSettings } = await import("./queries.server-C6BHYdre.mjs");
		await saveSettings(ws, data.settings, data.reason);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadPromos_createServerFn_handler = createServerRpc({
	id: "91cfb97b20c0c80e90cd43e69bb05622b3dbe66c510c7d3fcff6eace35afacca",
	name: "loadPromos",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadPromos.__executeServer(opts));
var loadPromos = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadPromos_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listPromotions, listLoyalty } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: {
				promotions: await listPromotions(ws.ctx),
				loyalty: await listLoyalty(ws.ctx)
			}
		};
	} catch (err) {
		return fail(err);
	}
});
var savePromoFn_createServerFn_handler = createServerRpc({
	id: "437f45d3d69a12e5b57cf0028b044aa69a4f6af44491fa0857894d6351dbd3b3",
	name: "savePromoFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => savePromoFn.__executeServer(opts));
var savePromoFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(savePromoFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { savePromotion } = await import("./queries.server-C6BHYdre.mjs");
		const promo = await savePromotion(ws, data);
		return {
			ok: true,
			id: promo.id,
			estimatedCostPaise: promo.estimatedCostPaise,
			label: promo.label
		};
	} catch (err) {
		return fail(err);
	}
});
var loadCms_createServerFn_handler = createServerRpc({
	id: "824065c43b79caad7e4bb63a639776ee71ae20f1fc53a34602e9f409d30de240",
	name: "loadCms",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadCms.__executeServer(opts));
var loadCms = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadCms_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listCms } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listCms(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var saveCmsFn_createServerFn_handler = createServerRpc({
	id: "369c6f649cd6a037b41dab9b920459f5665d99490f592dc5100e7e66238d7e9d",
	name: "saveCmsFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => saveCmsFn.__executeServer(opts));
var saveCmsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveCmsFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { saveCms } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			id: (await saveCms(ws, data)).id
		};
	} catch (err) {
		return fail(err);
	}
});
var loadZones_createServerFn_handler = createServerRpc({
	id: "02fb03e21e993da0a7c71438ca7ca17b26dbce6bdf1397aec394f0604d1635f8",
	name: "loadZones",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadZones.__executeServer(opts));
var loadZones = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadZones_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listZones, listCities } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: {
				zones: await listZones(ws.ctx),
				cities: await listCities(ws.ctx)
			}
		};
	} catch (err) {
		return fail(err);
	}
});
var saveZoneFn_createServerFn_handler = createServerRpc({
	id: "19782e45033a355bbc439be94d1a46d56c40f19497d729087668348f33442898",
	name: "saveZoneFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => saveZoneFn.__executeServer(opts));
var saveZoneFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveZoneFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { saveZone } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			id: (await saveZone(ws, data)).id
		};
	} catch (err) {
		return fail(err);
	}
});
var loadKyc_createServerFn_handler = createServerRpc({
	id: "5d5e9b687acf47a2a51004e0e1657d31e94c1c77e5a0a55db66b0e873eb0edb0",
	name: "loadKyc",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadKyc.__executeServer(opts));
var loadKyc = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadKyc_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listKyc } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listKyc(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var reviewKycFn_createServerFn_handler = createServerRpc({
	id: "0735daa8e21c5d2cd694c1ec46f85294ab8e0c554647be6554478c22cde26c8f",
	name: "reviewKycFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => reviewKycFn.__executeServer(opts));
var reviewKycFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(reviewKycFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { reviewKyc } = await import("./queries.server-C6BHYdre.mjs");
		await reviewKyc(ws, data.id, data.status, data.notes);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadRisk_createServerFn_handler = createServerRpc({
	id: "0007528a7cfe06710f80d8a454685fb4d4485b470bac429ef4aecab91320fa88",
	name: "loadRisk",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadRisk.__executeServer(opts));
var loadRisk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadRisk_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listRisk } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listRisk(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadNotifications_createServerFn_handler = createServerRpc({
	id: "d352057dc439a707698b6118ba7d2ce342f8f6cbfc4132cf9c2d568339febab2",
	name: "loadNotifications",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadNotifications.__executeServer(opts));
var loadNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadNotifications_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listNotifications } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listNotifications(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadDispatch_createServerFn_handler = createServerRpc({
	id: "111d98c6a63e49b61503a8399ecd1146e3e5294277346222822ccf4ddbd24af2",
	name: "loadDispatch",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadDispatch.__executeServer(opts));
var loadDispatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadDispatch_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { dispatchBoard } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await dispatchBoard(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadLive_createServerFn_handler = createServerRpc({
	id: "5dea6d4928b9ed13923ec86111de35a81b77d1097a23e755cae157c27cdcd49a",
	name: "loadLive",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadLive.__executeServer(opts));
var loadLive = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadLive_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { liveBoard } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await liveBoard(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var tickSim_createServerFn_handler = createServerRpc({
	id: "9a32e49af888eee6ac809987911d8f5454ab2116523bd096b5e390cc38ec4c64",
	name: "tickSim",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => tickSim.__executeServer(opts));
var tickSim = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(tickSim_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { tickSimulation } = await import("./queries.server-C6BHYdre.mjs");
		const tick = await tickSimulation(ws);
		return {
			ok: true,
			advanced: tick.advanced,
			label: tick.label
		};
	} catch (err) {
		return fail(err);
	}
});
var loadAnalytics_createServerFn_handler = createServerRpc({
	id: "4c9b732d479f51bc5b3b82a173bfe4bf85344d1fa6e9f2655048e531fc108d53",
	name: "loadAnalytics",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadAnalytics.__executeServer(opts));
var loadAnalytics = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadAnalytics_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { analyticsSeries } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await analyticsSeries(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var loadHealth_createServerFn_handler = createServerRpc({
	id: "fd96c74deef4807c69c7b6bfc67d4c50e3d464a0844c695e83cc03caf43a2784",
	name: "loadHealth",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadHealth.__executeServer(opts));
var loadHealth = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadHealth_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { systemHealth } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await systemHealth(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var exportCsv_createServerFn_handler = createServerRpc({
	id: "b095a7eb0526f151333f3c8ddb808952d7ff650cd18c2fd240e56241d993df05",
	name: "exportCsv",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => exportCsv.__executeServer(opts));
var exportCsv = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(exportCsv_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { requirePermission } = await import("./rbac-DLs78-ty.mjs").then((n) => n.a).then((n) => n.a);
		requirePermission(ws.ctx, "export_data");
		const q = await import("./queries.server-C6BHYdre.mjs");
		let csv = "";
		if (data.kind === "orders") {
			requirePermission(ws.ctx, "view_orders");
			csv = "id,status,restaurant,total_paise,placed_at,data_mode\n" + (await q.listOrders(ws.ctx, { limit: 200 })).map((r) => `${r.id},${r.status},${r.restaurant},${r.totalPaise},${r.placedAt},${r.data_mode}`).join("\n");
		} else if (data.kind === "restaurants") csv = "id,name,status,city,orders\n" + (await q.listRestaurants(ws.ctx)).map((r) => `${r.id},${r.name},${r.status},${r.cityId},${r.orderCount}`).join("\n");
		else if (data.kind === "riders") csv = "id,name,status,online,kyc\n" + (await q.listRiders(ws.ctx)).map((r) => `${r.id},${r.name},${r.status},${r.online},${r.kycStatus}`).join("\n");
		else {
			requirePermission(ws.ctx, "view_finance");
			const fin = await q.financeSummary(ws.ctx);
			csv = "metric,paise,label\nGMV," + fin.gmv + ",SIMULATED\ncontribution," + fin.contribution.total + ",ESTIMATE\n";
		}
		await (await import("./workspace.server-DJpercHs.mjs")).appendAudit({
			orgId: ws.ctx.orgId,
			employeeId: ws.ctx.employeeId,
			userId: ws.ctx.userId,
			roleKey: ws.ctx.actingRoleKey,
			action: "export.csv",
			targetType: "export",
			targetId: data.kind
		});
		return {
			ok: true,
			csv,
			filename: `roshoi-${data.kind}.csv`
		};
	} catch (err) {
		return fail(err);
	}
});
async function runAiTools(ws, names) {
	const q = await import("./queries.server-C6BHYdre.mjs");
	const out = [];
	for (const tool of names) {
		if (!canUseAiTool(ws.ctx, tool)) continue;
		try {
			if (tool === "get_financial_metrics") out.push({
				tool,
				label: "SIMULATED",
				data: await q.financeSummary(ws.ctx)
			});
			else if (tool === "get_ceo_brief") out.push({
				tool,
				label: "SIMULATED",
				data: await q.ceoBrief(ws.ctx)
			});
			else if (tool === "get_order" || tool === "get_delivery_metrics") out.push({
				tool,
				label: "SIMULATED",
				data: await q.listOrders(ws.ctx, {
					delayed: true,
					limit: 15
				})
			});
			else if (tool === "get_restaurant") out.push({
				tool,
				label: "SIMULATED",
				data: await q.listRestaurants(ws.ctx)
			});
			else if (tool === "get_rider") out.push({
				tool,
				label: "SIMULATED",
				data: await q.listRiders(ws.ctx)
			});
			else if (tool === "get_support_tickets") out.push({
				tool,
				label: "SIMULATED",
				data: await q.listTickets(ws.ctx)
			});
			else if (tool === "get_risk_signals") out.push({
				tool,
				label: "SIMULATED",
				data: await q.listRisk(ws.ctx)
			});
			else if (tool === "get_dashboard") out.push({
				tool,
				label: "SIMULATED",
				data: await q.dashboardPayload(ws)
			});
			else if (tool === "get_campaign_metrics") out.push({
				tool,
				label: "SIMULATED",
				data: await q.listPromotions(ws.ctx)
			});
			else if (tool === "get_customer_metrics") out.push({
				tool,
				label: "SIMULATED",
				data: await q.listCustomers(ws.ctx)
			});
		} catch {}
	}
	return out;
}
var askAssistant_createServerFn_handler = createServerRpc({
	id: "199d02e40dbd3765be93c8606f13fed1748355d936ec36b8b813cede5786dfd9",
	name: "askAssistant",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => askAssistant.__executeServer(opts));
var askAssistant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(askAssistant_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { requirePermission } = await import("./rbac-DLs78-ty.mjs").then((n) => n.a).then((n) => n.a);
		requirePermission(ws.ctx, "access_AI");
		if (data.mode === "ceo") requirePermission(ws.ctx, "access_CEO_dashboard");
		const leak = denyAiLeakage(ws.ctx, data.question);
		if (leak) return {
			ok: false,
			error: leak,
			status: 403
		};
		const snapshots = await runAiTools(ws, allowedAiTools(ws.ctx).slice(0, 8));
		const apiKey = process.env.XAI_API_KEY;
		const facts = JSON.stringify(snapshots).slice(0, 12e3);
		const system = `You are the ${data.mode === "ceo" ? "CEO" : "operations"} assistant for Roshoi Command, a food-delivery marketplace OS for Karimganj/Sribhumi, Assam.
Rules:
- Use ONLY the provided tool snapshots. Never invent numbers.
- Label every figure ACTUAL, SIMULATED, ESTIMATE, FORECAST, or MODEL.
- If data is missing say "I don't have confirmed data for that."
- Cite like: "Based on N simulated orders…"
- Recommend actions; do not claim you executed high-risk operations.
- High-risk changes require human review: refunds, commission, suspensions, payouts, permission changes.
Current employee role: ${ws.ctx.actingRoleKey}. Data mode: ${ws.dataMode}.`;
		if (!apiKey) {
			const fallback = snapshots.map((s) => `${s.tool} (${s.label}): ${JSON.stringify(s.data).slice(0, 400)}`).join("\n");
			return {
				ok: true,
				text: `AI provider is unavailable in this environment, so here is a deterministic briefing from authorized tools.\n\nQuestion: ${data.question}\n\n${fallback.slice(0, 2500)}\n\nAll marketplace figures are SIMULATED until Window 5 is connected.`,
				tools: snapshots.map((s) => s.tool),
				provider: "deterministic"
			};
		}
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 700,
				messages: [{
					role: "system",
					content: system
				}, {
					role: "user",
					content: `Question: ${data.question}\n\nAuthorized snapshots:\n${facts}`
				}]
			})
		});
		if (!res.ok) return {
			ok: false,
			error: `xAI API error ${res.status}`,
			status: 502
		};
		return {
			ok: true,
			text: (await res.json()).choices[0]?.message.content ?? "I don't have confirmed data for that.",
			tools: snapshots.map((s) => s.tool),
			provider: "xai"
		};
	} catch (err) {
		return fail(err);
	}
});
var saveLoyaltyFn_createServerFn_handler = createServerRpc({
	id: "3c96bb0db94010cd0d3b78c39e6768b56d744494f28f1bd5ec53e7dfbff850ac",
	name: "saveLoyaltyFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => saveLoyaltyFn.__executeServer(opts));
var saveLoyaltyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveLoyaltyFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { saveLoyalty } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			id: (await saveLoyalty(ws, data)).id
		};
	} catch (err) {
		return fail(err);
	}
});
var loadCampaigns_createServerFn_handler = createServerRpc({
	id: "83c24e7c1ada5bd254df94a18b239190af954800d6d16349b4eff4ef81ab8686",
	name: "loadCampaigns",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadCampaigns.__executeServer(opts));
var loadCampaigns = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadCampaigns_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listCampaigns } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listCampaigns(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var saveCampaignFn_createServerFn_handler = createServerRpc({
	id: "694a7148f8b0249902a80b567bf391a6c054eed1962f34e484cb0fc4de94d6b2",
	name: "saveCampaignFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => saveCampaignFn.__executeServer(opts));
var saveCampaignFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveCampaignFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { saveCampaign } = await import("./queries.server-C6BHYdre.mjs");
		const saved = await saveCampaign(ws, data);
		return {
			ok: true,
			id: saved.id,
			estimatedCostPaise: saved.estimatedCostPaise
		};
	} catch (err) {
		return fail(err);
	}
});
var loadReports_createServerFn_handler = createServerRpc({
	id: "e40a94689a7886b564fb8662e3a6b558a25dafc9562ecc8de5c295e44de22f9a",
	name: "loadReports",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadReports.__executeServer(opts));
var loadReports = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadReports_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { reportsPayload } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await reportsPayload(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
var approveSettlementFn_createServerFn_handler = createServerRpc({
	id: "d3990ff9611d43ec4b4d051f7af958cd9c9318194c4ab521a6abb17beea4c1c2",
	name: "approveSettlementFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => approveSettlementFn.__executeServer(opts));
var approveSettlementFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(approveSettlementFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { approveSettlement } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			note: (await approveSettlement(ws, data.id, data.decision, data.reason)).note
		};
	} catch (err) {
		return fail(err);
	}
});
var queueNotificationFn_createServerFn_handler = createServerRpc({
	id: "bf53c6b58d25312f3ffc86e1e38dcb67055e8cb2fbf44c74bb435e23b9fbd883",
	name: "queueNotificationFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => queueNotificationFn.__executeServer(opts));
var queueNotificationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(queueNotificationFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { queueNotification } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			...await queueNotification(ws, data)
		};
	} catch (err) {
		return fail(err);
	}
});
var updateCustomerFn_createServerFn_handler = createServerRpc({
	id: "3030d3aa56c6434a07ca42d9a5dccd7741cdb8350a633ef6b2e001a603ce94eb",
	name: "updateCustomerFn",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => updateCustomerFn.__executeServer(opts));
var updateCustomerFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(updateCustomerFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const ws = await workspace(context.userId);
		const { updateCustomer } = await import("./queries.server-C6BHYdre.mjs");
		await updateCustomer(ws, data);
		return { ok: true };
	} catch (err) {
		return fail(err);
	}
});
var loadCities_createServerFn_handler = createServerRpc({
	id: "1479bcb93c079ee2e3b44a46e758b6c96d45b641441c18748e3346bac0d636e4",
	name: "loadCities",
	filename: "src/lib/roshoi/actions.ts"
}, (opts) => loadCities.__executeServer(opts));
var loadCities = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadCities_createServerFn_handler, async ({ context }) => {
	try {
		const ws = await workspace(context.userId);
		const { listCities } = await import("./queries.server-C6BHYdre.mjs");
		return {
			ok: true,
			data: await listCities(ws.ctx)
		};
	} catch (err) {
		return fail(err);
	}
});
//#endregion
export { actOnOrder_createServerFn_handler, actRestaurant_createServerFn_handler, actRider_createServerFn_handler, actTicket_createServerFn_handler, approveSettlementFn_createServerFn_handler, askAssistant_createServerFn_handler, bootstrapSession_createServerFn_handler, exportCsv_createServerFn_handler, inviteEmployeeFn_createServerFn_handler, loadAnalytics_createServerFn_handler, loadAudit_createServerFn_handler, loadBranding_createServerFn_handler, loadCampaigns_createServerFn_handler, loadCeo_createServerFn_handler, loadCities_createServerFn_handler, loadCms_createServerFn_handler, loadCustomer_createServerFn_handler, loadCustomers_createServerFn_handler, loadDashboard_createServerFn_handler, loadDispatch_createServerFn_handler, loadEmployees_createServerFn_handler, loadFinance_createServerFn_handler, loadFlags_createServerFn_handler, loadHealth_createServerFn_handler, loadKyc_createServerFn_handler, loadLive_createServerFn_handler, loadNotifications_createServerFn_handler, loadOrder_createServerFn_handler, loadOrders_createServerFn_handler, loadPromos_createServerFn_handler, loadReports_createServerFn_handler, loadRestaurant_createServerFn_handler, loadRestaurants_createServerFn_handler, loadRider_createServerFn_handler, loadRiders_createServerFn_handler, loadRisk_createServerFn_handler, loadSettings_createServerFn_handler, loadSettlements_createServerFn_handler, loadTicket_createServerFn_handler, loadTickets_createServerFn_handler, loadZones_createServerFn_handler, queueNotificationFn_createServerFn_handler, reviewKycFn_createServerFn_handler, runEconomics_createServerFn_handler, saveBrandingFn_createServerFn_handler, saveCampaignFn_createServerFn_handler, saveCmsFn_createServerFn_handler, saveLoyaltyFn_createServerFn_handler, savePromoFn_createServerFn_handler, saveSettingsFn_createServerFn_handler, saveZoneFn_createServerFn_handler, setFlagFn_createServerFn_handler, tickSim_createServerFn_handler, updateCustomerFn_createServerFn_handler, updateEmployeeFn_createServerFn_handler };
