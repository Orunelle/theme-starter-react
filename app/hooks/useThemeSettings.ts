import { useStorefront, useThemeRuntime } from "@orunelle/theme-sdk";
import {
  resolveSettingValues,
  type SettingValues,
} from "@orunelle/theme-contract";

export function useText() {
  const { locale, store } = useStorefront();
  return (values: SettingValues, key: string) =>
    String(values[`${key}-${locale}`] ?? values[`${key}-en`] ?? "").replaceAll(
      "{{store}}",
      store.name[locale],
    );
}

export function useGlobal() {
  const { theme, configuration } = useThemeRuntime();
  return resolveSettingValues(
    theme.manifest.editor?.settings ?? {},
    configuration?.settings ?? {},
  );
}

export function useHref() {
  const { locale } = useStorefront();
  return (value: string) => {
    if (!value) return `/${locale}/products`;
    if (value.startsWith("https://")) return value;
    if (value.startsWith("#")) return `/${locale}/${value}`;
    if (/^\/(en|ar)(\/|$)/.test(value)) return value;
    return `/${locale}${value.startsWith("/") ? "" : "/"}${value}`;
  };
}
