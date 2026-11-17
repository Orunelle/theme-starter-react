import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../components/account/AccountPage";
export const Route = createFileRoute("/$locale/account/addresses")({
  component: () => <AccountPage path="account/addresses" />,
});
