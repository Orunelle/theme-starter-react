import { type ReactNode } from "react";

export type IconName =
  | "search"
  | "user"
  | "heart"
  | "cart"
  | "menu"
  | "close"
  | "arrow"
  | "truck"
  | "package"
  | "globe"
  | "plus"
  | "minus"
  | "chevron-left"
  | "chevron-right";

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21v-3a7 7 0 0 1 14 0v3" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    cart: (
      <>
        <path d="M6 7h12l1 14H5L6 7ZM9 7V4a3 3 0 0 1 6 0v3" />
      </>
    ),
    menu: <path d="M4 8h16M4 15h12" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    truck: (
      <>
        <path d="M2 4h12v12H2zM14 9h4l4 4v3h-8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    package: (
      <>
        <path d="m3 7 9-5 9 5v11l-9 5-9-5zM3 7l9 5 9-5M12 12v11" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a17 17 0 0 0 0 20M12 2a17 17 0 0 1 0 20" />
      </>
    ),
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    "chevron-left": <path d="m14 6-6 6 6 6" />,
    "chevron-right": <path d="m10 6 6 6-6 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
