import { Link, useLocation } from "@tanstack/react-router";
import { useStorefront } from "@orunelle/theme-sdk";
import { Icon } from "../icons";
export function LanguageLink() {
  const { locale } = useStorefront(),
    location = useLocation();
  const other = locale === "en" ? "ar" : "en";
  return (
    <Link
      to={
        location.pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${other}`) +
        location.searchStr
      }
      lang={other}
      className="metropolitan-language"
    >
      <Icon name="globe" size={16} />
      {other === "ar" ? "العربية" : "EN English"}
    </Link>
  );
}
