import { createFileRoute } from "@tanstack/react-router";
import { ModuleView } from "@/components/command/pages";

export const Route = createFileRoute("/app/$module/$id")({
  component: ModuleDetailScreen,
});

function ModuleDetailScreen() {
  const { module, id } = Route.useParams();
  return <ModuleView module={module} id={id} />;
}
