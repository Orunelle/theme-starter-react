import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StorefrontProvider,
  type StorefrontContext,
} from "@orunelle/theme-sdk";
import { resolveTheme } from "@orunelle/theme-engine";
import definition from "../app/theme";
import { ProductActions } from "../app/components/product/ProductActions";

describe("unavailable product options", () => {
  for (const locale of ["en", "ar"] as const)
    it(`renders an explicit ${locale} unavailable state without an empty selector`, () => {
      const storefront: StorefrontContext = {
        store: {
          id: "fixture-store",
          slug: "fixture",
          name: { en: "Fixture", ar: "متجر تجريبي" },
        },
        origin: "http://127.0.0.1:3031",
        locale,
        mode: "preview",
        release: "fixture",
        commerce: "fixture",
      };
      const html = renderToStaticMarkup(
        <QueryClientProvider client={new QueryClient()}>
          <StorefrontProvider
            theme={resolveTheme(definition)}
            storefront={storefront}
          >
            <ProductActions variants={[]} />
          </StorefrontProvider>
        </QueryClientProvider>,
      );
      expect(html).toContain('role="status"');
      expect(html).toContain("disabled");
      expect(html).not.toContain("<select");
      expect(html).toContain(
        locale === "ar" ? "الشراء غير متاح" : "Purchases unavailable",
      );
    });
});
