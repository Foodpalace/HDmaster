import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/admin/customer-orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleCustomerOrderHttp } = await import("@/lib/roshoi/server/customer-order-http.server");
        return handleCustomerOrderHttp(request);
      },
    },
  },
});
