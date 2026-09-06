import { useEffect, useState, type CSSProperties } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bike,
  Calculator,
  ChartNoAxesColumn,
  Command as CommandIcon,
  Crown,
  FileText,
  Flag,
  Gift,
  IdCard,
  LayoutDashboard,
  LifeBuoy,
  Map,
  Megaphone,
  Menu,
  Palette,
  PanelsTopLeft,
  Percent,
  Radio,
  Receipt,
  Scale,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Utensils,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { bootstrapSession, updateEmployeeFn } from "@/lib/roshoi/actions";
import { NAV, itemAllowed } from "@/lib/roshoi/nav";
import { t, type Locale } from "@/lib/roshoi/i18n";
import { parseCommand, intentPath } from "@/lib/roshoi/search";
import { ROLE_LABELS, SYSTEM_ROLES } from "@/lib/roshoi/permissions";
import { RoshoiMark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ICONS = {
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
  alert: AlertTriangle,
  spark: Sparkles,
  id: IdCard,
  palette: Palette,
  flag: Flag,
  settings: Settings,
  bell: Bell,
  scroll: ScrollText,
  activity: Activity,
};

export type EmployeeSession = NonNullable<Extract<Awaited<ReturnType<typeof bootstrapSession>>, { ok: true }>>["employee"];

export function CommandShell() {
  const { user, isPending } = useCurrentUserState();
  const [locale, setLocale] = useState<Locale>("en");
  const [navOpen, setNavOpen] = useState(false);
  const [cmd, setCmd] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();

  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => bootstrapSession(),
    enabled: Boolean(user),
  });

  const assume = useMutation({
    mutationFn: (role: string | null) => {
      const emp =
        session.data && session.data.ok ? session.data.employee : null;
      if (!emp) throw new Error("No employee session");
      return updateEmployeeFn({
        data: {
          id: emp.id,
          assumedRoleKey: role,
          reason: role ? `View as ${role}` : "Exit role preview",
        },
      });
    },
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("Role view updated");
        void qc.invalidateQueries();
      } else toast.error(res.error);
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (isPending || (user && session.isPending)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-muted">
        <RoshoiMark className="size-10" />
        <p className="font-display text-xl text-fg">Roshoi Command</p>
        <div className="h-24 w-72 animate-pulse rounded-[24px] bg-surface" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const payload = session.data && session.data.ok ? session.data : null;
  const employee = payload?.employee;
  if (session.data && !session.data.ok) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg p-6 text-fg">
        <div className="max-w-md rounded-[24px] border border-border bg-surface p-6">
          <h1 className="font-display text-2xl">Cannot enter Command</h1>
          <p className="mt-2 text-sm text-muted">{session.data.error}</p>
        </div>
      </main>
    );
  }
  if (employee && employee.status === "PENDING") {
    return (
      <main className="grid min-h-screen place-items-center bg-bg p-6 text-fg">
        <div className="max-w-md rounded-[24px] border border-border bg-surface p-6">
          <RoshoiMark className="size-10" />
          <h1 className="mt-4 font-display text-2xl">Access pending</h1>
          <p className="mt-2 text-sm text-muted">
            Your account is waiting for an administrator invite. The first person to sign in becomes Super Admin;
            later employees must be invited.
          </p>
          <div className="mt-6">
            <UserButton />
          </div>
        </div>
      </main>
    );
  }

  const perms = employee?.permissions ?? [];
  const groups = NAV.map((g) => ({
    ...g,
    items: g.items.filter((it) => itemAllowed(it, perms) || employee?.actingRoleKey === "SUPER_ADMIN"),
  })).filter((g) => g.items.length);

  const brand = payload?.branding as Record<string, string> | null;
  const appName = brand?.admin_branding || brand?.app_name || "Roshoi Command";

  const runCommand = () => {
    const intent = parseCommand(cmd);
    const path = intentPath(intent);
    setCmdOpen(false);
    setCmd("");
    const [pathname, qs] = path.split("?");
    const search = Object.fromEntries(new URLSearchParams(qs ?? ""));
    void navigate({ to: (pathname || "/app") as "/app", search });
  };

  const cssVars = brand
    ? ({
        ["--color-bg" as string]: brand.color_bg,
        ["--color-fg" as string]: brand.color_fg,
        ["--color-primary" as string]: brand.color_primary,
        ["--color-primary-fg" as string]: brand.color_primary_fg,
        ["--color-accent" as string]: brand.color_accent,
      } as CSSProperties)
    : undefined;

  return (
    <div className="min-h-screen bg-bg text-fg" style={cssVars}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-fg">
        Skip to content
      </a>
      {employee?.dataMode === "SIMULATED" ? (
        <div className="sim-banner px-4 py-2 text-center text-xs">
          Simulated / development data — not production marketplace activity. Windows 1–3 are not connected yet.
        </div>
      ) : null}
      {employee?.assumedRoleKey && employee.assumedRoleKey !== employee.roleKey ? (
        <div className="flex items-center justify-center gap-3 bg-info/20 px-4 py-2 text-xs">
          Viewing as {ROLE_LABELS[employee.assumedRoleKey] ?? employee.assumedRoleKey}. Mutations use this role’s
          permissions.
          <button className="underline" type="button" onClick={() => assume.mutate(null)}>
            Exit
          </button>
        </div>
      ) : null}

      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-border bg-surface p-4 transition-transform md:static md:translate-x-0",
            navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <Link to="/app" className="flex items-center gap-2" onClick={() => setNavOpen(false)}>
              <RoshoiMark className="size-8" />
              <div>
                <p className="font-display text-base leading-none">{appName}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted">Command</p>
              </div>
            </Link>
            <button className="md:hidden" type="button" onClick={() => setNavOpen(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="space-y-5">
            {groups.map((g) => (
              <div key={g.id}>
                <p className="mb-1 px-2 text-[10px] uppercase tracking-[0.16em] text-subtle">{t(locale, g.i18n)}</p>
                <ul className="space-y-0.5">
                  {g.items.map((item) => {
                    const Icon = ICONS[item.icon];
                    const active = item.path === "/app" ? pathname === "/app" : pathname.startsWith(item.path);
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.path}
                          onClick={() => setNavOpen(false)}
                          className={cn(
                            "flex min-h-11 items-center gap-2 rounded-[10px] px-2 text-sm",
                            active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg",
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          {t(locale, item.i18n)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/90 px-3 py-2 backdrop-blur md:px-6">
            <button type="button" className="grid size-11 place-items-center md:hidden" onClick={() => setNavOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="flex min-h-11 flex-1 items-center gap-2 rounded-[12px] border border-border bg-elevated px-3 text-left text-sm text-muted"
            >
              <CommandIcon className="size-4" />
              <span className="hidden sm:inline">Search Command</span>
              <span className="ml-auto hidden text-xs text-subtle sm:inline">⌘K</span>
            </button>
            <select
              aria-label="Language"
              className="h-10 rounded-[10px] border border-border bg-elevated px-2 text-xs"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
            >
              <option value="en">EN</option>
              <option value="bn">বাংলা</option>
              <option value="as">অসমীয়া</option>
              <option value="hi">हिन्दी</option>
            </select>
            {employee && (employee.roleKey === "SUPER_ADMIN" || employee.permissions.includes("assume_role")) ? (
              <select
                aria-label="View as role"
                className="hidden h-10 max-w-[9rem] rounded-[10px] border border-border bg-elevated px-2 text-xs md:block"
                value={employee.assumedRoleKey ?? employee.roleKey}
                onChange={(e) => assume.mutate(e.target.value === employee.roleKey ? null : e.target.value)}
              >
                {SYSTEM_ROLES.filter((r) => r !== "CUSTOM").map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            ) : null}
            <div className="hidden items-center gap-2 md:flex">
              <div className="text-right">
                <p className="text-xs text-muted">{employee ? ROLE_LABELS[employee.actingRoleKey] : ""}</p>
                <p className="text-sm">{employee?.name}</p>
              </div>
              <UserButton />
            </div>
            <div className="md:hidden">
              <UserButton />
            </div>
          </header>
          <main id="main" className="flex-1 px-3 py-4 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>

      {cmdOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-start bg-bg/70 p-4 pt-[15vh]" onClick={() => setCmdOpen(false)}>
          <div
            className="w-full max-w-lg rounded-[20px] border border-border bg-surface p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runCommand();
              }}
            >
              <Input
                autoFocus
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                placeholder="Find delayed orders today…"
              />
            </form>
            <p className="mt-2 text-xs text-muted">Natural-language search respects your permissions.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function useEmployee() {
  const q = useQuery({ queryKey: ["session"], queryFn: () => bootstrapSession() });
  return q.data && q.data.ok ? q.data.employee : null;
}
