import type { PlatformSettings } from "./types";

/** Fields that move money. Changing them requires `modify_financial_settings`. */
export const FINANCIAL_SETTING_KEYS = [
  "commissionBps",
  "paymentFeeBps",
  "serviceFeePaise",
  "riderBasePaise",
  "riderDistancePaise",
  "refundLimitPaise",
] as const satisfies readonly (keyof PlatformSettings)[];

export function financialSettingsChanged(prev: PlatformSettings, next: PlatformSettings): boolean {
  return FINANCIAL_SETTING_KEYS.some((k) => prev[k] !== next[k]);
}
