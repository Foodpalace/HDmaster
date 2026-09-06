import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_SETTINGS } from "./types.ts";
import { financialSettingsChanged } from "./settings.ts";
import { isFlagEnabled } from "./flags.ts";

describe("financial settings gate", () => {
  it("detects commission change", () => {
    assert.equal(financialSettingsChanged(DEFAULT_SETTINGS, DEFAULT_SETTINGS), false);
    assert.equal(
      financialSettingsChanged(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, commissionBps: 800 }),
      true,
    );
    assert.equal(
      financialSettingsChanged(DEFAULT_SETTINGS, { ...DEFAULT_SETTINGS, otpRequired: false }),
      false,
    );
  });
});

describe("feature flags", () => {
  it("ON is enabled, OFF is not, rollout <100 is not", () => {
    assert.equal(isFlagEnabled([{ key: "cod", state: "ON", rolloutPct: 100 }], "cod"), true);
    assert.equal(isFlagEnabled([{ key: "cod", state: "OFF", rolloutPct: 0 }], "cod"), false);
    assert.equal(
      isFlagEnabled([{ key: "cod", state: "ROLLOUT_PERCENTAGE", rolloutPct: 40 }], "cod"),
      false,
    );
    assert.equal(isFlagEnabled([], "cod"), false);
  });
});
