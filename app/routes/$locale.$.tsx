import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/$locale/$")({
  loader: ({ params, location }) => {
    const path = params._splat ?? "";
    const aliases: Record<string, string> = {
      "account/profile": "account",
      "track-order": "tracking",
      "checkout/success": "account/orders",
      "auth/login": "login",
      "auth/register": "register",
      "auth/verify": "verify-email",
      "auth/forgot-password": "forgot-password",
      "auth/reset-password": "reset-password",
      "legal/privacy": "pages/privacy",
      "legal/terms": "pages/terms",
      drops: "collections",
    };
    const target =
      aliases[path] ??
      (path.startsWith("drops/")
        ? path.replace(/^drops\//, "collections/")
        : path.startsWith("category/")
          ? path.replace(/^category\//, "categories/")
          : undefined);
    if (target)
      throw redirect({
        href: `/${params.locale}/${target}${location.searchStr}`,
        statusCode: 301,
      });

    throw notFound();
  },
});
