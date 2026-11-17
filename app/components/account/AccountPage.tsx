import { ThemeLink } from "../common/ThemeLink";
import { useEffect, useRef, useState } from "react";
import { AuthForm } from "./AuthForm";
import { Link } from "@tanstack/react-router";
import { Icon, type IconName } from "../icons";
import {
  useStorefront,
  useCommerce,
  useCustomerQuery,
  customerCacheKey,
} from "@orunelle/theme-sdk";
import { Orders } from "./Orders";
import { Addresses } from "./Addresses";
import { useCart } from "../cart/CartProvider";
import { AccountOverview } from "./AccountOverview";
import {
  useCopy,
  useAction,
  Failure,
  Field,
  Guard,
  FixtureNotice,
  values,
  val,
} from "../common/commerce";
export function Profile() {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy(),
    action = useAction();
  const query = useCustomerQuery(
    customerCacheKey(context, "profile"),
    session.client.customer.me,
    session.authenticated,
  );
  return (
    <>
      <Failure error={query.error || action.error} />
      {query.isPending && (
        <p role="status">{t("Loading profile…", "جارٍ تحميل الملف الشخصي…")}</p>
      )}
      {query.error && (
        <button type="button" onClick={() => void query.refetch()}>
          {t("Try again", "حاول مجددًا")}
        </button>
      )}
      {query.data && (
        <form
          key={query.data.id}
          className="store-form"
          method="post"
          onSubmit={(event) => {
            const data = values(event);
            void action.run(async () => {
              await session.client.customer.update({
                firstName: val(data, "firstName"),
                lastName: val(data, "lastName"),
                phone: val(data, "phone"),
              });
              await query.refetch();
              action.setNotice(t("Profile saved.", "تم حفظ الملف الشخصي."));
            });
          }}
        >
          <h2>{t("Personal details", "البيانات الشخصية")}</h2>
          <p className="metropolitan-account-email" dir="ltr">
            {query.data.email}
          </p>
          <Field
            name="firstName"
            label={t("First name", "الاسم الأول")}
            value={query.data.firstName}
          />
          <Field
            name="lastName"
            label={t("Last name", "اسم العائلة")}
            value={query.data.lastName}
          />
          <Field
            name="phone"
            type="tel"
            label={t("Phone", "الهاتف")}
            value={query.data.phone}
          />
          <button disabled={action.pending}>
            {t("Save profile", "حفظ الملف الشخصي")}
          </button>
          <p role="status">{action.notice}</p>
        </form>
      )}
      {query.data && (
        <form
          key={`preferences:${query.data.locale}:${query.data.marketingConsent}`}
          className="store-form metropolitan-preferences"
          method="post"
          onSubmit={(event) => {
            const data = values(event);
            void action.run(async () => {
              await session.client.customer.update({
                locale: val(data, "locale"),
                marketingConsent: data.get("marketingConsent") === "on",
              });
              await query.refetch();
              action.setNotice(t("Preferences saved.", "تم حفظ التفضيلات."));
            });
          }}
        >
          <h2>{t("Preferences & security", "التفضيلات والأمان")}</h2>
          <label className="form-field">
            <span>{t("Preferred language", "اللغة المفضلة")}</span>
            <select
              name="locale"
              defaultValue={
                query.data.locale.startsWith("ar") ? "ar-EG" : "en-US"
              }
            >
              <option value="en-US">English</option>
              <option value="ar-EG">العربية</option>
            </select>
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              name="marketingConsent"
              defaultChecked={query.data.marketingConsent}
            />
            {t(
              "Email me product news and offers",
              "أرسل لي أخبار المنتجات والعروض بالبريد",
            )}
          </label>
          <button disabled={action.pending}>
            {t("Save preferences", "حفظ التفضيلات")}
          </button>
          <Link
            to="/$locale/forgot-password"
            params={{ locale: context.locale }}
          >
            {t("Reset your password", "إعادة تعيين كلمة المرور")}
          </Link>
        </form>
      )}
      <div className="action-row">
        <button
          className="button-secondary"
          disabled={action.pending}
          onClick={() =>
            void action.run(async () => {
              await session.client.cart.mergeGuest();
              await session.cache.invalidateQueries();
              action.setNotice(t("Guest cart merged.", "تم دمج سلة الزائر."));
            })
          }
        >
          {t("Merge guest cart", "دمج سلة الزائر")}
        </button>
        <button
          disabled={action.pending}
          onClick={() => void action.run(session.logout)}
        >
          {t("Sign out", "تسجيل الخروج")}
        </button>
      </div>
    </>
  );
}
function WishlistPage() {
  const cart = useCart();
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy(),
    action = useAction();
  const query = useCustomerQuery(
    customerCacheKey(context, "wishlist"),
    session.client.wishlist.read,
    session.authenticated,
  );
  const items = query.data
    ? [
        ...query.data.uncategorized,
        ...query.data.collections.flatMap((c) => c.items),
      ]
    : [];
  return (
    <>
      <Failure error={query.error || action.error} />
      {query.isPending && (
        <p role="status">{t("Loading favourites…", "جارٍ تحميل المفضلة…")}</p>
      )}
      {query.error && (
        <button type="button" onClick={() => void query.refetch()}>
          {t("Try again", "حاول مجددًا")}
        </button>
      )}
      <ul className="resource-list">
        {items.map((item) => (
          <li key={item.id}>
            {item.productVariant ? (
              <Link
                to="/$locale/products/$handle"
                params={{
                  locale: context.locale,
                  handle: item.productVariant.product.handle,
                }}
              >
                {item.productVariant.product.name}
              </Link>
            ) : (
              <span>{t("Unavailable product", "منتج غير متاح")}</span>
            )}
            {item.productVariant && (
              <button
                type="button"
                disabled={!item.available || action.pending}
                onClick={() =>
                  void action.run(async () => {
                    cart.update(
                      await session.client.cart.add(item.productVariant!.id, 1),
                    );
                    action.setNotice(
                      t("Added to your cart.", "تمت الإضافة إلى السلة."),
                    );
                    cart.open();
                  })
                }
              >
                {item.available
                  ? t("Add to cart", "أضف إلى السلة")
                  : t("Out of stock", "نفد المخزون")}
              </button>
            )}
            <button
              className="button-secondary"
              disabled={action.pending}
              onClick={() =>
                void action.run(async () => {
                  await session.client.wishlist.remove(item.id);
                  await query.refetch();
                  action.setNotice(
                    t("Removed from your favourites.", "تم الحذف من المفضلة."),
                  );
                })
              }
            >
              {t("Remove from wishlist", "حذف من المفضلة")}
            </button>
          </li>
        ))}
      </ul>
      {query.data && !items.length && (
        <p className="empty-state">
          {t(
            "Your wishlist is empty. Save a product to find it here.",
            "المفضلة فارغة. احفظ منتجًا ليظهر هنا.",
          )}
        </p>
      )}
    </>
  );
}
function Tracking() {
  const t = useCopy(),
    [number, setNumber] = useState("");
  return (
    <>
      <form
        className="store-form"
        method="get"
        onSubmit={(e) => {
          const data = values(e);
          setNumber(val(data, "number"));
        }}
      >
        <Field name="number" label={t("Order number", "رقم الطلب")} />
        <button>{t("Find order", "البحث عن الطلب")}</button>
      </form>
      {number && <Orders number={number} />}
    </>
  );
}
export function AccountPage({
  path,
  print = false,
}: {
  path: string;
  print?: boolean;
}) {
  const action = useAction();
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy();
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(max-width: 680px)").matches) return;
    navigation.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [path, session.ready, session.authenticated]);
  if (
    [
      "login",
      "register",
      "forgot-password",
      "reset-password",
      "verify-email",
    ].includes(path)
  )
    return (
      <section className="account-page metropolitan-account-page">
        <AuthForm path={path} />
      </section>
    );
  const title =
    path === "account/profile"
      ? t("Personal details", "البيانات الشخصية")
      : path === "account/addresses"
        ? t("Delivery addresses", "عناوين التوصيل")
        : path.startsWith("account/orders")
          ? t("Your orders", "طلباتك")
          : path === "account/wishlist"
            ? t("Your wishlist", "المفضلة")
            : path === "tracking"
              ? t("Track your order", "تتبع طلبك")
              : t("Your account", "حسابك");
  if (context.commerce !== "api" || context.mode === "preview")
    return (
      <section className="account-page metropolitan-account-page">
        <h1>{title}</h1>
        <FixtureNotice />
      </section>
    );
  if (!session.ready)
    return (
      <section className="account-page metropolitan-account-page">
        <p role="status">{t("Loading your session…", "جارٍ تحميل الجلسة…")}</p>
      </section>
    );
  if (!session.authenticated)
    return (
      <section className="account-page metropolitan-account-page">
        <AuthForm path="login" />
      </section>
    );
  const links: [string, string, IconName][] = [
    ["account", t("Overview", "نظرة عامة"), "user"],
    ["account/profile", t("Personal details", "بياناتي الشخصية"), "user"],
    ["account/orders", t("My orders", "طلباتي"), "package"],
    ["account/addresses", t("Delivery addresses", "عناوين التوصيل"), "truck"],
    ["account/wishlist", t("My favourites", "المفضلة"), "heart"],
    ["tracking", t("Track an order", "تتبع طلب"), "search"],
  ];
  return (
    <section className="account-page metropolitan-account-page">
      <header className="metropolitan-account-heading">
        <h1>{title}</h1>
        <p>
          {t(
            "A little easier, every time you shop.",
            "كل ما تحتاجه لتجربة تسوق أسهل.",
          )}
        </p>
      </header>
      <div className="metropolitan-account-layout">
        <nav
          ref={navigation}
          className="metropolitan-account-navigation"
          aria-label={t("Your account", "حسابك")}
        >
          {links.map(([route, label, icon]) => (
            <ThemeLink
              key={route}
              href={`/${context.locale}/${route}`}
              aria-current={
                path === route ||
                (route === "account/orders" &&
                  path.startsWith("account/orders/"))
                  ? "page"
                  : undefined
              }
            >
              <Icon name={icon} size={20} />
              {label}
            </ThemeLink>
          ))}
          <button
            type="button"
            disabled={action.pending}
            onClick={() => void action.run(session.logout)}
          >
            {t("Sign out", "تسجيل الخروج")}
          </button>
        </nav>
        <div className="metropolitan-account-panel">
          <Guard>
            {path === "account/addresses" ? (
              <Addresses />
            ) : path.startsWith("account/orders") ? (
              <Orders number={path.split("/")[2] ?? ""} print={print} />
            ) : path === "account/wishlist" ? (
              <WishlistPage />
            ) : path === "tracking" ? (
              <Tracking />
            ) : path === "account/profile" ? (
              <Profile />
            ) : (
              <AccountOverview />
            )}
          </Guard>
        </div>
      </div>
    </section>
  );
}
