import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/admin/customer-orders/$id/cancel")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { handleCustomerOrderCancelHttp } = await import("@/lib/roshoi/server/customer-order-http.server");
        return handleCustomerOrderCancelHttp(request, params.id);
      },
    },
  },
});
