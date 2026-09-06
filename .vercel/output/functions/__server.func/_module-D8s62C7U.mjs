import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { r as Route$5 } from "./_ssr/router-CPouBxiu.mjs";
import { n as ModuleView } from "./_ssr/pages-SsIS38uC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_module-D8s62C7U.js
var import_jsx_runtime = require_jsx_runtime();
function ModuleScreen() {
	const { module } = Route$5.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleView, { module });
}
//#endregion
export { ModuleScreen as component };
