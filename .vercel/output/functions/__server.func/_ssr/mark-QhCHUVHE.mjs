import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as authClient } from "./client-CVqXY6bk.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mark-QhCHUVHE.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatInr(paise, fraction = 0) {
	const rupees = paise / 100;
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: fraction,
		minimumFractionDigits: fraction
	}).format(rupees);
}
function formatInrExact(paise) {
	return formatInr(paise, paise % 100 === 0 ? 0 : 2);
}
function formatNumber(n) {
	return new Intl.NumberFormat("en-IN").format(n);
}
function relativeTime(iso, now = Date.now()) {
	if (!iso) return "—";
	const t = new Date(iso).getTime();
	if (Number.isNaN(t)) return "—";
	const diff = Math.round((t - now) / 1e3);
	const abs = Math.abs(diff);
	const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
	if (abs < 60) return rtf.format(diff, "second");
	if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
	if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
	return rtf.format(Math.round(diff / 86400), "day");
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function RoshoiMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			width: "32",
			height: "32",
			rx: "8",
			fill: "currentColor",
			className: "text-primary"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M9 23V9h7.2c3.1 0 5.1 1.7 5.1 4.3 0 2.1-1.2 3.6-3.2 4.2L22.6 23h-3.2l-4.1-5.2H12V23H9zm3-8.2h4c1.6 0 2.6-.8 2.6-2.1S17.6 10.7 16 10.7h-4v4.1z",
			fill: "currentColor",
			className: "text-primary-fg"
		})]
	});
}
//#endregion
export { relativeTime as a, formatNumber as i, cn as n, useCurrentUser as o, formatInrExact as r, useCurrentUserState as s, RoshoiMark as t };
