import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useCommerce, useStorefront } from "@orunelle/theme-sdk";
import { CommerceError } from "@orunelle/theme-sdk/commerce";
import enCopy from "../../../locales/en.json";
import arCopy from "../../../locales/ar.json";
import { useToast } from "./Toast";
const copy: Record<string, Readonly<Record<string, string>>> = {
  en: enCopy,
  ar: arCopy,
};
export function useCopy() {
  const { locale } = useStorefront();
  return (en: string, ar: string) =>
    copy[locale]?.[en] ?? (locale === "ar" ? ar : en);
}
export function useAction() {
  const toast = useToast(),
    t = useCopy(),
    busy = useRef(false);
  const [pending, setPending] = useState(false),
    [error, setError] = useState<unknown>(),
    [notice, setNotice] = useState("");
  return {
    pending,
    error,
    notice,
    setNotice(message: string) {
      setNotice(message);
      toast(message);
    },
    async run(action: () => Promise<void>) {
      if (busy.current) return;
      busy.current = true;
      setPending(true);
      setError(undefined);
      setNotice("");
      try {
        await action();
      } catch (error) {
        setError(error);
        toast(
          t(
            "The request could not be completed. Please try again.",
            "تعذر إكمال الطلب. حاول مرة أخرى.",
          ),
          "error",
        );
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
  };
}
export function Failure({ error }: { error: unknown }) {
  const t = useCopy();
  if (!error) return null;
  const uncertain = error instanceof CommerceError && error.recovery;
  return (
    <p className="form-error" role="alert">
      {uncertain
        ? t(
            "We could not confirm the result. Refresh the resource before trying again. For an order, use Recover order to reuse its original request.",
            "تعذر تأكيد النتيجة. حدّث البيانات قبل المحاولة مجددًا. للطلب، استخدم استعادة الطلب لإعادة استخدام نفس الطلب.",
          )
        : t(
            "The request could not be completed. Check your details and try again.",
            "تعذر إكمال الطلب. راجع البيانات وحاول مرة أخرى.",
          )}
      {error instanceof CommerceError && (
        <span className="request-reference">
          {t("Reference", "المرجع")}: {error.code} {error.requestId}
        </span>
      )}
    </p>
  );
}
export function Field({
  label,
  name,
  type = "text",
  required = true,
  value,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value?: string;
  autoComplete?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={value}
        autoComplete={autoComplete}
        minLength={
          type === "password"
            ? autoComplete === "current-password"
              ? 1
              : 12
            : undefined
        }
      />
    </label>
  );
}
export function values(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  return new FormData(event.currentTarget);
}
export const val = (data: FormData, name: string) =>
  String(data.get(name) ?? "");
export function FixtureNotice() {
  const t = useCopy();
  return (
    <p className="sample-notice" role="status">
      {t(
        "This reference preview uses sample data. Purchases and account changes are unavailable.",
        "تستخدم هذه المعاينة بيانات تجريبية. الشراء وتعديل الحساب غير متاحين.",
      )}
    </p>
  );
}
export function Guard({ children }: { children: ReactNode }) {
  const context = useStorefront(),
    session = useCommerce(),
    t = useCopy();
  if (context.commerce !== "api" || context.mode === "preview")
    return <FixtureNotice />;
  if (!session.ready)
    return (
      <p role="status">{t("Loading your session…", "جارٍ تحميل الجلسة…")}</p>
    );
  if (!session.authenticated)
    return (
      <p>
        {t("Sign in to continue.", "سجل الدخول للمتابعة.")}{" "}
        <Link to="/$locale/login" params={{ locale: context.locale }}>
          {t("Sign in", "تسجيل الدخول")}
        </Link>
      </p>
    );
  return children;
}
export function Pagination({ page, pages }: { page: number; pages: number }) {
  const { pathname, searchStr } = useLocation();
  const t = useCopy();
  function href(target: number) {
    const params = new URLSearchParams(searchStr);
    params.set("page", String(target));
    return `${pathname}?${params}`;
  }
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label={t("Pagination", "الصفحات")}>
      {page > 1 && <Link to={href(page - 1)}>{t("Previous", "السابق")}</Link>}
      <span>
        {page} / {pages}
      </span>
      {page < pages && <Link to={href(page + 1)}>{t("Next", "التالي")}</Link>}
    </nav>
  );
}
