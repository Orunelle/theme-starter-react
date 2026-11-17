import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  useCommerce,
  useStorefront,
  useCustomerQuery,
  customerCacheKey,
  formatMoney,
} from "@orunelle/theme-sdk";
import type { Cart } from "@orunelle/theme-sdk/commerce";
import { useCart } from "./CartProvider";
import { useCopy, useAction, Failure, FixtureNotice } from "../common/commerce";
import { QuantityInput } from "../common/QuantityInput";
import { quantityLimit, validQuantity } from "../../lib/quantity";
import { Icon } from "../icons";
import { responsiveImage } from "../../lib/responsiveImage";

function CartLine({
  line,
  currency,
}: {
  line: Cart["items"][number];
  currency: string;
}) {
  const context = useStorefront(),
    session = useCommerce(),
    cart = useCart(),
    t = useCopy(),
    action = useAction();
  const [quantity, setQuantity] = useState(line.quantity);
  const [quantityValid, setQuantityValid] = useState(true);
  const product = useCustomerQuery(
    [...customerCacheKey(context, "cart-product"), line.productHandle],
    () => session.client.product(line.productHandle),
    !line.unavailable,
  );
  const image =
    product.data?.storeId === context.store.id
      ? (
          product.data.media.find(
            (media) => media.mediaType === "main_image",
          ) ??
          product.data.media.find((media) =>
            media.asset.mimeType.startsWith("image/"),
          )
        )?.asset
      : undefined;
  const imageUrl =
    image &&
    (/^https:\/\//.test(image.resolvedCdnUrl) ||
      /^\/(?!\/)/.test(image.resolvedCdnUrl))
      ? image.resolvedCdnUrl
      : undefined;
  const max = quantityLimit(line.availableQuantity);
  const invalid =
    !quantityValid || line.unavailable || !validQuantity(quantity, max);
  return (
    <li className="metropolitan-cart-line">
      <div className="metropolitan-cart-line-body">
        <Link
          className="metropolitan-cart-thumbnail"
          to="/$locale/products/$handle"
          params={{ locale: context.locale, handle: line.productHandle }}
          aria-label={line.name}
        >
          {imageUrl ? (
            <img {...responsiveImage(imageUrl, "112px")} alt="" loading="lazy" />
          ) : (
            <Icon name="package" size={28} />
          )}
        </Link>
        <div className="metropolitan-cart-line-details">
          <div className="metropolitan-cart-line-heading">
            <Link
              to="/$locale/products/$handle"
              params={{ locale: context.locale, handle: line.productHandle }}
            >
              {line.name}
            </Link>
            <strong>
              {formatMoney(
                line.unitPriceMinor * line.quantity,
                currency,
                context.locale,
              )}
            </strong>
          </div>
          <p className="metropolitan-cart-sku">
            {t("Item code", "رمز الصنف")}: {line.sku}
          </p>
          <p className="metropolitan-cart-unit">
            {formatMoney(line.unitPriceMinor, currency, context.locale)}{" "}
            {t("each", "للقطعة")}
          </p>
          <div className="metropolitan-cart-controls">
            <QuantityInput
              value={quantity}
              max={max}
              onChange={setQuantity}
              onValidityChange={setQuantityValid}
              disabled={action.pending || line.unavailable}
            />
            {quantity !== line.quantity && (
              <button
                type="button"
                className="metropolitan-text-button"
                disabled={action.pending || invalid}
                onClick={() =>
                  void action.run(async () => {
                    if (!validQuantity(quantity, max)) return;
                    cart.update(
                      await session.client.cart.update(line.id, quantity),
                    );
                    action.setNotice(t("Cart updated.", "تم تحديث السلة."));
                  })
                }
              >
                {t("Update", "تحديث")}
              </button>
            )}
            <button
              type="button"
              className="metropolitan-text-button"
              disabled={action.pending}
              onClick={() =>
                void action.run(async () => {
                  cart.update(await session.client.cart.remove(line.id));
                  action.setNotice(
                    t(
                      "Item removed from your cart.",
                      "تم حذف المنتج من السلة.",
                    ),
                  );
                })
              }
            >
              {t("Remove", "حذف")}
            </button>
          </div>
          {(line.unavailable || line.quantity > max) && (
            <p className="form-error" role="alert">
              {line.unavailable || max === 0
                ? t(
                    "This item is unavailable. Remove it to continue.",
                    "هذا المنتج غير متاح. احذفه للمتابعة.",
                  )
                : t(
                    `Only ${max} available. Update the quantity to continue.`,
                    `المتاح ${max} فقط. حدّث الكمية للمتابعة.`,
                  )}
            </p>
          )}
          <Failure error={action.error} />
        </div>
      </div>
    </li>
  );
}
export function CartContents({ compact = false }: { compact?: boolean }) {
  const { locale, commerce } = useStorefront(),
    cart = useCart(),
    t = useCopy();
  const { query } = cart;
  if (commerce !== "api")
    return (
      <div className="metropolitan-cart-empty">
        <FixtureNotice />
        <Link to="/$locale/products" params={{ locale }}>
          {t("Explore products", "تصفح المنتجات")}
        </Link>
      </div>
    );
  if (query.isPending)
    return (
      <p className="metropolitan-cart-empty" role="status">
        {t("Loading cart…", "جارٍ تحميل السلة…")}
      </p>
    );
  if (query.error)
    return (
      <div className="metropolitan-cart-empty">
        <Failure error={query.error} />
        <button type="button" onClick={() => void query.refetch()}>
          {t("Try again", "حاول مجددًا")}
        </button>
      </div>
    );
  const data = query.data;
  if (!data?.items.length)
    return (
      <div className="metropolitan-cart-empty">
        <Icon name="cart" size={40} />
        <h2>{t("Make room for something new", "أفسح مكانًا لشيء جديد")}</h2>
        <p>
          {t(
            "Your cart is empty. Find something you love and add it here.",
            "سلتك فارغة. اختر ما يعجبك وأضفه هنا.",
          )}
        </p>
        <Link
          className="metropolitan-checkout-link"
          to="/$locale/products"
          params={{ locale }}
        >
          {t("Explore products", "تصفح المنتجات")}
        </Link>
      </div>
    );
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.unitPriceMinor * item.quantity,
    0,
  );
  const unavailable = data.items.some(
    (item) =>
      item.unavailable ||
      !validQuantity(item.quantity, quantityLimit(item.availableQuantity)),
  );
  return (
    <div className={`metropolitan-cart-content${compact ? " is-compact" : ""}`}>
      <ul className="metropolitan-cart-lines">
        {data.items.map((line) => (
          <CartLine
            key={`${line.id}:${line.quantity}:${line.availableQuantity}`}
            line={line}
            currency={data.currency}
          />
        ))}
      </ul>
      <aside className="metropolitan-cart-summary">
        <h2>{t("Order summary", "ملخص الطلب")}</h2>
        <dl>
          <div>
            <dt>{t("Items", "المنتجات")}</dt>
            <dd>{cart.count}</dd>
          </div>
          <div className="metropolitan-cart-subtotal">
            <dt>{t("Subtotal", "المجموع الفرعي")}</dt>
            <dd>{formatMoney(subtotal, data.currency, locale)}</dd>
          </div>
        </dl>
        <p>
          {t(
            "Delivery, taxes and discounts are calculated at checkout.",
            "يتم حساب التوصيل والضرائب والخصومات عند إتمام الطلب.",
          )}
        </p>
        {unavailable ? (
          <p className="form-error" role="alert">
            {t(
              "Review unavailable items and quantities before checkout.",
              "راجع المنتجات غير المتاحة والكميات قبل إتمام الطلب.",
            )}
          </p>
        ) : (
          <Link
            className="metropolitan-checkout-link"
            to="/$locale/checkout"
            params={{ locale }}
            onClick={cart.close}
          >
            {t("Continue to checkout", "متابعة إتمام الطلب")}
            <Icon name="arrow" size={18} />
          </Link>
        )}
        {compact && (
          <Link
            className="metropolitan-view-cart"
            to="/$locale/cart"
            params={{ locale }}
            onClick={cart.close}
          >
            {t("View full cart", "عرض السلة كاملة")}
          </Link>
        )}
        {!compact && (
          <Link
            className="metropolitan-view-cart"
            to="/$locale/products"
            params={{ locale }}
          >
            {t("Continue shopping", "متابعة التسوق")}
          </Link>
        )}
      </aside>
    </div>
  );
}
