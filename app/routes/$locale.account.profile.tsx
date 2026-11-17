import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../components/account/AccountPage";
export const Route = createFileRoute("/$locale/account/profile")({
  component: () => <AccountPage path="account/profile" />,
});
