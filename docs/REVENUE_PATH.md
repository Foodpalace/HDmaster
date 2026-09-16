# Roshoi Revenue Path

HDmaster is the authoritative backend for the money path.

## Razorpay configuration

The live gateway adapter uses these server-only environment variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `ROSHOI_SERVICE_TOKEN`

Never expose the key secret, webhook secret, or service token to a browser bundle.

The payment flow is:

1. HDmaster creates a Razorpay order for the exact order total in paise.
2. Customer completes Checkout using the payment methods enabled on the Razorpay account (UPI and cards are supported by Razorpay Checkout).
3. The customer callback signature is verified server-side.
4. Razorpay webhooks are verified against the raw request body.
5. Duplicate webhook event IDs are ignored.
6. Only a captured payment changes HDmaster `orders.payment_status` to `PAID`.
7. A journal entry is created once for the captured payment.
8. Restaurant acceptance remains a separate canonical order transition; payment success never auto-accepts an order.

Razorpay's current documentation requires an Orders API order before Checkout and server-side signature verification; webhooks should be used for asynchronous payment state. UPI Collect is deprecated for most new integrations from 28 February 2026, so Roshoi should use the supported UPI Checkout/Intent path rather than building a new VPA Collect flow.

## Production gate

Real-money launch remains blocked until the following are verified in the deployed environment:

- Live Razorpay keys are configured and the merchant account is live-enabled.
- Webhook URL is configured with the exact `RAZORPAY_WEBHOOK_SECRET`.
- A real test transaction reaches `payment.captured` and creates exactly one payment journal.
- Order amount is unchanged between HDmaster and Razorpay.
- Duplicate webhook delivery is harmless.
- Refund and settlement flows are verified against real gateway records.
- Customer, partner, and rider applications use HDmaster order IDs and canonical transitions rather than local authoritative order state.
