import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useStorefront, ThemeComposition } from "@orunelle/theme-sdk";
import { ThemeImage } from "@orunelle/theme-engine";
import { useGlobal, useHref } from "../../hooks/useThemeSettings";
import { Icon } from "../icons";
import { LanguageLink } from "./LanguageLink";
import { useCart } from "../cart/CartProvider";

export function Header() {
  const { locale, store } = useStorefront(),
    settings = useGlobal(),
    href = useHref(),
    location = useLocation(),
    cart = useCart();
  const ar = locale === "ar",
    home = /^\/(en|ar)\/?$/.test(location.pathname);
  const [panel, setPanel] = useState<"menu" | "search" | null>(null),
    [scrolled, setScrolled] = useState(false),
    [dark, setDark] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const listener = () => setScrolled(window.scrollY > 30);
    listener();
    window.addEventListener("scroll", listener, { passive: true });
    return () => window.removeEventListener("scroll", listener);
  }, []);
  useEffect(() => {
    try {
      setDark(localStorage.getItem("metropolitan-color-mode") === "dark");
    } catch {}
  }, []);
  useEffect(() => {
    document
      .querySelector(".metropolitan-shell")
      ?.setAttribute("data-mode", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    setPanel(null);
  }, [location.pathname, location.searchStr]);
  useEffect(() => {
    if (panel) {
      dialog.current?.showModal();
      if (panel === "search") search.current?.focus();
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    dialog.current?.close();
  }, [panel]);
  const brand = String(settings.brand || store.name[locale]);
  return (
    <>
      <header className="mp-header" data-overlay={home && !scrolled}>
        <button
          className="mp-header-menu"
          aria-label={ar ? "القائمة" : "Menu"}
          onClick={() => setPanel("menu")}
          aria-haspopup="dialog"
        >
          <Icon name="menu" size={18} />
          <span>{ar ? "القائمة" : "Menu"}</span>
        </button>
        <Link
          to="/$locale"
          params={{ locale }}
          className="mp-wordmark"
          dir="ltr"
        >
          {store.logo ? (
            <ThemeImage
              value={store.logo}
              className="mp-logo"
              priority
              fallback={brand}
            />
          ) : (
            brand
          )}
        </Link>
        <div className="mp-header-tools">
          <span className="mp-header-locale">
            <LanguageLink />
          </span>
          {settings["enable-dark-mode"] !== false ? (
            <button
              className="mp-light-toggle"
              onClick={() => {
                const value = !dark;
                setDark(value);
                try {
                  localStorage.setItem(
                    "metropolitan-color-mode",
                    value ? "dark" : "light",
                  );
                } catch {}
              }}
              aria-pressed={dark}
            >
              <span aria-hidden className="mp-light-symbol" />
              <span>
                {ar
                  ? dark
                    ? "الوضع — داكن"
                    : "الوضع — فاتح"
                  : dark
                    ? "Light — Off"
                    : "Light — On"}
              </span>
            </button>
          ) : null}
          {settings["show-search"] !== false ? (
            <button
              onClick={() => setPanel("search")}
              aria-haspopup="dialog"
              aria-label={ar ? "البحث" : "Search"}
            >
              <Icon name="search" size={19} />
              <span>{ar ? "بحث" : "Search"}</span>
            </button>
          ) : null}
          <Link
            to={href("/account")}
            className="mp-header-account"
            aria-label={ar ? "الحساب" : "Account"}
          >
            <Icon name="user" size={19} />
            <span>{ar ? "الحساب" : "Account"}</span>
          </Link>
          <button
            onClick={cart.open}
            aria-haspopup="dialog"
            aria-label={`${ar ? "الحقيبة" : "Bag"} (${cart.count})`}
          >
            <Icon name="cart" size={19} />
            <span>
              {ar ? "الحقيبة" : "Bag"}
              {cart.count > 0 ? ` (${cart.count})` : ""}
            </span>
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        className={`mp-side-panel mp-${panel ?? "menu"}-panel`}
        aria-label={
          panel === "search"
            ? ar
              ? "البحث"
              : "Search"
            : ar
              ? "القائمة"
              : "Menu"
        }
        onClose={() => setPanel(null)}
        onCancel={() => setPanel(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const b = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < b.left ||
              e.clientX > b.right ||
              e.clientY < b.top ||
              e.clientY > b.bottom
            )
              setPanel(null);
          }
        }}
      >
        <div className="mp-panel-top">
          <button onClick={() => setPanel(null)} autoFocus>
            <Icon name="close" size={17} />
            {ar ? "إغلاق" : "Close"}
          </button>
        </div>
        {panel === "menu" ? (
          <nav
            className="mp-side-navigation"
            aria-label={ar ? "التنقل الرئيسي" : "Main navigation"}
          >
            <ThemeComposition scope="group" name="header" />
            <details>
              <summary>{ar ? "عن العلامة" : "Company"}</summary>
              <Link to={href("/pages/about-us")}>
                {ar ? "من نحن" : "About us"}
              </Link>
              <Link to={href("/pages/journal")}>
                {ar ? "المجلة" : "Journal"}
              </Link>
              <Link to={href("/pages/custom-care")}>
                {ar ? "خدمة العملاء" : "Customer care"}
              </Link>
              <Link to={href("/pages/our-stores")}>
                {ar ? "متاجرنا" : "Our stores"}
              </Link>
            </details>
            <LanguageLink />
          </nav>
        ) : null}
        {panel === "search" ? (
          <div className="mp-search-panel-body">
            <h2>{ar ? "ما الذي تبحث عنه؟" : "What are you looking for?"}</h2>
            <form role="search" action={href("/search")}>
              <input
                ref={search}
                name="q"
                type="search"
                placeholder={ar ? "ابحث في المنتجات" : "Search products"}
                aria-label={ar ? "ابحث في المنتجات" : "Search products"}
                maxLength={200}
                required
              />
              <button aria-label={ar ? "بحث" : "Search"}>
                <Icon name="arrow" />
              </button>
            </form>
            <p>{ar ? "اكتشف المجموعة" : "Explore the collection"}</p>
            <Link to={href("/products")}>
              {ar ? "جميع المنتجات" : "All products"}
            </Link>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
