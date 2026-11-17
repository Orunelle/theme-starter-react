import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  useStorefront,
  useCommerce,
  useCustomerQuery,
  customerCacheKey,
  formatMoney,
} from "@orunelle/theme-sdk";
import type { Order } from "@orunelle/theme-sdk/commerce";
import { useCopy, Failure } from "../common/commerce";

export function OrderDetails({
  order,
  print = false,
}: {
  order: Order;
  print?: boolean;
}) {
  const t = useCopy(),
    { locale, store } = useStorefront();
  const printed = useRef("");
  useEffect(() => {
    if (!print || printed.current === order.id) return;
    const frame = requestAnimationFrame(() => {
      printed.current = order.id;
      window.print();
    });
    return () => cancelAnimationFrame(frame);
  }, [print, order.id]);
  const status = useOrderStatus();
  const money = (amount: number) =>
    formatMoney(amount, order.totals.currency, locale);
  const totals: [string, number][] = [
    [t("Subtotal", "المجموع الفرعي"), order.totals.subtotalMinor],
    [
      t("Discount", "الخصم"),
      order.totals.discountMinor ? -order.totals.discountMinor : 0,
    ],
    [t("Delivery", "التوصيل"), order.totals.shippingMinor],
    [
      order.totals.taxInclusive
        ? t("Tax included", "الضريبة المشمولة")
        : t("Tax", "الضريبة"),
      order.totals.taxMinor,
    ],
    [t("Amount due", "المبلغ المستحق"), order.totals.amountDueMinor],
    [t("Total", "الإجمالي"), order.totals.totalMinor],
  ];
  return (
    <article className="metropolitan-order-details">
      <header className="metropolitan-account-intro">
        <div>
          <h2>
            {t("Invoice for order", "فاتورة الطلب")} {order.orderNumber}
          </h2>
          <p className="metropolitan-invoice-store">
            {t("Issued by", "صادرة من")}: {store.name[locale]}
          </p>
        </div>
        <button
          type="button"
          className="metropolitan-no-print button-secondary"
          onClick={() => window.print()}
        >
          {t("Print invoice", "طباعة الفاتورة")}
        </button>
      </header>
      <dl className="metropolitan-order-meta">
        {[
          [t("Order status", "حالة الطلب"), status(order.status)],
          [t("Payment status", "حالة الدفع"), status(order.paymentStatus)],
          [
            t("Payment method", "طريقة الدفع"),
            order.paymentMethod === "cod"
              ? t("Cash on delivery", "الدفع عند الاستلام")
              : order.paymentMethod,
          ],
          [t("Delivery", "التوصيل"), order.delivery.name],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="metropolitan-order-table-wrap">
        <table className="metropolitan-order-table">
          <thead>
            <tr>
              <th scope="col">{t("Product", "المنتج")}</th>
              <th scope="col">{t("Quantity", "الكمية")}</th>
              <th scope="col">{t("Total", "الإجمالي")}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{money(item.totalMinor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="metropolitan-order-totals">
        {totals.map(([label, amount]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{money(amount)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
export function Orders({
  number = "",
  print = false,
  limit,
}: {
  number?: string;
  print?: boolean;
  limit?: number;
}) {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy();
  const status = useOrderStatus();
  const [page, setPage] = useState(1);
  const query = useCustomerQuery(
    [...customerCacheKey(context, "orders"), page],
    () => session.client.orders.list(page),
    session.authenticated && !number,
  );
  const detail = useCustomerQuery(
    [...customerCacheKey(context, "order"), number],
    () => session.client.orders.get(number),
    session.authenticated && !!number,
  );
  if (number)
    return (
      <>
        <Link
          className="metropolitan-order-link metropolitan-no-print"
          to="/$locale/account/orders"
          params={{ locale: context.locale }}
        >
          {t("Back to orders", "العودة إلى الطلبات")}
        </Link>
        <Failure error={detail.error} />
        {detail.error ? (
          <button
            type="button"
            className="button-secondary"
            onClick={() => void detail.refetch()}
          >
            {t("Try again", "حاول مجددًا")}
          </button>
        ) : detail.data ? (
          <OrderDetails order={detail.data} print={print} />
        ) : (
          <p role="status">{t("Loading order…", "جارٍ تحميل الطلب…")}</p>
        )}
      </>
    );
  return (
    <>
      <Failure error={query.error} />
      {query.isPending && (
        <p role="status">{t("Loading orders…", "جارٍ تحميل الطلبات…")}</p>
      )}
      {query.error && (
        <button
          type="button"
          className="button-secondary"
          onClick={() => void query.refetch()}
        >
          {t("Try again", "حاول مجددًا")}
        </button>
      )}
      <ul className="metropolitan-order-list">
        {query.data?.items.slice(0, limit).map((order) => (
          <li key={order.id} className="metropolitan-order-row">
            <div>
              <h2>
                {t("Order", "الطلب")} {order.orderNumber}
              </h2>
              <p>
                {status(order.status)} · {status(order.paymentStatus)}
              </p>
            </div>
            <strong>
              {formatMoney(
                order.totals.totalMinor,
                order.totals.currency,
                context.locale,
              )}
            </strong>
            <div className="action-row">
              <Link
                className="metropolitan-order-link"
                to="/$locale/account/orders/$number"
                params={{ locale: context.locale, number: order.orderNumber }}
              >
                {t("View order", "عرض الطلب")}
              </Link>
              <Link
                className="metropolitan-order-link"
                to="/$locale/account/orders/$number"
                params={{ locale: context.locale, number: order.orderNumber }}
                search={{ print: true }}
              >
                {t("Print invoice", "طباعة الفاتورة")}
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {query.data?.items.length === 0 && (
        <div className="empty-state">
          <h2>{t("Your first order starts here", "طلبك الأول يبدأ هنا")}</h2>
          <p>
            {t(
              "Your orders and invoices will appear here after checkout.",
              "ستظهر طلباتك وفواتيرك هنا بعد إتمام الشراء.",
            )}
          </p>
          <Link
            className="metropolitan-order-link"
            to="/$locale/products"
            params={{ locale: context.locale }}
          >
            {t("Explore products", "تصفح المنتجات")}
          </Link>
        </div>
      )}
      {!limit && query.data && query.data.pagination.pages > 1 && (
        <nav
          className="action-row"
          aria-label={t("Order pages", "صفحات الطلبات")}
        >
          <button
            type="button"
            disabled={page <= 1 || query.isFetching}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("Previous", "السابق")}
          </button>
          <span>
            {page} / {query.data.pagination.pages}
          </span>
          <button
            type="button"
            disabled={page >= query.data.pagination.pages || query.isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("Next", "التالي")}
          </button>
        </nav>
      )}
    </>
  );
}

function useOrderStatus() {
  const t = useCopy();
  const labels: Record<string, [string, string]> = {
    pending: ["Pending", "قيد الانتظار"],
    confirmed: ["Confirmed", "مؤكد"],
    processing: ["Processing", "قيد التجهيز"],
    shipped: ["Shipped", "تم الشحن"],
    delivered: ["Delivered", "تم التوصيل"],
    cancelled: ["Cancelled", "ملغي"],
    paid: ["Paid", "مدفوع"],
    unpaid: ["Unpaid", "غير مدفوع"],
    failed: ["Failed", "فشل"],
    refunded: ["Refunded", "تم الاسترداد"],
    partially_refunded: ["Partially refunded", "تم الاسترداد جزئيًا"],
    returned: ["Returned", "مرتجع"],
  };
  return (value: string) =>
    labels[value] ? t(...labels[value]!) : value.replace(/_/g, " ");
}
