import { CommerceError } from "@orunelle/theme-sdk/commerce";

export type GoogleProvider = { enabled: boolean; origin: string };
export async function googleProvider(
  signal?: AbortSignal,
): Promise<GoogleProvider> {
  const response = await fetch("/__commerce/auth/providers", {
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });
  const envelope = await response.json();
  if (!response.ok || envelope.success !== true)
    throw new Error("provider_unavailable");
  const provider = envelope.data?.google;
  if (!provider || typeof provider.enabled !== "boolean")
    throw new Error("provider_unavailable");
  if (!provider.enabled) return { enabled: false, origin: "" };
  const origin = new URL(provider.origin);
  if (origin.protocol !== "https:" || origin.origin !== provider.origin)
    throw new Error("provider_unavailable");
  return { enabled: true, origin: origin.origin };
}
export function googleMessageCredential(
  event: Pick<MessageEvent, "source" | "origin" | "data">,
  popup: Window,
  origin: string,
  flow: string,
): string | undefined {
  if (
    event.source !== popup ||
    event.origin !== origin ||
    event.data?.type !== "orunelle-customer-google" ||
    event.data.flow !== flow
  )
    return;
  const token = event.data.idToken;
  return typeof token === "string" && token.length > 0 && token.length <= 16384
    ? token
    : undefined;
}
export function openGoogleSignIn(
  origin: string,
  locale: string,
  signal: AbortSignal,
): Promise<string> {
  const flow = crypto.randomUUID();
  const popup = window.open(
    "about:blank",
    "orunelle-google-" + flow,
    "popup,width=500,height=680",
  );
  if (!popup) return Promise.reject(new Error("popup_blocked"));
  return new Promise((resolve, reject) => {
    let complete = false;
    const finish = (token?: string, reason = "popup_closed") => {
      if (complete) return;
      complete = true;
      window.removeEventListener("message", receive);
      signal.removeEventListener("abort", abort);
      window.clearInterval(poll);
      window.clearTimeout(timeout);
      popup.close();
      if (token) resolve(token);
      else reject(new Error(reason));
    };
    const receive = (event: MessageEvent) => {
      const token = googleMessageCredential(event, popup, origin, flow);
      if (token) finish(token);
    };
    const abort = () => finish(undefined, "cancelled");
    const poll = window.setInterval(() => {
      if (popup.closed) finish();
    }, 500);
    const timeout = window.setTimeout(
      () => finish(undefined, "popup_timeout"),
      120000,
    );
    window.addEventListener("message", receive);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    const url = new URL(
      `/${locale === "ar" ? "ar" : "en"}/storefront-google`,
      origin,
    );
    url.searchParams.set("origin", window.location.origin);
    url.searchParams.set("flow", flow);
    popup.location.href = url.href;
  });
}
export async function exchangeGoogleCredential(
  idToken: string,
): Promise<string> {
  const response = await fetch("/__commerce/auth/google", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    cache: "no-store",
  });
  const envelope = await response.json();
  if (
    !response.ok ||
    envelope.success !== true ||
    typeof envelope.data?.accessToken !== "string" ||
    !envelope.data.accessToken
  )
    throw new CommerceError(
      envelope.error?.code ?? "GOOGLE_SIGN_IN_FAILED",
      response.status,
      envelope.meta?.requestId ?? "",
    );
  return envelope.data.accessToken;
}
