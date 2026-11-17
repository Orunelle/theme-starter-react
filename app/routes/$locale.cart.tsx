import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "../components/cart/CartPage";
export const Route = createFileRoute("/$locale/cart")({ component: CartPage });
