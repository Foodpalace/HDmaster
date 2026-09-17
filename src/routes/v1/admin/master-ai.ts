import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/admin/master-ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleMasterAiHttp } = await import("@/lib/roshoi/server/master-ai-http.server");
        return handleMasterAiHttp(request);
      },
    },
  },
});
