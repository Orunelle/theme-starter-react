import { describe, expect, it } from "vitest";
import { demoPage, pageQuery } from "../app/lib/catalog";
import { demoItems } from "../app/lib/demo-data";
import type { StorefrontContext } from "@orunelle/theme-sdk";

describe("Metropolitan demo catalog and tenant boundary", () => {
  it("provides matching product images and selectable variants", () => {
    const data = demoPage({
      kind: "product",
      locale: "en",
      slug: "exchange-pinstripe-blazer",
    });
    expect(data.kind).toBe("product");
    if (data.kind !== "product") throw new Error("Wrong page");
    expect(data.variants).toHaveLength(6);
    expect(
      data.product.images?.some(
        (image) => image.variantId === data.variants[0]?.id,
      ),
    ).toBe(true);
    expect(data.product.price.currency).toBe("USD");
  });
  it("keeps collection filtering and pagination coherent", () => {
    const data = demoPage({
      kind: "collection",
      locale: "en",
      slug: "for-her",
    });
    expect(data.kind).toBe("catalog");
    if (data.kind !== "catalog") throw new Error("Wrong page");
    expect(data.pagination.total).toBeGreaterThan(0);
    for (const product of data.products)
      expect(
        demoItems.find((item) => item.product.id === product.id)?.tags,
      ).toContain("Women");
    const second = demoPage({
      kind: "collection",
      locale: "en",
      slug: "for-her",
      page: 2,
    });
    if (second.kind !== "catalog") throw new Error("Wrong page");
    expect(
      second.products.some((product) =>
        data.products.some((first) => first.id === product.id),
      ),
    ).toBe(false);
  });
  it("searches without inventing results and rejects unknown products", () => {
    const data = demoPage({
      kind: "search",
      locale: "ar",
      q: "nothing-matches-123",
    });
    expect(data.kind === "catalog" && data.products.length).toBe(0);
    expect(() =>
      demoPage({ kind: "product", locale: "en", slug: "missing" }),
    ).toThrow();
  });
  it("routes live catalogs through the authoritative SDK query", () => {
    const context = {
      store: {
        id: "live-store",
        slug: "live",
        name: { en: "Live", ar: "متجر" },
      },
      origin: "https://live.orunelle.com",
      locale: "en",
      mode: "public",
      release: "release",
      commerce: "api",
    } as StorefrontContext;
    const query = pageQuery(context, { kind: "home", locale: "en" });
    expect(query.queryKey).toContain("page");
    expect(query.queryKey).not.toContain("metropolitan-demo");
    const fixture = pageQuery(
      { ...context, commerce: "fixture" },
      { kind: "home", locale: "en" },
    );
    expect(fixture.queryKey).toContain("metropolitan-demo");
  });
});
