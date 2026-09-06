import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { S as useSearch, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as ROLE_LABELS, r as PERMISSIONS, s as SYSTEM_ROLES } from "./permissions-CgAuzqYW.mjs";
import { i as FEATURE_FLAG_KEYS, r as DEFAULT_SETTINGS } from "./types-AjEC33cK.mjs";
import { t as ACTIVE_FLOW } from "./state-machine-C0WNCLu9.mjs";
import { t as cityIdFromSlug } from "./search-vodECYHq.mjs";
import { a as relativeTime, i as formatNumber, n as cn, r as formatInrExact } from "./mark-QhCHUVHE.mjs";
import { n as Label, r as Textarea, t as Input } from "./input-DUqV2re_.mjs";
import { $ as saveSettingsFn, A as loadNotifications, B as loadSettings, C as loadDispatch, D as loadHealth, E as loadFlags, F as loadRestaurant, G as queueNotificationFn, H as loadTicket, I as loadRestaurants, J as saveBrandingFn, K as reviewKycFn, L as loadRider, M as loadOrders, N as loadPromos, O as loadKyc, P as loadReports, Q as savePromoFn, R as loadRiders, S as loadDashboard, T as loadFinance, U as loadTickets, V as loadSettlements, W as loadZones, X as saveCmsFn, Y as saveCampaignFn, Z as saveLoyaltyFn, _ as loadCeo, a as actRider, at as useEmployee, b as loadCustomer, c as askAssistant, d as inviteEmployeeFn, et as saveZoneFn, f as itemAllowed, g as loadCampaigns, h as loadBranding, i as actRestaurant, it as updateEmployeeFn, j as loadOrder, k as loadLive, l as defaultEconomicsScenario, m as loadAudit, n as NAV, nt as tickSim, o as actTicket, p as loadAnalytics, q as runEconomics, r as actOnOrder, rt as updateCustomerFn, s as approveSettlementFn, tt as setFlagFn, u as exportCsv, v as loadCities, w as loadEmployees, x as loadCustomers, y as loadCms, z as loadRisk } from "./shell-Xnrr9jX3.mjs";
import { t as Button } from "./button-D0XpeuI1.mjs";
import { a as CartesianGrid, i as Line, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pages-SsIS38uC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tones = {
	default: "bg-elevated text-muted border-border",
	success: "bg-success/15 text-success border-success/30",
	warning: "bg-warning/15 text-warning border-warning/30",
	danger: "bg-danger/15 text-danger border-danger/30",
	info: "bg-info/15 text-info border-info/30",
	primary: "bg-primary text-primary-fg border-transparent"
};
function Badge({ children, tone = "default", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide", tones[tone] ?? tones.default, className),
		children
	});
}
function statusTone(status) {
	const s = status.toUpperCase();
	if ([
		"ACTIVE",
		"ONLINE",
		"DELIVERED",
		"RESOLVED",
		"VERIFIED",
		"PAID",
		"ON"
	].includes(s)) return "success";
	if ([
		"DELAYED",
		"PENDING",
		"WAITING",
		"PAUSED",
		"UNDER_REVIEW",
		"BUSY"
	].includes(s)) return "warning";
	if ([
		"CANCELLED",
		"SUSPENDED",
		"FAILED",
		"CRITICAL",
		"REFUNDED",
		"OFF"
	].includes(s)) return "danger";
	if ([
		"PREPARING",
		"READY",
		"ASSIGNED",
		"IN_PROGRESS"
	].includes(s)) return "info";
	return "default";
}
function MetricCard({ label, value, hint, tone, source }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[20px] border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.14em] text-muted",
					children: label
				}), source ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: source === "SIMULATED" ? "warning" : source === "ESTIMATE" || source === "MODEL" ? "info" : "default",
					children: source
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-2 font-display text-2xl tabular", tone === "danger" && "text-danger", tone === "success" && "text-success", tone === "warning" && "text-warning"),
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function money(paise) {
	if (paise == null) return "—";
	return formatInrExact(paise);
}
function Panel({ title, action, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-[24px] border border-border bg-surface p-4 sm:p-5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: title
			}), action]
		}), children]
	});
}
function DataTable({ columns, rows, onRow }) {
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-8 text-center text-sm text-muted",
		children: "Nothing to show."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[640px] text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-border text-xs uppercase tracking-wider text-muted",
				children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: cn("px-2 py-2 font-medium", c.className),
					children: c.label
				}, c.key))
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				onClick: () => onRow?.(row),
				className: cn("border-b border-border/60", onRow && "cursor-pointer hover:bg-elevated"),
				children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: cn("px-2 py-2.5 align-middle", c.className),
					children: row[c.key]
				}, c.key))
			}, i)) })]
		})
	});
}
function StatusBadge({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: statusTone(value),
		children: value.replaceAll("_", " ")
	});
}
function ConfirmBar({ title, onConfirm, busy }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("");
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "sm",
		variant: "secondary",
		onClick: () => setOpen(true),
		children: title
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 rounded-[16px] border border-border bg-elevated p-3 sm:flex-row sm:items-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 space-y-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason (required)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: reason,
				onChange: (e) => setReason(e.target.value),
				placeholder: "Why this action?"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: () => setOpen(false),
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				disabled: reason.trim().length < 3 || busy,
				onClick: () => onConfirm(reason.trim()),
				children: "Confirm"
			})]
		})]
	});
}
function SearchBox({ value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		value,
		onChange: (e) => onChange(e.target.value),
		placeholder: placeholder ?? "Filter",
		className: "max-w-sm"
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), children]
	});
}
function useInvalidate() {
	const qc = useQueryClient();
	return () => void qc.invalidateQueries();
}
function ModuleView({ module, id }) {
	const emp = useEmployee();
	const item = NAV.flatMap((g) => g.items).find((it) => it.id === module);
	if (item && emp && emp.actingRoleKey !== "SUPER_ADMIN" && !itemAllowed(item, emp.permissions)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: `Missing permission for ${item.id}` });
	if (module === "ceo") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CeoPage, {});
	if (module === "live") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePage, {});
	if (module === "orders") return id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderDetail, { id }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersPage, {});
	if (module === "dispatch") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DispatchPage, {});
	if (module === "zones") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZonesPage, {});
	if (module === "restaurants") return id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantDetail, { id }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantsPage, {});
	if (module === "riders") return id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiderDetail, { id }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RidersPage, {});
	if (module === "customers") return id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerDetail, { id }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomersPage, {});
	if (module === "kyc") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KycPage, {});
	if (module === "support") return id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketDetail, { id }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupportPage, {});
	if (module === "finance") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinancePage, {});
	if (module === "settlements") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettlementsPage, {});
	if (module === "economics") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EconomicsPage, {});
	if (module === "promotions") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromosPage, {});
	if (module === "loyalty") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoyaltyPage, {});
	if (module === "marketing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketingPage, {});
	if (module === "cms") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsPage, {});
	if (module === "analytics") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsPage, {});
	if (module === "reports") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsPage, {});
	if (module === "risk") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPage, {});
	if (module === "ai") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiPage, { mode: "ops" });
	if (module === "employees") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeesPage, {});
	if (module === "branding") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandingPage, {});
	if (module === "flags") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlagsPage, {});
	if (module === "settings") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPage, {});
	if (module === "notifications") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsPage, {});
	if (module === "audit") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuditPage, {});
	if (module === "health") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthPage, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardPage, {});
}
function DashboardPage() {
	const q = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => loadDashboard()
	});
	const tick = useMutation({
		mutationFn: () => tickSim(),
		onSuccess: (r) => {
			if (r.ok) toast.message(`Simulation advanced ${r.advanced} orders`);
			else toast.error(r.error);
		}
	});
	const inv = useInvalidate();
	const data = q.data && q.data.ok ? q.data.data : null;
	const t = data?.today;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-muted",
					children: "Today"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Marketplace pulse"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "What happened. Is it normal. Does it need action."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					onClick: () => {
						q.refetch();
						inv();
					},
					children: "Refresh"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => tick.mutate(),
					disabled: tick.isPending,
					children: "Advance simulation"
				})]
			})]
		}), !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: q.data && !q.data.ok ? q.data.error : "Loading…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Orders",
					value: formatNumber(t.orders.value),
					source: t.orders.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "GMV",
					value: money(t.gmv.value),
					source: t.gmv.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Platform revenue",
					value: t.platformRevenue ? money(t.platformRevenue.value) : "Hidden",
					source: t.platformRevenue?.label,
					hint: t.platformRevenue ? void 0 : "Requires finance permission"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Contribution",
					value: t.contribution ? money(t.contribution.value) : "Hidden",
					source: t.contribution?.label,
					tone: (t.contribution?.value ?? 0) < 0 ? "danger" : "success",
					hint: "Revenue − variable costs (ESTIMATE)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Refunds",
					value: money(t.refunds.value),
					source: t.refunds.label,
					tone: "warning"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Cancellations",
					value: formatNumber(t.cancellations.value),
					source: t.cancellations.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Active restaurants",
					value: formatNumber(t.activeRestaurants.value),
					source: t.activeRestaurants.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Online riders",
					value: formatNumber(t.onlineRiders.value),
					source: t.onlineRiders.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Active deliveries",
					value: formatNumber(t.activeDeliveries.value),
					source: t.activeDeliveries.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Support load",
					value: formatNumber(t.supportLoad.value),
					source: t.supportLoad.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Delayed now",
					value: formatNumber(data.live.delayedOrders),
					tone: "danger",
					source: "SIMULATED"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: "Unassigned",
					value: formatNumber(data.live.unassignedOrders),
					tone: "warning",
					source: "SIMULATED"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Alerts",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: data.alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "flex items-start justify-between gap-3 rounded-[16px] border border-border bg-elevated p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: a.severity }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: a.title
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: a.body
					})] })
				}, a.id))
			})
		})] })]
	});
}
function CeoPage() {
	const q = useQuery({
		queryKey: ["ceo"],
		queryFn: () => loadCeo()
	});
	const data = q.data && q.data.ok ? q.data.data : null;
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading executive brief…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-muted",
				children: "CEO Command"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Business today"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "GMV",
						value: money(data.business.gmv.value),
						source: data.business.gmv.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Orders",
						value: formatNumber(data.business.orders.value),
						source: data.business.orders.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Contribution",
						value: money(data.finance.contribution.total),
						source: "ESTIMATE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Support backlog",
						value: formatNumber(data.supportBacklog),
						source: "SIMULATED"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Daily briefing",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "space-y-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Business"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: data.briefing.business })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Operations"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: data.briefing.operations })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Finance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: data.briefing.finance })] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-sm text-muted",
							children: "Recommended actions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 list-disc space-y-1 pl-5 text-sm",
							children: data.briefing.recommended.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, r))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Weakest estimated contribution",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2 text-sm",
						children: data.worstRestaurants.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app/$module/$id",
								params: {
									module: "restaurants",
									id: r.id
								},
								className: "underline-offset-2 hover:underline",
								children: r.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular text-danger",
								children: money(r.contribution)
							})]
						}, r.id))
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiPage, { mode: "ceo" })
		]
	});
}
function LivePage() {
	const q = useQuery({
		queryKey: ["live"],
		queryFn: () => loadLive(),
		refetchInterval: 12e3
	});
	const data = q.data && q.data.ok ? q.data.data : null;
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const counts = data?.counts ?? {};
	const riders = data?.riders ?? [];
	const lats = riders.map((r) => r.lat).filter((n) => n != null);
	const lngs = riders.map((r) => r.lng).filter((n) => n != null);
	const minLat = lats.length ? Math.min(...lats) - .01 : 24.84;
	const maxLat = lats.length ? Math.max(...lats) + .01 : 24.89;
	const minLng = lngs.length ? Math.min(...lngs) - .01 : 92.33;
	const maxLng = lngs.length ? Math.max(...lngs) + .01 : 92.38;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Live control"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6",
				children: ACTIVE_FLOW.concat(["DELIVERED", "CANCELLED"]).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[16px] border border-border bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-wider text-muted",
						children: s.replaceAll("_", " ")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tabular",
						children: counts[s] ?? 0
					})]
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: data?.trackingEnabled ? "Rider positions (SIMULATED)" : "Live tracking flag is OFF",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative h-64 overflow-hidden rounded-[16px] border border-border bg-elevated",
					children: [riders.filter((r) => r.lat != null && r.lng != null).map((r) => {
						const x = (r.lng - minLng) / (maxLng - minLng) * 100;
						const y = (1 - (r.lat - minLat) / (maxLat - minLat)) * 100;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary",
							style: {
								left: `${x}%`,
								top: `${y}%`
							},
							title: `${r.name} · ${r.status}`
						}, r.id);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "absolute bottom-2 left-3 text-[10px] uppercase tracking-wider text-muted",
						children: "GPS last-fix · SIMULATED · not a street map"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-1 text-xs sm:grid-cols-2",
					children: riders.slice(0, 8).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [r.status, r.lat != null ? ` · ${r.lat.toFixed(3)}, ${r.lng?.toFixed(3)}` : ""]
						})]
					}, r.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTable, {})
		]
	});
}
function OrdersPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Orders"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTable, {})]
	});
}
function OrderTable() {
	const search = useSearch({ strict: false });
	const [q, setQ] = (0, import_react.useState)(search.q ?? "");
	const [delayed, setDelayed] = (0, import_react.useState)(search.delayed === "1");
	const [status, setStatus] = (0, import_react.useState)(search.status ?? "");
	const [city, setCity] = (0, import_react.useState)(search.city ?? "");
	const nav = useNavigate();
	(0, import_react.useEffect)(() => {
		if (search.delayed === "1") setDelayed(true);
		if (search.city) setCity(search.city);
		if (search.status) setStatus(search.status);
		if (search.q) setQ(search.q);
	}, [
		search.delayed,
		search.city,
		search.status,
		search.q
	]);
	const query = useQuery({
		queryKey: [
			"orders",
			q,
			delayed,
			status,
			city,
			search.minutes
		],
		queryFn: () => loadOrders({ data: {
			q: q || void 0,
			delayed: delayed || void 0,
			status: status || void 0,
			cityId: city ? cityIdFromSlug(city) : void 0,
			minutes: search.minutes ? Number(search.minutes) : void 0
		} })
	});
	const rows = query.data && query.data.ok ? query.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Order board",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
					value: q,
					onChange: setQ,
					placeholder: "ID or restaurant"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm",
					value: status,
					onChange: (e) => setStatus(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "All statuses"
					}), ACTIVE_FLOW.concat([
						"DELIVERED",
						"CANCELLED",
						"REFUNDED"
					]).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: s,
						children: s
					}, s))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm",
					value: city,
					onChange: (e) => setCity(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All cities"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "karimganj",
							children: "Karimganj"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "silchar",
							children: "Silchar"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: delayed ? "primary" : "secondary",
					onClick: () => setDelayed(!delayed),
					children: "Delayed"
				})
			]
		}),
		children: query.data && !query.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: query.data.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "id",
					label: "Order"
				},
				{
					key: "restaurant",
					label: "Restaurant"
				},
				{
					key: "status",
					label: "Status"
				},
				{
					key: "pay",
					label: "Pay"
				},
				{
					key: "total",
					label: "Total"
				},
				{
					key: "when",
					label: "Placed"
				}
			],
			rows: rows.map((o) => ({
				_id: o.id,
				id: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-xs",
					children: [
						o.id,
						" ",
						o.delayed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "danger",
							children: "Delayed"
						}) : null
					]
				}),
				restaurant: o.restaurant,
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: o.status }),
				pay: o.payment_method,
				total: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular",
					children: money(o.totalPaise)
				}),
				when: relativeTime(o.placedAt ?? void 0)
			})),
			onRow: (row) => void nav({
				to: "/app/$module/$id",
				params: {
					module: "orders",
					id: String(row._id)
				}
			})
		})
	});
}
function OrderDetail({ id }) {
	const q = useQuery({
		queryKey: ["order", id],
		queryFn: () => loadOrder({ data: id })
	});
	const riders = useQuery({
		queryKey: ["riders"],
		queryFn: () => loadRiders({ data: {} })
	});
	const inv = useInvalidate();
	const act = useMutation({
		mutationFn: (input) => actOnOrder({ data: input }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Recorded");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const o = q.data && q.data.ok ? q.data.data : null;
	if (!o) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading order…"
	});
	const riderList = riders.data && riders.data.ok ? riders.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/app/$module",
				params: { module: "orders" },
				className: "text-sm text-muted",
				children: "← Orders"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs text-muted",
					children: o.id
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: o.restaurantName
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: o.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Customer",
						value: String(o.customerRef)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Total",
						value: money(o.totalPaise),
						source: o.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Promised",
						value: o.promisedAt ? relativeTime(o.promisedAt) : "—",
						tone: o.delayed ? "danger" : "default"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Items",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "text-sm",
					children: o.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							it.qty,
							" × ",
							it.name
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular",
							children: money(it.unitPaise * it.qty)
						})]
					}, i))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Financial breakdown",
				children: [o.commissionPaise == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Finance fields hidden by role."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Food" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular text-right",
							children: money(o.foodPaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Restaurant discount" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular text-right",
							children: money(o.restaurantDiscountPaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Platform discount" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular text-right",
							children: money(o.platformDiscountPaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Delivery" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular text-right",
							children: money(o.deliveryFeePaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Service" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular text-right",
							children: money(o.serviceFeePaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Commission" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular text-right",
							children: money(o.commissionPaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Payment fee" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular text-right",
							children: money(o.paymentFeePaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Rider payout" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular text-right",
							children: money(o.riderPayoutPaise)
						})
					]
				}), o.ledger.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wider text-muted",
						children: "Ledger"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-xs",
						children: o.ledger.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-2 font-mono",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								l.kind,
								" · ",
								l.source,
								" · ",
								l.ruleKey
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(l.amountPaise) })]
						}, i))
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Intervention",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
							title: "Cancel order",
							onConfirm: (reason) => act.mutate({
								orderId: o.id,
								action: "cancel",
								reason
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
							title: "Issue refund",
							onConfirm: (reason) => act.mutate({
								orderId: o.id,
								action: "refund",
								reason,
								amountPaise: o.totalPaise
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Refunds are allowed from DELIVERED / CANCELLED / failed states. Live orders must be cancelled first. Reassign is a request to the dispatcher, applied locally only in simulation."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
							title: "Escalate to support",
							onConfirm: (reason) => act.mutate({
								orderId: o.id,
								action: "escalate",
								reason
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-end gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Reassign rider",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm",
									defaultValue: "",
									onChange: (e) => {
										const riderId = e.target.value;
										if (!riderId) return;
										const reason = window.prompt("Reason for reassignment");
										if (reason && reason.trim().length >= 3) act.mutate({
											orderId: o.id,
											action: "assign_rider",
											riderId,
											reason: reason.trim()
										});
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Select rider"
									}), riderList.filter((r) => r.online).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: r.id,
										children: [
											r.name,
											" · ",
											r.status
										]
									}, r.id))]
								})
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Timeline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-2 text-sm",
					children: o.events.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							e.action,
							" ",
							e.from ? `${e.from} → ${e.to}` : ""
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: relativeTime(e.at ?? void 0)
						})]
					}, i))
				})
			})
		]
	});
}
function RestaurantsPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const nav = useNavigate();
	const query = useQuery({
		queryKey: ["restaurants", q],
		queryFn: () => loadRestaurants({ data: { q } })
	});
	const rows = query.data && query.data.ok ? query.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Restaurants"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
				value: q,
				onChange: setQ
			})]
		}), query.data && !query.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: query.data.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "name",
					label: "Name"
				},
				{
					key: "cuisine",
					label: "Cuisine"
				},
				{
					key: "status",
					label: "Status"
				},
				{
					key: "kyc",
					label: "KYC"
				},
				{
					key: "orders",
					label: "Orders"
				},
				{
					key: "rating",
					label: "Rating"
				}
			],
			rows: rows.map((r) => ({
				_id: r.id,
				name: r.name,
				cuisine: r.cuisine,
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: r.status }),
				kyc: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: r.kycStatus }),
				orders: r.orderCount,
				rating: r.rating.toFixed(1)
			})),
			onRow: (row) => void nav({
				to: "/app/$module/$id",
				params: {
					module: "restaurants",
					id: String(row._id)
				}
			})
		})]
	});
}
function RestaurantDetail({ id }) {
	const q = useQuery({
		queryKey: ["restaurant", id],
		queryFn: () => loadRestaurant({ data: id })
	});
	const inv = useInvalidate();
	const act = useMutation({
		mutationFn: (input) => actRestaurant({ data: {
			id,
			...input
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Updated");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const r = q.data && q.data.ok ? q.data.data : null;
	if (!r) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/app/$module",
				params: { module: "restaurants" },
				className: "text-sm text-muted",
				children: "← Restaurants"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: String(r.name)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: String(r.status) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: String(r.kycStatus) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					String(r.address),
					" · ",
					String(r.phoneMasked)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Orders",
						value: formatNumber(r.performance.orders),
						source: "SIMULATED"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "GMV",
						value: money(r.performance.gmv),
						source: "SIMULATED"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "AOV",
						value: money(r.performance.aov),
						source: "SIMULATED"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Cancel rate",
						value: `${(r.performance.cancellationRate * 100).toFixed(1)}%`,
						source: "SIMULATED"
					})
				]
			}),
			r.contributionEstimate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
				label: "Estimated contribution",
				value: money(r.contributionEstimate.value),
				source: "ESTIMATE"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Menu",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "columns-1 gap-3 text-sm sm:columns-2",
					children: r.menu.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "mb-1 flex justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							m.name,
							" ",
							m.veg ? "· veg" : ""
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular",
							children: money(m.pricePaise)
						})]
					}, m.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
						title: "Approve / activate",
						onConfirm: (reason) => act.mutate({
							status: "ACTIVE",
							reason
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
						title: "Pause",
						onConfirm: (reason) => act.mutate({
							status: "PAUSED",
							reason
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
						title: "Suspend",
						onConfirm: (reason) => act.mutate({
							status: "SUSPENDED",
							reason
						})
					})
				]
			})
		]
	});
}
function RidersPage() {
	const nav = useNavigate();
	const q = useQuery({
		queryKey: ["riders"],
		queryFn: () => loadRiders({ data: {} })
	});
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Riders"
		}), q.data && !q.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "name",
					label: "Name"
				},
				{
					key: "status",
					label: "Status"
				},
				{
					key: "vehicle",
					label: "Vehicle"
				},
				{
					key: "kyc",
					label: "KYC"
				},
				{
					key: "cash",
					label: "Cash"
				}
			],
			rows: rows.map((r) => ({
				_id: r.id,
				name: r.name,
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: r.status }),
				vehicle: r.vehicle,
				kyc: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: r.kycStatus }),
				cash: r.cashCollectedPaise == null ? "—" : money(r.cashCollectedPaise)
			})),
			onRow: (row) => void nav({
				to: "/app/$module/$id",
				params: {
					module: "riders",
					id: String(row._id)
				}
			})
		})]
	});
}
function RiderDetail({ id }) {
	const q = useQuery({
		queryKey: ["rider", id],
		queryFn: () => loadRider({ data: id })
	});
	const inv = useInvalidate();
	const act = useMutation({
		mutationFn: (input) => actRider({ data: {
			id,
			...input
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Updated");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const r = q.data && q.data.ok ? q.data.data : null;
	if (!r) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/app/$module",
				params: { module: "riders" },
				className: "text-sm text-muted",
				children: "← Riders"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: r.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: r.status }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					r.vehicle,
					" · ",
					r.phoneMasked,
					" · rating ",
					r.rating.toFixed(1)
				]
			}),
			r.lat != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"Last operational fix ",
					r.lat.toFixed(3),
					", ",
					r.lng?.toFixed(3),
					" (SIMULATED)"
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Recent deliveries",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "text-sm",
					children: r.deliveries.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app/$module/$id",
							params: {
								module: "orders",
								id: d.id
							},
							className: "font-mono text-xs",
							children: d.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: d.status })]
					}, d.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
					title: "Approve",
					onConfirm: (reason) => act.mutate({
						status: "OFFLINE",
						reason
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
					title: "Suspend",
					onConfirm: (reason) => act.mutate({
						status: "SUSPENDED",
						reason
					})
				})]
			})
		]
	});
}
function CustomersPage() {
	const nav = useNavigate();
	const q = useQuery({
		queryKey: ["customers"],
		queryFn: () => loadCustomers({ data: {} })
	});
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Customers"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Only references required for operations. No full numbers or credentials."
			}),
			q.data && !q.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "ref",
						label: "Ref"
					},
					{
						key: "phone",
						label: "Phone"
					},
					{
						key: "loyalty",
						label: "Loyalty"
					},
					{
						key: "orders",
						label: "Orders"
					},
					{
						key: "risk",
						label: "Risk"
					}
				],
				rows: rows.map((c) => ({
					_id: c.id,
					ref: c.displayRef,
					phone: c.phoneMasked,
					loyalty: c.loyaltyTier,
					orders: c.orderCount,
					risk: c.riskScore
				})),
				onRow: (row) => void nav({
					to: "/app/$module/$id",
					params: {
						module: "customers",
						id: String(row._id)
					}
				})
			})
		]
	});
}
function CustomerDetail({ id }) {
	const q = useQuery({
		queryKey: ["customer", id],
		queryFn: () => loadCustomer({ data: id })
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const c = q.data && q.data.ok ? q.data.data : null;
	if (!c) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: c.displayRef
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					c.phoneMasked,
					" · ",
					c.loyaltyTier,
					" · risk ",
					c.riskScore
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Orders",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "text-sm",
					children: c.orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app/$module/$id",
							params: {
								module: "orders",
								id: o.id
							},
							children: o.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							o.status,
							" · ",
							money(o.totalPaise ?? 0)
						] })]
					}, o.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
				title: "Edit customer status",
				onConfirm: (reason) => updateCustomerFn({ data: {
					id: c.id,
					status: c.status === "ACTIVE" ? "FLAGGED" : "ACTIVE",
					reason
				} }).then((r) => {
					if (r.ok) toast.success("Updated");
					else toast.error(r.error);
				})
			})
		]
	});
}
function DispatchPage() {
	const q = useQuery({
		queryKey: ["dispatch"],
		queryFn: () => loadDispatch(),
		refetchInterval: 1e4
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const d = q.data && q.data.ok ? q.data.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Dispatch monitor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: d?.note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Unassigned",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2 text-sm",
							children: d?.unassigned.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app/$module/$id",
									params: {
										module: "orders",
										id: o.id
									},
									children: o.id
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: o.restaurant })]
							}, o.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Available riders",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2 text-sm",
							children: d?.available.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								r.name,
								" · ",
								r.zoneId
							] }, r.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Busy riders",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2 text-sm",
							children: d?.busy.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								r.name,
								" · ",
								r.activeOrderId ?? "—"
							] }, r.id))
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Reassignment requests (to core matcher)",
				children: (d?.requests?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No dispatch requests yet. Reassign from an order — this never runs a second matcher."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-sm",
					children: d?.requests.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-xs",
							children: [
								r.orderId,
								" → ",
								r.riderId ?? "any"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								r.status,
								" · ",
								r.reason
							]
						})]
					}, r.id))
				})
			})
		]
	});
}
function ZonesPage() {
	const q = useQuery({
		queryKey: ["zones"],
		queryFn: () => loadZones()
	});
	const inv = useInvalidate();
	const [name, setName] = (0, import_react.useState)("");
	const [cityId, setCityId] = (0, import_react.useState)("");
	const [fee, setFee] = (0, import_react.useState)(3e3);
	const [radius, setRadius] = (0, import_react.useState)(5);
	const save = useMutation({
		mutationFn: () => saveZoneFn({ data: {
			name,
			cityId,
			deliveryFeePaise: fee,
			minOrderPaise: 1e4,
			maxRadiusKm: radius,
			etaMinutes: 35
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Zone saved");
				inv();
				setName("");
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const data = q.data && q.data.ok ? q.data.data : null;
	const defaultCity = data?.cities[0]?.id ?? "";
	const selectedCity = cityId || defaultCity;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Delivery zones"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Boundaries are configurable. Karimganj is not hard-coded into business logic."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "name",
						label: "Zone"
					},
					{
						key: "city",
						label: "City"
					},
					{
						key: "fee",
						label: "Fee"
					},
					{
						key: "min",
						label: "Min order"
					},
					{
						key: "eta",
						label: "ETA"
					},
					{
						key: "r",
						label: "Radius"
					}
				],
				rows: (data?.zones ?? []).map((z) => ({
					name: z.name,
					city: z.cityName,
					fee: money(z.deliveryFeePaise),
					min: money(z.minOrderPaise),
					eta: `${z.etaMinutes} min`,
					r: `${z.maxRadiusKm} km`
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Coverage (radius model)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-3",
					children: (data?.zones ?? []).map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid size-28 place-items-center rounded-full border border-border bg-elevated text-center text-[10px] leading-tight",
						children: [z.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-muted",
							children: [z.maxRadiusKm, " km"]
						})]
					}, z.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Add zone",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Zone name",
							value: name,
							onChange: (e) => setName(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-10 rounded-[10px] border border-border bg-elevated px-2",
							value: selectedCity,
							onChange: (e) => setCityId(e.target.value),
							children: (data?.cities ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c.id,
								children: c.name
							}, c.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: fee,
							onChange: (e) => setFee(Number(e.target.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: radius,
							onChange: (e) => setRadius(Number(e.target.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !name,
							onClick: () => save.mutate(),
							children: "Create"
						})
					]
				})
			})
		]
	});
}
function SupportPage() {
	const [queue, setQueue] = (0, import_react.useState)("");
	const nav = useNavigate();
	const q = useQuery({
		queryKey: ["tickets", queue],
		queryFn: () => loadTickets({ data: { queue: queue || void 0 } })
	});
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Support center"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: [
					"",
					"customer",
					"restaurant",
					"rider"
				].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: queue === k ? "primary" : "secondary",
					onClick: () => setQueue(k),
					children: k || "All"
				}, k || "all"))
			})]
		}), q.data && !q.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "id",
					label: "Ticket"
				},
				{
					key: "queue",
					label: "Queue"
				},
				{
					key: "subject",
					label: "Subject"
				},
				{
					key: "status",
					label: "Status"
				},
				{
					key: "priority",
					label: "Priority"
				}
			],
			rows: rows.map((t) => ({
				_id: t.id,
				id: t.id,
				queue: t.queue,
				subject: t.subject,
				status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: t.status }),
				priority: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: t.priority })
			})),
			onRow: (row) => void nav({
				to: "/app/$module/$id",
				params: {
					module: "support",
					id: String(row._id)
				}
			})
		})]
	});
}
function TicketDetail({ id }) {
	const q = useQuery({
		queryKey: ["ticket", id],
		queryFn: () => loadTicket({ data: id })
	});
	const [body, setBody] = (0, import_react.useState)("");
	const inv = useInvalidate();
	const act = useMutation({
		mutationFn: (input) => actTicket({ data: input }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Updated");
				setBody("");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const t = q.data && q.data.ok ? q.data.data : null;
	if (!t) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: String(t.subject)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: String(t.status) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: String(t.queue) }),
					t.slaBreached ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "danger",
						children: "SLA breached"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: "info",
						children: [
							"SLA ",
							String(t.slaMinutes),
							"m"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Thread",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3",
						children: t.messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-[16px] border border-border bg-elevated p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									m.authorType,
									" · ",
									m.visibility === "internal" ? "internal note" : "visible"
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: relativeTime(m.at ?? void 0) })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1",
								children: m.body
							})]
						}, m.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						className: "mt-3",
						value: body,
						onChange: (e) => setBody(e.target.value),
						placeholder: "Reply or internal note"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => act.mutate({
									id,
									action: "reply",
									body
								}),
								children: "Public reply"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => act.mutate({
									id,
									action: "note",
									body
								}),
								children: "Internal note"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => act.mutate({
									id,
									action: "assign"
								}),
								children: "Assign to me"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => act.mutate({
									id,
									action: "resolve",
									resolutionCode: body || "resolved"
								}),
								children: "Resolve"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => act.mutate({
									id,
									action: "reopen"
								}),
								children: "Reopen"
							})
						]
					})
				]
			})
		]
	});
}
function FinancePage() {
	const q = useQuery({
		queryKey: ["finance"],
		queryFn: () => loadFinance()
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const d = q.data && q.data.ok ? q.data.data : null;
	if (!d) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading…"
	});
	const s = d.summary;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Finance command"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Contribution = legitimate platform revenue − variable platform costs. Labelled ESTIMATE when derived."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Commissions",
						value: money(s.revenue.commissions),
						source: s.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Delivery revenue",
						value: money(s.revenue.delivery),
						source: s.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Service fees",
						value: money(s.revenue.serviceFees),
						source: s.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Rider payouts",
						value: money(s.costs.riderPayouts),
						source: s.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Refunds",
						value: money(s.costs.refunds),
						source: s.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
						label: "Contribution",
						value: money(s.contribution.total),
						source: "ESTIMATE"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Restaurant contribution (ESTIMATE)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					columns: [
						{
							key: "name",
							label: "Restaurant"
						},
						{
							key: "orders",
							label: "Orders"
						},
						{
							key: "gmv",
							label: "GMV"
						},
						{
							key: "c",
							label: "Contribution"
						}
					],
					rows: d.profitability.restaurants.slice(0, 20).map((r) => ({
						name: r.name,
						orders: r.orders,
						gmv: money(r.gmv),
						c: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: r.contribution < 0 ? "text-danger" : "",
							children: money(r.contribution)
						})
					}))
				})
			})
		]
	});
}
function SettlementsPage() {
	const [party, setParty] = (0, import_react.useState)("RESTAURANT");
	const q = useQuery({
		queryKey: ["settlements", party],
		queryFn: () => loadSettlements({ data: { party } })
	});
	const inv = useInvalidate();
	const act = useMutation({
		mutationFn: (input) => approveSettlementFn({ data: input }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.message(r.note);
				inv();
			} else toast.error(r.error);
		}
	});
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Settlements"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: party === "RESTAURANT" ? "primary" : "secondary",
						onClick: () => setParty("RESTAURANT"),
						children: "Restaurants"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: party === "RIDER" ? "primary" : "secondary",
						onClick: () => setParty("RIDER"),
						children: "Riders"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Visibility and approval only. Actual payout execution belongs to a licensed payment integration."
			}),
			q.data && !q.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "name",
						label: "Party"
					},
					{
						key: "orders",
						label: "Orders"
					},
					{
						key: "payable",
						label: "Payable"
					},
					{
						key: "status",
						label: "Status"
					},
					{
						key: "act",
						label: "Action"
					}
				],
				rows: rows.map((r) => ({
					name: r.name,
					orders: r.orders,
					payable: money(r.payablePaise),
					status: r.status,
					act: r.status === "READY" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							const reason = window.prompt("Approval reason");
							if (reason && reason.trim().length >= 3) act.mutate({
								id: r.id,
								decision: "APPROVED",
								reason: reason.trim()
							});
						},
						children: "Approve"
					}) : "—"
				}))
			})
		]
	});
}
function EconomicsPage() {
	const base = (0, import_react.useMemo)(() => defaultEconomicsScenario(), []);
	const [bps, setBps] = (0, import_react.useState)(1e3);
	const q = useQuery({
		queryKey: ["econ", bps],
		queryFn: () => runEconomics({ data: {
			shockBps: bps,
			scenarios: [
				{
					...base,
					name: "Scenario A · 10%"
				},
				{
					...base,
					name: "Scenario B · custom",
					commissionBps: bps
				},
				{
					...base,
					name: "Scenario C · 8%",
					commissionBps: 800,
					ordersPerDay: 110
				}
			]
		} })
	});
	const data = q.data && q.data.ok ? q.data.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Economics & profit simulator"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "All outputs are MODEL / ESTIMATE. 10% commission is not assumed profitable."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: [
							"Commission ",
							bps / 100,
							"%"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1500,
						step: 100,
						value: bps,
						onChange: (e) => setBps(Number(e.target.value))
					}),
					[
						0,
						500,
						800,
						1e3,
						1200
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: bps === n ? "primary" : "secondary",
						onClick: () => setBps(n),
						children: [n / 100, "%"]
					}, n))
				]
			}),
			q.data && !q.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-3",
				children: data?.results.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: s.name,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "space-y-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Revenue / order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular",
									children: money(s.revenuePerOrderPaise)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Variable / order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular",
									children: money(s.variableCostPerOrderPaise)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contribution / order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular",
									children: money(s.contributionPerOrderPaise)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Break-even orders/day" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular",
									children: s.breakEvenOrdersPerDay ?? "—"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "info",
						className: "mt-3",
						children: s.label
					})]
				}, s.name))
			}),
			data?.shock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm",
				children: [
					"If commission moves to ",
					bps / 100,
					"%, estimated daily contribution changes by ",
					money(data.shock.contributionDeltaPaise),
					" (",
					data.shock.label,
					")."
				]
			}) : null
		]
	});
}
function PromosPage() {
	const q = useQuery({
		queryKey: ["promos"],
		queryFn: () => loadPromos()
	});
	const inv = useInvalidate();
	const [name, setName] = (0, import_react.useState)("New lunch offer");
	const [firstOnly, setFirstOnly] = (0, import_react.useState)(true);
	const [cap, setCap] = (0, import_react.useState)(200);
	const [status, setStatus] = (0, import_react.useState)("DRAFT");
	const [category, setCategory] = (0, import_react.useState)("lunch");
	const save = useMutation({
		mutationFn: () => savePromoFn({ data: {
			name,
			kind: "PERCENT",
			funding: "PLATFORM",
			percentBps: 1e3,
			minOrderPaise: 2e4,
			maxDiscountPaise: 8e3,
			capCount: cap,
			firstOrderOnly: firstOnly,
			status,
			category
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.message(`Estimated cost ${formatInrExact(r.estimatedCostPaise)}`);
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const d = q.data && q.data.ok ? q.data.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Promotions"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Unlimited ACTIVE discounts are blocked. Cost figures are ESTIMATE. Target first-order, category, and cap before going live."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "name",
						label: "Name"
					},
					{
						key: "funding",
						label: "Funding"
					},
					{
						key: "target",
						label: "Target"
					},
					{
						key: "status",
						label: "Status"
					},
					{
						key: "est",
						label: "Est. cost"
					},
					{
						key: "cap",
						label: "Cap"
					}
				],
				rows: (d?.promotions ?? []).map((p) => ({
					name: p.name,
					funding: p.funding,
					target: [
						p.firstOrderOnly ? "first order" : null,
						p.category,
						p.zoneId
					].filter(Boolean).join(" · ") || "all",
					status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: p.status }),
					est: money(p.estimatedCostPaise),
					cap: p.capCount ?? "none"
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Create (always capped)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Category",
							value: category,
							onChange: (e) => setCategory(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cap,
							onChange: (e) => setCap(Number(e.target.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm",
							value: status,
							onChange: (e) => setStatus(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "DRAFT",
								children: "Draft"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ACTIVE",
								children: "Active"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: firstOnly ? "primary" : "secondary",
							onClick: () => setFirstOnly(!firstOnly),
							children: ["First order ", firstOnly ? "ON" : "OFF"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => save.mutate(),
							children: "Save"
						})
					]
				})
			})
		]
	});
}
function LoyaltyPage() {
	const q = useQuery({
		queryKey: ["promos"],
		queryFn: () => loadPromos()
	});
	const inv = useInvalidate();
	const [name, setName] = (0, import_react.useState)("Roshoi Points");
	const [earn, setEarn] = (0, import_react.useState)(200);
	const [cap, setCap] = (0, import_react.useState)(2e4);
	const save = useMutation({
		mutationFn: () => saveLoyaltyFn({ data: {
			name,
			kind: "points",
			earnBps: earn,
			capPaise: cap,
			status: "ACTIVE",
			abuseCapPerDay: 3
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Loyalty saved");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const d = q.data && q.data.ok ? q.data.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Loyalty"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Earn rate, rupee cap, and abuse cap. Feature flag ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "loyalty" }),
					" must be ON."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "name",
						label: "Program"
					},
					{
						key: "kind",
						label: "Kind"
					},
					{
						key: "earn",
						label: "Earn bps"
					},
					{
						key: "cap",
						label: "Cap"
					},
					{
						key: "status",
						label: "Status"
					}
				],
				rows: (d?.loyalty ?? []).map((l) => ({
					name: l.name,
					kind: l.kind,
					earn: l.earnBps,
					cap: l.capPaise ? money(l.capPaise) : "none",
					status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: l.status })
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Edit program",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: earn,
							onChange: (e) => setEarn(Number(e.target.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cap,
							onChange: (e) => setCap(Number(e.target.value))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-3",
					onClick: () => save.mutate(),
					children: "Save (capped)"
				})]
			})
		]
	});
}
function MarketingPage() {
	const q = useQuery({
		queryKey: ["campaigns"],
		queryFn: () => loadCampaigns()
	});
	const inv = useInvalidate();
	const [name, setName] = (0, import_react.useState)("City push");
	const save = useMutation({
		mutationFn: () => saveCampaignFn({ data: {
			name,
			channel: "push",
			audience: "customers",
			budgetPaise: 5e4,
			status: "DRAFT",
			notes: "ESTIMATE"
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.message(`Budget ${formatInrExact(r.estimatedCostPaise)} (ESTIMATE)`);
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Marketing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Campaigns are a distinct surface from CMS slots. Spend is ESTIMATE until an ad network is connected."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "name",
						label: "Campaign"
					},
					{
						key: "channel",
						label: "Channel"
					},
					{
						key: "audience",
						label: "Audience"
					},
					{
						key: "budget",
						label: "Budget"
					},
					{
						key: "status",
						label: "Status"
					}
				],
				rows: rows.map((c) => ({
					name: c.name,
					channel: c.channel,
					audience: c.audience,
					budget: money(c.budgetPaise),
					status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: c.status })
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => save.mutate(),
					children: "Save draft"
				})]
			})
		]
	});
}
function CmsPage() {
	const q = useQuery({
		queryKey: ["cms"],
		queryFn: () => loadCms()
	});
	const inv = useInvalidate();
	const [title, setTitle] = (0, import_react.useState)("");
	const [surface, setSurface] = (0, import_react.useState)("customer");
	const [sponsored, setSponsored] = (0, import_react.useState)(false);
	const save = useMutation({
		mutationFn: () => saveCmsFn({ data: {
			surface,
			slot: "banner",
			title,
			body: title,
			sponsored
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Published");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "CMS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Customer, restaurant, rider, and admin surfaces. Sponsored slots are labelled and require the advertising flag."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "surface",
						label: "Surface"
					},
					{
						key: "slot",
						label: "Slot"
					},
					{
						key: "title",
						label: "Title"
					},
					{
						key: "ad",
						label: "Sponsored"
					}
				],
				rows: rows.map((c) => ({
					surface: c.surface,
					slot: c.slot,
					title: c.title,
					ad: c.sponsored ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "warning",
						children: "Sponsored"
					}) : "—"
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: title,
						onChange: (e) => setTitle(e.target.value),
						placeholder: "New banner title"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm",
						value: surface,
						onChange: (e) => setSurface(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "customer",
								children: "Customer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "restaurant",
								children: "Restaurant"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "rider",
								children: "Rider"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "admin",
								children: "Admin"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: sponsored ? "primary" : "secondary",
						onClick: () => setSponsored(!sponsored),
						children: ["Sponsored ", sponsored ? "ON" : "OFF"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !title,
						onClick: () => save.mutate(),
						children: "Publish"
					})
				]
			})
		]
	});
}
function AnalyticsPage() {
	const q = useQuery({
		queryKey: ["analytics"],
		queryFn: () => loadAnalytics()
	});
	const exp = useMutation({
		mutationFn: (kind) => exportCsv({ data: { kind } }),
		onSuccess: (r) => {
			if (!r.ok) return toast.error(r.error);
			const blob = new Blob([r.csv], { type: "text/csv" });
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = r.filename;
			a.click();
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const d = q.data && q.data.ok ? q.data.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Analytics"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Aggregated from source orders. Grain: ",
					d?.grain,
					". Label: ",
					d?.label,
					"."
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					"orders",
					"restaurants",
					"riders",
					"finance"
				].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => exp.mutate(k),
					children: ["Export ", k]
				}, k))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-72 rounded-[24px] border border-border bg-surface p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
					data: d?.series ?? [],
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, { stroke: "#2a2c2a" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "day",
							stroke: "#8c8a82",
							fontSize: 11
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							stroke: "#8c8a82",
							fontSize: 11
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
							background: "#141614",
							border: "1px solid #2a2c2a"
						} }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							type: "monotone",
							dataKey: "orders",
							stroke: "#e8e4dc",
							strokeWidth: 2,
							dot: false
						})
					]
				})
			})
		})]
	});
}
function ReportsPage() {
	const q = useQuery({
		queryKey: ["reports"],
		queryFn: () => loadReports()
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const d = q.data && q.data.ok ? q.data.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Reports"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"City and status breakdowns. Grain ",
					d?.grain,
					". Label ",
					d?.label,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "By city",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						columns: [
							{
								key: "name",
								label: "City"
							},
							{
								key: "orders",
								label: "Orders"
							},
							{
								key: "gmv",
								label: "GMV"
							}
						],
						rows: (d?.byCity ?? []).map((c) => ({
							name: c.name,
							orders: c.orders,
							gmv: money(c.gmv)
						}))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "By status",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						columns: [{
							key: "status",
							label: "Status"
						}, {
							key: "orders",
							label: "Orders"
						}],
						rows: (d?.byStatus ?? []).map((c) => ({
							status: c.status,
							orders: c.orders
						}))
					})
				})]
			})
		]
	});
}
function RiskPage() {
	const q = useQuery({
		queryKey: ["risk"],
		queryFn: () => loadRisk()
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Fraud / risk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Signals only. Do not auto-punish because a score exists."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "subject",
						label: "Subject"
					},
					{
						key: "signal",
						label: "Signal"
					},
					{
						key: "score",
						label: "Score"
					},
					{
						key: "summary",
						label: "Summary"
					}
				],
				rows: rows.map((r) => ({
					subject: `${r.subjectType} ${r.subjectId}`,
					signal: r.signalKey,
					score: r.score,
					summary: r.summary
				}))
			})
		]
	});
}
function KycPage() {
	const q = useQuery({
		queryKey: ["kyc"],
		queryFn: () => loadKyc()
	});
	const inv = useInvalidate();
	const act = useMutation({
		mutationFn: (input) => reviewKycFn({ data: input }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Recorded");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "KYC operations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Window 4 never claims identity is verified by a third party unless a real verifier is connected. Documents are not publicly accessible."
			}),
			rows.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[20px] border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: [
								k.subjectType,
								" · ",
								k.subjectId
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: k.status })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: k.notes
					}),
					k.documentRefs?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 text-xs text-muted",
						children: k.documentRefs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Vault ref ",
							d.ref,
							" · ",
							d.label,
							" (not publicly accessible)"
						] }, d.ref))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "No documents in vault."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
								title: "Mark under review",
								onConfirm: (notes) => act.mutate({
									id: k.id,
									status: "UNDER_REVIEW",
									notes
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
								title: "Record operator review",
								onConfirm: (notes) => act.mutate({
									id: k.id,
									status: "VERIFIED",
									notes
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
								title: "Reject",
								onConfirm: (notes) => act.mutate({
									id: k.id,
									status: "REJECTED",
									notes
								})
							})
						]
					})
				]
			}, k.id))
		]
	});
}
function AiPage({ mode }) {
	const [q, setQ] = (0, import_react.useState)(mode === "ceo" ? "How is the business today?" : "Summarize today’s operations.");
	const [log, setLog] = (0, import_react.useState)([]);
	const ask = useMutation({
		mutationFn: () => askAssistant({ data: {
			question: q,
			mode
		} }),
		onSuccess: (r) => {
			if (r.ok) setLog((l) => [...l, {
				q,
				a: r.text
			}]);
			else toast.error(r.error);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: mode === "ceo" ? "CEO assistant" : "Operations assistant",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted",
				children: "Uses authorized tools only. High-risk actions are recommendations, not executions."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: log.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[16px] border border-border bg-elevated p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: m.q
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 whitespace-pre-wrap",
						children: m.a
					})]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => ask.mutate(),
					disabled: ask.isPending || !q.trim(),
					children: "Ask"
				})]
			})
		]
	});
}
function EmployeesPage() {
	const emp = useEmployee();
	const q = useQuery({
		queryKey: ["employees"],
		queryFn: () => loadEmployees()
	});
	const cities = useQuery({
		queryKey: ["cities"],
		queryFn: () => loadCities()
	});
	const inv = useInvalidate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("CUSTOMER_SUPPORT");
	const [cityId, setCityId] = (0, import_react.useState)("");
	const [custom, setCustom] = (0, import_react.useState)([]);
	const invite = useMutation({
		mutationFn: () => inviteEmployeeFn({ data: {
			email,
			name,
			roleKey: role,
			department: "Operations",
			cityId: cityId || null,
			customPermissions: role === "CUSTOM" ? custom : void 0
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Invited");
				inv();
			} else toast.error(r.error);
		}
	});
	const update = useMutation({
		mutationFn: (input) => updateEmployeeFn({ data: input }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Updated");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const rows = q.data && q.data.ok ? q.data.data : [];
	const cityRows = cities.data && cities.data.ok ? cities.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Employees"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "name",
						label: "Name"
					},
					{
						key: "email",
						label: "Email"
					},
					{
						key: "role",
						label: "Role"
					},
					{
						key: "city",
						label: "City"
					},
					{
						key: "mfa",
						label: "MFA"
					},
					{
						key: "status",
						label: "Status"
					},
					{
						key: "act",
						label: "Lifecycle"
					}
				],
				rows: rows.map((e) => ({
					name: e.name,
					email: e.email,
					role: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-9 max-w-[10rem] rounded-[8px] border border-border bg-elevated px-1 text-xs",
						defaultValue: e.roleKey,
						onChange: (ev) => {
							const reason = window.prompt("Reason to change role");
							if (reason && reason.trim().length >= 3) update.mutate({
								id: e.id,
								roleKey: ev.target.value,
								reason: reason.trim()
							});
						},
						children: SYSTEM_ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: r,
							children: ROLE_LABELS[r] ?? r
						}, r))
					}),
					city: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-9 max-w-[9rem] rounded-[8px] border border-border bg-elevated px-1 text-xs",
						defaultValue: e.cityId ?? "",
						onChange: (ev) => {
							const reason = window.prompt("Reason to change city scope");
							if (reason && reason.trim().length >= 3) update.mutate({
								id: e.id,
								cityId: ev.target.value || null,
								reason: reason.trim()
							});
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All cities"
						}), cityRows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))]
					}),
					mfa: e.mfaReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "success",
						children: "enrolled"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "not enrolled" }),
					status: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: e.status }),
					act: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1",
						children: [e.status === "ACTIVE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								const reason = window.prompt("Reason to disable");
								if (reason && reason.trim().length >= 3) update.mutate({
									id: e.id,
									status: "DISABLED",
									reason: reason.trim()
								});
							},
							children: "Disable"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								const reason = window.prompt("Reason to activate");
								if (reason && reason.trim().length >= 3) update.mutate({
									id: e.id,
									status: "ACTIVE",
									reason: reason.trim()
								});
							},
							children: "Activate"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								const reason = window.prompt(e.mfaReady ? "Reason to clear MFA" : "Reason to mark MFA enrolled (operator record, not a third-party authenticator)");
								if (reason && reason.trim().length >= 3) update.mutate({
									id: e.id,
									mfaReady: !e.mfaReady,
									reason: reason.trim()
								});
							},
							children: e.mfaReady ? "Clear MFA" : "Mark MFA"
						})]
					})
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Invite employee",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Name",
								value: name,
								onChange: (e) => setName(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Email",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-10 rounded-[10px] border border-border bg-elevated px-2",
								value: role,
								onChange: (e) => setRole(e.target.value),
								children: SYSTEM_ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: r,
									children: ROLE_LABELS[r] ?? r
								}, r))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "h-10 rounded-[10px] border border-border bg-elevated px-2",
								value: cityId,
								onChange: (e) => setCityId(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All cities"
								}), cityRows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))]
							})
						]
					}),
					role === "CUSTOM" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-1",
						children: PERMISSIONS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `rounded-full border px-2 py-1 text-[10px] ${custom.includes(p) ? "border-primary bg-elevated" : "border-border text-muted"}`,
							onClick: () => setCustom((c) => c.includes(p) ? c.filter((x) => x !== p) : [...c, p]),
							children: p
						}, p))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						disabled: !email || !name,
						onClick: () => invite.mutate(),
						children: "Send invite"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [
							"They sign in with the same email. You are ",
							emp?.email,
							". ",
							PERMISSIONS.length,
							" permissions in catalog. MFA is an operator record until an authenticator is connected."
						]
					})
				]
			})
		]
	});
}
function BrandingPage() {
	const q = useQuery({
		queryKey: ["branding"],
		queryFn: () => loadBranding()
	});
	const inv = useInvalidate();
	const [patch, setPatch] = (0, import_react.useState)({});
	const save = useMutation({
		mutationFn: () => saveBrandingFn({ data: {
			patch,
			reason: "Update central branding"
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Branding saved");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const b = q.data && q.data.ok ? q.data.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Central branding"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Change identity without rebuilding business logic."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					["app_name", "App name"],
					["tagline", "Tagline"],
					["admin_branding", "Admin branding"],
					["customer_branding", "Customer branding"],
					["restaurant_branding", "Restaurant branding"],
					["rider_branding", "Rider branding"],
					["legal_company_name", "Legal company name"],
					["notification_sender", "Notification sender"],
					["invoice_branding", "Invoice branding"],
					["support_email", "Support email"],
					["support_phone", "Support phone"],
					["domain", "Domain"],
					["app_store_name", "App store name"],
					["color_bg", "Color bg"],
					["color_primary", "Color primary"],
					["logo_svg", "Logo SVG"],
					["favicon_svg", "Favicon SVG"]
				].map(([k, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						defaultValue: b?.[k] ?? "",
						onChange: (e) => setPatch((p) => ({
							...p,
							[k]: e.target.value
						}))
					})
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => save.mutate(),
				disabled: !Object.keys(patch).length,
				children: "Save branding"
			})
		]
	});
}
function FlagsPage() {
	const q = useQuery({
		queryKey: ["flags"],
		queryFn: () => loadFlags()
	});
	const inv = useInvalidate();
	const act = useMutation({
		mutationFn: (input) => setFlagFn({ data: {
			...input,
			reason: `Toggle ${input.key}`
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Flag updated");
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const rows = q.data && q.data.ok ? q.data.data : [];
	const keys = Array.from(/* @__PURE__ */ new Set([...FEATURE_FLAG_KEYS, ...rows.map((r) => r.key)]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "Feature flags"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border rounded-[24px] border border-border bg-surface",
			children: keys.map((key) => {
				const row = rows.find((r) => r.key === key);
				const on = row?.state === "ON";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-sm",
						children: key
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: row?.notes ?? "Central flag"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: on ? "primary" : "secondary",
						onClick: () => act.mutate({
							key,
							state: on ? "OFF" : "ON",
							rolloutPct: on ? 0 : 100
						}),
						children: on ? "ON" : "OFF"
					})]
				}, key);
			})
		})]
	});
}
function SettingsPage() {
	const q = useQuery({
		queryKey: ["settings"],
		queryFn: () => loadSettings()
	});
	const [s, setS] = (0, import_react.useState)(null);
	const inv = useInvalidate();
	const save = useMutation({
		mutationFn: () => saveSettingsFn({ data: {
			settings: s ?? DEFAULT_SETTINGS,
			reason: "Update platform settings"
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.success("Saved");
				inv();
			} else toast.error(r.error);
		}
	});
	const data = q.data && q.data.ok ? q.data.data : null;
	const cur = s ?? data;
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	if (!cur) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading…"
	});
	const set = (k, v) => setS({
		...cur,
		[k]: v
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "System settings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Commission (bps)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.commissionBps,
							onChange: (e) => set("commissionBps", Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Payment fee (bps)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.paymentFeeBps,
							onChange: (e) => set("paymentFeeBps", Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Service fee (paise)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.serviceFeePaise,
							onChange: (e) => set("serviceFeePaise", Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Rider base (paise)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.riderBasePaise,
							onChange: (e) => set("riderBasePaise", Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Refund limit (paise)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.refundLimitPaise,
							onChange: (e) => set("refundLimitPaise", Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Support SLA (minutes)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.supportSlaMinutes,
							onChange: (e) => set("supportSlaMinutes", Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Offer timeout (seconds)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.offerTimeoutSeconds,
							onChange: (e) => set("offerTimeoutSeconds", Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Cancellation window (minutes)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.cancellationWindowMinutes,
							onChange: (e) => set("cancellationWindowMinutes", Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Rider distance (paise)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cur.riderDistancePaise,
							onChange: (e) => set("riderDistancePaise", Number(e.target.value))
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: cur.otpRequired ? "primary" : "secondary",
					onClick: () => set("otpRequired", !cur.otpRequired),
					children: ["OTP ", cur.otpRequired ? "ON" : "OFF"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: cur.codEnabled ? "primary" : "secondary",
					onClick: () => set("codEnabled", !cur.codEnabled),
					children: ["COD ", cur.codEnabled ? "ON" : "OFF"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"Commission, fees, and rider pay require ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "modify_financial_settings" }),
					". CEO cannot change them."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => save.mutate(),
				children: "Save high-risk settings"
			})
		]
	});
}
function NotificationsPage() {
	const q = useQuery({
		queryKey: ["notifications"],
		queryFn: () => loadNotifications()
	});
	const inv = useInvalidate();
	const [channel, setChannel] = (0, import_react.useState)("push");
	const queue = useMutation({
		mutationFn: () => queueNotificationFn({ data: {
			channel,
			templateKey: "ops_broadcast",
			audience: "customers"
		} }),
		onSuccess: (r) => {
			if (r.ok) {
				toast.message(`Queued ${r.id} — not claimed delivered`);
				inv();
			} else toast.error(r.error);
		}
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-end justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Notifications"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Adapter statuses. Delivery is never claimed without provider confirmation."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm",
					value: channel,
					onChange: (e) => setChannel(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "push",
							children: "Push"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "sms",
							children: "SMS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "whatsapp",
							children: "WhatsApp"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => queue.mutate(),
					children: "Queue (not send)"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "channel",
					label: "Channel"
				},
				{
					key: "template",
					label: "Template"
				},
				{
					key: "status",
					label: "Status"
				},
				{
					key: "conf",
					label: "Confirmed"
				}
			],
			rows: rows.map((n) => ({
				channel: n.channel,
				template: n.templateKey,
				status: n.status,
				conf: n.providerConfirmed ? "yes" : "no"
			}))
		})]
	});
}
function AuditPage() {
	const [qtext, setQtext] = (0, import_react.useState)("");
	const q = useQuery({
		queryKey: ["audit", qtext],
		queryFn: () => loadAudit({ data: { q: qtext || void 0 } })
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const rows = q.data && q.data.ok ? q.data.data : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Audit log"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Append-only. There is no edit or delete API."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBox, {
				value: qtext,
				onChange: setQtext,
				placeholder: "Action or target id"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: rows.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-[16px] border border-border bg-surface p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: a.action
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: relativeTime(a.at ?? void 0)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							a.roleKey,
							" · ",
							a.targetType,
							" ",
							a.targetId,
							" ",
							a.reason ? `· ${a.reason}` : ""
						]
					})]
				}, a.id))
			})
		]
	});
}
function HealthPage() {
	const q = useQuery({
		queryKey: ["health"],
		queryFn: () => loadHealth()
	});
	if (q.data && !q.data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Denied, { error: q.data.error });
	const d = q.data && q.data.ok ? q.data.data : null;
	if (!d) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "System health"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: Object.entries(d).filter(([k]) => k !== "label" && k !== "secretsExposed" && k !== "databaseLatencyMs").map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
					label: k,
					value: String(v),
					source: d.label
				}, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"DB latency ",
					d.databaseLatencyMs,
					"ms. Secrets are not exposed."
				]
			})
		]
	});
}
function Denied({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[24px] border border-border bg-surface p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl",
			children: "Not permitted"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: error
		})]
	});
}
//#endregion
export { ModuleView as n, DashboardPage as t };
