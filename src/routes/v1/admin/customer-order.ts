import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/admin/customer-order")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleCustomerOrderReadHttp } = await import("@/lib/roshoi/server/customer-order-read-http.server");
        return handleCustomerOrderReadHttp(request);
      },
    },
  },
});
