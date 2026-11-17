import { Link } from "@tanstack/react-router";
import {
  useCommerce,
  useStorefront,
  useCustomerQuery,
  customerCacheKey,
} from "@orunelle/theme-sdk";
import { useCopy, Failure } from "../common/commerce";
import { AddressText } from "./AddressText";
import { Orders } from "./Orders";
import { Icon } from "../icons";

export function AccountOverview() {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy();
  const profile = useCustomerQuery(
    customerCacheKey(context, "profile"),
    session.client.customer.me,
    session.authenticated,
  );
  const addresses = useCustomerQuery(
    customerCacheKey(context, "addresses"),
    session.client.addresses.list,
    session.authenticated,
  );
  const address =
    addresses.data?.find((a) => a.isDefault) ?? addresses.data?.[0];
  return (
    <>
      <Failure error={profile.error || addresses.error} />
      <div className="metropolitan-account-intro">
        <div>
          <h2>
            {profile.data?.firstName
              ? t(
                  `Welcome, ${profile.data.firstName}`,
                  `مرحبًا، ${profile.data.firstName}`,
                )
              : t("Welcome back", "مرحبًا بعودتك")}
          </h2>
          <p>
            {t(
              "Manage your orders, delivery details and favourites.",
              "تابع طلباتك وعناوين التوصيل ومنتجاتك المفضلة.",
            )}
          </p>
        </div>
        <Link
          className="metropolitan-order-link"
          to="/$locale/account/profile"
          params={{ locale: context.locale }}
        >
          {t("Edit profile", "تعديل الملف الشخصي")}
        </Link>
      </div>
      <section className="metropolitan-dashboard-section">
        <header>
          <h2>{t("Recent orders", "الطلبات الأخيرة")}</h2>
          <Link
            to="/$locale/account/orders"
            params={{ locale: context.locale }}
          >
            {t("All orders", "كل الطلبات")}
          </Link>
        </header>
        <Orders limit={3} />
      </section>
      <section className="metropolitan-dashboard-section">
        <header>
          <h2>{t("Delivery address", "عنوان التوصيل")}</h2>
          <Link
            to="/$locale/account/addresses"
            params={{ locale: context.locale }}
          >
            {t("Manage addresses", "إدارة العناوين")}
          </Link>
        </header>
        {addresses.isPending ? (
          <p role="status">{t("Loading addresses…", "جارٍ تحميل العناوين…")}</p>
        ) : address ? (
          <div>
            <strong>{address.label}</strong>
            {address.isDefault && (
              <span className="metropolitan-default-label">
                {t("Default", "الافتراضي")}
              </span>
            )}
            <AddressText address={address} />
          </div>
        ) : (
          !addresses.error && (
            <p>
              {t(
                "Add an address to make your next checkout easier.",
                "أضف عنوانًا لتسهيل طلبك القادم.",
              )}
            </p>
          )
        )}
      </section>
      <ul className="metropolitan-account-links">
        <li>
          <Link
            to="/$locale/account/wishlist"
            params={{ locale: context.locale }}
          >
            {t("Your saved favourites", "منتجاتك المفضلة")}
            <Icon name="heart" />
          </Link>
        </li>
        <li>
          <Link
            to="/$locale/account/profile"
            params={{ locale: context.locale }}
          >
            {t("Preferences & security", "التفضيلات والأمان")}
            <Icon name="arrow" />
          </Link>
        </li>
        <li>
          <Link to="/$locale/tracking" params={{ locale: context.locale }}>
            {t("Track an order", "تتبع طلب")}
            <Icon name="truck" />
          </Link>
        </li>
      </ul>
    </>
  );
}
