import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../components/account/AccountPage";
export const Route = createFileRoute("/$locale/account/orders/")({
  component: () => <AccountPage path="account/orders" />,
});
