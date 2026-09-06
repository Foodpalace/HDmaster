import { createFileRoute } from "@tanstack/react-router";
import { ModuleView } from "@/components/command/pages";

export const Route = createFileRoute("/app/$module")({
  component: ModuleScreen,
});

function ModuleScreen() {
  const { module } = Route.useParams();
  return <ModuleView module={module} />;
}
