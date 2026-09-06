import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/command/pages";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});
