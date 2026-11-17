import { Link } from "@tanstack/react-router";
import {
  useStorefront,
  formatPrice,
  type PublicProduct,
} from "@orunelle/theme-sdk";
import { useGlobal } from "../../hooks/useThemeSettings";
import { responsiveImage } from "../../lib/responsiveImage";

export function ProductCard({
  product,
  model = false,
}: {
  product: PublicProduct;
  model?: boolean;
}) {
  const { locale } = useStorefront(),
    settings = useGlobal();
  const photos = product.images ?? (product.image ? [product.image] : []),
    hover = photos.find((p) => p.url.includes("hover")) ?? photos[1];
  const primary = model && hover ? hover : product.image;
  return (
    <article className="product-card metropolitan-product-card">
      <Link
        to="/$locale/products/$handle"
        params={{ locale, handle: product.handle }}
        className="metropolitan-product-image"
        aria-label={product.name[locale]}
      >
        {primary ? (
          <img
            className="mp-card-primary"
            {...responsiveImage(primary.url, "(max-width: 767px) 50vw, 25vw")}
            alt={primary.alt || product.name[locale]}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="mp-media-empty" />
        )}
        {hover && !model ? (
          <img
            className="mp-card-hover"
            {...responsiveImage(hover.url, "(max-width: 767px) 50vw, 25vw")}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : null}
        {product.compareAtPrice &&
        product.compareAtPrice.amountMinor > product.price.amountMinor ? (
          <span className="mp-product-label">
            {locale === "ar" ? "تخفيض" : "SALE"}
          </span>
        ) : null}
      </Link>
      <div className="mp-card-info">
        <h2>
          <Link
            to="/$locale/products/$handle"
            params={{ locale, handle: product.handle }}
          >
            {product.name[locale]}
          </Link>
        </h2>
        {settings["show-prices"] !== false ? (
          <p className="product-price">
            {formatPrice(product, locale)}
            {product.compareAtPrice &&
            product.compareAtPrice.amountMinor > product.price.amountMinor ? (
              <s>
                {new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: product.compareAtPrice.currency,
                }).format(product.compareAtPrice.amountMinor / 100)}
              </s>
            ) : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}
