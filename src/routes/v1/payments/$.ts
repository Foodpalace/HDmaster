import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/payments/$")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { handlePaymentHttp } = await import("@/lib/roshoi/server/payment-http.server");
        return handlePaymentHttp(request, params as Record<string, string | undefined>);
      },
    },
  },
});
