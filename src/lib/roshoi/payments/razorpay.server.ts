import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.razorpay.com/v1";

type RazorpayOrder = {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
};

type RazorpayPayment = {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method: string;
  error_code?: string | null;
  error_description?: string | null;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${required("RAZORPAY_KEY_ID")}:${required("RAZORPAY_KEY_SECRET")}`).toString("base64")}`;
}

async function razorpay<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: { description: text.slice(0, 500) } };
  }
  if (!response.ok) {
    const message =
      body && typeof body === "object" && body !== null && "error" in body &&
      typeof (body as { error?: { description?: unknown } }).error?.description === "string"
        ? (body as { error: { description: string } }).error.description
        : `Razorpay HTTP ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
  idempotencyKey?: string;
}): Promise<RazorpayOrder> {
  if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise <= 0) {
    throw new Error("Payment amount must be a positive integer number of paise");
  }
  return razorpay<RazorpayOrder>("/orders", {
    method: "POST",
    headers: input.idempotencyKey ? { "X-Razorpay-Idempotency-Key": input.idempotencyKey } : undefined,
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
    }),
  });
}

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  if (!paymentId.trim()) throw new Error("paymentId is required");
  return razorpay<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`, { method: "GET" });
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = required("RAZORPAY_KEY_SECRET");
  const expected = createHmac("sha256", secret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = required("RAZORPAY_WEBHOOK_SECRET");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

function safeEqualHex(expected: string, received: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(received, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export type { RazorpayOrder, RazorpayPayment };
