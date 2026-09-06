import { t as ForbiddenError } from "./rbac-DLs78-ty.mjs";
import { n as requireUserId } from "./verify.server-2xhe562Y.mjs";
import { ensureWorkspace } from "./workspace.server-DJpercHs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-http.server-gZdJhbPn.js
function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}
function fail(err) {
	if (err instanceof ForbiddenError) return json({
		error: err.message,
		code: "FORBIDDEN"
	}, 403);
	const message = err instanceof Error ? err.message : "Unexpected error";
	if (message === "Unauthorized") return json({
		error: message,
		code: "UNAUTHORIZED"
	}, 401);
	return json({
		error: message,
		code: "BAD_REQUEST"
	}, 400);
}
function splatOf(params) {
	return (params._splat ?? params["$"] ?? Object.values(params)[0] ?? "").replace(/^\/+|\/+$/g, "");
}
async function handleAdminHttp(request, params) {
	try {
		const userId = await requireUserId();
		const ws = await ensureWorkspace(userId);
		const q = await import("./queries.server-C6BHYdre.mjs");
		const path = splatOf(params);
		const method = request.method.toUpperCase();
		const url = new URL(request.url);
		const idempotencyKey = request.headers.get("Idempotency-Key") ?? void 0;
		if (method === "GET" && path === "dashboard") return json({
			data: await q.dashboardPayload(ws),
			label: "SIMULATED"
		});
		if (method === "GET" && path === "orders") {
			const delayed = url.searchParams.get("delayed") === "1";
			const status = url.searchParams.get("status") ?? void 0;
			const cityId = url.searchParams.get("city") ?? void 0;
			const minutes = url.searchParams.get("minutes") ? Number(url.searchParams.get("minutes")) : void 0;
			return json({ data: await q.listOrders(ws.ctx, {
				delayed,
				status,
				cityId,
				minutes
			}) });
		}
		if (method === "GET" && path.startsWith("orders/")) return json({ data: await q.getOrder(ws.ctx, path.slice(7)) });
		if (method === "GET" && path === "restaurants") return json({ data: await q.listRestaurants(ws.ctx) });
		if (method === "GET" && path === "riders") return json({ data: await q.listRiders(ws.ctx) });
		if (method === "GET" && path === "customers") return json({ data: await q.listCustomers(ws.ctx) });
		if (method === "GET" && path.startsWith("customers/")) return json({ data: await q.getCustomer(ws.ctx, path.slice(10)) });
		if (method === "GET" && path === "support") return json({ data: await q.listTickets(ws.ctx) });
		if (method === "GET" && path === "analytics") return json({ data: await q.analyticsSeries(ws.ctx) });
		if (method === "GET" && path === "finance") return json({ data: {
			summary: await q.financeSummary(ws.ctx),
			profitability: await q.profitability(ws.ctx)
		} });
		if (method === "GET" && path === "settlements") {
			const party = url.searchParams.get("party") === "RIDER" ? "RIDER" : "RESTAURANT";
			return json({ data: await q.listSettlementBatches(ws.ctx, party) });
		}
		if (method === "GET" && path === "audit") return json({ data: await q.listAudit(ws.ctx, url.searchParams.get("q") ?? void 0) });
		if (method === "GET" && path === "settings") return json({ data: await q.getSettings(ws.ctx) });
		if (method === "GET" && path === "feature-flags") return json({ data: await q.listFlags(ws.ctx) });
		if (method === "GET" && path === "branding") return json({ data: await q.getBranding(ws.ctx) });
		if (method === "GET" && path === "health") return json({ data: await q.systemHealth(ws.ctx) });
		if (method === "POST" && path === "ai") return json({ error: "Use the Command assistant surface for AI. HTTP AI is reserved for Window 5." }, 501);
		if (method === "POST" && path === "dispatch/reassign") {
			const body = await request.json();
			await q.interveneOrder(ws, {
				orderId: body.orderId,
				action: "assign_rider",
				riderId: body.riderId,
				reason: body.reason,
				idempotencyKey
			});
			return json({
				ok: true,
				note: "Dispatch reassignment is a REQUEST to the core matcher. Applied locally in simulation only."
			});
		}
		if (method === "POST" && /^orders\/.+\/refund$/.test(path)) {
			const orderId = path.split("/")[1];
			const body = await request.json();
			await q.interveneOrder(ws, {
				orderId,
				action: "refund",
				reason: body.reason,
				amountPaise: body.amountPaise,
				idempotencyKey
			});
			return json({
				ok: true,
				label: "SIMULATED"
			});
		}
		if (method === "POST" && /^orders\/.+\/cancel$/.test(path)) {
			const orderId = path.split("/")[1];
			const body = await request.json();
			await q.interveneOrder(ws, {
				orderId,
				action: "cancel",
				reason: body.reason,
				idempotencyKey
			});
			return json({
				ok: true,
				label: "SIMULATED"
			});
		}
		if (method === "POST" && path === "support") {
			const body = await request.json();
			if (!body.id) return json({ error: "Ticket id required" }, 400);
			await q.mutateTicket(ws, {
				...body,
				id: body.id,
				idempotencyKey
			});
			return json({ ok: true });
		}
		if (method === "POST" && /^settlements\/.+\/approve$/.test(path)) {
			const id = path.split("/")[1];
			const body = await request.json();
			return json({
				ok: true,
				note: (await q.approveSettlement(ws, id, body.decision ?? "APPROVED", body.reason)).note
			});
		}
		if (method === "PATCH" || method === "PUT" || method === "DELETE") {
			if (path.startsWith("audit")) return json({
				error: "Audit log is append-only",
				code: "FORBIDDEN"
			}, 405);
		}
		return json({
			error: "Not found",
			path: `/v1/admin/${path}`
		}, 404);
	} catch (err) {
		return fail(err);
	}
}
//#endregion
export { handleAdminHttp };
