import { useState, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  useStorefront,
  useCommerce,
  useCustomerQuery,
  customerCacheKey,
  formatMoney,
} from "@orunelle/theme-sdk";
import {
  CommerceError,
  type Order,
  type Recovery,
  type Cart,
  type CartSummary,
} from "@orunelle/theme-sdk/commerce";
import { useCart } from "../cart/CartProvider";
import { Icon } from "../icons";
import { AddressText } from "../account/AddressText";
import { responsiveImage } from "../../lib/responsiveImage";
import "../../styles/checkout.css";
import { Orders, OrderDetails } from "../account/Orders";
import {
  useCopy,
  useAction,
  Failure,
  Guard,
  FixtureNotice,
} from "../common/commerce";
function CheckoutLine({
  line,
  currency,
}: {
  line: Cart["items"][number];
  currency: string;
}) {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy();
  const product = useCustomerQuery(
    [...customerCacheKey(context, "cart-product"), line.productHandle],
    () => session.client.product(line.productHandle),
    context.commerce === "api" && !line.unavailable,
  );
  const asset =
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
  const image =
    asset &&
    (/^https:\/\//.test(asset.resolvedCdnUrl) ||
      /^\/(?!\/)/.test(asset.resolvedCdnUrl))
      ? asset.resolvedCdnUrl
      : undefined;
  return (
    <li className="mp-checkout-item">
      <div className="mp-checkout-thumbnail">
        {image ? (
          <img {...responsiveImage(image, "72px")} alt="" loading="lazy" />
        ) : (
          <Icon name="package" size={24} />
        )}
      </div>
      <div className="mp-checkout-item-copy">
        <Link
          to="/$locale/products/$handle"
          params={{ locale: context.locale, handle: line.productHandle }}
        >
          {line.name}
        </Link>
        <p>
          {t("Item code", "رمز الصنف")}: {line.sku}
        </p>
        <p>
          {t("Quantity", "الكمية")}: {line.quantity}
        </p>
      </div>
      <strong>
        {formatMoney(
          line.unitPriceMinor * line.quantity,
          currency,
          context.locale,
        )}
      </strong>
    </li>
  );
}

function CheckoutSummary({
  summary,
  updating,
  children,
}: {
  summary?: CartSummary;
  updating: boolean;
  children: import("react").ReactNode;
}) {
  const context = useStorefront(),
    t = useCopy(),
    cart = useCart();
  const data = summary?.cart ?? cart.query.data;
  const subtotal = data?.items.reduce(
    (total, line) => total + line.unitPriceMinor * line.quantity,
    0,
  );
  const totals = summary?.totals;
  const money = (amount: number) =>
    formatMoney(
      amount,
      totals?.currency ?? data?.currency ?? context.currency ?? "EGP",
      context.locale,
    );
  return (
    <aside
      className="mp-checkout-summary"
      aria-labelledby="checkout-summary-title"
      aria-busy={updating}
    >
      <header className="mp-checkout-section-heading">
        <h2 id="checkout-summary-title">{t("Order summary", "ملخص الطلب")}</h2>
        <Link to="/$locale/cart" params={{ locale: context.locale }}>
          {t("Edit bag", "تعديل السلة")}
        </Link>
      </header>
      {data?.items.length ? (
        <ul className="mp-checkout-items">
          {data.items.map((line) => (
            <CheckoutLine key={line.id} line={line} currency={data.currency} />
          ))}
        </ul>
      ) : (
        <div className="mp-checkout-bag-state">
          <Icon name="cart" size={28} />
          <p>
            {context.commerce === "api" && cart.query.isPending
              ? t("Loading your bag…", "جارٍ تحميل سلتك…")
              : context.commerce !== "api"
                ? t(
                    "Your order will appear here when shopping in a live store.",
                    "سيظهر طلبك هنا عند التسوق من متجر فعلي.",
                  )
                : t("Your bag is empty.", "سلتك فارغة.")}
          </p>
          <Link to="/$locale/products" params={{ locale: context.locale }}>
            {t("Continue shopping", "متابعة التسوق")}
          </Link>
        </div>
      )}
      <Failure error={cart.query.error} />
      <dl className="mp-checkout-totals">
        <div>
          <dt>{t("Subtotal", "المجموع الفرعي")}</dt>
          <dd>
            {totals
              ? money(totals.subtotalMinor)
              : subtotal !== undefined
                ? money(subtotal)
                : "—"}
          </dd>
        </div>
        {!!totals?.discountMinor && (
          <div>
            <dt>{t("Discount", "الخصم")}</dt>
            <dd>{money(-totals.discountMinor)}</dd>
          </div>
        )}
        <div>
          <dt>{t("Delivery", "التوصيل")}</dt>
          <dd>
            {summary?.selectedShipping
              ? money(totals!.shippingMinor)
              : t("Calculated after selection", "يُحسب بعد الاختيار")}
          </dd>
        </div>
        {totals && (
          <div>
            <dt>
              {totals.taxInclusive
                ? t("Tax included", "الضريبة المشمولة")
                : t("Tax", "الضريبة")}
            </dt>
            <dd>{money(totals.taxMinor)}</dd>
          </div>
        )}
        <div className="mp-checkout-total">
          <dt>{t("Total", "الإجمالي")}</dt>
          <dd>
            {totals && summary?.selectedShipping ? (
              <>
                <span>{totals.currency}</span> {money(totals.totalMinor)}
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
      <p className="mp-checkout-summary-note" role="status">
        {updating
          ? t("Updating your order summary…", "جارٍ تحديث ملخص الطلب…")
          : !summary?.selectedShipping
            ? t(
                "Choose your address and delivery option to see your final total.",
                "اختر عنوانك وخيار التوصيل لعرض الإجمالي النهائي.",
              )
            : t(
                "Review your details before placing your order.",
                "راجع بياناتك قبل تأكيد الطلب.",
              )}
      </p>
      {children}
    </aside>
  );
}

function Checkout() {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy(),
    action = useAction();
  const available =
    context.commerce === "api" &&
    context.mode !== "preview" &&
    session.authenticated;
  const addresses = useCustomerQuery(
    customerCacheKey(context, "addresses"),
    session.client.addresses.list,
    available,
  );
  const methods = useCustomerQuery(
    customerCacheKey(context, "payment-methods"),
    session.client.payments.methods,
    available,
  );
  const [addressId, setAddressId] = useState(""),
    [shippingOptionId, setShippingOptionId] = useState(""),
    [paymentMethod, setPaymentMethod] = useState(""),
    [order, setOrder] = useState<Order>(),
    [recovery, setRecovery] = useState<Recovery>();
  const summary = useCustomerQuery(
    [
      ...customerCacheKey(context, "summary"),
      addressId,
      shippingOptionId,
      paymentMethod,
    ],
    () =>
      session.client.cart.summary({
        addressId,
        ...(shippingOptionId ? { shippingOptionId } : {}),
        ...(paymentMethod ? { paymentMethod } : {}),
      }),
    available && !!addressId,
  );
  const pendingKey = `orunelle.checkout.v2:${context.store.id}:${session.customerId}`;
  useEffect(() => {
    if (!session.customerId) return;
    try {
      const raw = sessionStorage.getItem(pendingKey);
      if (raw) {
        const saved: unknown = JSON.parse(raw);
        if (
          saved &&
          typeof saved === "object" &&
          "scope" in saved &&
          "body" in saved &&
          "requestKey" in saved &&
          typeof saved.body === "string" &&
          typeof saved.requestKey === "string"
        )
          setRecovery(saved as Recovery);
      }
    } catch {
      /* Storage may be unavailable; in-memory recovery remains available. */
    }
  }, [pendingKey, session.customerId]);
  function remember(value?: Recovery) {
    try {
      if (value) sessionStorage.setItem(pendingKey, JSON.stringify(value));
      else sessionStorage.removeItem(pendingKey);
    } catch {
      /* Do not block a confirmed order on browser storage. */
    }
  }
  async function pay(placed: Order) {
    if (placed.paymentMethod === "paymob" || placed.paymentMethod === "xpay") {
      const result = await session.client.payments.start(
        placed.paymentMethod,
        placed.orderNumber,
      );
      if (result.paymentUrl) {
        const url = new URL(result.paymentUrl);
        if (url.protocol !== "https:" || url.username || url.password)
          throw new Error("Invalid payment URL");
        window.location.assign(url.href);
      }
    }
  }
  if (order)
    return (
      <>
        <OrderDetails order={order} />
        {order.paymentMethod !== "cod" && order.paymentStatus !== "paid" && (
          <button
            disabled={action.pending}
            onClick={() => void action.run(() => pay(order))}
          >
            {t("Continue to payment", "متابعة الدفع")}
          </button>
        )}
        <Failure error={action.error} />
      </>
    );
  const selectedAddress = addresses.data?.find(
    (address) => address.id === addressId,
  );
  const locked = !available || !!recovery || action.pending;
  const ready =
    available &&
    !locked &&
    !!summary.data &&
    summary.data.cart.items.length > 0 &&
    !summary.isFetching &&
    !!paymentMethod &&
    !!shippingOptionId &&
    summary.data.selectedShipping?.id === shippingOptionId;
  return (
    <>
      <Failure
        error={
          addresses.error || methods.error || summary.error || action.error
        }
      />
      <form
        className="mp-checkout-form"
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            !available ||
            action.pending ||
            summary.isFetching ||
            !summary.data ||
            !addressId ||
            !paymentMethod ||
            !shippingOptionId ||
            recovery ||
            summary.data.selectedShipping?.id !== shippingOptionId ||
            summary.data.cart.items.length === 0
          )
            return;
          const input = {
            addressId,
            shippingOptionId,
            paymentMethod,
            expectedTotalMinor: summary.data.totals.totalMinor,
          };
          const key = crypto.randomUUID();
          const prepared = session.client.prepareCheckout(input, key);
          remember(prepared);
          void action.run(async () => {
            try {
              const result = await session.client.checkout(input, key);
              remember();
              setOrder(result.order);
              await session.cache.invalidateQueries();
              await pay(result.order);
            } catch (error) {
              if (error instanceof CommerceError && error.recovery) {
                setRecovery(error.recovery);
                remember(error.recovery);
              } else remember();
              if (
                error instanceof CommerceError &&
                error.code === "CART_PRICE_CHANGED"
              )
                await summary.refetch();
              throw error;
            }
          });
        }}
      >
        <div className="mp-checkout-details">
          {!available && (
            <div className="mp-checkout-access">
              {context.commerce !== "api" || context.mode === "preview" ? (
                <FixtureNotice />
              ) : !session.ready ? (
                <p role="status">
                  {t("Loading your session…", "جارٍ تحميل الجلسة…")}
                </p>
              ) : (
                <>
                  <div>
                    <h2>{t("Your account, your checkout", "حسابك، طلبك")}</h2>
                    <p>
                      {t(
                        "Sign in to use your saved addresses and place your order.",
                        "سجل الدخول لاستخدام عناوينك المحفوظة وتأكيد طلبك.",
                      )}
                    </p>
                  </div>
                  <Link to="/$locale/login" params={{ locale: context.locale }}>
                    {t("Sign in", "تسجيل الدخول")}
                    <Icon name="arrow" size={16} />
                  </Link>
                </>
              )}
            </div>
          )}
          <section
            className="mp-checkout-section"
            aria-labelledby="checkout-address-title"
          >
            <header className="mp-checkout-section-heading">
              <h2 id="checkout-address-title">
                <span className="mp-checkout-step" aria-hidden="true">
                  1
                </span>
                {t("Delivery address", "عنوان التوصيل")}
              </h2>
              {available && (
                <Link
                  to="/$locale/account/addresses"
                  params={{ locale: context.locale }}
                >
                  {t("Add or edit", "إضافة أو تعديل")}
                </Link>
              )}
            </header>
            <p className="mp-checkout-help">
              {t(
                "Where would you like your order delivered?",
                "إلى أين تود توصيل طلبك؟",
              )}
            </p>
            {addresses.isPending && available && (
              <p role="status">
                {t("Loading delivery addresses…", "جارٍ تحميل عناوين التوصيل…")}
              </p>
            )}
            <label className="mp-checkout-field">
              <span>{t("Saved address", "العنوان المحفوظ")}</span>
              <select
                required
                name="addressId"
                value={addressId}
                disabled={locked}
                onChange={(e) => {
                  setAddressId(e.target.value);
                  setShippingOptionId("");
                }}
              >
                <option value="">
                  {t("Choose a delivery address", "اختر عنوان التوصيل")}
                </option>
                {addresses.data?.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} · {address.recipientName}
                  </option>
                ))}
              </select>
            </label>
            {selectedAddress && (
              <div className="mp-checkout-address">
                <strong>{selectedAddress.label}</strong>
                <AddressText address={selectedAddress} />
              </div>
            )}
            {addresses.data?.length === 0 && (
              <p className="mp-checkout-help" role="status">
                {t(
                  "Add a delivery address before placing your order.",
                  "أضف عنوان توصيل قبل تأكيد الطلب.",
                )}{" "}
                <Link
                  to="/$locale/account/addresses"
                  params={{ locale: context.locale }}
                >
                  {t("Add an address", "إضافة عنوان")}
                </Link>
              </p>
            )}
          </section>
          <fieldset
            className="mp-checkout-section"
            disabled={locked || !addressId || summary.isFetching}
          >
            <legend>
              <span className="mp-checkout-step" aria-hidden="true">
                2
              </span>
              {t("Delivery method", "طريقة التوصيل")}
            </legend>
            <p className="mp-checkout-help">
              {!addressId
                ? t(
                    "Select an address to see available delivery options.",
                    "اختر عنوانًا لعرض خيارات التوصيل المتاحة.",
                  )
                : summary.isFetching
                  ? t(
                      "Updating delivery options…",
                      "جارٍ تحديث خيارات التوصيل…",
                    )
                  : t(
                      "Choose the delivery option that works for you.",
                      "اختر طريقة التوصيل المناسبة لك.",
                    )}
            </p>
            <div className="mp-checkout-options">
              {summary.data?.shippingOptions.map((option) => (
                <label className="mp-checkout-option" key={option.id}>
                  <input
                    type="radio"
                    name="shippingOptionId"
                    required
                    value={option.id}
                    checked={shippingOptionId === option.id}
                    onChange={() => setShippingOptionId(option.id)}
                  />
                  <span>{option.name}</span>
                  <strong>
                    {formatMoney(
                      option.amountMinor,
                      summary.data!.totals.currency,
                      context.locale,
                    )}
                  </strong>
                </label>
              ))}
            </div>
            {addressId &&
              !summary.isFetching &&
              summary.data?.shippingOptions.length === 0 && (
                <p className="mp-checkout-help" role="status">
                  {t(
                    "No delivery options are available for this address and cart. Choose another address or edit your cart.",
                    "لا تتوفر خيارات توصيل لهذا العنوان والسلة. اختر عنوانًا آخر أو عدّل السلة.",
                  )}
                </p>
              )}
          </fieldset>
          <fieldset className="mp-checkout-section" disabled={locked}>
            <legend>
              <span className="mp-checkout-step" aria-hidden="true">
                3
              </span>
              {t("Payment", "الدفع")}
            </legend>
            <p className="mp-checkout-help">
              {t("How would you like to pay?", "كيف تود الدفع؟")}
            </p>
            {methods.isPending && available && (
              <p role="status">
                {t("Loading payment methods…", "جارٍ تحميل طرق الدفع…")}
              </p>
            )}
            <div className="mp-checkout-options">
              {methods.data?.map((method) => (
                <label className="mp-checkout-option" key={method.method}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    required
                    value={method.method}
                    checked={paymentMethod === method.method}
                    onChange={() => setPaymentMethod(method.method)}
                  />
                  <span>
                    {method.method === "cod"
                      ? t("Cash on delivery", "الدفع عند الاستلام")
                      : method.name}
                  </span>
                </label>
              ))}
            </div>
            {!available && (
              <p className="mp-checkout-help">
                {t(
                  "Available payment methods appear after signing in.",
                  "تظهر طرق الدفع المتاحة بعد تسجيل الدخول.",
                )}
              </p>
            )}
            {methods.data?.length === 0 && (
              <p role="status">
                {t(
                  "No payment methods are currently available. Please try again later.",
                  "لا توجد طرق دفع متاحة حاليًا. يرجى المحاولة لاحقًا.",
                )}
              </p>
            )}
            {(paymentMethod === "paymob" || paymentMethod === "xpay") && (
              <p className="mp-checkout-help">
                {t(
                  "After placing your order, you’ll continue to the payment provider.",
                  "بعد تأكيد طلبك، ستنتقل إلى مزود الدفع.",
                )}
              </p>
            )}
          </fieldset>
          <Link
            className="mp-checkout-return"
            to="/$locale/cart"
            params={{ locale: context.locale }}
          >
            <Icon name="chevron-left" size={16} />
            {t("Return to bag", "العودة إلى السلة")}
          </Link>
        </div>
        <CheckoutSummary summary={summary.data} updating={summary.isFetching}>
          <button
            className="mp-checkout-submit"
            type="submit"
            disabled={!ready}
          >
            {action.pending
              ? t("Placing order…", "جارٍ تأكيد الطلب…")
              : t("Place order", "تأكيد الطلب")}
            <Icon name="arrow" size={18} />
          </button>
          <button
            className="mp-checkout-refresh"
            type="button"
            disabled={
              !available ||
              !addressId ||
              summary.isFetching ||
              action.pending ||
              !!recovery
            }
            onClick={() => void summary.refetch()}
          >
            {t("Refresh order summary", "تحديث ملخص الطلب")}
          </button>
        </CheckoutSummary>
      </form>
      {recovery && (
        <div className="mp-checkout-recovery" role="status">
          <p>
            {t(
              "The order result is uncertain. Recover this order before submitting another.",
              "نتيجة الطلب غير مؤكدة. استعد هذا الطلب قبل إرسال طلب آخر.",
            )}
          </p>
          <button
            disabled={action.pending}
            onClick={() =>
              void action.run(async () => {
                const result = await session.client.recoverCheckout(recovery);
                remember();
                setRecovery(undefined);
                setOrder(result.order);
                await pay(result.order);
              })
            }
          >
            {t("Recover order", "استعادة الطلب")}
          </button>
        </div>
      )}
    </>
  );
} /** Reserved platform checkout: excluded from the author presentation registry. */
export function CheckoutPage() {
  const t = useCopy(),
    { locale } = useStorefront();
  return (
    <section className="mp-checkout-page">
      <nav
        className="mp-checkout-breadcrumb"
        aria-label={t("Breadcrumb", "مسار التنقل")}
      >
        <Link to="/$locale/cart" params={{ locale }}>
          <Icon name="chevron-left" size={14} />
          {t("Shopping bag", "سلة التسوق")}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{t("Checkout", "إتمام الطلب")}</span>
      </nav>
      <header className="mp-checkout-heading">
        <h1>{t("Checkout", "إتمام الطلب")}</h1>
        <p>
          {t(
            "A few details, then it’s yours.",
            "بضع تفاصيل وتصبح اختياراتك لك.",
          )}
        </p>
      </header>
      <Checkout />
    </section>
  );
}
export function PaymentCallback() {
  const { searchStr } = useLocation(),
    t = useCopy();
  const number = new URLSearchParams(searchStr).get("order");
  return (
    <section className="account-page">
      <h1>{t("Payment result", "نتيجة الدفع")}</h1>
      <p>
        {t(
          "Payment status below comes from your order. A provider redirect does not confirm payment.",
          "حالة الدفع أدناه من طلبك. إعادة توجيه مزود الدفع لا تؤكد نجاح الدفع.",
        )}
      </p>
      <Guard>
        {number ? (
          <Orders number={number} />
        ) : (
          <p>{t("No order number was supplied.", "لم يتم توفير رقم الطلب.")}</p>
        )}
      </Guard>
    </section>
  );
}
