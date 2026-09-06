import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/admin/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { handleAdminHttp } = await import("@/lib/roshoi/server/admin-http.server");
        return handleAdminHttp(request, params as Record<string, string | undefined>);
      },
      POST: async ({ request, params }) => {
        const { handleAdminHttp } = await import("@/lib/roshoi/server/admin-http.server");
        return handleAdminHttp(request, params as Record<string, string | undefined>);
      },
    },
  },
});
