import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../components/account/AccountPage";
export const Route = createFileRoute("/$locale/verify-email")({
  component: () => <AccountPage path="verify-email" />,
});
