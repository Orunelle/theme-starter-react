import { notFound } from "@tanstack/react-router";
import { pageQuery as apiPageQuery } from "@orunelle/theme-runtime/tanstack";
import { publicQuery } from "@orunelle/theme-sdk/query";
import type {
  RoutePageData,
  StorefrontContext,
  PublicProduct,
} from "@orunelle/theme-sdk";
import { demoItems as samples, demoProducts } from "./demo-data";

type Input = Parameters<typeof apiPageQuery>[1];
export const DEMO_COLLECTIONS = [
  { id: "for-him", slug: "for-him", en: "For Him", ar: "له" },
  { id: "for-her", slug: "for-her", en: "For Her", ar: "لها" },
  {
    id: "new-arrivals",
    slug: "new-arrivals",
    en: "New Arrivals",
    ar: "وصل حديثًا",
  },
  { id: "sales", slug: "sales", en: "Sale", ar: "التخفيضات" },
  {
    id: "men-tops",
    slug: "men-tops",
    en: "Men Tops",
    ar: "القطع العلوية للرجال",
  },
  {
    id: "women-tops",
    slug: "women-tops",
    en: "Women Tops",
    ar: "القطع العلوية للنساء",
  },
  {
    id: "men-bottoms",
    slug: "men-bottoms",
    en: "Men Bottoms",
    ar: "البناطيل للرجال",
  },
  {
    id: "women-bottoms",
    slug: "women-bottoms",
    en: "Women Bottoms",
    ar: "البناطيل والتنانير للنساء",
  },
];
const first = [
  "exchange-pinstripe-blazer",
  "waypoint-canvas-jacket",
  "basin-wide-jean",
  "waverly-utility-top",
  "cobble-cable-sweater",
  "willow-satin-slip-dress",
  "ticker-pinstripe-trouser",
  "heritage-stripe-cardigan",
  "cabana-camp-shirt",
  "bishop-wrap-skirt",
  "bowman-rugby-shirt",
  "meridian-pleated-skirt",
  "kilgore-check-shirt",
  "meridian-pleated-skirt-1",
  "ainsworth-overcoat",
  "drift-zip-cardigan",
];
const ordered = [...demoProducts].sort(
  (a, b) =>
    (first.indexOf(a.handle) < 0 ? 999 : first.indexOf(a.handle)) -
    (first.indexOf(b.handle) < 0 ? 999 : first.indexOf(b.handle)),
);
export function demoPage(input: Input): RoutePageData {
  const ar = input.locale === "ar";
  const contentTitles: Record<string, [string, string]> = {
    lookbook: ["Lookbook", "الإطلالات"],
    journal: ["Metropolitan Stories", "حكايات متروبوليتان"],
    blog: ["Metropolitan Stories", "حكايات متروبوليتان"],
    "about-us": ["About Us", "من نحن"],
    "custom-care": ["Customer Care", "خدمة العملاء"],
    "our-stores": ["Our Stores", "متاجرنا"],
    "privacy-policy": ["Privacy Policy", "سياسة الخصوصية"],
    "refund-policy": ["Refund Policy", "سياسة الاسترجاع"],
    "terms-of-service": ["Terms of Service", "شروط الخدمة"],
  };
  if (input.kind === "content")
    return {
      kind: "content",
      title:
        contentTitles[input.slug ?? ""]?.[ar ? 1 : 0] ?? input.slug ?? "Page",
      paragraphs: [],
    };
  if (input.kind === "product") {
    const item = samples.find((item) => item.product.handle === input.slug);
    if (!item) throw notFound();
    return {
      kind: "product",
      title: item.product.name[input.locale],
      product: item.product,
      variants: item.variants,
      related: ordered.filter((p) => p.id !== item.product.id).slice(0, 8),
      optionVisuals: {
        Color: {
          Black: { color: "#1e1e1e" },
          Beige: { color: "#decda9" },
          White: { color: "#fff" },
          Brown: { color: "#795d4c" },
          Navy: { color: "#28394e" },
          Grey: { color: "#999" },
        },
      },
    };
  }
  if (input.kind === "collections" || input.kind === "categories")
    return {
      kind: "collections",
      title: ar ? "المجموعات" : "Collections",
      collections: DEMO_COLLECTIONS.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: ar ? c.ar : c.en,
        description: "",
        collectionItems: [],
      })),
      basePath: "collections",
      pagination: {
        page: 1,
        limit: 20,
        total: DEMO_COLLECTIONS.length,
        pages: 1,
      },
    };
  let products = ordered,
    title = ar ? "جميع المنتجات" : "All Products";
  if (input.kind === "collection" || input.kind === "category") {
    const c = DEMO_COLLECTIONS.find((c) => c.slug === input.slug);
    if (!c) throw notFound();
    title = ar ? c.ar : c.en;
    products = ordered.filter((p) => {
      const info = samples.find((s) => s.product.id === p.id)!;
      return input.slug === "sales"
        ? !!p.compareAtPrice
        : input.slug === "new-arrivals"
          ? first.slice(0, 8).includes(p.handle)
          : input.slug?.includes("her") || input.slug?.includes("women")
            ? info.tags.includes("Women")
            : info.tags.includes("Men");
    });
    if (input.slug?.includes("tops"))
      products = products.filter(
        (p) => p.categoryId === "tops" || p.categoryId === "shirts",
      );
    if (input.slug?.includes("bottoms"))
      products = products.filter(
        (p) => p.categoryId === "trousers" || p.categoryId === "skirts",
      );
  }
  if (input.kind === "search") {
    title = ar ? "البحث" : "Search";
    const words = (input.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    products = products.filter((p) =>
      words.every((w) =>
        Object.values(p.name).join(" ").toLowerCase().includes(w),
      ),
    );
  }
  const page = input.page ?? 1,
    limit = input.kind === "home" ? 40 : 16;
  return {
    kind: "catalog",
    title,
    products: products.slice((page - 1) * limit, page * limit),
    resources: { products: {}, collections: {} },
    pagination: {
      page,
      limit,
      total: products.length,
      pages: Math.ceil(products.length / limit),
    },
  };
}
export function pageQuery(
  context: StorefrontContext,
  input: Input,
): ReturnType<typeof apiPageQuery> {
  const editorial = [
    "lookbook",
    "journal",
    "blog",
    "about-us",
    "custom-care",
    "our-stores",
  ];
  if (input.kind === "content" && editorial.includes(input.slug ?? ""))
    return publicQuery<RoutePageData>(
      context,
      "metropolitan-editorial",
      input,
      async () => demoPage(input),
    );
  return context.commerce === "api"
    ? apiPageQuery(context, input)
    : publicQuery<RoutePageData>(
        context,
        "metropolitan-demo",
        input,
        async () => demoPage(input),
      );
}
