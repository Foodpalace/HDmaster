import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 15_000, retry: 1 } },
  });
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    context: { queryClient },
  });
}
