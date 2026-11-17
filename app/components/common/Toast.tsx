import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useStorefront } from "@orunelle/theme-sdk";
import { Icon } from "../icons";

type Toast = { id: number; message: string; kind: "success" | "error" };
const ToastItemsContext = createContext<{
  toasts: Toast[];
  dismiss: (id: number) => void;
}>({ toasts: [], dismiss: () => {} });
const ToastContext = createContext<
  (message: string, kind?: Toast["kind"]) => void
>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const notify = useCallback(
    (message: string, kind: Toast["kind"] = "success") => {
      if (!message) return;
      const id = ++next.current;
      setToasts((items) => [...items.slice(-2), { id, message, kind }]);
      const timer = setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id));
        timers.current.delete(timer);
      }, 6500);
      timers.current.add(timer);
    },
    [],
  );
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );
  return (
    <ToastContext.Provider value={notify}>
      <ToastItemsContext.Provider
        value={{
          toasts,
          dismiss: (id) =>
            setToasts((items) => items.filter((item) => item.id !== id)),
        }}
      >
        {children}
        <ToastViewport />
      </ToastItemsContext.Provider>
    </ToastContext.Provider>
  );
}

export function ToastViewport() {
  const { locale } = useStorefront();
  const { toasts, dismiss } = useContext(ToastItemsContext);
  return (
    <div
      className="metropolitan-toasts"
      aria-label={locale === "ar" ? "الإشعارات" : "Notifications"}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="metropolitan-toast"
          data-kind={toast.kind}
        >
          <span role={toast.kind === "error" ? "alert" : "status"}>
            {toast.message}
          </span>
          <button
            type="button"
            aria-label={
              locale === "ar" ? "إغلاق الإشعار" : "Dismiss notification"
            }
            onClick={() => dismiss(toast.id)}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
