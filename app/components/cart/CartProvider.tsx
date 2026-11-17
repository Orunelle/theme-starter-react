import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "@tanstack/react-router";
import {
  customerCacheKey,
  useCommerce,
  useCustomerQuery,
  useStorefront,
  type PublicProduct,
} from "@orunelle/theme-sdk";
import type { Variant } from "@orunelle/theme-sdk/commerce";
import { demoItems as samples } from "../../lib/demo-data";
import type { Cart } from "@orunelle/theme-sdk/commerce";
import { Icon } from "../icons";
import { ToastViewport } from "../common/Toast";
import { CartContents } from "./CartContents";
import { useCopy } from "../common/commerce";

function useCartState() {
  const context = useStorefront(),
    session = useCommerce();
  const [isOpen, setOpen] = useState(false);
  const [demoLines, setDemoLines] = useState<
    {
      product: PublicProduct;
      variantId: string;
      quantity: number;
      label: string;
    }[]
  >([]);
  const demoKey = `metropolitan-demo-bag:${context.store.id}`;
  useEffect(() => {
    if (context.commerce === "api") return;
    try {
      const saved = JSON.parse(localStorage.getItem(demoKey) ?? "[]");
      if (!Array.isArray(saved)) return;
      setDemoLines(
        saved
          .slice(0, 40)
          .flatMap((line: { variantId?: string; quantity?: number }) => {
            const item = samples.find((item) =>
              item.variants.some((v) => v.id === line?.variantId),
            );
            const variant = item?.variants.find((v) => v.id === line.variantId);
            if (
              !item ||
              !variant ||
              !Number.isInteger(line.quantity) ||
              Number(line.quantity) < 1
            )
              return [];
            return [
              {
                product: item.product,
                variantId: variant.id,
                quantity: Math.min(
                  Number(line.quantity),
                  variant.availableQuantity || 1,
                ),
                label: Object.values(variant.options ?? {}).join(" / "),
              },
            ];
          }),
      );
    } catch {
      /* A disabled local store does not prevent a temporary demo bag. */
    }
  }, [demoKey, context.commerce]);
  function setDemo(next: typeof demoLines) {
    setDemoLines(next);
    try {
      localStorage.setItem(
        demoKey,
        JSON.stringify(
          next.map(({ variantId, quantity }) => ({ variantId, quantity })),
        ),
      );
    } catch {}
  }
  function addDemo(product: PublicProduct, variant: Variant, quantity: number) {
    if (context.commerce === "api") return;
    const current = demoLines.find((line) => line.variantId === variant.id);
    const nextQuantity = Math.min(
      variant.availableQuantity,
      quantity + (current?.quantity ?? 0),
    );
    setDemo(
      current
        ? demoLines.map((line) =>
            line.variantId === variant.id
              ? { ...line, quantity: nextQuantity }
              : line,
          )
        : [
            ...demoLines,
            {
              product,
              variantId: variant.id,
              quantity: nextQuantity,
              label: Object.values(variant.options ?? {}).join(" / "),
            },
          ],
    );
  }
  function changeDemo(variantId: string, quantity: number) {
    if (context.commerce === "api" || !Number.isInteger(quantity)) return;
    const variant = samples
      .flatMap((item) => item.variants)
      .find((v) => v.id === variantId);
    setDemo(
      quantity <= 0
        ? demoLines.filter((line) => line.variantId !== variantId)
        : demoLines.map((line) =>
            line.variantId === variantId
              ? {
                  ...line,
                  quantity: Math.min(
                    quantity,
                    variant?.availableQuantity ?? 10,
                  ),
                }
              : line,
          ),
    );
  }
  const query = useCustomerQuery(
    customerCacheKey(context, "cart"),
    session.client.cart.read,
    context.commerce === "api",
  );
  const update = useCallback(
    (cart: Cart) => {
      session.cache.setQueryData(
        [
          "customer",
          session.customerId || "guest",
          ...customerCacheKey(context, "cart"),
        ],
        cart,
      );
    },
    [session.cache, session.customerId, context],
  );
  return {
    query,
    update,
    demoLines,
    addDemo,
    changeDemo,
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
    count:
      context.commerce === "api"
        ? (query.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0)
        : demoLines.reduce((sum, line) => sum + line.quantity, 0),
  };
}
const CartContext = createContext<ReturnType<typeof useCartState> | null>(null);
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartProvider is required.");
  return context;
}
export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCartState();
  return (
    <CartContext.Provider value={cart}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}
function CartDrawer() {
  const { commerce, locale } = useStorefront();
  const cart = useCart(),
    t = useCopy(),
    { pathname } = useLocation();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    cart.close();
  }, [pathname]);
  useEffect(() => {
    if (!cart.isOpen) {
      dialog.current?.close();
      return;
    }
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [cart.isOpen]);
  return (
    <dialog
      ref={dialog}
      className="metropolitan-cart-drawer"
      aria-labelledby="cart-drawer-title"
      onClose={cart.close}
      onCancel={cart.close}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            cart.close();
        }
      }}
    >
      <header className="metropolitan-drawer-heading">
        <h2 id="cart-drawer-title">
          {t("Your cart", "سلة التسوق")} <span>({cart.count})</span>
        </h2>
        <button
          type="button"
          className="metropolitan-icon-button"
          autoFocus
          aria-label={t("Close cart", "إغلاق السلة")}
          onClick={cart.close}
        >
          <Icon name="close" />
        </button>
      </header>
      <ToastViewport />
      {cart.isOpen &&
        (commerce === "api" ? <CartContents compact /> : <DemoBag />)}
    </dialog>
  );
}

export function DemoBag() {
  const { locale } = useStorefront(),
    cart = useCart(),
    ar = locale === "ar";
  const money = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  return (
    <div className="mp-demo-bag">
      {cart.demoLines.length ? (
        <>
          <ul>
            {cart.demoLines.map((line) => (
              <li key={line.variantId}>
                {line.product.image ? (
                  <img src={line.product.image.url} alt="" />
                ) : null}
                <div>
                  <a href={`/${locale}/products/${line.product.handle}`}>
                    {line.product.name[locale]}
                  </a>
                  <p>{line.label}</p>
                  <p>{money(line.product.price.amountMinor)}</p>
                  <div className="mp-demo-quantity">
                    <button
                      onClick={() =>
                        cart.changeDemo(line.variantId, line.quantity - 1)
                      }
                      aria-label={ar ? "تقليل الكمية" : "Decrease quantity"}
                    >
                      −
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      onClick={() =>
                        cart.changeDemo(line.variantId, line.quantity + 1)
                      }
                      aria-label={ar ? "زيادة الكمية" : "Increase quantity"}
                    >
                      +
                    </button>
                    <button onClick={() => cart.changeDemo(line.variantId, 0)}>
                      {ar ? "حذف" : "Remove"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mp-demo-subtotal">
            <span>{ar ? "المجموع التجريبي" : "Demo subtotal"}</span>
            <strong>
              {money(
                cart.demoLines.reduce(
                  (sum, line) =>
                    sum + line.product.price.amountMinor * line.quantity,
                  0,
                ),
              )}
            </strong>
          </div>
          <button className="mp-demo-checkout" disabled>
            {ar ? "الدفع غير متاح في المعاينة" : "Checkout unavailable in demo"}
          </button>
        </>
      ) : (
        <div className="mp-demo-empty">
          <p>{ar ? "حقيبتك فارغة حاليًا." : "Your bag is currently empty."}</p>
          <a className="mp-underlink" href={`/${locale}/products`}>
            {ar ? "تابع التسوق" : "Continue shopping"}
          </a>
        </div>
      )}
      <p className="sample-notice">
        {ar
          ? "حقيبة تجريبية محفوظة على هذا الجهاز فقط. لا تُنفذ طلبات حقيقية."
          : "Demo bag saved on this device only. No real orders are placed."}
      </p>
    </div>
  );
}
