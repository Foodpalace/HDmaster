import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  actOnOrder,
  actRestaurant,
  actRider,
  actTicket,
  approveSettlementFn,
  askAssistant,
  defaultEconomicsScenario,
  exportCsv,
  inviteEmployeeFn,
  loadAnalytics,
  loadAudit,
  loadCampaigns,
  loadCeo,
  loadCities,
  loadCms,
  loadCustomer,
  loadCustomers,
  loadDashboard,
  loadDispatch,
  loadEmployees,
  loadFinance,
  loadFlags,
  loadHealth,
  loadKyc,
  loadLive,
  loadNotifications,
  loadOrder,
  loadOrders,
  loadPromos,
  loadReports,
  loadRestaurant,
  loadRestaurants,
  loadRider,
  loadRiders,
  loadRisk,
  loadSettings,
  loadSettlements,
  loadTicket,
  loadTickets,
  loadZones,
  queueNotificationFn,
  reviewKycFn,
  runEconomics,
  saveBrandingFn,
  saveCampaignFn,
  saveCmsFn,
  saveLoyaltyFn,
  savePromoFn,
  saveSettingsFn,
  saveZoneFn,
  setFlagFn,
  tickSim,
  updateCustomerFn,
  updateEmployeeFn,
  loadBranding,
} from "@/lib/roshoi/actions";
import { ROLE_LABELS, SYSTEM_ROLES, PERMISSIONS } from "@/lib/roshoi/permissions";
import { FEATURE_FLAG_KEYS, DEFAULT_SETTINGS, type PlatformSettings } from "@/lib/roshoi/types";
import { NAV, itemAllowed } from "@/lib/roshoi/nav";
import { cityIdFromSlug } from "@/lib/roshoi/search";
import { ACTIVE_FLOW } from "@/lib/roshoi/orders/state-machine";
import { formatInrExact, formatNumber, relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ConfirmBar,
  DataTable,
  Field,
  MetricCard,
  Panel,
  SearchBox,
  StatusBadge,
  money,
} from "./widgets";
import { useEmployee } from "./shell";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useInvalidate() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries();
}

export function ModuleView({ module, id }: { module: string; id?: string }) {
  const emp = useEmployee();
  const item = NAV.flatMap((g) => g.items).find((it) => it.id === module);
  if (
    item &&
    emp &&
    emp.actingRoleKey !== "SUPER_ADMIN" &&
    !itemAllowed(item, emp.permissions)
  ) {
    return <Denied error={`Missing permission for ${item.id}`} />;
  }
  if (module === "ceo") return <CeoPage />;
  if (module === "live") return <LivePage />;
  if (module === "orders") return id ? <OrderDetail id={id} /> : <OrdersPage />;
  if (module === "dispatch") return <DispatchPage />;
  if (module === "zones") return <ZonesPage />;
  if (module === "restaurants") return id ? <RestaurantDetail id={id} /> : <RestaurantsPage />;
  if (module === "riders") return id ? <RiderDetail id={id} /> : <RidersPage />;
  if (module === "customers") return id ? <CustomerDetail id={id} /> : <CustomersPage />;
  if (module === "kyc") return <KycPage />;
  if (module === "support") return id ? <TicketDetail id={id} /> : <SupportPage />;
  if (module === "finance") return <FinancePage />;
  if (module === "settlements") return <SettlementsPage />;
  if (module === "economics") return <EconomicsPage />;
  if (module === "promotions") return <PromosPage />;
  if (module === "loyalty") return <LoyaltyPage />;
  if (module === "marketing") return <MarketingPage />;
  if (module === "cms") return <CmsPage />;
  if (module === "analytics") return <AnalyticsPage />;
  if (module === "reports") return <ReportsPage />;
  if (module === "risk") return <RiskPage />;
  if (module === "ai") return <AiPage mode="ops" />;
  if (module === "employees") return <EmployeesPage />;
  if (module === "branding") return <BrandingPage />;
  if (module === "flags") return <FlagsPage />;
  if (module === "settings") return <SettingsPage />;
  if (module === "notifications") return <NotificationsPage />;
  if (module === "audit") return <AuditPage />;
  if (module === "health") return <HealthPage />;
  return <DashboardPage />;
}

export function DashboardPage() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => loadDashboard() });
  const tick = useMutation({
    mutationFn: () => tickSim(),
    onSuccess: (r) => {
      if (r.ok) toast.message(`Simulation advanced ${r.advanced} orders`);
      else toast.error(r.error);
    },
  });
  const inv = useInvalidate();
  const data = q.data && q.data.ok ? q.data.data : null;
  const t = data?.today;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Today</p>
          <h1 className="font-display text-3xl">Marketplace pulse</h1>
          <p className="mt-1 text-sm text-muted">What happened. Is it normal. Does it need action.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { void q.refetch(); inv(); }}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => tick.mutate()} disabled={tick.isPending}>
            Advance simulation
          </Button>
        </div>
      </header>
      {!data ? (
        <p className="text-muted">{q.data && !q.data.ok ? q.data.error : "Loading…"}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Orders" value={formatNumber(t!.orders.value)} source={t!.orders.label} />
            <MetricCard label="GMV" value={money(t!.gmv.value)} source={t!.gmv.label} />
            <MetricCard
              label="Platform revenue"
              value={t!.platformRevenue ? money(t!.platformRevenue.value) : "Hidden"}
              source={t!.platformRevenue?.label}
              hint={t!.platformRevenue ? undefined : "Requires finance permission"}
            />
            <MetricCard
              label="Contribution"
              value={t!.contribution ? money(t!.contribution.value) : "Hidden"}
              source={t!.contribution?.label}
              tone={(t!.contribution?.value ?? 0) < 0 ? "danger" : "success"}
              hint="Revenue − variable costs (ESTIMATE)"
            />
            <MetricCard label="Refunds" value={money(t!.refunds.value)} source={t!.refunds.label} tone="warning" />
            <MetricCard label="Cancellations" value={formatNumber(t!.cancellations.value)} source={t!.cancellations.label} />
            <MetricCard label="Active restaurants" value={formatNumber(t!.activeRestaurants.value)} source={t!.activeRestaurants.label} />
            <MetricCard label="Online riders" value={formatNumber(t!.onlineRiders.value)} source={t!.onlineRiders.label} />
            <MetricCard label="Active deliveries" value={formatNumber(t!.activeDeliveries.value)} source={t!.activeDeliveries.label} />
            <MetricCard label="Support load" value={formatNumber(t!.supportLoad.value)} source={t!.supportLoad.label} />
            <MetricCard label="Delayed now" value={formatNumber(data.live.delayedOrders)} tone="danger" source="SIMULATED" />
            <MetricCard label="Unassigned" value={formatNumber(data.live.unassignedOrders)} tone="warning" source="SIMULATED" />
          </div>
          <Panel title="Alerts">
            <ul className="space-y-2">
              {data.alerts.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 rounded-[16px] border border-border bg-elevated p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={a.severity} />
                      <p className="text-sm font-medium">{a.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted">{a.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}

function CeoPage() {
  const q = useQuery({ queryKey: ["ceo"], queryFn: () => loadCeo() });
  const data = q.data && q.data.ok ? q.data.data : null;
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  if (!data) return <p className="text-muted">Loading executive brief…</p>;
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted">CEO Command</p>
        <h1 className="font-display text-3xl">Business today</h1>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="GMV" value={money(data.business.gmv.value)} source={data.business.gmv.label} />
        <MetricCard label="Orders" value={formatNumber(data.business.orders.value)} source={data.business.orders.label} />
        <MetricCard label="Contribution" value={money(data.finance.contribution.total)} source="ESTIMATE" />
        <MetricCard label="Support backlog" value={formatNumber(data.supportBacklog)} source="SIMULATED" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Daily briefing">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted">Business</dt><dd>{data.briefing.business}</dd></div>
            <div><dt className="text-muted">Operations</dt><dd>{data.briefing.operations}</dd></div>
            <div><dt className="text-muted">Finance</dt><dd>{data.briefing.finance}</dd></div>
          </dl>
          <h3 className="mt-4 text-sm text-muted">Recommended actions</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {data.briefing.recommended.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Weakest estimated contribution">
          <ul className="space-y-2 text-sm">
            {data.worstRestaurants.map((r) => (
              <li key={r.id} className="flex justify-between gap-3">
                <Link to="/app/$module/$id" params={{ module: "restaurants", id: r.id }} className="underline-offset-2 hover:underline">
                  {r.name}
                </Link>
                <span className="tabular text-danger">{money(r.contribution)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <AiPage mode="ceo" />
    </div>
  );
}

function LivePage() {
  const q = useQuery({ queryKey: ["live"], queryFn: () => loadLive(), refetchInterval: 12_000 });
  const data = q.data && q.data.ok ? q.data.data : null;
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const counts = data?.counts ?? {};
  const riders = data?.riders ?? [];
  const lats = riders.map((r) => r.lat).filter((n): n is number => n != null);
  const lngs = riders.map((r) => r.lng).filter((n): n is number => n != null);
  const minLat = lats.length ? Math.min(...lats) - 0.01 : 24.84;
  const maxLat = lats.length ? Math.max(...lats) + 0.01 : 24.89;
  const minLng = lngs.length ? Math.min(...lngs) - 0.01 : 92.33;
  const maxLng = lngs.length ? Math.max(...lngs) + 0.01 : 92.38;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Live control</h1>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {ACTIVE_FLOW.concat(["DELIVERED", "CANCELLED"]).map((s) => (
          <div key={s} className="rounded-[16px] border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted">{s.replaceAll("_", " ")}</p>
            <p className="font-display text-2xl tabular">{counts[s] ?? 0}</p>
          </div>
        ))}
      </div>
      <Panel title={data?.trackingEnabled ? "Rider positions (SIMULATED)" : "Live tracking flag is OFF"}>
        <div className="relative h-64 overflow-hidden rounded-[16px] border border-border bg-elevated">
          {riders.filter((r) => r.lat != null && r.lng != null).map((r) => {
            const x = ((r.lng! - minLng) / (maxLng - minLng)) * 100;
            const y = (1 - (r.lat! - minLat) / (maxLat - minLat)) * 100;
            return (
              <div
                key={r.id}
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`${r.name} · ${r.status}`}
              />
            );
          })}
          <p className="absolute bottom-2 left-3 text-[10px] uppercase tracking-wider text-muted">
            GPS last-fix · SIMULATED · not a street map
          </p>
        </div>
        <ul className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
          {riders.slice(0, 8).map((r) => (
            <li key={r.id} className="flex justify-between gap-2">
              <span>{r.name}</span>
              <span className="text-muted">{r.status}{r.lat != null ? ` · ${r.lat.toFixed(3)}, ${r.lng?.toFixed(3)}` : ""}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <OrderTable />
    </div>
  );
}

function OrdersPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Orders</h1>
      <OrderTable />
    </div>
  );
}

function OrderTable() {
  const search = useSearch({ strict: false }) as {
    delayed?: string;
    city?: string;
    minutes?: string;
    q?: string;
    status?: string;
  };
  const [q, setQ] = useState(search.q ?? "");
  const [delayed, setDelayed] = useState(search.delayed === "1");
  const [status, setStatus] = useState(search.status ?? "");
  const [city, setCity] = useState(search.city ?? "");
  const nav = useNavigate();
  useEffect(() => {
    if (search.delayed === "1") setDelayed(true);
    if (search.city) setCity(search.city);
    if (search.status) setStatus(search.status);
    if (search.q) setQ(search.q);
  }, [search.delayed, search.city, search.status, search.q]);
  const query = useQuery({
    queryKey: ["orders", q, delayed, status, city, search.minutes],
    queryFn: () =>
      loadOrders({
        data: {
          q: q || undefined,
          delayed: delayed || undefined,
          status: status || undefined,
          cityId: city ? cityIdFromSlug(city) : undefined,
          minutes: search.minutes ? Number(search.minutes) : undefined,
        },
      }),
  });
  const rows = query.data && query.data.ok ? query.data.data : [];
  return (
    <Panel
      title="Order board"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <SearchBox value={q} onChange={setQ} placeholder="ID or restaurant" />
          <select className="h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {ACTIVE_FLOW.concat(["DELIVERED", "CANCELLED", "REFUNDED"]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All cities</option>
            <option value="karimganj">Karimganj</option>
            <option value="silchar">Silchar</option>
          </select>
          <Button size="sm" variant={delayed ? "primary" : "secondary"} onClick={() => setDelayed(!delayed)}>
            Delayed
          </Button>
        </div>
      }
    >
      {query.data && !query.data.ok ? <Denied error={query.data.error} /> : (
        <DataTable
          columns={[
            { key: "id", label: "Order" },
            { key: "restaurant", label: "Restaurant" },
            { key: "status", label: "Status" },
            { key: "pay", label: "Pay" },
            { key: "total", label: "Total" },
            { key: "when", label: "Placed" },
          ]}
          rows={rows.map((o) => ({
            _id: o.id,
            id: (
              <span className="font-mono text-xs">
                {o.id} {o.delayed ? <Badge tone="danger">Delayed</Badge> : null}
              </span>
            ),
            restaurant: o.restaurant,
            status: <StatusBadge value={o.status} />,
            pay: o.payment_method,
            total: <span className="tabular">{money(o.totalPaise)}</span>,
            when: relativeTime(o.placedAt ?? undefined),
          }))}
          onRow={(row) => void nav({ to: "/app/$module/$id", params: { module: "orders", id: String(row._id) } })}
        />
      )}
    </Panel>
  );
}

function OrderDetail({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["order", id], queryFn: () => loadOrder({ data: id }) });
  const riders = useQuery({ queryKey: ["riders"], queryFn: () => loadRiders({ data: {} }) });
  const inv = useInvalidate();
  const act = useMutation({
    mutationFn: (input: Parameters<typeof actOnOrder>[0]["data"]) => actOnOrder({ data: input }),
    onSuccess: (r) => {
      if (r.ok) { toast.success("Recorded"); inv(); }
      else toast.error(r.error);
    },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const o = q.data && q.data.ok ? q.data.data : null;
  if (!o) return <p className="text-muted">Loading order…</p>;
  const riderList = riders.data && riders.data.ok ? riders.data.data : [];
  return (
    <div className="space-y-4">
      <Link to="/app/$module" params={{ module: "orders" }} className="text-sm text-muted">← Orders</Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">{o.id}</p>
          <h1 className="font-display text-3xl">{o.restaurantName}</h1>
        </div>
        <StatusBadge value={o.status} />
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Customer" value={String(o.customerRef)} />
        <MetricCard label="Total" value={money(o.totalPaise)} source={o.label} />
        <MetricCard label="Promised" value={o.promisedAt ? relativeTime(o.promisedAt) : "—"} tone={o.delayed ? "danger" : "default"} />
      </div>
      <Panel title="Items">
        <ul className="text-sm">
          {o.items.map((it, i) => (
            <li key={i} className="flex justify-between py-1">
              <span>{it.qty} × {it.name}</span>
              <span className="tabular">{money(it.unitPaise * it.qty)}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Financial breakdown">
        {o.commissionPaise == null ? <p className="text-sm text-muted">Finance fields hidden by role.</p> : (
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt>Food</dt><dd className="tabular text-right">{money(o.foodPaise)}</dd>
            <dt>Restaurant discount</dt><dd className="tabular text-right">{money(o.restaurantDiscountPaise)}</dd>
            <dt>Platform discount</dt><dd className="tabular text-right">{money(o.platformDiscountPaise)}</dd>
            <dt>Delivery</dt><dd className="tabular text-right">{money(o.deliveryFeePaise)}</dd>
            <dt>Service</dt><dd className="tabular text-right">{money(o.serviceFeePaise)}</dd>
            <dt>Commission</dt><dd className="tabular text-right">{money(o.commissionPaise)}</dd>
            <dt>Payment fee</dt><dd className="tabular text-right">{money(o.paymentFeePaise)}</dd>
            <dt>Rider payout</dt><dd className="tabular text-right">{money(o.riderPayoutPaise)}</dd>
          </dl>
        )}
        {o.ledger.length ? (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-muted">Ledger</p>
            <ul className="mt-2 space-y-1 text-xs">
              {o.ledger.map((l, i) => (
                <li key={i} className="flex justify-between gap-2 font-mono">
                  <span>{l.kind} · {l.source} · {l.ruleKey}</span>
                  <span>{money(l.amountPaise)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Panel>
      <Panel title="Intervention">
        <div className="flex flex-col gap-3">
          <ConfirmBar title="Cancel order" onConfirm={(reason) => act.mutate({ orderId: o.id, action: "cancel", reason })} />
          <ConfirmBar title="Issue refund" onConfirm={(reason) => act.mutate({ orderId: o.id, action: "refund", reason, amountPaise: o.totalPaise })} />
          <p className="text-xs text-muted">Refunds are allowed from DELIVERED / CANCELLED / failed states. Live orders must be cancelled first. Reassign is a request to the dispatcher, applied locally only in simulation.</p>
          <ConfirmBar title="Escalate to support" onConfirm={(reason) => act.mutate({ orderId: o.id, action: "escalate", reason })} />
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Reassign rider">
              <select
                className="h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm"
                defaultValue=""
                onChange={(e) => {
                  const riderId = e.target.value;
                  if (!riderId) return;
                  const reason = window.prompt("Reason for reassignment");
                  if (reason && reason.trim().length >= 3) {
                    act.mutate({ orderId: o.id, action: "assign_rider", riderId, reason: reason.trim() });
                  }
                }}
              >
                <option value="">Select rider</option>
                {riderList.filter((r) => r.online).map((r) => (
                  <option key={r.id} value={r.id}>{r.name} · {r.status}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </Panel>
      <Panel title="Timeline">
        <ol className="space-y-2 text-sm">
          {o.events.map((e, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>{e.action} {e.from ? `${e.from} → ${e.to}` : ""}</span>
              <span className="text-muted">{relativeTime(e.at ?? undefined)}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}

function RestaurantsPage() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const query = useQuery({ queryKey: ["restaurants", q], queryFn: () => loadRestaurants({ data: { q } }) });
  const rows = query.data && query.data.ok ? query.data.data : [];
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Restaurants</h1>
        <SearchBox value={q} onChange={setQ} />
      </header>
      {query.data && !query.data.ok ? <Denied error={query.data.error} /> : (
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "cuisine", label: "Cuisine" },
            { key: "status", label: "Status" },
            { key: "kyc", label: "KYC" },
            { key: "orders", label: "Orders" },
            { key: "rating", label: "Rating" },
          ]}
          rows={rows.map((r) => ({
            _id: r.id,
            name: r.name,
            cuisine: r.cuisine,
            status: <StatusBadge value={r.status} />,
            kyc: <StatusBadge value={r.kycStatus} />,
            orders: r.orderCount,
            rating: r.rating.toFixed(1),
          }))}
          onRow={(row) => void nav({ to: "/app/$module/$id", params: { module: "restaurants", id: String(row._id) } })}
        />
      )}
    </div>
  );
}

function RestaurantDetail({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["restaurant", id], queryFn: () => loadRestaurant({ data: id }) });
  const inv = useInvalidate();
  const act = useMutation({
    mutationFn: (input: { status: string; reason: string }) => actRestaurant({ data: { id, ...input } }),
    onSuccess: (r) => { if (r.ok) { toast.success("Updated"); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const r = q.data && q.data.ok ? q.data.data : null;
  if (!r) return <p className="text-muted">Loading…</p>;
  return (
    <div className="space-y-4">
      <Link to="/app/$module" params={{ module: "restaurants" }} className="text-sm text-muted">← Restaurants</Link>
      <h1 className="font-display text-3xl">{String(r.name)}</h1>
      <div className="flex flex-wrap gap-2">
        <StatusBadge value={String(r.status)} />
        <StatusBadge value={String(r.kycStatus)} />
      </div>
      <p className="text-sm text-muted">{String(r.address)} · {String(r.phoneMasked)}</p>
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Orders" value={formatNumber(r.performance.orders)} source="SIMULATED" />
        <MetricCard label="GMV" value={money(r.performance.gmv)} source="SIMULATED" />
        <MetricCard label="AOV" value={money(r.performance.aov)} source="SIMULATED" />
        <MetricCard label="Cancel rate" value={`${(r.performance.cancellationRate * 100).toFixed(1)}%`} source="SIMULATED" />
      </div>
      {r.contributionEstimate ? (
        <MetricCard label="Estimated contribution" value={money(r.contributionEstimate.value)} source="ESTIMATE" />
      ) : null}
      <Panel title="Menu">
        <ul className="columns-1 gap-3 text-sm sm:columns-2">
          {r.menu.map((m) => (
            <li key={m.id} className="mb-1 flex justify-between gap-2">
              <span>{m.name} {m.veg ? "· veg" : ""}</span>
              <span className="tabular">{money(m.pricePaise)}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="flex flex-wrap gap-2">
        <ConfirmBar title="Approve / activate" onConfirm={(reason) => act.mutate({ status: "ACTIVE", reason })} />
        <ConfirmBar title="Pause" onConfirm={(reason) => act.mutate({ status: "PAUSED", reason })} />
        <ConfirmBar title="Suspend" onConfirm={(reason) => act.mutate({ status: "SUSPENDED", reason })} />
      </div>
    </div>
  );
}

function RidersPage() {
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["riders"], queryFn: () => loadRiders({ data: {} }) });
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Riders</h1>
      {q.data && !q.data.ok ? <Denied error={q.data.error} /> : (
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "status", label: "Status" },
            { key: "vehicle", label: "Vehicle" },
            { key: "kyc", label: "KYC" },
            { key: "cash", label: "Cash" },
          ]}
          rows={rows.map((r) => ({
            _id: r.id,
            name: r.name,
            status: <StatusBadge value={r.status} />,
            vehicle: r.vehicle,
            kyc: <StatusBadge value={r.kycStatus} />,
            cash: r.cashCollectedPaise == null ? "—" : money(r.cashCollectedPaise),
          }))}
          onRow={(row) => void nav({ to: "/app/$module/$id", params: { module: "riders", id: String(row._id) } })}
        />
      )}
    </div>
  );
}

function RiderDetail({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["rider", id], queryFn: () => loadRider({ data: id }) });
  const inv = useInvalidate();
  const act = useMutation({
    mutationFn: (input: { status: string; reason: string }) => actRider({ data: { id, ...input } }),
    onSuccess: (r) => { if (r.ok) { toast.success("Updated"); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const r = q.data && q.data.ok ? q.data.data : null;
  if (!r) return <p className="text-muted">Loading…</p>;
  return (
    <div className="space-y-4">
      <Link to="/app/$module" params={{ module: "riders" }} className="text-sm text-muted">← Riders</Link>
      <h1 className="font-display text-3xl">{r.name}</h1>
      <StatusBadge value={r.status} />
      <p className="text-sm text-muted">{r.vehicle} · {r.phoneMasked} · rating {r.rating.toFixed(1)}</p>
      {r.lat != null ? <p className="text-xs text-muted">Last operational fix {r.lat.toFixed(3)}, {r.lng?.toFixed(3)} (SIMULATED)</p> : null}
      <Panel title="Recent deliveries">
        <ul className="text-sm">
          {r.deliveries.map((d) => (
            <li key={d.id} className="flex justify-between py-1">
              <Link to="/app/$module/$id" params={{ module: "orders", id: d.id }} className="font-mono text-xs">{d.id}</Link>
              <span>{d.status}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="flex flex-wrap gap-2">
        <ConfirmBar title="Approve" onConfirm={(reason) => act.mutate({ status: "OFFLINE", reason })} />
        <ConfirmBar title="Suspend" onConfirm={(reason) => act.mutate({ status: "SUSPENDED", reason })} />
      </div>
    </div>
  );
}

function CustomersPage() {
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["customers"], queryFn: () => loadCustomers({ data: {} }) });
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Customers</h1>
      <p className="text-sm text-muted">Only references required for operations. No full numbers or credentials.</p>
      {q.data && !q.data.ok ? <Denied error={q.data.error} /> : (
        <DataTable
          columns={[
            { key: "ref", label: "Ref" },
            { key: "phone", label: "Phone" },
            { key: "loyalty", label: "Loyalty" },
            { key: "orders", label: "Orders" },
            { key: "risk", label: "Risk" },
          ]}
          rows={rows.map((c) => ({
            _id: c.id,
            ref: c.displayRef,
            phone: c.phoneMasked,
            loyalty: c.loyaltyTier,
            orders: c.orderCount,
            risk: c.riskScore,
          }))}
          onRow={(row) => void nav({ to: "/app/$module/$id", params: { module: "customers", id: String(row._id) } })}
        />
      )}
    </div>
  );
}

function CustomerDetail({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["customer", id], queryFn: () => loadCustomer({ data: id }) });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const c = q.data && q.data.ok ? q.data.data : null;
  if (!c) return <p className="text-muted">Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">{c.displayRef}</h1>
      <p className="text-sm text-muted">{c.phoneMasked} · {c.loyaltyTier} · risk {c.riskScore}</p>
      <Panel title="Orders">
        <ul className="text-sm">
          {c.orders.map((o) => (
            <li key={o.id} className="flex justify-between py-1">
              <Link to="/app/$module/$id" params={{ module: "orders", id: o.id }}>{o.id}</Link>
              <span>{o.status} · {money((o as { totalPaise?: number }).totalPaise ?? 0)}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <ConfirmBar
        title="Edit customer status"
        onConfirm={(reason) =>
          updateCustomerFn({ data: { id: c.id, status: c.status === "ACTIVE" ? "FLAGGED" : "ACTIVE", reason } }).then((r) => {
            if (r.ok) toast.success("Updated");
            else toast.error(r.error);
          })
        }
      />
    </div>
  );
}

function DispatchPage() {
  const q = useQuery({ queryKey: ["dispatch"], queryFn: () => loadDispatch(), refetchInterval: 10_000 });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const d = q.data && q.data.ok ? q.data.data : null;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Dispatch monitor</h1>
      <p className="text-sm text-muted">{d?.note}</p>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Unassigned">
          <ul className="space-y-2 text-sm">
            {d?.unassigned.map((o) => (
              <li key={o.id} className="flex justify-between">
                <Link to="/app/$module/$id" params={{ module: "orders", id: o.id }}>{o.id}</Link>
                <span>{o.restaurant}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Available riders">
          <ul className="space-y-2 text-sm">
            {d?.available.map((r) => (
              <li key={r.id}>{r.name} · {r.zoneId}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Busy riders">
          <ul className="space-y-2 text-sm">
            {d?.busy.map((r) => (
              <li key={r.id}>{r.name} · {r.activeOrderId ?? "—"}</li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Reassignment requests (to core matcher)">
        {(d?.requests?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted">No dispatch requests yet. Reassign from an order — this never runs a second matcher.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {d?.requests.map((r) => (
              <li key={r.id} className="flex justify-between gap-3">
                <span className="font-mono text-xs">{r.orderId} → {r.riderId ?? "any"}</span>
                <span className="text-muted">{r.status} · {r.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function ZonesPage() {
  const q = useQuery({ queryKey: ["zones"], queryFn: () => loadZones() });
  const inv = useInvalidate();
  const [name, setName] = useState("");
  const [cityId, setCityId] = useState("");
  const [fee, setFee] = useState(3000);
  const [radius, setRadius] = useState(5);
  const save = useMutation({
    mutationFn: () =>
      saveZoneFn({
        data: {
          name,
          cityId,
          deliveryFeePaise: fee,
          minOrderPaise: 10000,
          maxRadiusKm: radius,
          etaMinutes: 35,
        },
      }),
    onSuccess: (r) => { if (r.ok) { toast.success("Zone saved"); inv(); setName(""); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const data = q.data && q.data.ok ? q.data.data : null;
  const defaultCity = data?.cities[0]?.id ?? "";
  const selectedCity = cityId || defaultCity;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Delivery zones</h1>
      <p className="text-sm text-muted">Boundaries are configurable. Karimganj is not hard-coded into business logic.</p>
      <DataTable
        columns={[
          { key: "name", label: "Zone" },
          { key: "city", label: "City" },
          { key: "fee", label: "Fee" },
          { key: "min", label: "Min order" },
          { key: "eta", label: "ETA" },
          { key: "r", label: "Radius" },
        ]}
        rows={(data?.zones ?? []).map((z) => ({
          name: z.name,
          city: z.cityName,
          fee: money(z.deliveryFeePaise),
          min: money(z.minOrderPaise),
          eta: `${z.etaMinutes} min`,
          r: `${z.maxRadiusKm} km`,
        }))}
      />
      <Panel title="Coverage (radius model)">
        <div className="flex flex-wrap gap-3">
          {(data?.zones ?? []).map((z) => (
            <div key={z.id} className="grid size-28 place-items-center rounded-full border border-border bg-elevated text-center text-[10px] leading-tight">
              {z.name}
              <span className="block text-muted">{z.maxRadiusKm} km</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Add zone">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Zone name" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="h-10 rounded-[10px] border border-border bg-elevated px-2" value={selectedCity} onChange={(e) => setCityId(e.target.value)}>
            {(data?.cities ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
          <Input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          <Button disabled={!name} onClick={() => save.mutate()}>Create</Button>
        </div>
      </Panel>
    </div>
  );
}

function SupportPage() {
  const [queue, setQueue] = useState("");
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["tickets", queue], queryFn: () => loadTickets({ data: { queue: queue || undefined } }) });
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Support center</h1>
        <div className="flex gap-2">
          {["", "customer", "restaurant", "rider"].map((k) => (
            <Button key={k || "all"} size="sm" variant={queue === k ? "primary" : "secondary"} onClick={() => setQueue(k)}>
              {k || "All"}
            </Button>
          ))}
        </div>
      </header>
      {q.data && !q.data.ok ? <Denied error={q.data.error} /> : (
        <DataTable
          columns={[
            { key: "id", label: "Ticket" },
            { key: "queue", label: "Queue" },
            { key: "subject", label: "Subject" },
            { key: "status", label: "Status" },
            { key: "priority", label: "Priority" },
          ]}
          rows={rows.map((t) => ({
            _id: t.id,
            id: t.id,
            queue: t.queue,
            subject: t.subject,
            status: <StatusBadge value={t.status} />,
            priority: <StatusBadge value={t.priority} />,
          }))}
          onRow={(row) => void nav({ to: "/app/$module/$id", params: { module: "support", id: String(row._id) } })}
        />
      )}
    </div>
  );
}

function TicketDetail({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["ticket", id], queryFn: () => loadTicket({ data: id }) });
  const [body, setBody] = useState("");
  const inv = useInvalidate();
  const act = useMutation({
    mutationFn: (input: Parameters<typeof actTicket>[0]["data"]) => actTicket({ data: input }),
    onSuccess: (r) => { if (r.ok) { toast.success("Updated"); setBody(""); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const t = q.data && q.data.ok ? q.data.data : null;
  if (!t) return <p className="text-muted">Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">{String(t.subject)}</h1>
      <div className="flex gap-2">
        <StatusBadge value={String(t.status)} />
        <StatusBadge value={String(t.queue)} />
        {t.slaBreached ? <Badge tone="danger">SLA breached</Badge> : <Badge tone="info">SLA {String(t.slaMinutes)}m</Badge>}
      </div>
      <Panel title="Thread">
        <ul className="space-y-3">
          {t.messages.map((m) => (
            <li key={m.id} className="rounded-[16px] border border-border bg-elevated p-3 text-sm">
              <div className="flex justify-between text-xs text-muted">
                <span>{m.authorType} · {m.visibility === "internal" ? "internal note" : "visible"}</span>
                <span>{relativeTime(m.at ?? undefined)}</span>
              </div>
              <p className="mt-1">{m.body}</p>
            </li>
          ))}
        </ul>
        <Textarea className="mt-3" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply or internal note" />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => act.mutate({ id, action: "reply", body })}>Public reply</Button>
          <Button size="sm" variant="secondary" onClick={() => act.mutate({ id, action: "note", body })}>Internal note</Button>
          <Button size="sm" variant="secondary" onClick={() => act.mutate({ id, action: "assign" })}>Assign to me</Button>
          <Button size="sm" variant="secondary" onClick={() => act.mutate({ id, action: "resolve", resolutionCode: body || "resolved" })}>Resolve</Button>
          <Button size="sm" variant="secondary" onClick={() => act.mutate({ id, action: "reopen" })}>Reopen</Button>
        </div>
      </Panel>
    </div>
  );
}

function FinancePage() {
  const q = useQuery({ queryKey: ["finance"], queryFn: () => loadFinance() });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const d = q.data && q.data.ok ? q.data.data : null;
  if (!d) return <p className="text-muted">Loading…</p>;
  const s = d.summary;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Finance command</h1>
      <p className="text-sm text-muted">Contribution = legitimate platform revenue − variable platform costs. Labelled ESTIMATE when derived.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Commissions" value={money(s.revenue.commissions)} source={s.label} />
        <MetricCard label="Delivery revenue" value={money(s.revenue.delivery)} source={s.label} />
        <MetricCard label="Service fees" value={money(s.revenue.serviceFees)} source={s.label} />
        <MetricCard label="Rider payouts" value={money(s.costs.riderPayouts)} source={s.label} />
        <MetricCard label="Refunds" value={money(s.costs.refunds)} source={s.label} />
        <MetricCard label="Contribution" value={money(s.contribution.total)} source="ESTIMATE" />
      </div>
      <Panel title="Restaurant contribution (ESTIMATE)">
        <DataTable
          columns={[
            { key: "name", label: "Restaurant" },
            { key: "orders", label: "Orders" },
            { key: "gmv", label: "GMV" },
            { key: "c", label: "Contribution" },
          ]}
          rows={d.profitability.restaurants.slice(0, 20).map((r) => ({
            name: r.name,
            orders: r.orders,
            gmv: money(r.gmv),
            c: <span className={r.contribution < 0 ? "text-danger" : ""}>{money(r.contribution)}</span>,
          }))}
        />
      </Panel>
    </div>
  );
}

function SettlementsPage() {
  const [party, setParty] = useState<"RESTAURANT" | "RIDER">("RESTAURANT");
  const q = useQuery({ queryKey: ["settlements", party], queryFn: () => loadSettlements({ data: { party } }) });
  const inv = useInvalidate();
  const act = useMutation({
    mutationFn: (input: { id: string; decision: "APPROVED" | "REJECTED"; reason: string }) =>
      approveSettlementFn({ data: input }),
    onSuccess: (r) => {
      if (r.ok) { toast.message(r.note); inv(); }
      else toast.error(r.error);
    },
  });
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <h1 className="font-display text-3xl">Settlements</h1>
        <div className="flex gap-2">
          <Button size="sm" variant={party === "RESTAURANT" ? "primary" : "secondary"} onClick={() => setParty("RESTAURANT")}>Restaurants</Button>
          <Button size="sm" variant={party === "RIDER" ? "primary" : "secondary"} onClick={() => setParty("RIDER")}>Riders</Button>
        </div>
      </header>
      <p className="text-sm text-muted">Visibility and approval only. Actual payout execution belongs to a licensed payment integration.</p>
      {q.data && !q.data.ok ? <Denied error={q.data.error} /> : (
        <DataTable
          columns={[
            { key: "name", label: "Party" },
            { key: "orders", label: "Orders" },
            { key: "payable", label: "Payable" },
            { key: "status", label: "Status" },
            { key: "act", label: "Action" },
          ]}
          rows={rows.map((r) => ({
            name: r.name,
            orders: r.orders,
            payable: money(r.payablePaise),
            status: r.status,
            act: r.status === "READY" ? (
              <Button size="sm" variant="secondary" onClick={() => {
                const reason = window.prompt("Approval reason");
                if (reason && reason.trim().length >= 3) act.mutate({ id: r.id, decision: "APPROVED", reason: reason.trim() });
              }}>Approve</Button>
            ) : "—",
          }))}
        />
      )}
    </div>
  );
}

function EconomicsPage() {
  const base = useMemo(() => defaultEconomicsScenario(), []);
  const [bps, setBps] = useState(1000);
  const q = useQuery({
    queryKey: ["econ", bps],
    queryFn: () =>
      runEconomics({
        data: {
          shockBps: bps,
          scenarios: [
            { ...base, name: "Scenario A · 10%" },
            { ...base, name: "Scenario B · custom", commissionBps: bps },
            { ...base, name: "Scenario C · 8%", commissionBps: 800, ordersPerDay: 110 },
          ],
        },
      }),
  });
  const data = q.data && q.data.ok ? q.data.data : null;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Economics & profit simulator</h1>
      <p className="text-sm text-muted">All outputs are MODEL / ESTIMATE. 10% commission is not assumed profitable.</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Commission {bps / 100}%</label>
        <input type="range" min={0} max={1500} step={100} value={bps} onChange={(e) => setBps(Number(e.target.value))} />
        {[0, 500, 800, 1000, 1200].map((n) => (
          <Button key={n} size="sm" variant={bps === n ? "primary" : "secondary"} onClick={() => setBps(n)}>
            {n / 100}%
          </Button>
        ))}
      </div>
      {q.data && !q.data.ok ? <Denied error={q.data.error} /> : (
        <div className="grid gap-3 md:grid-cols-3">
          {data?.results.map((s) => (
            <Panel key={s.name} title={s.name}>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Revenue / order</span><span className="tabular">{money(s.revenuePerOrderPaise)}</span></div>
                <div className="flex justify-between"><span>Variable / order</span><span className="tabular">{money(s.variableCostPerOrderPaise)}</span></div>
                <div className="flex justify-between"><span>Contribution / order</span><span className="tabular">{money(s.contributionPerOrderPaise)}</span></div>
                <div className="flex justify-between"><span>Break-even orders/day</span><span className="tabular">{s.breakEvenOrdersPerDay ?? "—"}</span></div>
              </dl>
              <Badge tone="info" className="mt-3">{s.label}</Badge>
            </Panel>
          ))}
        </div>
      )}
      {data?.shock ? (
        <p className="text-sm">
          If commission moves to {bps / 100}%, estimated daily contribution changes by {money(data.shock.contributionDeltaPaise)} ({data.shock.label}).
        </p>
      ) : null}
    </div>
  );
}

function PromosPage() {
  const q = useQuery({ queryKey: ["promos"], queryFn: () => loadPromos() });
  const inv = useInvalidate();
  const [name, setName] = useState("New lunch offer");
  const [firstOnly, setFirstOnly] = useState(true);
  const [cap, setCap] = useState(200);
  const [status, setStatus] = useState("DRAFT");
  const [category, setCategory] = useState("lunch");
  const save = useMutation({
    mutationFn: () =>
      savePromoFn({
        data: {
          name,
          kind: "PERCENT",
          funding: "PLATFORM",
          percentBps: 1000,
          minOrderPaise: 20000,
          maxDiscountPaise: 8000,
          capCount: cap,
          firstOrderOnly: firstOnly,
          status,
          category,
        },
      }),
    onSuccess: (r) => {
      if (r.ok) { toast.message(`Estimated cost ${formatInrExact(r.estimatedCostPaise)}`); inv(); }
      else toast.error(r.error);
    },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const d = q.data && q.data.ok ? q.data.data : null;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Promotions</h1>
      <p className="text-sm text-muted">Unlimited ACTIVE discounts are blocked. Cost figures are ESTIMATE. Target first-order, category, and cap before going live.</p>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "funding", label: "Funding" },
          { key: "target", label: "Target" },
          { key: "status", label: "Status" },
          { key: "est", label: "Est. cost" },
          { key: "cap", label: "Cap" },
        ]}
        rows={(d?.promotions ?? []).map((p) => ({
          name: p.name,
          funding: p.funding,
          target: [p.firstOrderOnly ? "first order" : null, p.category, p.zoneId].filter(Boolean).join(" · ") || "all",
          status: <StatusBadge value={p.status} />,
          est: money(p.estimatedCostPaise),
          cap: p.capCount ?? "none",
        }))}
      />
      <Panel title="Create (always capped)">
        <div className="flex flex-wrap gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input type="number" value={cap} onChange={(e) => setCap(Number(e.target.value))} />
          <select className="h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
          </select>
          <Button size="sm" variant={firstOnly ? "primary" : "secondary"} onClick={() => setFirstOnly(!firstOnly)}>
            First order {firstOnly ? "ON" : "OFF"}
          </Button>
          <Button onClick={() => save.mutate()}>Save</Button>
        </div>
      </Panel>
    </div>
  );
}

function LoyaltyPage() {
  const q = useQuery({ queryKey: ["promos"], queryFn: () => loadPromos() });
  const inv = useInvalidate();
  const [name, setName] = useState("Roshoi Points");
  const [earn, setEarn] = useState(200);
  const [cap, setCap] = useState(20000);
  const save = useMutation({
    mutationFn: () =>
      saveLoyaltyFn({
        data: { name, kind: "points", earnBps: earn, capPaise: cap, status: "ACTIVE", abuseCapPerDay: 3 },
      }),
    onSuccess: (r) => { if (r.ok) { toast.success("Loyalty saved"); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const d = q.data && q.data.ok ? q.data.data : null;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Loyalty</h1>
      <p className="text-sm text-muted">Earn rate, rupee cap, and abuse cap. Feature flag <code>loyalty</code> must be ON.</p>
      <DataTable
        columns={[
          { key: "name", label: "Program" },
          { key: "kind", label: "Kind" },
          { key: "earn", label: "Earn bps" },
          { key: "cap", label: "Cap" },
          { key: "status", label: "Status" },
        ]}
        rows={(d?.loyalty ?? []).map((l) => ({
          name: l.name,
          kind: l.kind,
          earn: l.earnBps,
          cap: l.capPaise ? money(l.capPaise) : "none",
          status: <StatusBadge value={l.status} />,
        }))}
      />
      <Panel title="Edit program">
        <div className="grid gap-2 sm:grid-cols-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" value={earn} onChange={(e) => setEarn(Number(e.target.value))} />
          <Input type="number" value={cap} onChange={(e) => setCap(Number(e.target.value))} />
        </div>
        <Button className="mt-3" onClick={() => save.mutate()}>Save (capped)</Button>
      </Panel>
    </div>
  );
}

function MarketingPage() {
  const q = useQuery({ queryKey: ["campaigns"], queryFn: () => loadCampaigns() });
  const inv = useInvalidate();
  const [name, setName] = useState("City push");
  const save = useMutation({
    mutationFn: () =>
      saveCampaignFn({
        data: { name, channel: "push", audience: "customers", budgetPaise: 50000, status: "DRAFT", notes: "ESTIMATE" },
      }),
    onSuccess: (r) => {
      if (r.ok) { toast.message(`Budget ${formatInrExact(r.estimatedCostPaise)} (ESTIMATE)`); inv(); }
      else toast.error(r.error);
    },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Marketing</h1>
      <p className="text-sm text-muted">Campaigns are a distinct surface from CMS slots. Spend is ESTIMATE until an ad network is connected.</p>
      <DataTable
        columns={[
          { key: "name", label: "Campaign" },
          { key: "channel", label: "Channel" },
          { key: "audience", label: "Audience" },
          { key: "budget", label: "Budget" },
          { key: "status", label: "Status" },
        ]}
        rows={rows.map((c) => ({
          name: c.name,
          channel: c.channel,
          audience: c.audience,
          budget: money(c.budgetPaise),
          status: <StatusBadge value={c.status} />,
        }))}
      />
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => save.mutate()}>Save draft</Button>
      </div>
    </div>
  );
}

function CmsPage() {
  const q = useQuery({ queryKey: ["cms"], queryFn: () => loadCms() });
  const inv = useInvalidate();
  const [title, setTitle] = useState("");
  const [surface, setSurface] = useState("customer");
  const [sponsored, setSponsored] = useState(false);
  const save = useMutation({
    mutationFn: () => saveCmsFn({ data: { surface, slot: "banner", title, body: title, sponsored } }),
    onSuccess: (r) => { if (r.ok) { toast.success("Published"); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">CMS</h1>
      <p className="text-sm text-muted">Customer, restaurant, rider, and admin surfaces. Sponsored slots are labelled and require the advertising flag.</p>
      <DataTable
        columns={[
          { key: "surface", label: "Surface" },
          { key: "slot", label: "Slot" },
          { key: "title", label: "Title" },
          { key: "ad", label: "Sponsored" },
        ]}
        rows={rows.map((c) => ({
          surface: c.surface,
          slot: c.slot,
          title: c.title,
          ad: c.sponsored ? <Badge tone="warning">Sponsored</Badge> : "—",
        }))}
      />
      <div className="flex flex-wrap gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New banner title" />
        <select className="h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm" value={surface} onChange={(e) => setSurface(e.target.value)}>
          <option value="customer">Customer</option>
          <option value="restaurant">Restaurant</option>
          <option value="rider">Rider</option>
          <option value="admin">Admin</option>
        </select>
        <Button size="sm" variant={sponsored ? "primary" : "secondary"} onClick={() => setSponsored(!sponsored)}>
          Sponsored {sponsored ? "ON" : "OFF"}
        </Button>
        <Button disabled={!title} onClick={() => save.mutate()}>Publish</Button>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const q = useQuery({ queryKey: ["analytics"], queryFn: () => loadAnalytics() });
  const exp = useMutation({
    mutationFn: (kind: "orders" | "restaurants" | "riders" | "finance") => exportCsv({ data: { kind } }),
    onSuccess: (r) => {
      if (!r.ok) return toast.error(r.error);
      const blob = new Blob([r.csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = r.filename;
      a.click();
    },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const d = q.data && q.data.ok ? q.data.data : null;
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Analytics</h1>
          <p className="text-sm text-muted">Aggregated from source orders. Grain: {d?.grain}. Label: {d?.label}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["orders", "restaurants", "riders", "finance"] as const).map((k) => (
            <Button key={k} size="sm" variant="secondary" onClick={() => exp.mutate(k)}>Export {k}</Button>
          ))}
        </div>
      </header>
      <div className="h-72 rounded-[24px] border border-border bg-surface p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={d?.series ?? []}>
            <CartesianGrid stroke="#2a2c2a" />
            <XAxis dataKey="day" stroke="#8c8a82" fontSize={11} />
            <YAxis stroke="#8c8a82" fontSize={11} />
            <Tooltip contentStyle={{ background: "#141614", border: "1px solid #2a2c2a" }} />
            <Line type="monotone" dataKey="orders" stroke="#e8e4dc" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ReportsPage() {
  const q = useQuery({ queryKey: ["reports"], queryFn: () => loadReports() });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const d = q.data && q.data.ok ? q.data.data : null;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Reports</h1>
      <p className="text-sm text-muted">City and status breakdowns. Grain {d?.grain}. Label {d?.label}.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="By city">
          <DataTable
            columns={[
              { key: "name", label: "City" },
              { key: "orders", label: "Orders" },
              { key: "gmv", label: "GMV" },
            ]}
            rows={(d?.byCity ?? []).map((c) => ({ name: c.name, orders: c.orders, gmv: money(c.gmv) }))}
          />
        </Panel>
        <Panel title="By status">
          <DataTable
            columns={[
              { key: "status", label: "Status" },
              { key: "orders", label: "Orders" },
            ]}
            rows={(d?.byStatus ?? []).map((c) => ({ status: c.status, orders: c.orders }))}
          />
        </Panel>
      </div>
    </div>
  );
}

function RiskPage() {
  const q = useQuery({ queryKey: ["risk"], queryFn: () => loadRisk() });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Fraud / risk</h1>
      <p className="text-sm text-muted">Signals only. Do not auto-punish because a score exists.</p>
      <DataTable
        columns={[
          { key: "subject", label: "Subject" },
          { key: "signal", label: "Signal" },
          { key: "score", label: "Score" },
          { key: "summary", label: "Summary" },
        ]}
        rows={rows.map((r) => ({
          subject: `${r.subjectType} ${r.subjectId}`,
          signal: r.signalKey,
          score: r.score,
          summary: r.summary,
        }))}
      />
    </div>
  );
}

function KycPage() {
  const q = useQuery({ queryKey: ["kyc"], queryFn: () => loadKyc() });
  const inv = useInvalidate();
  const act = useMutation({
    mutationFn: (input: { id: string; status: string; notes: string }) => reviewKycFn({ data: input }),
    onSuccess: (r) => { if (r.ok) { toast.success("Recorded"); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">KYC operations</h1>
      <p className="text-sm text-muted">Window 4 never claims identity is verified by a third party unless a real verifier is connected. Documents are not publicly accessible.</p>
      {rows.map((k) => (
        <div key={k.id} className="rounded-[20px] border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{k.subjectType} · {k.subjectId}</p>
            <StatusBadge value={k.status} />
          </div>
          <p className="mt-1 text-xs text-muted">{k.notes}</p>
          {k.documentRefs?.length ? (
            <ul className="mt-2 text-xs text-muted">
              {k.documentRefs.map((d) => (
                <li key={d.ref}>Vault ref {d.ref} · {d.label} (not publicly accessible)</li>
              ))}
            </ul>
          ) : <p className="mt-2 text-xs text-muted">No documents in vault.</p>}
          <div className="mt-3 flex gap-2">
            <ConfirmBar title="Mark under review" onConfirm={(notes) => act.mutate({ id: k.id, status: "UNDER_REVIEW", notes })} />
            <ConfirmBar title="Record operator review" onConfirm={(notes) => act.mutate({ id: k.id, status: "VERIFIED", notes })} />
            <ConfirmBar title="Reject" onConfirm={(notes) => act.mutate({ id: k.id, status: "REJECTED", notes })} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AiPage({ mode }: { mode: "ops" | "ceo" }) {
  const [q, setQ] = useState(mode === "ceo" ? "How is the business today?" : "Summarize today’s operations.");
  const [log, setLog] = useState<{ q: string; a: string }[]>([]);
  const ask = useMutation({
    mutationFn: () => askAssistant({ data: { question: q, mode } }),
    onSuccess: (r) => {
      if (r.ok) setLog((l) => [...l, { q, a: r.text }]);
      else toast.error(r.error);
    },
  });
  return (
    <Panel title={mode === "ceo" ? "CEO assistant" : "Operations assistant"}>
      <p className="mb-3 text-xs text-muted">Uses authorized tools only. High-risk actions are recommendations, not executions.</p>
      <div className="space-y-3">
        {log.map((m, i) => (
          <div key={i} className="rounded-[16px] border border-border bg-elevated p-3 text-sm">
            <p className="text-muted">{m.q}</p>
            <p className="mt-2 whitespace-pre-wrap">{m.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} />
        <Button onClick={() => ask.mutate()} disabled={ask.isPending || !q.trim()}>Ask</Button>
      </div>
    </Panel>
  );
}

function EmployeesPage() {
  const emp = useEmployee();
  const q = useQuery({ queryKey: ["employees"], queryFn: () => loadEmployees() });
  const cities = useQuery({ queryKey: ["cities"], queryFn: () => loadCities() });
  const inv = useInvalidate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("CUSTOMER_SUPPORT");
  const [cityId, setCityId] = useState("");
  const [custom, setCustom] = useState<string[]>([]);
  const invite = useMutation({
    mutationFn: () => inviteEmployeeFn({
      data: {
        email,
        name,
        roleKey: role,
        department: "Operations",
        cityId: cityId || null,
        customPermissions: role === "CUSTOM" ? custom : undefined,
      },
    }),
    onSuccess: (r) => { if (r.ok) { toast.success("Invited"); inv(); } else toast.error(r.error); },
  });
  const update = useMutation({
    mutationFn: (input: {
      id: string;
      status?: string;
      roleKey?: string;
      cityId?: string | null;
      mfaReady?: boolean;
      customPermissions?: string[];
      reason: string;
    }) => updateEmployeeFn({ data: input }),
    onSuccess: (r) => { if (r.ok) { toast.success("Updated"); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const rows = q.data && q.data.ok ? q.data.data : [];
  const cityRows = cities.data && cities.data.ok ? cities.data.data : [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Employees</h1>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "city", label: "City" },
          { key: "mfa", label: "MFA" },
          { key: "status", label: "Status" },
          { key: "act", label: "Lifecycle" },
        ]}
        rows={rows.map((e) => ({
          name: e.name,
          email: e.email,
          role: (
            <select
              className="h-9 max-w-[10rem] rounded-[8px] border border-border bg-elevated px-1 text-xs"
              defaultValue={e.roleKey}
              onChange={(ev) => {
                const reason = window.prompt("Reason to change role");
                if (reason && reason.trim().length >= 3) update.mutate({ id: e.id, roleKey: ev.target.value, reason: reason.trim() });
              }}
            >
              {SYSTEM_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
              ))}
            </select>
          ),
          city: (
            <select
              className="h-9 max-w-[9rem] rounded-[8px] border border-border bg-elevated px-1 text-xs"
              defaultValue={e.cityId ?? ""}
              onChange={(ev) => {
                const reason = window.prompt("Reason to change city scope");
                if (reason && reason.trim().length >= 3) {
                  update.mutate({ id: e.id, cityId: ev.target.value || null, reason: reason.trim() });
                }
              }}
            >
              <option value="">All cities</option>
              {cityRows.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ),
          mfa: e.mfaReady ? <Badge tone="success">enrolled</Badge> : <Badge>not enrolled</Badge>,
          status: <StatusBadge value={e.status} />,
          act: (
            <div className="flex flex-wrap gap-1">
              {e.status === "ACTIVE" ? (
                <Button size="sm" variant="secondary" onClick={() => {
                  const reason = window.prompt("Reason to disable");
                  if (reason && reason.trim().length >= 3) update.mutate({ id: e.id, status: "DISABLED", reason: reason.trim() });
                }}>Disable</Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => {
                  const reason = window.prompt("Reason to activate");
                  if (reason && reason.trim().length >= 3) update.mutate({ id: e.id, status: "ACTIVE", reason: reason.trim() });
                }}>Activate</Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => {
                const reason = window.prompt(e.mfaReady ? "Reason to clear MFA" : "Reason to mark MFA enrolled (operator record, not a third-party authenticator)");
                if (reason && reason.trim().length >= 3) update.mutate({ id: e.id, mfaReady: !e.mfaReady, reason: reason.trim() });
              }}>{e.mfaReady ? "Clear MFA" : "Mark MFA"}</Button>
            </div>
          ),
        }))}
      />
      <Panel title="Invite employee">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="h-10 rounded-[10px] border border-border bg-elevated px-2" value={role} onChange={(e) => setRole(e.target.value)}>
            {SYSTEM_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
            ))}
          </select>
          <select className="h-10 rounded-[10px] border border-border bg-elevated px-2" value={cityId} onChange={(e) => setCityId(e.target.value)}>
            <option value="">All cities</option>
            {cityRows.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {role === "CUSTOM" ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {PERMISSIONS.map((p) => (
              <button
                key={p}
                type="button"
                className={`rounded-full border px-2 py-1 text-[10px] ${custom.includes(p) ? "border-primary bg-elevated" : "border-border text-muted"}`}
                onClick={() => setCustom((c) => (c.includes(p) ? c.filter((x) => x !== p) : [...c, p]))}
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}
        <Button className="mt-3" disabled={!email || !name} onClick={() => invite.mutate()}>Send invite</Button>
        <p className="mt-2 text-xs text-muted">They sign in with the same email. You are {emp?.email}. {PERMISSIONS.length} permissions in catalog. MFA is an operator record until an authenticator is connected.</p>
      </Panel>
    </div>
  );
}

function BrandingPage() {
  const q = useQuery({ queryKey: ["branding"], queryFn: () => loadBranding() });
  const inv = useInvalidate();
  const [patch, setPatch] = useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () => saveBrandingFn({ data: { patch, reason: "Update central branding" } }),
    onSuccess: (r) => { if (r.ok) { toast.success("Branding saved"); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const b = (q.data && q.data.ok ? q.data.data : null) as Record<string, string> | null;
  const fields = [
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
    ["favicon_svg", "Favicon SVG"],
  ];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Central branding</h1>
      <p className="text-sm text-muted">Change identity without rebuilding business logic.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([k, label]) => (
          <Field key={k} label={label}>
            <Input
              defaultValue={b?.[k] ?? ""}
              onChange={(e) => setPatch((p) => ({ ...p, [k]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
      <Button onClick={() => save.mutate()} disabled={!Object.keys(patch).length}>Save branding</Button>
    </div>
  );
}

function FlagsPage() {
  const q = useQuery({ queryKey: ["flags"], queryFn: () => loadFlags() });
  const inv = useInvalidate();
  const act = useMutation({
    mutationFn: (input: { key: string; state: string; rolloutPct: number }) =>
      setFlagFn({ data: { ...input, reason: `Toggle ${input.key}` } }),
    onSuccess: (r) => { if (r.ok) { toast.success("Flag updated"); inv(); } else toast.error(r.error); },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const rows = q.data && q.data.ok ? q.data.data : [];
  const keys = Array.from(new Set([...FEATURE_FLAG_KEYS, ...rows.map((r) => r.key)]));
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Feature flags</h1>
      <ul className="divide-y divide-border rounded-[24px] border border-border bg-surface">
        {keys.map((key) => {
          const row = rows.find((r) => r.key === key);
          const on = row?.state === "ON";
          return (
            <li key={key} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-mono text-sm">{key}</p>
                <p className="text-xs text-muted">{row?.notes ?? "Central flag"}</p>
              </div>
              <Button
                size="sm"
                variant={on ? "primary" : "secondary"}
                onClick={() => act.mutate({ key, state: on ? "OFF" : "ON", rolloutPct: on ? 0 : 100 })}
              >
                {on ? "ON" : "OFF"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SettingsPage() {
  const q = useQuery({ queryKey: ["settings"], queryFn: () => loadSettings() });
  const [s, setS] = useState<PlatformSettings | null>(null);
  const inv = useInvalidate();
  const save = useMutation({
    mutationFn: () => saveSettingsFn({ data: { settings: s ?? DEFAULT_SETTINGS, reason: "Update platform settings" } }),
    onSuccess: (r) => { if (r.ok) { toast.success("Saved"); inv(); } else toast.error(r.error); },
  });
  const data = q.data && q.data.ok ? q.data.data : null;
  const cur = s ?? data;
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  if (!cur) return <p className="text-muted">Loading…</p>;
  const set = (k: keyof PlatformSettings, v: number | boolean) =>
    setS({ ...cur, [k]: v });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">System settings</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Commission (bps)">
          <Input type="number" value={cur.commissionBps} onChange={(e) => set("commissionBps", Number(e.target.value))} />
        </Field>
        <Field label="Payment fee (bps)">
          <Input type="number" value={cur.paymentFeeBps} onChange={(e) => set("paymentFeeBps", Number(e.target.value))} />
        </Field>
        <Field label="Service fee (paise)">
          <Input type="number" value={cur.serviceFeePaise} onChange={(e) => set("serviceFeePaise", Number(e.target.value))} />
        </Field>
        <Field label="Rider base (paise)">
          <Input type="number" value={cur.riderBasePaise} onChange={(e) => set("riderBasePaise", Number(e.target.value))} />
        </Field>
        <Field label="Refund limit (paise)">
          <Input type="number" value={cur.refundLimitPaise} onChange={(e) => set("refundLimitPaise", Number(e.target.value))} />
        </Field>
        <Field label="Support SLA (minutes)">
          <Input type="number" value={cur.supportSlaMinutes} onChange={(e) => set("supportSlaMinutes", Number(e.target.value))} />
        </Field>
        <Field label="Offer timeout (seconds)">
          <Input type="number" value={cur.offerTimeoutSeconds} onChange={(e) => set("offerTimeoutSeconds", Number(e.target.value))} />
        </Field>
        <Field label="Cancellation window (minutes)">
          <Input type="number" value={cur.cancellationWindowMinutes} onChange={(e) => set("cancellationWindowMinutes", Number(e.target.value))} />
        </Field>
        <Field label="Rider distance (paise)">
          <Input type="number" value={cur.riderDistancePaise} onChange={(e) => set("riderDistancePaise", Number(e.target.value))} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={cur.otpRequired ? "primary" : "secondary"} onClick={() => set("otpRequired", !cur.otpRequired)}>
          OTP {cur.otpRequired ? "ON" : "OFF"}
        </Button>
        <Button size="sm" variant={cur.codEnabled ? "primary" : "secondary"} onClick={() => set("codEnabled", !cur.codEnabled)}>
          COD {cur.codEnabled ? "ON" : "OFF"}
        </Button>
      </div>
      <p className="text-xs text-muted">Commission, fees, and rider pay require <code>modify_financial_settings</code>. CEO cannot change them.</p>
      <Button onClick={() => save.mutate()}>Save high-risk settings</Button>
    </div>
  );
}

function NotificationsPage() {
  const q = useQuery({ queryKey: ["notifications"], queryFn: () => loadNotifications() });
  const inv = useInvalidate();
  const [channel, setChannel] = useState("push");
  const queue = useMutation({
    mutationFn: () => queueNotificationFn({ data: { channel, templateKey: "ops_broadcast", audience: "customers" } }),
    onSuccess: (r) => {
      if (r.ok) { toast.message(`Queued ${r.id} — not claimed delivered`); inv(); }
      else toast.error(r.error);
    },
  });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Notifications</h1>
          <p className="text-sm text-muted">Adapter statuses. Delivery is never claimed without provider confirmation.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 rounded-[10px] border border-border bg-elevated px-2 text-sm" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="push">Push</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <Button size="sm" onClick={() => queue.mutate()}>Queue (not send)</Button>
        </div>
      </header>
      <DataTable
        columns={[
          { key: "channel", label: "Channel" },
          { key: "template", label: "Template" },
          { key: "status", label: "Status" },
          { key: "conf", label: "Confirmed" },
        ]}
        rows={rows.map((n) => ({
          channel: n.channel,
          template: n.templateKey,
          status: n.status,
          conf: n.providerConfirmed ? "yes" : "no",
        }))}
      />
    </div>
  );
}

function AuditPage() {
  const [qtext, setQtext] = useState("");
  const q = useQuery({ queryKey: ["audit", qtext], queryFn: () => loadAudit({ data: { q: qtext || undefined } }) });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const rows = q.data && q.data.ok ? q.data.data : [];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Audit log</h1>
      <p className="text-sm text-muted">Append-only. There is no edit or delete API.</p>
      <SearchBox value={qtext} onChange={setQtext} placeholder="Action or target id" />
      <ul className="space-y-2">
        {rows.map((a) => (
          <li key={a.id} className="rounded-[16px] border border-border bg-surface p-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="font-mono text-xs">{a.action}</span>
              <span className="text-xs text-muted">{relativeTime(a.at ?? undefined)}</span>
            </div>
            <p className="text-xs text-muted">{a.roleKey} · {a.targetType} {a.targetId} {a.reason ? `· ${a.reason}` : ""}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HealthPage() {
  const q = useQuery({ queryKey: ["health"], queryFn: () => loadHealth() });
  if (q.data && !q.data.ok) return <Denied error={q.data.error} />;
  const d = q.data && q.data.ok ? q.data.data : null;
  if (!d) return <p className="text-muted">Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">System health</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(d)
          .filter(([k]) => k !== "label" && k !== "secretsExposed" && k !== "databaseLatencyMs")
          .map(([k, v]) => (
            <MetricCard key={k} label={k} value={String(v)} source={d.label} />
          ))}
      </div>
      <p className="text-xs text-muted">DB latency {d.databaseLatencyMs}ms. Secrets are not exposed.</p>
    </div>
  );
}

function Denied({ error }: { error: string }) {
  return (
    <div className="rounded-[24px] border border-border bg-surface p-6">
      <h2 className="font-display text-2xl">Not permitted</h2>
      <p className="mt-2 text-sm text-muted">{error}</p>
    </div>
  );
}
