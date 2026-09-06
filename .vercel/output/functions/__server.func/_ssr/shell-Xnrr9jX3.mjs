import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { b as Navigate, f as useRouterState, h as Outlet, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Bike, C as Gift, D as Command, E as Crown, M as Activity, O as ChartNoAxesColumn, S as IdCard, T as FileText, _ as Menu, a as UserRound, b as LifeBuoy, c as Shield, d as Scale, f as Receipt, g as Palette, h as PanelsTopLeft, i as Users, j as Bell, k as Calculator, l as Settings, m as Percent, n as Wallet, o as TriangleAlert, p as Radio, r as Utensils, s as Sparkles, t as X, u as ScrollText, v as Megaphone, w as Flag, x as LayoutDashboard, y as Map } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as ROLE_LABELS, s as SYSTEM_ROLES } from "./permissions-CgAuzqYW.mjs";
import { r as DEFAULT_SETTINGS } from "./types-AjEC33cK.mjs";
import { n as intentPath, r as parseCommand } from "./search-vodECYHq.mjs";
import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr2.mjs";
import { i as signOut } from "./client-CVqXY6bk.mjs";
import { t as authMiddleware } from "./middleware-Ds3-lDV_.mjs";
import { n as cn, o as useCurrentUser, s as useCurrentUserState, t as RoshoiMark } from "./mark-QhCHUVHE.mjs";
import { t as Input } from "./input-DUqV2re_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-Xnrr9jX3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var bootstrapSession = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("dfc147152adcfdb2e0501028862d01e04016b160b663b00ca66efa989f5bfc86"));
var loadDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4a76ca4357534811b3c3dc2c6fdf4564ed7721f9bed211eb29a2eb78866ad86b"));
var loadCeo = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d7dae7b1be4ff1b8a4e4dda69186a7ea225f5b8bdb9f866d983a5acf992bffdc"));
var loadOrders = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6f0d8ef4599babd0a4f0035fc5de9220fed2957021ae26624d9815728fc9c66f"));
var loadOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("cd1d282a40bad161eb89b7014529cb1d30c1a8893f87aceb1a801474fdfb0770"));
var actOnOrder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("0d4bed86214a1e67a45035c5506a680f4f7accf60c8968a8efe530a0a53ada52"));
var loadRestaurants = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("896f6f6fc776298a879816eee05991046adc500832c53bc7e738243e54b00926"));
var loadRestaurant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("5ff6cb1a647905c67db5a70fe69f1a8a4f4cad5ab6952759f2e2c216f7870c93"));
var actRestaurant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("d7ecbb3ebcfd68d8f872473d0cdbbb30924e0d003b25862f482f585dc948b22a"));
var loadRiders = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("98abfa2ea9a8e9d0a5a2b87c5516e4d85a7bdfb332f0fe1aac436fc91d752bbd"));
var loadRider = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("f9abe72b2605ccd63f4a7a62ded4763effceab82f9c7c751b3d86ddcaf150c6c"));
var actRider = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("9616b5e96e57ee94783151c5da450f0ea5dbdab3886e3a4249b2d34fb8d5f08f"));
var loadCustomers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("8740cbce8a9ad906c6fe89f427d056d3891f1167f3e131d98b0f94029fd832fa"));
var loadCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("7837cd488e24aa6679cb4a2c0f65989909b26d887baec338c9cd5fa35be1a9fb"));
var loadTickets = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("56159d00c607061466be791f40f2e3b742e1e5ff8307d5aaaf249b7b511ce2d2"));
var loadTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("9a4270cd41d12920194e3469667c6004f2e23ae44a29705bf4a6a5d1d9c0a18b"));
var actTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("059532e864d74219170545a18385e8446fc5be3c12aa07f202e7f6f53a67a31c"));
var loadFinance = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c359c5273166443756c590360b5645eb466589d6e4fd42c963ef2cc3db9053bd"));
var loadSettlements = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("76ce2fecae68b8f4428797ec7eddde0943ddffc28eb9392e3145a7960d010acb"));
var runEconomics = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("660be725e9ad72d1a6b1608fb4f72b2d7ede397fff4cfffb4696753f29f959b3"));
var loadEmployees = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b51298b7ada2d002f90721ddc83d145e62c1820a82626257033d2862045b7963"));
var inviteEmployeeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("38dc65fa31993f9c7d4ad9fa773e3e3f9b8be30aedf18ffe4c11713b2a81dc11"));
var updateEmployeeFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("15a4e3c619198d4c4032e55a4c8592291047647a2fbf61f38f6a0ee7767eacf0"));
var loadAudit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("c70b3737cc90cb6a3cffd2a7eb65cbfaa1e949b9fb978ea23eed48eae0bbf72d"));
var loadFlags = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4a6e1b67ad336894d4c2b9728126c5db8a9a7cf06aacbcf5f15a9d57e1ef659f"));
var setFlagFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("59087d450124feb9c8353ee7bbda8f1b6c0a64970ccfc42cdb032e6ff3a15eca"));
var loadBranding = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("192793802dfa55798d44ce0c7d78b84c4a51d367fffbd62a31480353f5313ff4"));
var saveBrandingFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("55298299f4cc092d62453fd09b393981d067c853e005729ad1bd9a0825216c69"));
var loadSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7e4347130f3376dc6d41ea9432dae6bf038cae03990650703acfa25a45cb6534"));
var saveSettingsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("778c77e1e02825db68ef5d0847264d3e09c9ba40c8a6044b6f17c85310122e52"));
var loadPromos = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("91cfb97b20c0c80e90cd43e69bb05622b3dbe66c510c7d3fcff6eace35afacca"));
var savePromoFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("437f45d3d69a12e5b57cf0028b044aa69a4f6af44491fa0857894d6351dbd3b3"));
var loadCms = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("824065c43b79caad7e4bb63a639776ee71ae20f1fc53a34602e9f409d30de240"));
var saveCmsFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("369c6f649cd6a037b41dab9b920459f5665d99490f592dc5100e7e66238d7e9d"));
var loadZones = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("02fb03e21e993da0a7c71438ca7ca17b26dbce6bdf1397aec394f0604d1635f8"));
var saveZoneFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("19782e45033a355bbc439be94d1a46d56c40f19497d729087668348f33442898"));
var loadKyc = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5d5e9b687acf47a2a51004e0e1657d31e94c1c77e5a0a55db66b0e873eb0edb0"));
var reviewKycFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("0735daa8e21c5d2cd694c1ec46f85294ab8e0c554647be6554478c22cde26c8f"));
var loadRisk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0007528a7cfe06710f80d8a454685fb4d4485b470bac429ef4aecab91320fa88"));
var loadNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d352057dc439a707698b6118ba7d2ce342f8f6cbfc4132cf9c2d568339febab2"));
var loadDispatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("111d98c6a63e49b61503a8399ecd1146e3e5294277346222822ccf4ddbd24af2"));
var loadLive = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5dea6d4928b9ed13923ec86111de35a81b77d1097a23e755cae157c27cdcd49a"));
var tickSim = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("9a32e49af888eee6ac809987911d8f5454ab2116523bd096b5e390cc38ec4c64"));
var loadAnalytics = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4c9b732d479f51bc5b3b82a173bfe4bf85344d1fa6e9f2655048e531fc108d53"));
var loadHealth = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fd96c74deef4807c69c7b6bfc67d4c50e3d464a0844c695e83cc03caf43a2784"));
var exportCsv = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("b095a7eb0526f151333f3c8ddb808952d7ff650cd18c2fd240e56241d993df05"));
var askAssistant = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("199d02e40dbd3765be93c8606f13fed1748355d936ec36b8b813cede5786dfd9"));
var saveLoyaltyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("3c96bb0db94010cd0d3b78c39e6768b56d744494f28f1bd5ec53e7dfbff850ac"));
var loadCampaigns = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("83c24e7c1ada5bd254df94a18b239190af954800d6d16349b4eff4ef81ab8686"));
var saveCampaignFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("694a7148f8b0249902a80b567bf391a6c054eed1962f34e484cb0fc4de94d6b2"));
var loadReports = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e40a94689a7886b564fb8662e3a6b558a25dafc9562ecc8de5c295e44de22f9a"));
var approveSettlementFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("d3990ff9611d43ec4b4d051f7af958cd9c9318194c4ab521a6abb17beea4c1c2"));
var queueNotificationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("bf53c6b58d25312f3ffc86e1e38dcb67055e8cb2fbf44c74bb435e23b9fbd883"));
var updateCustomerFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("3030d3aa56c6434a07ca42d9a5dccd7741cdb8350a633ef6b2e001a603ce94eb"));
var loadCities = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1479bcb93c079ee2e3b44a46e758b6c96d45b641441c18748e3346bac0d636e4"));
var defaultEconomicsScenario = () => ({
	name: "Current 10%",
	commissionBps: DEFAULT_SETTINGS.commissionBps,
	deliveryFeePaise: 3e3,
	customerFeePaise: DEFAULT_SETTINGS.serviceFeePaise,
	riderPayoutPaise: DEFAULT_SETTINGS.riderBasePaise + DEFAULT_SETTINGS.riderDistancePaise,
	discountPaise: 800,
	platformSubsidyPaise: 0,
	paymentCostPaise: 450,
	refundRate: .03,
	supportCostPaise: 200,
	infrastructureCostPerDayPaise: 4e4,
	ordersPerDay: 90,
	aovPaise: 28e3,
	restaurantCount: 24,
	riderCount: 28
});
var NAV = [
	{
		id: "today",
		i18n: "groups.today",
		items: [{
			id: "dashboard",
			path: "/app",
			i18n: "nav.dashboard",
			permission: "view_analytics",
			icon: "layout"
		}]
	},
	{
		id: "executive",
		i18n: "groups.executive",
		items: [{
			id: "ceo",
			path: "/app/ceo",
			i18n: "nav.ceo",
			permission: "access_CEO_dashboard",
			icon: "crown"
		}]
	},
	{
		id: "operations",
		i18n: "groups.operations",
		items: [
			{
				id: "live",
				path: "/app/live",
				i18n: "nav.live",
				permission: "view_orders",
				icon: "radio"
			},
			{
				id: "orders",
				path: "/app/orders",
				i18n: "nav.orders",
				permission: "view_orders",
				icon: "receipt"
			},
			{
				id: "dispatch",
				path: "/app/dispatch",
				i18n: "nav.dispatch",
				permission: "view_orders",
				icon: "bike"
			},
			{
				id: "zones",
				path: "/app/zones",
				i18n: "nav.zones",
				permission: "manage_delivery_zones",
				icon: "map"
			}
		]
	},
	{
		id: "network",
		i18n: "groups.network",
		items: [
			{
				id: "restaurants",
				path: "/app/restaurants",
				i18n: "nav.restaurants",
				permission: "view_restaurants",
				icon: "utensils"
			},
			{
				id: "riders",
				path: "/app/riders",
				i18n: "nav.riders",
				permission: "view_riders",
				icon: "bike"
			},
			{
				id: "customers",
				path: "/app/customers",
				i18n: "nav.customers",
				permission: "view_customers",
				icon: "users"
			},
			{
				id: "kyc",
				path: "/app/kyc",
				i18n: "nav.kyc",
				permission: "view_kyc",
				icon: "shield"
			}
		]
	},
	{
		id: "support",
		i18n: "groups.support",
		items: [{
			id: "support",
			path: "/app/support",
			i18n: "nav.support",
			permission: "manage_support",
			icon: "lifeBuoy"
		}]
	},
	{
		id: "finance",
		i18n: "groups.finance",
		items: [
			{
				id: "finance",
				path: "/app/finance",
				i18n: "nav.finance",
				permission: "view_finance",
				icon: "wallet"
			},
			{
				id: "settlements",
				path: "/app/settlements",
				i18n: "nav.settlements",
				permission: "view_finance",
				icon: "scale"
			},
			{
				id: "economics",
				path: "/app/economics",
				i18n: "nav.economics",
				permission: "view_finance",
				icon: "calculator"
			}
		]
	},
	{
		id: "growth",
		i18n: "groups.growth",
		items: [
			{
				id: "promotions",
				path: "/app/promotions",
				i18n: "nav.promotions",
				permission: "manage_promotions",
				icon: "percent"
			},
			{
				id: "loyalty",
				path: "/app/loyalty",
				i18n: "nav.loyalty",
				permission: "manage_promotions",
				icon: "gift"
			},
			{
				id: "marketing",
				path: "/app/marketing",
				i18n: "nav.marketing",
				permission: "manage_cms",
				icon: "megaphone"
			},
			{
				id: "cms",
				path: "/app/cms",
				i18n: "nav.cms",
				permission: "manage_cms",
				icon: "panels"
			}
		]
	},
	{
		id: "intelligence",
		i18n: "groups.intelligence",
		items: [
			{
				id: "analytics",
				path: "/app/analytics",
				i18n: "nav.analytics",
				permission: "view_analytics",
				icon: "chart"
			},
			{
				id: "reports",
				path: "/app/reports",
				i18n: "nav.reports",
				permission: "view_analytics",
				icon: "file"
			},
			{
				id: "risk",
				path: "/app/risk",
				i18n: "nav.risk",
				permission: "view_risk",
				icon: "alert"
			},
			{
				id: "ai",
				path: "/app/ai",
				i18n: "nav.ai",
				permission: "access_AI",
				icon: "spark"
			}
		]
	},
	{
		id: "system",
		i18n: "groups.system",
		items: [
			{
				id: "employees",
				path: "/app/employees",
				i18n: "nav.employees",
				permission: "manage_users",
				icon: "id"
			},
			{
				id: "branding",
				path: "/app/branding",
				i18n: "nav.branding",
				permission: "manage_branding",
				icon: "palette"
			},
			{
				id: "flags",
				path: "/app/flags",
				i18n: "nav.flags",
				permission: "manage_feature_flags",
				icon: "flag"
			},
			{
				id: "settings",
				path: "/app/settings",
				i18n: "nav.settings",
				permission: "manage_platform_settings",
				icon: "settings"
			},
			{
				id: "notifications",
				path: "/app/notifications",
				i18n: "nav.notifications",
				permission: "manage_notifications",
				icon: "bell"
			},
			{
				id: "audit",
				path: "/app/audit",
				i18n: "nav.audit",
				permission: "view_audit_logs",
				icon: "scroll"
			},
			{
				id: "health",
				path: "/app/health",
				i18n: "nav.health",
				permission: "view_analytics",
				icon: "activity"
			}
		]
	}
];
function itemAllowed(item, perms) {
	const need = Array.isArray(item.permission) ? item.permission : [item.permission];
	if (perms.includes("view_analytics") && item.id === "dashboard") return true;
	return need.some((p) => perms.includes(p));
}
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var en = {
	app: {
		name: "Roshoi Command",
		tagline: "The kitchen, delivered."
	},
	nav: {
		dashboard: "Today",
		ceo: "CEO Command",
		live: "Live Control",
		orders: "Orders",
		dispatch: "Dispatch",
		zones: "Zones",
		restaurants: "Restaurants",
		riders: "Riders",
		customers: "Customers",
		kyc: "KYC",
		support: "Support",
		finance: "Finance",
		settlements: "Settlements",
		economics: "Economics",
		promotions: "Promotions",
		loyalty: "Loyalty",
		marketing: "Marketing",
		cms: "CMS",
		analytics: "Analytics",
		reports: "Reports",
		risk: "Risk",
		ai: "AI Assistant",
		employees: "Employees",
		branding: "Branding",
		flags: "Feature flags",
		settings: "Settings",
		notifications: "Notifications",
		audit: "Audit log",
		health: "System health"
	},
	groups: {
		today: "Today",
		executive: "Executive",
		operations: "Operations",
		network: "Network",
		support: "Support",
		finance: "Finance",
		growth: "Growth",
		intelligence: "Intelligence",
		system: "System"
	},
	auth: {
		signIn: "Sign in",
		signOut: "Sign out",
		email: "Work email",
		password: "Password",
		continueGoogle: "Continue with Google",
		continueX: "Continue with X",
		firstUser: "The first person to sign in becomes Super Admin.",
		pending: "Your access is pending an administrator invite.",
		enter: "Enter Command"
	},
	common: {
		simulated: "Simulated / development data",
		actual: "Actual",
		estimate: "Estimate",
		forecast: "Forecast",
		model: "Model",
		search: "Search Command",
		save: "Save",
		cancel: "Cancel",
		confirm: "Confirm",
		reason: "Reason",
		export: "Export CSV",
		empty: "Nothing to show",
		loading: "Loading",
		delayed: "Delayed",
		online: "Online",
		offline: "Offline"
	}
};
var DICTIONARIES = {
	en,
	bn: {
		app: {
			name: "রোশই কমান্ড",
			tagline: "রান্নাঘর, পৌঁছে দেওয়া।"
		},
		nav: {
			dashboard: "আজ",
			ceo: "সিইও কমান্ড",
			live: "লাইভ নিয়ন্ত্রণ",
			orders: "অর্ডার",
			dispatch: "ডিসপ্যাচ",
			zones: "জোন",
			restaurants: "রেস্তোরাঁ",
			riders: "রাইডার",
			customers: "গ্রাহক",
			kyc: "কেওয়াইসি",
			support: "সহায়তা",
			finance: "অর্থ",
			settlements: "সেটেলমেন্ট",
			economics: "অর্থনীতি",
			promotions: "প্রমোশন",
			loyalty: "লয়ালটি",
			marketing: "মার্কেটিং",
			cms: "সিএমএস",
			analytics: "বিশ্লেষণ",
			reports: "রিপোর্ট",
			risk: "ঝুঁকি",
			ai: "এআই সহায়ক",
			employees: "কর্মচারী",
			branding: "ব্র্যান্ডিং",
			flags: "ফিচার ফ্ল্যাগ",
			settings: "সেটিংস",
			notifications: "বিজ্ঞপ্তি",
			audit: "অডিট লগ",
			health: "সিস্টেম স্বাস্থ্য"
		},
		groups: {
			today: "আজ",
			executive: "নির্বাহী",
			operations: "অপারেশন",
			network: "নেটওয়ার্ক",
			support: "সহায়তা",
			finance: "অর্থ",
			growth: "গ্রোথ",
			intelligence: "ইন্টেলিজেন্স",
			system: "সিস্টেম"
		},
		auth: {
			signIn: "সাইন ইন",
			signOut: "সাইন আউট",
			email: "কর্মস্থলের ইমেইল",
			password: "পাসওয়ার্ড",
			continueGoogle: "Google দিয়ে চালিয়ে যান",
			continueX: "X দিয়ে চালিয়ে যান",
			firstUser: "প্রথম সাইন-ইনকারী সুপার অ্যাডমিন হবেন।",
			pending: "আপনার অ্যাক্সেস অ্যাডমিনের আমন্ত্রণের অপেক্ষায়।",
			enter: "কমান্ডে প্রবেশ করুন"
		},
		common: {
			simulated: "সিমুলেটেড / ডেভেলপমেন্ট ডেটা",
			actual: "প্রকৃত",
			estimate: "আনুমানিক",
			forecast: "পূর্বাভাস",
			model: "মডেল",
			search: "কমান্ড খুঁজুন",
			save: "সংরক্ষণ",
			cancel: "বাতিল",
			confirm: "নিশ্চিত",
			reason: "কারণ",
			export: "CSV রপ্তানি",
			empty: "দেখানোর কিছু নেই",
			loading: "লোড হচ্ছে",
			delayed: "বিলম্বিত",
			online: "অনলাইন",
			offline: "অফলাইন"
		}
	},
	as: {
		...en,
		app: {
			name: "ৰোশই কমাণ্ড",
			tagline: "ৰান্ধনিঘৰ, পঠিওৱা।"
		},
		nav: {
			dashboard: "আজি",
			ceo: "চিইঅ' কমাণ্ড",
			live: "লাইভ নিয়ন্ত্ৰণ",
			orders: "অৰ্ডাৰ",
			dispatch: "ডিস্পেচ",
			zones: "জ'ন",
			restaurants: "ৰেষ্টুৰেণ্ট",
			riders: "ৰাইডাৰ",
			customers: "গ্ৰাহক",
			kyc: "কেৱাইচি",
			support: "সহায়",
			finance: "অৰ্থ",
			settlements: "ছেটেলমেণ্ট",
			economics: "অৰ্থনীতি",
			promotions: "প্ৰমোচন",
			loyalty: "লয়ালিটি",
			marketing: "মাৰ্কেটিং",
			cms: "চিএমএছ",
			analytics: "বিশ্লেষণ",
			reports: "প্ৰতিবেদন",
			risk: "বিপদ",
			ai: "এআই সহায়ক",
			employees: "কৰ্মচাৰী",
			branding: "ব্ৰেণ্ডিং",
			flags: "ফিচাৰ ফ্লেগ",
			settings: "ছেটিংছ",
			notifications: "জাননী",
			audit: "অডিট লগ",
			health: "ছিষ্টেম স্বাস্থ্য"
		},
		groups: {
			today: "আজি",
			executive: "নিকাৰী",
			operations: "কাৰ্য্য",
			network: "নেটৱৰ্ক",
			support: "সহায়",
			finance: "অৰ্থ",
			growth: "বৃদ্ধি",
			intelligence: "বুদ্ধিমত্তা",
			system: "ছিষ্টেম"
		},
		auth: {
			signIn: "ছাইন ইন",
			signOut: "ছাইন আউট",
			email: "কৰ্মস্থলৰ ইমেইল",
			password: "পাছৱৰ্ড",
			continueGoogle: "Google ৰে আগবাঢ়ক",
			continueX: "X ৰে আগবাঢ়ক",
			firstUser: "প্ৰথম ছাইন-ইন কৰাজন ছুপাৰ এডমিন হ'ব।",
			pending: "আপোনাৰ এক্সেছ এডমিনৰ আমন্ত্ৰণৰ অপেক্ষাত।",
			enter: "কমাণ্ডত প্ৰৱেশ কৰক"
		},
		common: {
			...en.common,
			search: "কমাণ্ড সন্ধান"
		}
	},
	hi: {
		...en,
		app: {
			name: "रोशई कमांड",
			tagline: "रसोई, पहुँचाई गई।"
		},
		nav: {
			dashboard: "आज",
			ceo: "सीईओ कमांड",
			live: "लाइव नियंत्रण",
			orders: "ऑर्डर",
			dispatch: "डिस्पैच",
			zones: "ज़ोन",
			restaurants: "रेस्तराँ",
			riders: "राइडर",
			customers: "ग्राहक",
			kyc: "केवाईसी",
			support: "सहायता",
			finance: "वित्त",
			settlements: "सेटलमेंट",
			economics: "अर्थशास्त्र",
			promotions: "प्रमोशन",
			loyalty: "लॉयल्टी",
			marketing: "मार्केटिंग",
			cms: "सीएमएस",
			analytics: "विश्लेषण",
			reports: "रिपोर्ट",
			risk: "जोखिम",
			ai: "एआई सहायक",
			employees: "कर्मचारी",
			branding: "ब्रांडिंग",
			flags: "फ़ीचर फ़्लैग",
			settings: "सेटिंग्स",
			notifications: "सूचनाएँ",
			audit: "ऑडिट लॉग",
			health: "सिस्टम स्वास्थ्य"
		},
		groups: {
			today: "आज",
			executive: "कार्यकारी",
			operations: "संचालन",
			network: "नेटवर्क",
			support: "सहायता",
			finance: "वित्त",
			growth: "ग्रोथ",
			intelligence: "इंटेलिजेंस",
			system: "सिस्टम"
		},
		auth: {
			signIn: "साइन इन",
			signOut: "साइन आउट",
			email: "कार्य ईमेल",
			password: "पासवर्ड",
			continueGoogle: "Google से जारी रखें",
			continueX: "X से जारी रखें",
			firstUser: "पहला साइन-इन Super Admin बनेगा।",
			pending: "आपकी पहुँच व्यवस्थापक आमंत्रण की प्रतीक्षा में है।",
			enter: "कमांड में प्रवेश करें"
		},
		common: {
			...en.common,
			search: "कमांड खोजें"
		}
	}
};
function lookup(tree, path) {
	const parts = path.split(".");
	let cur = tree;
	for (const p of parts) {
		if (typeof cur !== "object" || cur === null || !(p in cur)) return void 0;
		cur = cur[p];
	}
	return typeof cur === "string" ? cur : void 0;
}
function t(locale, path) {
	return lookup(DICTIONARIES[locale], path) ?? lookup(en, path) ?? path;
}
var ICONS = {
	layout: LayoutDashboard,
	crown: Crown,
	radio: Radio,
	receipt: Receipt,
	bike: Bike,
	map: Map,
	utensils: Utensils,
	users: Users,
	user: UserRound,
	shield: Shield,
	lifeBuoy: LifeBuoy,
	wallet: Wallet,
	scale: Scale,
	calculator: Calculator,
	percent: Percent,
	gift: Gift,
	megaphone: Megaphone,
	panels: PanelsTopLeft,
	chart: ChartNoAxesColumn,
	file: FileText,
	alert: TriangleAlert,
	spark: Sparkles,
	id: IdCard,
	palette: Palette,
	flag: Flag,
	settings: Settings,
	bell: Bell,
	scroll: ScrollText,
	activity: Activity
};
function CommandShell() {
	const { user, isPending } = useCurrentUserState();
	const [locale, setLocale] = (0, import_react.useState)("en");
	const [navOpen, setNavOpen] = (0, import_react.useState)(false);
	const [cmd, setCmd] = (0, import_react.useState)("");
	const [cmdOpen, setCmdOpen] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const qc = useQueryClient();
	const session = useQuery({
		queryKey: ["session"],
		queryFn: () => bootstrapSession(),
		enabled: Boolean(user)
	});
	const assume = useMutation({
		mutationFn: (role) => {
			const emp = session.data && session.data.ok ? session.data.employee : null;
			if (!emp) throw new Error("No employee session");
			return updateEmployeeFn({ data: {
				id: emp.id,
				assumedRoleKey: role,
				reason: role ? `View as ${role}` : "Exit role preview"
			} });
		},
		onSuccess: (res) => {
			if (res.ok) {
				toast.success("Role view updated");
				qc.invalidateQueries();
			} else toast.error(res.error);
		}
	});
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setCmdOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	if (isPending || user && session.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoshoiMark, { className: "size-10" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl text-fg",
				children: "Roshoi Command"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 w-72 animate-pulse rounded-[24px] bg-surface" })
		]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const payload = session.data && session.data.ok ? session.data : null;
	const employee = payload?.employee;
	if (session.data && !session.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-bg p-6 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md rounded-[24px] border border-border bg-surface p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: "Cannot enter Command"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: session.data.error
			})]
		})
	});
	if (employee && employee.status === "PENDING") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-bg p-6 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md rounded-[24px] border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoshoiMark, { className: "size-10" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-2xl",
					children: "Access pending"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Your account is waiting for an administrator invite. The first person to sign in becomes Super Admin; later employees must be invited."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				})
			]
		})
	});
	const perms = employee?.permissions ?? [];
	const groups = NAV.map((g) => ({
		...g,
		items: g.items.filter((it) => itemAllowed(it, perms) || employee?.actingRoleKey === "SUPER_ADMIN")
	})).filter((g) => g.items.length);
	const brand = payload?.branding;
	const appName = brand?.admin_branding || brand?.app_name || "Roshoi Command";
	const runCommand = () => {
		const intent = parseCommand(cmd);
		const path = intentPath(intent);
		setCmdOpen(false);
		setCmd("");
		const [pathname, qs] = path.split("?");
		const search = Object.fromEntries(new URLSearchParams(qs ?? ""));
		navigate({
			to: pathname || "/app",
			search
		});
	};
	const cssVars = brand ? {
		["--color-bg"]: brand.color_bg,
		["--color-fg"]: brand.color_fg,
		["--color-primary"]: brand.color_primary,
		["--color-primary-fg"]: brand.color_primary_fg,
		["--color-accent"]: brand.color_accent
	} : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		style: cssVars,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#main",
				className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-fg",
				children: "Skip to content"
			}),
			employee?.dataMode === "SIMULATED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sim-banner px-4 py-2 text-center text-xs",
				children: "Simulated / development data — not production marketplace activity. Windows 1–3 are not connected yet."
			}) : null,
			employee?.assumedRoleKey && employee.assumedRoleKey !== employee.roleKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-center gap-3 bg-info/20 px-4 py-2 text-xs",
				children: [
					"Viewing as ",
					ROLE_LABELS[employee.assumedRoleKey] ?? employee.assumedRoleKey,
					". Mutations use this role’s permissions.",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "underline",
						type: "button",
						onClick: () => assume.mutate(null),
						children: "Exit"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-screen",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: cn("fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-border bg-surface p-4 transition-transform md:static md:translate-x-0", navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/app",
							className: "flex items-center gap-2",
							onClick: () => setNavOpen(false),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoshoiMark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-base leading-none",
								children: appName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] uppercase tracking-widest text-muted",
								children: "Command"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "md:hidden",
							type: "button",
							onClick: () => setNavOpen(false),
							"aria-label": "Close menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "space-y-5",
						children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 px-2 text-[10px] uppercase tracking-[0.16em] text-subtle",
							children: t(locale, g.i18n)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-0.5",
							children: g.items.map((item) => {
								const Icon = ICONS[item.icon];
								const active = item.path === "/app" ? pathname === "/app" : pathname.startsWith(item.path);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.path,
									onClick: () => setNavOpen(false),
									className: cn("flex min-h-11 items-center gap-2 rounded-[10px] px-2 text-sm", active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), t(locale, item.i18n)]
								}) }, item.id);
							})
						})] }, g.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/90 px-3 py-2 backdrop-blur md:px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-11 place-items-center md:hidden",
								onClick: () => setNavOpen(true),
								"aria-label": "Open menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setCmdOpen(true),
								className: "flex min-h-11 flex-1 items-center gap-2 rounded-[12px] border border-border bg-elevated px-3 text-left text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, { className: "size-4" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: "Search Command"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto hidden text-xs text-subtle sm:inline",
										children: "⌘K"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Language",
								className: "h-10 rounded-[10px] border border-border bg-elevated px-2 text-xs",
								value: locale,
								onChange: (e) => setLocale(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "en",
										children: "EN"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "bn",
										children: "বাংলা"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "as",
										children: "অসমীয়া"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "hi",
										children: "हिन्दी"
									})
								]
							}),
							employee && (employee.roleKey === "SUPER_ADMIN" || employee.permissions.includes("assume_role")) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								"aria-label": "View as role",
								className: "hidden h-10 max-w-[9rem] rounded-[10px] border border-border bg-elevated px-2 text-xs md:block",
								value: employee.assumedRoleKey ?? employee.roleKey,
								onChange: (e) => assume.mutate(e.target.value === employee.roleKey ? null : e.target.value),
								children: SYSTEM_ROLES.filter((r) => r !== "CUSTOM").map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: r,
									children: ROLE_LABELS[r]
								}, r))
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden items-center gap-2 md:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: employee ? ROLE_LABELS[employee.actingRoleKey] : ""
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: employee?.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "md:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						id: "main",
						className: "flex-1 px-3 py-4 md:px-6 md:py-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
					})]
				})]
			}),
			cmdOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-start bg-bg/70 p-4 pt-[15vh]",
				onClick: () => setCmdOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-lg rounded-[20px] border border-border bg-surface p-4 shadow-2xl",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							runCommand();
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							autoFocus: true,
							value: cmd,
							onChange: (e) => setCmd(e.target.value),
							placeholder: "Find delayed orders today…"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Natural-language search respects your permissions."
					})]
				})
			}) : null
		]
	});
}
function useEmployee() {
	const q = useQuery({
		queryKey: ["session"],
		queryFn: () => bootstrapSession()
	});
	return q.data && q.data.ok ? q.data.employee : null;
}
//#endregion
export { saveSettingsFn as $, loadNotifications as A, loadSettings as B, loadDispatch as C, loadHealth as D, loadFlags as E, loadRestaurant as F, queueNotificationFn as G, loadTicket as H, loadRestaurants as I, saveBrandingFn as J, reviewKycFn as K, loadRider as L, loadOrders as M, loadPromos as N, loadKyc as O, loadReports as P, savePromoFn as Q, loadRiders as R, loadDashboard as S, loadFinance as T, loadTickets as U, loadSettlements as V, loadZones as W, saveCmsFn as X, saveCampaignFn as Y, saveLoyaltyFn as Z, loadCeo as _, actRider as a, useEmployee as at, loadCustomer as b, askAssistant as c, inviteEmployeeFn as d, saveZoneFn as et, itemAllowed as f, loadCampaigns as g, loadBranding as h, actRestaurant as i, updateEmployeeFn as it, loadOrder as j, loadLive as k, defaultEconomicsScenario as l, loadAudit as m, NAV as n, tickSim as nt, actTicket as o, loadAnalytics as p, runEconomics as q, actOnOrder as r, updateCustomerFn as rt, approveSettlementFn as s, CommandShell as t, setFlagFn as tt, exportCsv as u, loadCities as v, loadEmployees as w, loadCustomers as x, loadCms as y, loadRisk as z };
