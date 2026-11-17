import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../components/account/AccountPage";
export const Route = createFileRoute("/$locale/forgot-password")({
  component: () => <AccountPage path="forgot-password" />,
});
