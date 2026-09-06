import type { FeatureFlagKey, FlagState } from "./types";

export type RuntimeFlag = {
  key: string;
  state: FlagState | string;
  rolloutPct: number;
};

export function isFlagEnabled(flags: readonly RuntimeFlag[], key: FeatureFlagKey | string): boolean {
  const f = flags.find((x) => x.key === key);
  if (!f) return false;
  if (f.state === "ON") return true;
  if (f.state === "OFF") return false;
  if (f.state === "ROLLOUT_PERCENTAGE") return (f.rolloutPct ?? 0) >= 100;
  return false;
}

export function flagGateMessage(flags: readonly RuntimeFlag[], key: FeatureFlagKey | string): string | null {
  if (isFlagEnabled(flags, key)) return null;
  return `Feature flag "${key}" is OFF. This action is blocked until an operator turns it on.`;
}
