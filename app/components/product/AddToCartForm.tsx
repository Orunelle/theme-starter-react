import { useState } from "react";
import { useStorefront, useCommerce, formatPrice } from "@orunelle/theme-sdk";
import type { Variant } from "@orunelle/theme-sdk/commerce";
import { useCopy, useAction, Failure, values } from "../common/commerce";
export function AddToCartForm({ variants }: { variants: readonly Variant[] }) {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy(),
    action = useAction();
  const available = variants.filter(
    (v) => v.isActive && v.availableQuantity > 0,
  );
  const [variantId, setVariantId] = useState(available[0]?.id ?? "");
  if (context.commerce !== "api") return null;
  const variant = available.find((v) => v.id === variantId);
  return (
    <div className="product-actions">
      <label className="form-field">
        <span>{t("Choose an option", "اختر خيارًا")}</span>
        <select
          aria-label={t("Choose an option", "اختر خيارًا")}
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
        >
          {available.map((v) => (
            <option key={v.id} value={v.id}>
              {Object.values(v.options ?? {}).join(" / ") ||
                [v.size, v.color].filter(Boolean).join(" / ") ||
                v.sku}
              {v.priceOverrideMinor !== null
                ? ` — ${formatPrice({ id: v.id, handle: "", name: { en: "", ar: "" }, description: { en: "", ar: "" }, price: { amountMinor: v.priceOverrideMinor, currency: context.currency ?? "EGP" } }, context.locale)}`
                : ""}
            </option>
          ))}
        </select>
      </label>
      <div className="action-row">
        <button
          disabled={!session.ready || !variant || action.pending}
          onClick={() =>
            void action.run(async () => {
              await session.client.cart.add(variantId, 1);
              await session.cache.invalidateQueries();
              action.setNotice(
                t("Added to your cart.", "تمت الإضافة إلى السلة."),
              );
            })
          }
        >
          {action.pending
            ? t("Adding…", "جارٍ الإضافة…")
            : available.length
              ? t("Add to cart", "أضف إلى السلة")
              : t("Out of stock", "نفد المخزون")}
        </button>
        <button
          className="button-secondary"
          disabled={
            !session.ready ||
            !session.authenticated ||
            !variant ||
            action.pending
          }
          onClick={() =>
            void action.run(async () => {
              await session.client.wishlist.add(variantId);
              await session.cache.invalidateQueries();
              action.setNotice(
                t("Saved to your wishlist.", "تم الحفظ في المفضلة."),
              );
            })
          }
        >
          {t("Save to wishlist", "احفظ في المفضلة")}
        </button>
      </div>
      <p role="status">{action.notice}</p>
      <Failure error={action.error} />
    </div>
  );
}
