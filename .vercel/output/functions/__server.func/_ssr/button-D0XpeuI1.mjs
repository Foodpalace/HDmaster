import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./mark-QhCHUVHE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-D0XpeuI1.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-opacity duration-150 disabled:opacity-40 disabled:pointer-events-none select-none", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-fg hover:opacity-90",
			secondary: "bg-elevated text-fg border border-border hover:bg-surface",
			ghost: "text-fg hover:bg-elevated",
			danger: "bg-danger text-fg hover:opacity-90",
			outline: "border border-border text-fg hover:bg-elevated"
		},
		size: {
			sm: "h-8 px-3 text-sm rounded-[8px]",
			md: "h-10 px-4 text-sm rounded-[10px]",
			lg: "h-12 px-5 text-base rounded-[12px]",
			icon: "size-10 rounded-[10px]"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
