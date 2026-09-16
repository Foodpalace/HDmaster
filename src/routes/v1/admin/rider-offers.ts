import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/admin/rider-offers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleRiderOffersHttp } = await import("@/lib/roshoi/server/rider-dispatch-http.server");
        return handleRiderOffersHttp(request);
      },
      POST: async ({ request }) => {
        const { handleRiderOffersHttp } = await import("@/lib/roshoi/server/rider-dispatch-http.server");
        return handleRiderOffersHttp(request);
      },
    },
  },
});
