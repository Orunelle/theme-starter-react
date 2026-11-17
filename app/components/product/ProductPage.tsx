import { useId, useState } from "react";
import {
  ProductFormProvider,
  ProductTitle,
  ProductPrice,
  VariantPicker,
  ProductFields,
} from "@orunelle/theme-engine";
import {
  ThemeSlot,
  useThemeRuntime,
  useStorefront,
  type PublicProduct,
  type OptionVisuals,
} from "@orunelle/theme-sdk";
import type { Variant } from "@orunelle/theme-sdk/commerce";
import { Link } from "@tanstack/react-router";
import {
  MetropolitanBuyButtons,
  MetropolitanDescription,
} from "./ProductBlocks";
import { ProductCard } from "./ProductCard";
import { EditorialGallery } from "./EditorialGallery";
import { purchasableVariants } from "../../lib/variants";

export function ProductPage({
  product,
  variants = [],
  related,
  optionVisuals,
}: {
  product: PublicProduct;
  variants?: readonly Variant[];
  related?: readonly PublicProduct[];
  optionVisuals?: OptionVisuals;
}) {
  const tabsId = useId();
  const [infoTab, setInfoTab] = useState<"details" | "care">("details");
  const runtime = useThemeRuntime(),
    { locale } = useStorefront(),
    ar = locale === "ar",
    suggestions = related ?? runtime.related ?? [],
    [guide, setGuide] = useState(false);
  return (
    <div className="metropolitan-product">
      <ProductFormProvider
        key={product.id}
        product={product}
        variants={purchasableVariants(variants)}
        visuals={optionVisuals ?? runtime.optionVisuals ?? {}}
      >
        <section
          className="product-main"
          data-component="metropolitan-product-page"
        >
          <EditorialGallery />
          <div className="product-info">
            <div className="mp-product-main-info">
              <ProductTitle />
              <ProductPrice />
              <VariantPicker />
              <button
                className="mp-underlink mp-size-guide"
                onClick={() => setGuide((v) => !v)}
                aria-expanded={guide}
              >
                {ar ? "دليل المقاسات" : "Size Guide"}
              </button>
              {guide ? (
                <div className="mp-size-guide-content">
                  <p>
                    {ar
                      ? "للمقاس المناسب، قارن قياساتك بجدول المنتج أو تواصل مع المتجر."
                      : "For the best fit, compare your measurements with the garment details or contact the store."}
                  </p>
                  <table>
                    <caption>
                      {ar ? "دليل عام للمقاسات" : "General fit guide"}
                    </caption>
                    <thead>
                      <tr>
                        <th>{ar ? "المقاس" : "Size"}</th>
                        <th>{ar ? "القَصّة" : "Fit"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>S</td>
                        <td>{ar ? "صغير" : "Small"}</td>
                      </tr>
                      <tr>
                        <td>M</td>
                        <td>{ar ? "متوسط" : "Medium"}</td>
                      </tr>
                      <tr>
                        <td>L</td>
                        <td>{ar ? "كبير" : "Large"}</td>
                      </tr>
                      <tr>
                        <td>XL</td>
                        <td>{ar ? "كبير جدًا" : "Extra large"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}
              <MetropolitanBuyButtons settings={{ "buy-now": false }} />
              <div className="mp-product-details">
                <div
                  role="tablist"
                  className="mp-product-info-tabs"
                  aria-label={ar ? "معلومات المنتج" : "Product information"}
                  onKeyDown={(event) => {
                    if (
                      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    )
                      return;
                    event.preventDefault();
                    const next =
                      event.key === "Home"
                        ? "details"
                        : event.key === "End"
                          ? "care"
                          : infoTab === "details"
                            ? "care"
                            : "details";
                    setInfoTab(next);
                    document.getElementById(tabsId + "-" + next)?.focus();
                  }}
                >
                  {(["details", "care"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      id={tabsId + "-" + tab}
                      aria-selected={infoTab === tab}
                      aria-controls={tabsId + "-panel"}
                      tabIndex={infoTab === tab ? 0 : -1}
                      onClick={() => setInfoTab(tab)}
                    >
                      {tab === "details"
                        ? ar
                          ? "التفاصيل"
                          : "Details"
                        : ar
                          ? "الخامات والعناية"
                          : "Materials & Care"}
                    </button>
                  ))}
                </div>
                <div
                  role="tabpanel"
                  id={tabsId + "-panel"}
                  aria-labelledby={tabsId + "-" + infoTab}
                  tabIndex={0}
                  className="mp-product-info-panel"
                >
                  {infoTab === "details" ? (
                    <MetropolitanDescription />
                  ) : (
                    <p>
                      {ar
                        ? "راجع وصف المنتج وتعليمات العناية على القطعة قبل الغسل."
                        : "Check the product description and the garment care label before washing."}
                    </p>
                  )}
                </div>
              </div>
              <ProductFields
                product={product}
                title={ar ? "المواصفات" : "Specifications"}
              />
              <ThemeSlot name="product.after" />
            </div>
            <div className="mp-product-service-links">
              <Link
                to="/$locale/pages/$slug"
                params={{ locale, slug: "our-stores" }}
              >
                {ar ? "ابحث عن متجر" : "Find Store"}
              </Link>
              <Link
                to="/$locale/pages/$slug"
                params={{ locale, slug: "custom-care" }}
              >
                {ar ? "الشحن والدفع" : "Shipping & Payment"}
              </Link>
              <Link
                to="/$locale/pages/$slug"
                params={{ locale, slug: "refund-policy" }}
              >
                {ar ? "الاسترجاع والاستبدال" : "Returns & Exchange"}
              </Link>
            </div>
          </div>
        </section>
      </ProductFormProvider>
      {suggestions.length ? (
        <section className="mp-product-recommendations">
          <div className="mp-section-intro">
            <h2>{ar ? "أكمل الإطلالة" : "Complete the Look"}</h2>
            <p>
              {ar
                ? "قطع أخرى لاكتشافها في المجموعة."
                : "A few more pieces to discover in the collection."}
            </p>
          </div>
          <div className="product-grid mp-shelf-grid">
            {suggestions.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
