import { createFileRoute } from "@tanstack/react-router";
import { PaymentCallback } from "../components/checkout/CheckoutPage";
export const Route = createFileRoute("/$locale/checkout/paymob-callback")({
  component: PaymentCallback,
});
