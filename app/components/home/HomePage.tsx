import {
  ThemePageData,
  ThemeComposition,
  type PublicProduct,
} from "@orunelle/theme-sdk";
export function HomePage({ products }: { products: readonly PublicProduct[] }) {
  return (
    <ThemePageData products={products}>
      <ThemeComposition scope="template" name="home" />
    </ThemePageData>
  );
}
