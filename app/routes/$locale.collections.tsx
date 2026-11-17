import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/$locale/collections")({
  component: Outlet,
});
