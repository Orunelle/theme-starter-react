import { type ReactNode, type CSSProperties } from "react";
import { useStorefront, ThemeSlot } from "@orunelle/theme-sdk";
import { useGlobal } from "../../hooks/useThemeSettings";
import { useTranslation } from "../../hooks/useTranslation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ToastProvider } from "../common/Toast";
import { CartProvider } from "../cart/CartProvider";
export function ThemeLayout({ children }: { children: ReactNode }) {
  const { locale } = useStorefront(),
    settings = useGlobal(),
    t = useTranslation();
  const style = {
    "--metropolitan-accent": String(settings.accent ?? "#33383c"),
    "--metropolitan-header": String(settings["header-background"] ?? "#fff"),
    "--metropolitan-header-ink": String(settings["header-color"] ?? "#111"),
    "--metropolitan-footer": String(settings["footer-background"] ?? "#f5f5f5"),
    "--metropolitan-footer-ink": String(settings["footer-color"] ?? "#111"),
    "--metropolitan-action": String(settings["product-accent"] ?? "#111"),
  } as CSSProperties;
  return (
    <div
      className="metropolitan-shell"
      data-hide-prices={settings["show-prices"] === false}
      dir={locale === "ar" ? "rtl" : "ltr"}
      style={style}
    >
      <ToastProvider>
        <CartProvider>
          <a className="metropolitan-skip" href="#content">
            {t("navigation.skip")}
          </a>
          <Header />
          <ThemeSlot name="header.after" />
          <main id="content" className="metropolitan-main">
            {children}
          </main>
          <ThemeSlot name="footer.before" />
          <Footer />
        </CartProvider>
      </ToastProvider>
    </div>
  );
}
