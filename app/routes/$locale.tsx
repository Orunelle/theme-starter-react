import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import {
  StorefrontProvider,
  type StorefrontContext,
} from "@orunelle/theme-sdk";
import { resolveTheme } from "@orunelle/theme-engine";
import definition from "../theme";

const theme = resolveTheme(definition);
export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params, context }) => {
    if (params.locale !== "en" && params.locale !== "ar") throw notFound();
    const storefront: StorefrontContext = {
      ...context.storefront,
      locale: params.locale,
      ...(context.storefront.commerce !== "api"
        ? {
            currency: "USD",
            market: "US",
            store: {
              ...context.storefront.store,
              name: { en: "Metropolitan Demo", ar: "متروبوليتان التجريبي" },
            },
          }
        : {}),
      ...(context.storefront.commerce === "fixture" &&
      !context.storefront.configuration &&
      theme.defaults
        ? {
            configuration: {
              ...theme.defaults,
              installationId: "00000000-0000-4000-8000-000000000001",
            },
          }
        : {}),
    };
    return { storefront };
  },
  component: LocalizedStorefront,
});
function LocalizedStorefront() {
  const { storefront } = Route.useRouteContext();
  const { Layout } = theme.components;
  return (
    <StorefrontProvider
      theme={theme}
      storefront={storefront}
      configuration={storefront.configuration}
      media={storefront.media}
    >
      <Layout>
        <Outlet />
      </Layout>
    </StorefrontProvider>
  );
}
