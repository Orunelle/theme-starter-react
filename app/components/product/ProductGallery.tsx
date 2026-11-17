import { useStorefront, type PublicProduct } from "@orunelle/theme-sdk";
import { responsiveImage } from "../../lib/responsiveImage";
export function ProductGallery({
  product,
  detail = false,
}: {
  product: PublicProduct;
  detail?: boolean;
}) {
  const { locale, commerce } = useStorefront();
  const image = product.image;
  const safe =
    image && (/^https:\/\//.test(image.url) || /^\/(?!\/)/.test(image.url));
  if (safe)
    return (
      <img
        className={
          detail ? "product-photo product-detail-image" : "product-photo"
        }
        {...responsiveImage(image.url, detail ? "(max-width: 760px) 100vw, 63vw" : "(max-width: 767px) 50vw, 25vw")}
        alt={image.alt || product.name[locale]}
        loading={detail ? "eager" : "lazy"}
        decoding="async"
      />
    );
  return (
    <div
      className={`product-image-empty${detail ? " product-detail-image" : ""}`}
      role="img"
      aria-label={locale === "ar" ? "لا توجد صورة للمنتج" : "No product image"}
    >
      <span>
        {commerce === "api"
          ? locale === "ar"
            ? "لا توجد صورة"
            : "No image"
          : locale === "ar"
            ? "منتج تجريبي"
            : "Sample product"}
      </span>
    </div>
  );
}
