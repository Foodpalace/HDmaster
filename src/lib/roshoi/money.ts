/**
 * Safe money helpers — all values in integer paise.
 * Never use floating point for money.
 */

export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaise(paise: number): number {
  return paise / 100;
}

export function formatPaise(paise: number, locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(fromPaise(paise));
}

export function safeAdd(...values: number[]): number {
  return values.reduce((sum, v) => sum + Math.round(v), 0);
}

export function safeSubtract(a: number, b: number): number {
  return Math.round(a) - Math.round(b);
}

export function percentOf(paise: number, bps: number): number {
  return Math.round((paise * bps) / 10000);
}
