import { useEffect, useRef, useState } from "react";
import { useProductForm } from "@orunelle/theme-engine";
import { imagesForVariant, useStorefront } from "@orunelle/theme-sdk";
import { demoItems } from "../../lib/demo-data";
import { Icon } from "../icons";
import { responsiveImage } from "../../lib/responsiveImage";

export function EditorialGallery() {
  const { product, variant } = useProductForm(),
    { locale, commerce } = useStorefront(),
    ar = locale === "ar";
  const photoVariant =
    commerce === "api"
      ? variant
      : (demoItems
          .find((p) => p.product.id === product.id)
          ?.variants.find(
            (v) => v.options?.Color === variant?.options?.Color,
          ) ?? variant);
  const images = imagesForVariant(product, photoVariant),
    [active, setActive] = useState<number | null>(null),
    dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => setActive(null), [variant?.id]);
  useEffect(() => {
    if (active !== null) {
      dialog.current?.showModal();
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = overflow;
      };
    }
    dialog.current?.close();
  }, [active]);
  return (
    <>
      <div className="product-gallery product-gallery-grid">
        {images.length ? (
          images.map((image, i) => (
            <button
              key={image.url}
              onClick={() => setActive(i)}
              aria-label={`${ar ? "تكبير الصورة" : "Zoom image"} ${i + 1}`}
            >
              <img
                {...responsiveImage(image.url, "(max-width: 760px) 100vw, 63vw")}
                alt={image.alt || product.name[locale]}
                loading={i ? "lazy" : "eager"}
                fetchPriority={i ? "auto" : "high"}
              />
            </button>
          ))
        ) : (
          <span
            className="mp-media-empty"
            role="img"
            aria-label={ar ? "لا توجد صورة" : "No image"}
          />
        )}
      </div>
      <dialog
        ref={dialog}
        className="product-zoom mp-product-zoom"
        aria-label={ar ? "معاينة صورة المنتج" : "Product image preview"}
        onClose={() => setActive(null)}
        onCancel={() => setActive(null)}
      >
        <button
          className="mp-zoom-close"
          onClick={() => setActive(null)}
          autoFocus
          aria-label={ar ? "إغلاق الصورة" : "Close image"}
        >
          <Icon name="close" />
        </button>
        {active !== null && images[active] ? (
          <img
            {...responsiveImage(images[active].url, "100vw")}
            alt={images[active].alt || product.name[locale]}
          />
        ) : null}
        {images.length > 1 ? (
          <div className="mp-zoom-controls">
            <button
              onClick={() =>
                setActive((i) => ((i ?? 0) - 1 + images.length) % images.length)
              }
              aria-label={ar ? "الصورة السابقة" : "Previous image"}
            >
              <Icon name="arrow" size={18} />
            </button>
            <span>
              {(active ?? 0) + 1} / {images.length}
            </span>
            <button
              onClick={() => setActive((i) => ((i ?? 0) + 1) % images.length)}
              aria-label={ar ? "الصورة التالية" : "Next image"}
            >
              <Icon name="arrow" size={18} />
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
