import { AddToCartForm } from "./AddToCartForm";
import { useTranslation } from "../../hooks/useTranslation";
import type { Variant } from "@orunelle/theme-sdk/commerce";

export function ProductActions({ variants }: { variants: readonly Variant[] }) {
  const t = useTranslation();
  if (
    !variants.some(
      (variant) => variant.isActive && variant.availableQuantity > 0,
    )
  )
    return (
      <div className="product-actions metropolitan-product-options-empty">
        <p role="status">{t("purchase.no_options")}</p>
        <button type="button" disabled>
          {t("purchase.unavailable")}
        </button>
      </div>
    );
  const Actions = AddToCartForm;
  return <Actions variants={variants} />;
}
