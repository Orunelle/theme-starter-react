import { useMemo, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useStorefront, type RoutePageData } from "@orunelle/theme-sdk";
import { Pagination } from "../common/commerce";
import { ProductCard } from "./ProductCard";
import { Icon } from "../icons";

export function ProductListPage({
  data,
}: {
  data: Extract<RoutePageData, { kind: "catalog" }>;
}) {
  const { locale } = useStorefront(),
    ar = locale === "ar",
    { searchStr, pathname } = useLocation();
  const [filters, setFilters] = useState(false),
    [sort, setSort] = useState("featured"),
    [type, setType] = useState("all"),
    [model, setModel] = useState(false),
    [dense, setDense] = useState(false);
  const shown = useMemo(() => {
    let list = [...data.products];
    if (type !== "all") list = list.filter((p) => p.categoryId === type);
    if (sort === "price-asc")
      list.sort((a, b) => a.price.amountMinor - b.price.amountMinor);
    if (sort === "price-desc")
      list.sort((a, b) => b.price.amountMinor - a.price.amountMinor);
    if (sort === "name")
      list.sort((a, b) => a.name[locale].localeCompare(b.name[locale]));
    return list;
  }, [data.products, type, sort, locale]);
  const categories = [
    ...new Set(data.products.map((p) => p.categoryId).filter(Boolean)),
  ];
  return (
    <section className="mp-catalog">
      <div className="mp-catalog-title">
        <h1>{data.title}</h1>
        <nav aria-label={ar ? "أنواع المنتجات" : "Product types"}>
          <button
            aria-current={type === "all" ? "true" : undefined}
            onClick={() => setType("all")}
          >
            {ar ? "الكل" : "All"}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              aria-current={type === c ? "true" : undefined}
              onClick={() => setType(c!)}
            >
              {c}
            </button>
          ))}
        </nav>
      </div>
      {pathname.endsWith("/search") ? (
        <form className="mp-catalog-search" action={`/${locale}/search`}>
          <input
            type="search"
            name="q"
            defaultValue={new URLSearchParams(searchStr).get("q") ?? ""}
            aria-label={ar ? "ابحث في المنتجات" : "Search products"}
            placeholder={ar ? "ابحث في المنتجات" : "Search products"}
          />
          <button>{ar ? "بحث" : "Search"}</button>
        </form>
      ) : null}
      <div className="mp-catalog-toolbar">
        <button onClick={() => setFilters((v) => !v)} aria-expanded={filters}>
          <Icon name="plus" size={14} />
          {ar ? "تصفية" : "Filter"}
        </button>
        <span aria-live="polite">
          {data.pagination?.total ?? shown.length} {ar ? "منتج" : "products"}
        </span>
        <div>
          <div
            className="mp-grid-layout-buttons"
            role="group"
            aria-label={ar ? "تخطيط الشبكة" : "Grid layout"}
          >
            <button
              onClick={() => setDense(false)}
              aria-label={ar ? "شبكة عادية" : "Regular grid"}
              aria-pressed={!dense}
              className="mp-grid-toggle"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="currentColor"
                aria-hidden
              >
                <path d="M0 0h6v6H0zM9 0h6v6H9zM0 9h6v6H0zM9 9h6v6H9z" />
              </svg>
            </button>
            <button
              onClick={() => setDense(true)}
              aria-label={ar ? "شبكة كثيفة" : "Dense grid"}
              aria-pressed={dense}
              className="mp-grid-toggle"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="currentColor"
                aria-hidden
              >
                <path d="M0 0h4v4H0zM5.5 0h4v4h-4zM11 0h4v4h-4zM0 5.5h4v4H0zM5.5 5.5h4v4h-4zM11 5.5h4v4h-4zM0 11h4v4H0zM5.5 11h4v4h-4zM11 11h4v4h-4z" />
              </svg>
            </button>
          </div>
          <button onClick={() => setModel(false)} aria-pressed={!model}>
            {ar ? "المنتج" : "Product"}
          </button>
          <button onClick={() => setModel(true)} aria-pressed={model}>
            {ar ? "الإطلالة" : "Model"}
          </button>
        </div>
      </div>
      {filters ? (
        <div className="mp-catalog-filters">
          <label>
            {ar ? "ترتيب حسب" : "Sort by"}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">{ar ? "المميز" : "Featured"}</option>
              <option value="price-asc">
                {ar ? "السعر: من الأقل" : "Price: low to high"}
              </option>
              <option value="price-desc">
                {ar ? "السعر: من الأعلى" : "Price: high to low"}
              </option>
              <option value="name">{ar ? "الاسم" : "Alphabetically"}</option>
            </select>
          </label>
          <button
            onClick={() => {
              setType("all");
              setSort("featured");
            }}
          >
            {ar ? "مسح الفلاتر" : "Clear filters"}
          </button>
        </div>
      ) : null}
      {shown.length ? (
        <div className="product-grid" data-dense={dense}>
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} model={model} />
          ))}
        </div>
      ) : (
        <div className="mp-empty">
          <p>
            {ar
              ? "لا توجد منتجات تطابق اختيارك."
              : "No products match your selection."}
          </p>
          <Link to="/$locale/products" params={{ locale }}>
            {ar ? "عرض جميع المنتجات" : "View all products"}
          </Link>
        </div>
      )}
      <Pagination {...data.pagination} />
    </section>
  );
}
