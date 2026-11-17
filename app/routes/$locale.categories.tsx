import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/$locale/categories")({
  component: Outlet,
});
