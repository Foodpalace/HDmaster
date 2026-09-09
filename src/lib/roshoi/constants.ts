/**
 * Shared constants for Roshoi Core
 */

export const PAISA_PER_RUPEE = 100;

export const DEFAULT_COMMISSION_BPS = 1000; // 10%
export const DEFAULT_PAYMENT_FEE_BPS = 180; // 1.8%
export const DEFAULT_SERVICE_FEE_PAISE = 500; // ₹5

export const ORDER_TIMEOUT_SECONDS = 30;
export const CANCELLATION_WINDOW_MINUTES = 8;

export const DATA_MODES = ["SIMULATED", "SANDBOX", "LIVE"] as const;
export type DataModeStrict = (typeof DATA_MODES)[number];
