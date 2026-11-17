import { createFileRoute } from "@tanstack/react-router";
import { pageQuery } from "../lib/catalog";
import { ProductListPage } from "../components/product/ProductListPage";
import { CollectionListPage } from "../components/collection/CollectionListPage";
import { PageSingle } from "../components/page/PageSingle";
import { pageSearch } from "../lib/publicPage";
export const Route = createFileRoute("/$locale/pages/$slug")({
  validateSearch: pageSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps, params }) =>
    context.queryClient.ensureQueryData(
      pageQuery(context.storefront, {
        kind: "content",
        locale: context.storefront.locale,
        ...deps,
        slug: params.slug,
      }),
    ),
  head: ({ loaderData }) =>
    loaderData ? { meta: [{ title: loaderData.title }] } : {},
  component: Page,
});
function Page() {
  const data = Route.useLoaderData();
  if (data.kind === "catalog") return <ProductListPage data={data} />;
  if (data.kind === "collections") return <CollectionListPage data={data} />;
  if (data.kind === "content") return <PageSingle data={data} />;
  return null;
}
