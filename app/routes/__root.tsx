import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { getStorefront } from "@orunelle/theme-runtime/tanstack";
import styles from "@orunelle/theme-engine/styles.css?url";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    beforeLoad: async () => ({ storefront: await getStorefront() }),
    head: ({ matches }) => {
      const storefront = matches[0]?.context.storefront;
      const last = matches.at(-1);
      const path = last?.pathname ?? "/";
      const publicPage =
        last?.status === "success" &&
        /^\/(en|ar)(\/?$|\/(products|categories|collections|pages)(\/[^/]+)?\/?$)/.test(
          path,
        );
      return {
        meta: [
          { charSet: "utf-8" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          { title: "Metropolitan" },
          {
            name: "robots",
            content:
              storefront?.indexable && publicPage
                ? "index, follow"
                : "noindex, nofollow",
          },
        ],
        links: [
          ...(storefront?.indexable && publicPage
            ? [
                { rel: "canonical", href: storefront.origin + path },
                ...(["en", "ar"] as const).map((locale) => ({
                  rel: "alternate",
                  hrefLang: locale,
                  href:
                    storefront.origin +
                    path.replace(/^\/(en|ar)/, "/" + locale),
                })),
              ]
            : []),
          { rel: "stylesheet", href: styles },
        ],
      };
    },
    component: Document,
    notFoundComponent: NotFound,
    errorComponent: () => (
      <section className="error-page">
        <h1>Store unavailable / المتجر غير متاح</h1>
        <p>
          Please refresh to try again. / أعد تحميل الصفحة للمحاولة مرة أخرى.
        </p>
      </section>
    ),
  },
);
function Document() {
  const locale = useRouterState({
    select: (state) =>
      state.location.pathname.split("/")[1] === "ar" ? "ar" : "en",
  });
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
function NotFound() {
  const locale = useRouterState({
    select: (state) =>
      state.location.pathname.split("/")[1] === "ar" ? "ar" : "en",
  });
  return (
    <section className="storefront-shell error-page">
      <h1>{locale === "ar" ? "الصفحة غير موجودة" : "Page not found"}</h1>
      <p>
        {locale === "ar"
          ? "قد تكون الصفحة نُقلت أو لم تعد متاحة."
          : "This page may have moved or is no longer available."}
      </p>
      <Link to="/$locale" params={{ locale }}>
        {locale === "ar" ? "العودة إلى المنتجات" : "Back to products"}
      </Link>
    </section>
  );
}
