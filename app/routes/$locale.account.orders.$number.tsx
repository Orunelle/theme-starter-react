import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../components/account/AccountPage";
export const Route = createFileRoute("/$locale/account/orders/$number")({
  validateSearch: (search: Record<string, unknown>): { print?: boolean } => ({
    print:
      search.print === true || search.print === "true" || search.print === "1",
  }),
  component: () => {
    const { number } = Route.useParams();
    const { print } = Route.useSearch();
    return <AccountPage path={"account/orders/" + number} print={print} />;
  },
});
