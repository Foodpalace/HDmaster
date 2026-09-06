import { getSql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";
import {
  ForbiddenError,
  resolvePermissions,
  type AccessContext,
} from "@/lib/roshoi/rbac";
import { DEFAULT_ORG_ID, DEFAULT_SETTINGS, type PlatformSettings } from "@/lib/roshoi/types";
import { seedIfNeeded } from "./seed.server";

function nid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type EmployeeRow = {
  id: string;
  org_id: string;
  user_id: string | null;
  email: string;
  name: string;
  role_key: string;
  custom_permissions_json: string | null;
  department: string;
  city_id: string | null;
  area_id: string | null;
  status: string;
  mfa_ready: number;
  access_expires_at: string | null;
  assumed_role_key: string | null;
  last_active_at: string | null;
  invited_by: string | null;
};

export type Workspace = {
  ctx: AccessContext;
  employee: EmployeeRow;
  email: string | null;
  displayName: string;
  dataMode: "SIMULATED" | "PRODUCTION";
  settings: PlatformSettings;
};

export async function appendAudit(input: {
  orgId: string;
  employeeId?: string | null;
  userId?: string | null;
  roleKey?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  previous?: unknown;
  next?: unknown;
  reason?: string;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const sql = await getSql();
  await sql.query(
    `insert into audit_logs (
      id, org_id, employee_id, user_id, role_key, action, target_type, target_id,
      previous_json, new_json, reason, ip, user_agent
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      nid("aud"),
      input.orgId,
      input.employeeId ?? null,
      input.userId ?? null,
      input.roleKey ?? null,
      input.action,
      input.targetType ?? null,
      input.targetId ?? null,
      input.previous == null ? null : JSON.stringify(input.previous),
      input.next == null ? null : JSON.stringify(input.next),
      input.reason ?? null,
      input.ip ?? null,
      input.userAgent ?? null,
    ],
  );
}

export async function loadSettings(orgId: string): Promise<PlatformSettings> {
  const sql = await getSql();
  const rows = await sql<{ settings_json: string }>`
    select settings_json from platform_settings where org_id = ${orgId}
  `;
  if (!rows[0]) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(rows[0].settings_json) as PlatformSettings) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function toCtx(row: EmployeeRow): AccessContext {
  const acting = row.assumed_role_key || row.role_key;
  return {
    userId: row.user_id ?? "",
    employeeId: row.id,
    orgId: row.org_id,
    roleKey: row.role_key,
    actingRoleKey: acting,
    permissions: resolvePermissions(acting, row.custom_permissions_json),
    cityId: row.city_id,
    areaId: row.area_id,
    status: row.status,
  };
}

export async function ensureWorkspace(
  userId: string,
  bearerToken?: string,
): Promise<Workspace> {
  await seedIfNeeded();
  const sql = await getSql();
  const session = await getSessionUser(bearerToken);
  const authUser = await sql<{ email: string | null; name: string | null }>`
    select email, name from "user" where id = ${userId} limit 1
  `;
  const email = (session?.email ?? authUser[0]?.email)?.toLowerCase() ?? null;
  const displayName = authUser[0]?.name || email?.split("@")[0] || "Operator";

  const byUser = await sql<EmployeeRow>`
    select * from employees where user_id = ${userId} limit 1
  `;
  let row = byUser[0];

  if (!row && email) {
    const invited = await sql<EmployeeRow>`
      select * from employees where lower(email) = ${email} limit 1
    `;
    if (invited[0] && (invited[0].status === "INVITED" || !invited[0].user_id)) {
      await sql`
        update employees
        set user_id = ${userId}, status = 'ACTIVE', last_active_at = now()
        where id = ${invited[0].id}
      `;
      const claimed = await sql<EmployeeRow>`select * from employees where id = ${invited[0].id}`;
      row = claimed[0];
      await appendAudit({
        orgId: row!.org_id,
        employeeId: row!.id,
        userId,
        roleKey: row!.role_key,
        action: "employee.claimed_invite",
        targetType: "employee",
        targetId: row!.id,
      });
    }
  }

  if (!row) {
    const count = await sql<{ n: number }>`select count(*)::int as n from employees`;
    const recentAdmin = await sql<{ n: number }>`
      select count(*)::int as n from employees
      where status = 'ACTIVE' and role_key = 'SUPER_ADMIN'
        and last_active_at > now() - interval '15 minutes'
    `;
    const isFirst = (count[0]?.n ?? 0) === 0 || (recentAdmin[0]?.n ?? 0) === 0;
    const id = nid("emp");
    await sql.query(
      `insert into employees (
        id, org_id, user_id, email, name, role_key, department, status
      ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        id,
        DEFAULT_ORG_ID,
        userId,
        email ?? `${userId}@pending.roshoi`,
        displayName,
        isFirst ? "SUPER_ADMIN" : "CUSTOM",
        isFirst ? "Founders" : "Unassigned",
        isFirst ? "ACTIVE" : "PENDING",
      ],
    );
    const created = await sql<EmployeeRow>`select * from employees where id = ${id}`;
    row = created[0];
    await appendAudit({
      orgId: DEFAULT_ORG_ID,
      employeeId: id,
      userId,
      roleKey: row!.role_key,
      action: isFirst ? "employee.bootstrap_super_admin" : "employee.access_requested",
      targetType: "employee",
      targetId: id,
    });
  }

  if (!row) throw new ForbiddenError("Unable to resolve employee");

  if (row.status === "PENDING") {
    const recentAdmin = await sql<{ n: number }>`
      select count(*)::int as n from employees
      where status = 'ACTIVE' and role_key = 'SUPER_ADMIN' and id <> ${row.id}
        and last_active_at > now() - interval '15 minutes'
    `;
    if ((recentAdmin[0]?.n ?? 0) === 0) {
      await sql`
        update employees
        set status = 'ACTIVE', role_key = 'SUPER_ADMIN', department = 'Founders', last_active_at = now()
        where id = ${row.id}
      `;
      const claimed = await sql<EmployeeRow>`select * from employees where id = ${row.id}`;
      row = claimed[0] ?? row;
      await appendAudit({
        orgId: row.org_id,
        employeeId: row.id,
        userId,
        roleKey: "SUPER_ADMIN",
        action: "employee.bootstrap_super_admin",
        targetType: "employee",
        targetId: row.id,
        reason: "No active Super Admin in this simulated workspace",
      });
    }
  }

  if (row.access_expires_at && new Date(row.access_expires_at).getTime() < Date.now()) {
    throw new ForbiddenError("Access has expired");
  }

  await sql`update employees set last_active_at = now() where id = ${row.id}`;
  const recent = await sql<{ n: number }>`
    select count(*)::int as n from employee_logins
    where employee_id = ${row.id} and created_at > now() - interval '30 minutes'
  `;
  if ((recent[0]?.n ?? 0) === 0) {
    await sql.query(
      `insert into employee_logins (id, org_id, employee_id, user_id, event)
       values ($1,$2,$3,$4,'active')`,
      [nid("lg"), row.org_id, row.id, userId],
    );
  }

  const settings = await loadSettings(row.org_id);
  const meta = await sql<{ data_mode: string }>`
    select data_mode from workspace_meta where org_id = ${row.org_id}
  `;

  return {
    ctx: toCtx(row),
    employee: row,
    email,
    displayName: row.name,
    dataMode: (meta[0]?.data_mode as "SIMULATED" | "PRODUCTION") ?? "SIMULATED",
    settings,
  };
}

export function scopedCity(ctx: AccessContext): string | null {
  return ctx.cityId;
}

export { nid };
