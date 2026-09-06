import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as cn } from "./mark-QhCHUVHE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-DUqV2re_.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-10 w-full rounded-[10px] border border-border bg-elevated px-3 text-sm text-fg placeholder:text-subtle", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-24 w-full rounded-[12px] border border-border bg-elevated px-3 py-2 text-sm text-fg placeholder:text-subtle", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-muted", className),
		...props
	});
}
//#endregion
export { Label as n, Textarea as r, Input as t };
