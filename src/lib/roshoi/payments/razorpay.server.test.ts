import { createHmac } from "node:crypto";
import { describe, expect, it } from "node:test";
import { verifyCheckoutSignature, verifyWebhookSignature } from "./razorpay.server";

describe("Razorpay signature verification", () => {
  it("accepts a valid checkout signature", () => {
    process.env.RAZORPAY_KEY_SECRET = "test-secret";
    const signature = createHmac("sha256", "test-secret").update("order_1|pay_1").digest("hex");
    expect(verifyCheckoutSignature({ orderId: "order_1", paymentId: "pay_1", signature })).toBe(true);
  });

  it("rejects a tampered checkout signature", () => {
    process.env.RAZORPAY_KEY_SECRET = "test-secret";
    expect(verifyCheckoutSignature({ orderId: "order_1", paymentId: "pay_1", signature: "0".repeat(64) })).toBe(false);
  });

  it("accepts the exact raw webhook body signature", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "webhook-secret";
    const body = JSON.stringify({ id: "evt_1", event: "payment.captured" });
    const signature = createHmac("sha256", "webhook-secret").update(body).digest("hex");
    expect(verifyWebhookSignature(body, signature)).toBe(true);
    expect(verifyWebhookSignature(body + " ", signature)).toBe(false);
  });
});
