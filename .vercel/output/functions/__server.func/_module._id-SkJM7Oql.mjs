import { a as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { n as Route$3 } from "./_ssr/router-CPouBxiu.mjs";
import { n as ModuleView } from "./_ssr/pages-SsIS38uC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_module._id-SkJM7Oql.js
var import_jsx_runtime = require_jsx_runtime();
function ModuleDetailScreen() {
	const { module, id } = Route$3.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleView, {
		module,
		id
	});
}
//#endregion
export { ModuleDetailScreen as component };
