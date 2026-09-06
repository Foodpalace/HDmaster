import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowedAiTools,
  canAccessResource,
  canUseAiTool,
  denyAiLeakage,
  hasPermission,
  requireHighRisk,
  requirePermission,
  resolvePermissions,
  ForbiddenError,
  type AccessContext,
} from "./rbac.ts";
import { ROLE_PRESETS } from "./permissions.ts";

function ctx(partial: Partial<AccessContext> & { actingRoleKey: string }): AccessContext {
  const role = partial.actingRoleKey;
  return {
    userId: partial.userId ?? "u1",
    employeeId: partial.employeeId ?? "e1",
    orgId: partial.orgId ?? "org_roshoi",
    roleKey: partial.roleKey ?? role,
    actingRoleKey: role,
    permissions: partial.permissions ?? resolvePermissions(role),
    cityId: partial.cityId ?? null,
    areaId: partial.areaId ?? null,
    status: partial.status ?? "ACTIVE",
  };
}

describe("RBAC", () => {
  it("TEST 1: support cannot access CEO financial dashboard", () => {
    const support = ctx({ actingRoleKey: "CUSTOMER_SUPPORT" });
    assert.equal(hasPermission(support, "access_CEO_dashboard"), false);
    assert.equal(hasPermission(support, "view_finance"), false);
    assert.throws(() => requirePermission(support, "access_CEO_dashboard"), ForbiddenError);
  });

  it("TEST 2: area manager cannot read another city", () => {
    const manager = ctx({ actingRoleKey: "AREA_MANAGER", cityId: "city_karimganj" });
    assert.equal(
      canAccessResource(manager, "view_orders", {
        orgId: "org_roshoi",
        cityId: "city_silchar",
      }),
      false,
    );
    assert.equal(
      canAccessResource(manager, "view_orders", {
        orgId: "org_roshoi",
        cityId: "city_karimganj",
      }),
      true,
    );
  });

  it("TEST 3: finance cannot change commission", () => {
    const finance = ctx({ actingRoleKey: "FINANCE" });
    assert.equal(hasPermission(finance, "view_finance"), true);
    assert.equal(hasPermission(finance, "modify_financial_settings"), false);
    assert.throws(
      () => requirePermission(finance, "modify_financial_settings"),
      ForbiddenError,
    );
  });

  it("TEST 4: support cannot change another employee's permissions", () => {
    const support = ctx({ actingRoleKey: "CUSTOMER_SUPPORT" });
    assert.equal(hasPermission(support, "manage_roles"), false);
    assert.equal(hasPermission(support, "manage_users"), false);
  });

  it("TEST 5: cross-organization access fails", () => {
    const admin = ctx({ actingRoleKey: "SUPER_ADMIN", orgId: "org_roshoi" });
    assert.equal(
      canAccessResource(admin, "view_orders", { orgId: "org_other" }),
      false,
    );
  });

  it("TEST 6: AI tools respect permissions", () => {
    const support = ctx({ actingRoleKey: "CUSTOMER_SUPPORT" });
    assert.equal(canUseAiTool(support, "get_financial_metrics"), false);
    assert.equal(canUseAiTool(support, "get_ceo_brief"), false);
    assert.equal(canUseAiTool(support, "get_order"), true);
    assert.ok(denyAiLeakage(support, "Where are we losing money?"));
    const ceo = ctx({ actingRoleKey: "CEO" });
    assert.equal(canUseAiTool(ceo, "get_ceo_brief"), true);
    assert.equal(canUseAiTool(ceo, "get_financial_metrics"), true);
    assert.ok(allowedAiTools(support).every((t) => t !== "get_ceo_brief"));
    const analyst = ctx({ actingRoleKey: "ANALYST" });
    assert.equal(hasPermission(analyst, "access_AI"), false);
    assert.equal(canUseAiTool(analyst, "get_order"), false);
    assert.equal(canUseAiTool(analyst, "get_dashboard"), true);
  });

  it("TEST 7: unauthorized refund fails", () => {
    const analyst = ctx({ actingRoleKey: "ANALYST" });
    assert.equal(hasPermission(analyst, "issue_refunds"), false);
    assert.throws(() => requirePermission(analyst, "issue_refunds"), ForbiddenError);
  });

  it("TEST 8: audit log alteration is not exposed", async () => {
    const { readFile } = await import("node:fs/promises");
    const files = [
      "src/lib/roshoi/server/queries.server.ts",
      "src/lib/roshoi/server/workspace.server.ts",
      "src/lib/roshoi/actions.ts",
      "src/lib/roshoi/server/admin-http.server.ts",
    ];
    for (const file of files) {
      const src = await readFile(new URL(`../../../${file}`, import.meta.url), "utf8");
      assert.doesNotMatch(src, /update\s+audit_logs/i);
      assert.doesNotMatch(src, /delete\s+from\s+audit_logs/i);
    }
    const migration = await readFile(
      new URL("../../../migrations/0002_roshoi_command.sql", import.meta.url),
      "utf8",
    );
    assert.match(migration, /create table if not exists audit_logs/);
    assert.doesNotMatch(migration, /on update|on delete cascade.*audit/i);
  });

  it("HTTP admin family documents refund, cancel, dispatch, and append-only audit", async () => {
    const { readFile } = await import("node:fs/promises");
    const src = await readFile(
      new URL("../../../src/lib/roshoi/server/admin-http.server.ts", import.meta.url),
      "utf8",
    );
    assert.match(src, /Idempotency-Key/);
    assert.match(src, /action: "refund"/);
    assert.match(src, /dispatch\/reassign/);
    assert.match(src, /Audit log is append-only/);
  });

  it("high-risk actions require a reason", () => {
    const admin = ctx({ actingRoleKey: "SUPER_ADMIN" });
    assert.throws(() => requireHighRisk(admin, "issue_refunds", ""), ForbiddenError);
    assert.throws(() => requireHighRisk(admin, "issue_refunds", "no"), ForbiddenError);
    requireHighRisk(admin, "issue_refunds", "duplicate charge confirmed");
  });

  it("inactive employees have no permissions", () => {
    const inactive = ctx({ actingRoleKey: "SUPER_ADMIN", status: "DISABLED" });
    assert.equal(hasPermission(inactive, "view_orders"), false);
  });

  it("CEO has executive perms but not user management", () => {
    const ceo = ctx({ actingRoleKey: "CEO" });
    assert.equal(hasPermission(ceo, "access_CEO_dashboard"), true);
    assert.equal(hasPermission(ceo, "manage_users"), false);
  });

  it("custom role only gets listed permissions", () => {
    const custom = ctx({
      actingRoleKey: "CUSTOM",
      permissions: resolvePermissions("CUSTOM", JSON.stringify(["view_orders"])),
    });
    assert.equal(hasPermission(custom, "view_orders"), true);
    assert.equal(hasPermission(custom, "view_finance"), false);
  });

  it("unknown permissions in custom JSON are dropped", () => {
    const perms = resolvePermissions("CUSTOM", JSON.stringify(["view_orders", "drop_table"]));
    assert.deepEqual(perms, ["view_orders"]);
  });

  it("ROLE_PRESETS: finance cannot modify settings", () => {
    assert.ok(!ROLE_PRESETS.FINANCE.includes("modify_financial_settings"));
    assert.ok(ROLE_PRESETS.SUPER_ADMIN.includes("modify_financial_settings"));
  });
});
