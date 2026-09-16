import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/v1/admin/orders/$id/rider-transition")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const body = (await request.json()) as {
          riderId: string;
          from: string;
          to: string;
          reason?: string;
          correlationId?: string;
          contractVersion?: string;
        };
        const idempotencyKey = request.headers.get("Idempotency-Key") ?? "";
        const { handleRiderOrderTransition } = await import("@/lib/roshoi/server/rider-http.server");
        return handleRiderOrderTransition(request, {
          orderId: params.id,
          riderId: body.riderId,
          from: body.from as never,
          to: body.to as never,
          reason: body.reason,
          idempotencyKey,
          correlationId: body.correlationId,
        });
      },
    },
  },
});
