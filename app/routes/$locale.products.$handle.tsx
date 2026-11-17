import { createFileRoute } from "@tanstack/react-router";
import {
  useThemeComponents,
  useStorefront,
  ThemePageData,
  ThemeComposition,
} from "@orunelle/theme-sdk";
import { pageQuery } from "../lib/catalog";

export const Route = createFileRoute("/$locale/products/$handle")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      pageQuery(context.storefront, {
        kind: "product",
        locale: context.storefront.locale,
        slug: params.handle,
      }),
    ),
  head: ({ loaderData, params }) =>
    loaderData
      ? {
          meta: [{ title: loaderData.title }],
        }
      : {},
  component: Product,
});
function Product() {
  const { configuration } = useStorefront();
  const { ProductPage } = useThemeComponents();
  const data = Route.useLoaderData();
  return data.kind === "product" ? (
    <ThemePageData
      products={[data.product]}
      variants={data.variants}
      related={data.related}
      optionVisuals={data.optionVisuals}
    >
      <ThemeComposition
        scope="template"
        name={
          configuration?.assignments.find(
            (assignment) => assignment.resource.id === data.product.id,
          )?.template ?? "product.default"
        }
        productId={data.product.id}
        fallback={
          <ProductPage
            product={data.product}
            variants={data.variants}
            related={data.related ?? []}
            optionVisuals={data.optionVisuals ?? {}}
          />
        }
      />
    </ThemePageData>
  ) : null;
}
