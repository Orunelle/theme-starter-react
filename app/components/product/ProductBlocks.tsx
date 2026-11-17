import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProductForm } from "@orunelle/theme-engine";
import {
  emitStorefrontEvent,
  eventProduct,
  useCommerce,
  useStorefront,
  type ThemeNodeProps,
} from "@orunelle/theme-sdk";
import { useAction, useCopy, Failure } from "../common/commerce";
import { useCart } from "../cart/CartProvider";
import { QuantityInput } from "../common/QuantityInput";
import { quantityLimit, validQuantity } from "../../lib/quantity";
import { descriptionHtml } from "../../lib/description";

export function MetropolitanBuyButtons({
  settings = {},
}: {
  settings?: ThemeNodeProps["settings"];
}) {
  const { product, variant, quantity, setQuantity } = useProductForm();
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy(),
    action = useAction();
  const cart = useCart(),
    navigate = useNavigate();
  const [quantityValid, setQuantityValid] = useState(true);
  useEffect(() => setQuantityValid(true), [variant?.id]);
  const max = quantityLimit(variant?.isActive ? variant.availableQuantity : 0);
  const selectedQuantity = Math.max(1, Math.min(quantity, max));
  const disabled =
    (context.commerce === "api" && !session.ready) ||
    max === 0 ||
    !quantityValid ||
    action.pending;
  async function add(open: boolean) {
    if (disabled || !variant || !validQuantity(selectedQuantity, max)) return;
    if (context.commerce !== "api") {
      cart.addDemo(product, variant, selectedQuantity);
      if (open) cart.open();
      return;
    }
    const updated = await session.client.cart.add(variant.id, selectedQuantity);
    cart.update(updated);
    emitStorefrontEvent("product_added_to_cart", {
      product: eventProduct(product, context.locale),
      variantId: variant.id,
      quantity: selectedQuantity,
    });
    action.setNotice(t("Added to your cart.", "تمت الإضافة إلى السلة."));
    if (open) cart.open();
  }
  return (
    <div className="product-buy metropolitan-buy">
      <div className="product-buy-row">
        {settings.quantity !== false && (
          <QuantityInput
            key={variant?.id}
            value={selectedQuantity}
            max={max}
            onChange={setQuantity}
            onValidityChange={setQuantityValid}
            disabled={action.pending || max === 0}
          />
        )}
        <button
          type="button"
          className="product-add"
          disabled={disabled}
          onClick={() => void action.run(() => add(true))}
        >
          {action.pending
            ? t("Adding…", "جارٍ الإضافة…")
            : t("Add to cart", "أضف إلى السلة")}
        </button>
      </div>
      <p className="metropolitan-stock" role="status">
        {max > 0
          ? t(
              `${variant!.availableQuantity} ${context.commerce === "api" ? "available" : "demo units"}`,
              `${variant!.availableQuantity} متاح`,
            )
          : t("This option is out of stock.", "هذا الخيار غير متوفر حاليًا.")}
      </p>
      <div className="metropolitan-buy-secondary">
        {settings["buy-now"] !== false && (
          <button
            type="button"
            className="button-secondary"
            disabled={disabled}
            onClick={() =>
              void action.run(async () => {
                await add(false);
                await navigate({ to: `/${context.locale}/checkout` });
              })
            }
          >
            {t("Buy now", "اشتر الآن")}
          </button>
        )}
        <button
          type="button"
          className="button-secondary"
          disabled={
            action.pending ||
            !variant ||
            !session.ready ||
            context.commerce !== "api"
          }
          onClick={() =>
            void action.run(async () => {
              if (!session.authenticated) {
                await navigate({ to: `/${context.locale}/login` });
                return;
              }
              await session.client.wishlist.add(variant!.id);
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
      <Failure error={action.error} />
      {context.commerce !== "api" && (
        <p className="sample-notice">
          {t(
            "Sample product · Purchases unavailable",
            "منتج تجريبي · الشراء غير متاح",
          )}
        </p>
      )}
    </div>
  );
}

export function MetropolitanDescription({
  settings = {},
}: {
  settings?: ThemeNodeProps["settings"];
}) {
  const { product } = useProductForm(),
    { locale } = useStorefront(),
    t = useCopy();
  const text =
    product.description[locale] ||
    product.description.en ||
    product.description.ar;
  if (!text?.trim()) return null;
  const body = /<\/?[a-z][\s\S]*>/i.test(text) ? (
    <div
      className="metropolitan-rich-description"
      dangerouslySetInnerHTML={{ __html: descriptionHtml(text) }}
    />
  ) : (
    <div className="metropolitan-rich-description">
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
  return settings.collapsed === true ? (
    <details className="product-collapsible">
      <summary>{t("Product description", "وصف المنتج")}</summary>
      {body}
    </details>
  ) : (
    <section className="metropolitan-description">
      <h2>{t("Product description", "وصف المنتج")}</h2>
      {body}
    </section>
  );
}
