import { useStorefront } from "@orunelle/theme-sdk";
import en from "../../locales/en.json";
import ar from "../../locales/ar.json";
export function useTranslation() {
  const { locale } = useStorefront();
  return (key: keyof typeof en) => (locale === "ar" ? ar : en)[key];
}
