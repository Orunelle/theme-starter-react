import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function ThemeLink({
  href,
  children,
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  "aria-current"?: "page";
}) {
  return href.startsWith("https://") || href.includes("#") ? (
    <a href={href} {...props}>
      {children}
    </a>
  ) : (
    <Link
      to={href}
      activeOptions={{ exact: true, includeSearch: false }}
      {...props}
    >
      {children}
    </Link>
  );
}
