//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-Q1Ax951f.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: [
			"/",
			"/app",
			"/login",
			"/api/auth/$",
			"/v1/admin/$",
			"/v1/admin/$resource/$id",
			"/v1/admin/dispatch/reassign"
		],
		preloads: [
			"/assets/index-uesg2yC8.js",
			"/assets/react-SIfiwpqq.js",
			"/assets/preload-helper-D-ufFECY.js",
			"/assets/link-BY3Ztik2.js",
			"/assets/lazyRouteComponent-DruktuIU.js",
			"/assets/useNavigate-DrqvhG58.js"
		],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-uesg2yC8.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-DfKWohli.js",
			"/assets/mark-D9ebdYVY.js",
			"/assets/button-B9HqbMgy.js"
		]
	},
	"/app": {
		filePath: "/workspace/src/routes/app/route.tsx",
		children: ["/app/$module", "/app/"],
		preloads: ["/assets/route-Dx13tcdy.js", "/assets/shell-Cvha6SQx.js"]
	},
	"/login": {
		filePath: "/workspace/src/routes/login.tsx",
		children: void 0,
		preloads: [
			"/assets/login-Byawh7G7.js",
			"/assets/client-DRhaju3Z.js",
			"/assets/mark-D9ebdYVY.js",
			"/assets/button-B9HqbMgy.js",
			"/assets/input-BN1zJC2O.js"
		]
	},
	"/app/$module": {
		filePath: "/workspace/src/routes/app/$module.tsx",
		children: ["/app/$module/$id"],
		preloads: ["/assets/_module-CNMH80o0.js", "/assets/pages-DCCKw5s6.js"]
	},
	"/app/": {
		filePath: "/workspace/src/routes/app/index.tsx",
		children: void 0,
		preloads: ["/assets/app-DLaadmYr.js", "/assets/pages-DCCKw5s6.js"]
	},
	"/app/$module/$id": {
		filePath: "/workspace/src/routes/app/$module.$id.tsx",
		children: void 0,
		preloads: ["/assets/_module._id-DRlojW1b.js"]
	}
} });
//#endregion
export { tsrStartManifest };
