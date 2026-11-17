import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useStorefront, ThemeComposition } from "@orunelle/theme-sdk";
import { useGlobal, useHref, useText } from "../../hooks/useThemeSettings";
import { LanguageLink } from "./LanguageLink";
import { Icon } from "../icons";

export function Footer() {
  const { locale, commerce, store } = useStorefront(),
    settings = useGlobal(),
    text = useText(),
    href = useHref(),
    ar = locale === "ar";
  const [notice, setNotice] = useState(""),
    [pending, setPending] = useState(false);
  const email = String(settings["contact-email"] ?? ""),
    phone = String(settings["contact-phone"] ?? ""),
    endpoint = String(settings["newsletter-url"] ?? "");
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!endpoint) {
      setNotice(
        ar
          ? "الاشتراك غير متاح حاليًا."
          : "Newsletter subscriptions are currently unavailable.",
      );
      return;
    }
    setPending(true);
    try {
      const target = new URL(endpoint, location.origin);
      if (target.protocol !== "https:" && target.origin !== location.origin)
        throw new Error();
      const response = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: new FormData(form).get("email"),
          consent: true,
        }),
      });
      if (!response.ok) throw new Error();
      setNotice(ar ? "شكرًا لاشتراكك." : "Thank you for subscribing.");
      form.reset();
    } catch {
      setNotice(
        ar
          ? "تعذّر الاشتراك. يرجى المحاولة لاحقًا."
          : "We couldn’t subscribe you. Please try again later.",
      );
    } finally {
      setPending(false);
    }
  }
  const groups = [
    {
      title: ar ? "تسوق" : "Shop",
      links: [
        ["Women", "نساء", "/collections/for-her"],
        ["Men", "رجال", "/collections/for-him"],
        ["Lookbook", "الإطلالات", "/pages/lookbook"],
        ["Collections", "المجموعات", "/collections"],
      ],
    },
    {
      title: ar ? "الشركة" : "Company",
      links: [
        ["About Us", "من نحن", "/pages/about-us"],
        ["Our Stores", "متاجرنا", "/pages/our-stores"],
        ["Journal", "المجلة", "/pages/journal"],
        ["Customer Care", "خدمة العملاء", "/pages/custom-care"],
      ],
    },
    {
      title: ar ? "معلومات" : "Legal",
      links: [
        ["Privacy Policy", "سياسة الخصوصية", "/pages/privacy-policy"],
        ["Refund Policy", "سياسة الاسترجاع", "/pages/refund-policy"],
        ["Terms of Service", "شروط الخدمة", "/pages/terms-of-service"],
      ],
    },
  ];
  return (
    <footer className="mp-footer" id="footer">
      <div className="mp-footer-main">
        <div className="mp-newsletter">
          <p>
            {ar
              ? "اشترك في نشرتنا ليصلك جديد المجموعات والإصدارات."
              : "Subscribe to our newsletter for new collections, thoughtful stories and the latest arrivals."}
          </p>
          <form onSubmit={(e) => void subscribe(e)}>
            <div>
              <input
                name="email"
                type="email"
                required
                placeholder={ar ? "بريدك الإلكتروني" : "Enter your Email"}
                aria-label={ar ? "البريد الإلكتروني" : "Email address"}
              />
              <button disabled={pending}>
                {pending
                  ? ar
                    ? "جارٍ الاشتراك…"
                    : "Subscribing…"
                  : ar
                    ? "اشترك"
                    : "Subscribe"}
              </button>
            </div>
            <label>
              <input type="checkbox" required />
              {ar
                ? "أوافق على الرسائل التسويقية وأقر بقراءة"
                : "I agree to receive marketing emails and have read the"}{" "}
              <Link to={href("/pages/privacy-policy")}>
                {ar ? "سياسة الخصوصية" : "Privacy policy"}
              </Link>
            </label>
            <p role="status">{notice}</p>
          </form>
        </div>
        {groups.map((g) => (
          <div className="mp-footer-column" key={g.title}>
            <h2>{g.title}</h2>
            {g.links.map(([en, arabic, url]) => (
              <Link key={url} to={href(url!)}>
                {ar ? arabic : en}
              </Link>
            ))}
          </div>
        ))}
        <div className="mp-footer-column">
          <h2>{ar ? "تواصل معنا" : "Contacts"}</h2>
          {email ? (
            <a href={`mailto:${email}`}>{email}</a>
          ) : (
            <Link to={href("/pages/custom-care")}>
              {ar ? "خدمة العملاء" : "Customer care"}
            </Link>
          )}
          {phone ? (
            <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
          ) : null}
          <Link to={href("/account/orders")}>
            {ar ? "تتبع الطلب" : "Track your order"}
          </Link>
        </div>
        <div className="mp-footer-column mp-footer-media">
          <h2>{ar ? "اكتشف المزيد" : "Discover"}</h2>
          <Link to={href("/pages/lookbook")}>
            {ar ? "دليل الإطلالات" : "Lookbook"}
            <Icon name="arrow" size={15} />
          </Link>
          <Link to={href("/pages/journal")}>
            {ar ? "قصصنا" : "Our stories"}
            <Icon name="arrow" size={15} />
          </Link>
          <ThemeComposition scope="group" name="footer" />
        </div>
      </div>
      <div className="mp-footer-base">
        <span>{String(settings.brand || store.name[locale])}</span>
        <p>
          © {new Date().getFullYear()}{" "}
          {String(settings.brand || store.name[locale])}.{" "}
          {ar ? "بدعم أورونيل" : "Powered by Orunelle"}
        </p>
        <LanguageLink />
      </div>
      {commerce !== "api" ? (
        <p className="metropolitan-preview-notice">
          {ar
            ? "معاينة تجريبية · المنتجات والأسعار للعرض فقط · لا تُنفذ طلبات حقيقية"
            : "Demo preview · Sample products and prices · No real orders are placed"}
        </p>
      ) : null}
    </footer>
  );
}
