import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

function createApplicationRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) =>
        query.meta?.visibility === "public" && query.state.status === "success",
    },
  });
  return router;
}
// Never share a router/query cache between SSR requests. Keep the browser's
// instance across navigations so query state and commerce UI remain continuous.
let clientRouter: ReturnType<typeof createApplicationRouter> | undefined;
export function getRouter() {
  if (typeof window !== "undefined")
    return (clientRouter ??= createApplicationRouter());
  return createApplicationRouter();
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
