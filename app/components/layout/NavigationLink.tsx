import { useStorefront, type ThemeNodeProps } from "@orunelle/theme-sdk";
import { useText, useHref } from "../../hooks/useThemeSettings";
import { ThemeLink } from "../common/ThemeLink";
export function NavigationLink({ settings }: ThemeNodeProps) {
  const text = useText(),
    href = useHref(),
    { navigation } = useStorefront();
  const target = String(settings.href ?? "/products");
  if (
    target.startsWith("/pages/") &&
    !navigation?.some((item) => "/" + item.path === target)
  )
    return (
      <span className="metropolitan-unconfigured-link">
        {text(settings, "title")}
      </span>
    );
  return <ThemeLink href={href(target)}>{text(settings, "title")}</ThemeLink>;
}
