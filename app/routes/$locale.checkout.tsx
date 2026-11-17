import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/$locale/checkout")({
  component: Outlet,
});
