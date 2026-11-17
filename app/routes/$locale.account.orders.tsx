import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/$locale/account/orders")({
  component: Outlet,
});
