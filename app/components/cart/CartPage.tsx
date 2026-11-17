import { useCopy } from "../common/commerce";
import { useStorefront } from "@orunelle/theme-sdk";
import { DemoBag } from "./CartProvider";
import { useCart } from "./CartProvider";
import { CartContents } from "./CartContents";
export function CartPage() {
  const { commerce } = useStorefront();
  const t = useCopy(),
    { count } = useCart();
  return (
    <section className="cart-page metropolitan-cart-page">
      <header className="metropolitan-account-heading">
        <h1>
          {t("Your cart", "سلة التسوق")} <span>({count})</span>
        </h1>
        <p>
          {t(
            "Your next favourites, all in one place.",
            "اختياراتك المفضلة في مكان واحد.",
          )}
        </p>
      </header>
      {commerce === "api" ? <CartContents /> : <DemoBag />}
    </section>
  );
}
