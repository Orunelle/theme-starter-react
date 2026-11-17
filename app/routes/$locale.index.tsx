import { createFileRoute } from "@tanstack/react-router";
import { useThemeComponents } from "@orunelle/theme-sdk";
import { pageQuery } from "../lib/catalog";

export const Route = createFileRoute("/$locale/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      pageQuery(context.storefront, {
        kind: "home",
        locale: context.storefront.locale,
      }),
    ),
  component: Catalog,
});
function Catalog() {
  const { HomePage } = useThemeComponents();
  const data = Route.useLoaderData();
  return data.kind === "catalog" ? (
    <HomePage products={data.products} resources={data.resources} />
  ) : null;
}
