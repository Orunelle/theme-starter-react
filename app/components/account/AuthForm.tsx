import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useStorefront, useCommerce } from "@orunelle/theme-sdk";
import { CommerceError } from "@orunelle/theme-sdk/commerce";
import { Icon } from "../icons";
import {
  useCopy,
  useAction,
  Failure,
  Field,
  FixtureNotice,
  values,
  val,
} from "../common/commerce";
import {
  googleProvider,
  openGoogleSignIn,
  exchangeGoogleCredential,
} from "../../lib/googleSignIn";

export function AuthForm({ path }: { path: string }) {
  const context = useStorefront(),
    session = useCommerce(),
    action = useAction(),
    t = useCopy();
  const location = useLocation(),
    navigate = useNavigate();
  const [google, setGoogle] = useState<string>();
  const [googleError, setGoogleError] = useState("");
  const popup = useRef<AbortController | null>(null);
  const live = context.commerce === "api" && context.mode !== "preview";
  const signingIn = path === "login" || path === "register";
  useEffect(() => {
    const controller = new AbortController();
    if (live && signingIn)
      void googleProvider(controller.signal)
        .then((provider) => setGoogle(provider.enabled ? provider.origin : ""))
        .catch(() => {
          if (!controller.signal.aborted) setGoogle("");
        });
    return () => {
      controller.abort();
      popup.current?.abort();
    };
  }, [live, signingIn]);
  const title =
    path === "register"
      ? t("Create your account", "أنشئ حسابك")
      : path === "forgot-password"
        ? t("Forgot your password?", "نسيت كلمة المرور؟")
        : path === "reset-password"
          ? t("Choose a new password", "اختر كلمة مرور جديدة")
          : path === "verify-email"
            ? t("Verify your email", "تأكيد البريد الإلكتروني")
            : t("Welcome back", "أهلًا بعودتك");
  async function completeLogin(accessToken: string) {
    await session.acceptToken(accessToken);
    try {
      await session.client.cart.mergeGuest();
    } catch (error) {
      if (!(error instanceof CommerceError && error.code === "NO_GUEST_CART"))
        action.setNotice(
          t(
            "You are signed in. You can merge your guest cart from your account.",
            "تم تسجيل الدخول. يمكنك دمج سلة الزائر من حسابك.",
          ),
        );
    }
    await navigate({
      to: "/$locale/account",
      params: { locale: context.locale },
    });
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    const data = values(event);
    if (!live) return;
    void action.run(async () => {
      const email = val(data, "email"),
        password = val(data, "password");
      if (path === "forgot-password") {
        await session.client.customer.requestReset(email);
        action.setNotice(
          t(
            "If an account exists, we’ll send a recovery link. Check your email.",
            "إذا كان لديك حساب، سنرسل رابط الاستعادة. تحقق من بريدك الإلكتروني.",
          ),
        );
        return;
      }
      if (path === "reset-password") {
        const token =
          new URLSearchParams(location.searchStr).get("token") ?? "";
        if (token)
          await session.client.customer.resetWithToken(token, password);
        else
          await session.client.customer.resetPassword(
            email,
            val(data, "code"),
            password,
          );
        action.setNotice(
          t(
            "Password updated. You can sign in.",
            "تم تحديث كلمة المرور. يمكنك تسجيل الدخول.",
          ),
        );
        return;
      }
      if (path === "verify-email") {
        await session.client.customer.verifyEmail(email, val(data, "code"));
        action.setNotice(
          t(
            "Email verified. You can sign in.",
            "تم تأكيد البريد. يمكنك تسجيل الدخول.",
          ),
        );
        return;
      }
      const result =
        path === "register"
          ? await session.client.customer.register({
              email,
              password,
              firstName: val(data, "firstName"),
              lastName: val(data, "lastName"),
              phone: val(data, "phone"),
              locale: context.locale === "ar" ? "ar-EG" : "en-US",
              marketingConsent: false,
            })
          : await session.client.customer.login(email, password);
      if (!result.accessToken) {
        action.setNotice(
          t(
            "Check your email to verify your account before signing in.",
            "تحقق من بريدك لتأكيد الحساب قبل تسجيل الدخول.",
          ),
        );
        return;
      }
      await completeLogin(result.accessToken);
    });
  };
  function continueGoogle() {
    if (!live || !google || action.pending) return;
    setGoogleError("");
    popup.current = new AbortController();
    // Open synchronously during the click so browsers do not block the popup.
    const credential = openGoogleSignIn(
      google,
      context.locale,
      popup.current.signal,
    );
    void action.run(async () => {
      try {
        await completeLogin(await exchangeGoogleCredential(await credential));
      } catch (error) {
        if (error instanceof Error && error.message === "cancelled") return;
        setGoogleError(
          error instanceof Error && error.message === "popup_blocked"
            ? t(
                "Allow pop-ups for this store, then try Google again.",
                "اسمح بالنوافذ المنبثقة لهذا المتجر، ثم حاول باستخدام جوجل مجددًا.",
              )
            : t(
                "Google sign-in did not finish. Try again or sign in with your email.",
                "لم يكتمل تسجيل الدخول بجوجل. حاول مرة أخرى أو استخدم بريدك الإلكتروني.",
              ),
        );
      }
    });
  }
  const recoveryToken =
    path === "reset-password" &&
    new URLSearchParams(location.searchStr).has("token");
  return (
    <div className="metropolitan-auth-layout">
      <div className="metropolitan-auth-intro">
        <h1>{title}</h1>
        <p>
          {signingIn
            ? t(
                "Your orders, saved favourites and delivery details, all in one place.",
                "طلباتك ومفضلاتك وعناوين التوصيل، كلها في مكان واحد.",
              )
            : t(
                "Let’s help you get back to your account.",
                "لنساعدك على العودة إلى حسابك.",
              )}
        </p>
        <div className="metropolitan-auth-benefits">
          <p>
            <Icon name="package" />
            {t("Follow your orders", "تابع طلباتك")}
          </p>
          <p>
            <Icon name="heart" />
            {t("Keep your favourites close", "احتفظ بمنتجاتك المفضلة")}
          </p>
          <p>
            <Icon name="truck" />
            {t("Manage your delivery addresses", "أدر عناوين التوصيل")}
          </p>
        </div>
        <Link
          to="/$locale/products"
          params={{ locale: context.locale }}
          className="metropolitan-account-back"
        >
          {t("Continue shopping", "متابعة التسوق")}
          <Icon name="arrow" size={18} />
        </Link>
      </div>
      <div className="metropolitan-auth-content">
        <h2>
          {path === "login"
            ? t("Sign in to your account", "تسجيل الدخول إلى حسابك")
            : title}
        </h2>
        {!live && <FixtureNotice />}
        {signingIn && (google !== "" || !live) && (
          <>
            <button
              type="button"
              className="metropolitan-google-button"
              disabled={!live || !google || !session.ready || action.pending}
              onClick={continueGoogle}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.2 3-7.4Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 5-.9 6.6-2.4L15.4 17c-.9.6-2.1 1-3.4 1-2.6 0-4.9-1.8-5.7-4.1H3v2.6A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.3 13.9a6 6 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 9l3.3-2.6Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.5l3.3 2.6C7.1 7.8 9.4 6 12 6Z"
                />
              </svg>
              {t("Continue with Google", "المتابعة باستخدام جوجل")}
            </button>
            <div className="metropolitan-auth-divider">
              <span>
                {t("or use your email", "أو باستخدام البريد الإلكتروني")}
              </span>
            </div>
          </>
        )}
        {googleError && (
          <p role="alert" className="form-error">
            {googleError}
          </p>
        )}
        <form
          className="store-form metropolitan-auth-form"
          method="post"
          onSubmit={submit}
        >
          {path === "register" && (
            <div className="metropolitan-form-pair">
              <Field
                name="firstName"
                label={t("First name", "الاسم الأول")}
                autoComplete="given-name"
              />
              <Field
                name="lastName"
                label={t("Last name", "اسم العائلة")}
                autoComplete="family-name"
              />
            </div>
          )}
          {(!recoveryToken || path !== "reset-password") && (
            <Field
              name="email"
              type="email"
              label={t("Email address", "البريد الإلكتروني")}
              autoComplete="email"
            />
          )}
          {path === "register" && (
            <Field
              name="phone"
              type="tel"
              label={t("Phone number", "رقم الهاتف")}
              autoComplete="tel"
            />
          )}
          {!["forgot-password", "verify-email"].includes(path) && (
            <Field
              name="password"
              type="password"
              label={
                path === "reset-password"
                  ? t("New password", "كلمة المرور الجديدة")
                  : t("Password", "كلمة المرور")
              }
              autoComplete={
                path === "login" ? "current-password" : "new-password"
              }
            />
          )}
          {path === "register" && (
            <p className="metropolitan-field-help">
              {t("Use at least 12 characters.", "استخدم 12 حرفًا على الأقل.")}
            </p>
          )}
          {["verify-email", "reset-password"].includes(path) &&
            !recoveryToken && (
              <Field
                name="code"
                label={t("Email code", "رمز البريد الإلكتروني")}
                autoComplete="one-time-code"
              />
            )}
          {path === "login" && (
            <Link
              to="/$locale/forgot-password"
              params={{ locale: context.locale }}
              className="metropolitan-forgot-link"
            >
              {t("Forgot your password?", "نسيت كلمة المرور؟")}
            </Link>
          )}
          <button
            type="submit"
            className="metropolitan-auth-submit"
            disabled={!live || action.pending || !session.ready}
          >
            {action.pending
              ? t("Please wait…", "يرجى الانتظار…")
              : path === "login"
                ? t("Sign in", "تسجيل الدخول")
                : path === "register"
                  ? t("Create account", "إنشاء حساب")
                  : path === "forgot-password"
                    ? t("Send recovery link", "إرسال رابط الاستعادة")
                    : path === "reset-password"
                      ? t("Save new password", "حفظ كلمة المرور الجديدة")
                      : t("Verify email", "تأكيد البريد الإلكتروني")}
          </button>
          <Failure error={action.error} />
          <p role="status" className="metropolitan-auth-status">
            {action.notice}
          </p>
        </form>
        <p className="metropolitan-auth-switch">
          {path === "login" ? (
            <>
              {t("New here?", "ليس لديك حساب؟")}{" "}
              <Link to="/$locale/register" params={{ locale: context.locale }}>
                {t("Create an account", "إنشاء حساب جديد")}
              </Link>
            </>
          ) : (
            <Link to="/$locale/login" params={{ locale: context.locale }}>
              {t("Back to sign in", "العودة إلى تسجيل الدخول")}
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
