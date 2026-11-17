import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  useStorefront,
  useThemeRuntime,
  type RoutePageData,
} from "@orunelle/theme-sdk";
import { useGlobal, useHref } from "../../hooks/useThemeSettings";
import { LOOKS, STORIES, media } from "../../lib/editorial";
import { demoProducts } from "../../lib/demo-data";
import { Image } from "../home/Sections";
import { ProductCard } from "../product/ProductCard";
import { Icon } from "../icons";

export function PageSingle({
  data,
}: {
  data: Extract<RoutePageData, { kind: "content" }>;
}) {
  const { locale, commerce } = useStorefront(),
    { products } = useThemeRuntime(),
    settings = useGlobal(),
    href = useHref(),
    ar = locale === "ar",
    { pathname, searchStr } = useLocation();
  const slug = pathname.split("/").filter(Boolean).at(-1) ?? "",
    query = new URLSearchParams(searchStr);
  const [look, setLook] = useState<number | null>(null),
    [filter, setFilter] = useState("all");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const value = new URLSearchParams(searchStr).get("look");
    setLook(
      value !== null &&
        Number.isInteger(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) < LOOKS.length
        ? Number(value)
        : null,
    );
  }, [searchStr]);
  useEffect(() => {
    if (look !== null) {
      dialog.current?.showModal();
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = overflow;
      };
    }
    dialog.current?.close();
  }, [look]);
  const current = look !== null ? LOOKS[look] : undefined;
  if (slug === "lookbook")
    return (
      <section className="mp-lookbook-page">
        <div className="mp-page-title">
          <h1>{ar ? "دليل الإطلالات" : "Lookbook"}</h1>
          <div className="mp-tabs">
            {["all", "women", "men"].map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                aria-pressed={filter === k}
              >
                {ar
                  ? k === "all"
                    ? "الكل"
                    : k === "women"
                      ? "نساء"
                      : "رجال"
                  : k === "all"
                    ? "All"
                    : k === "women"
                      ? "Women"
                      : "Men"}
              </button>
            ))}
          </div>
        </div>
        <div className="mp-lookbook-grid">
          {LOOKS.map((item, i) =>
            filter === "all" || (filter === "women" ? i < 3 : i >= 3) ? (
              <button
                key={item.slug}
                className="mp-look-card"
                onClick={() => setLook(i)}
                aria-haspopup="dialog"
              >
                <Image value={media(item.image)} alt={item.name[locale]} />
                <h2>{item.name[locale]}</h2>
                <span className="mp-look-open">
                  <Icon name="plus" size={17} />
                </span>
              </button>
            ) : null,
          )}
        </div>
        <dialog
          ref={dialog}
          className="mp-look-dialog"
          onClose={() => setLook(null)}
          onCancel={() => setLook(null)}
          aria-label={current?.name[locale]}
        >
          <button
            className="mp-look-close"
            autoFocus
            onClick={() => setLook(null)}
            aria-label={ar ? "إغلاق الإطلالة" : "Close look"}
          >
            <Icon name="close" />
          </button>
          {current ? (
            <>
              <Image value={media(current.image)} alt={current.name[locale]} />
              <div>
                <h2>{current.name[locale]}</h2>
                {(commerce === "api" ? products : demoProducts)
                  .filter((p) => current.products.includes(p.handle))
                  .map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                <Link className="mp-underlink" to={href("/products")}>
                  {ar ? "تسوق المجموعة" : "Shop the collection"}
                </Link>
              </div>
            </>
          ) : null}
        </dialog>
      </section>
    );
  if (slug === "journal" || slug === "blog") {
    const selected = STORIES.find((s) => s.slug === query.get("story"));
    return selected ? (
      <article className="mp-journal-article">
        <header>
          <p>{ar ? "حكايات متروبوليتان" : "Metropolitan Stories"}</p>
          <h1>{selected.title[locale]}</h1>
          <p>{selected.summary[locale]}</p>
        </header>
        <Image value={media(selected.image)} alt={selected.title[locale]} />
        <div>
          <p>
            {ar
              ? "تبدأ الإطلالة المتوازنة باختيار ما يناسبك. امنح كل قطعة مساحة، وجرّب ألوانًا متقاربة، واجمع بين الخامات المختلفة لتصنع طابعك الخاص."
              : "A considered wardrobe starts with the pieces that feel right for you. Give each piece room, try a tonal palette, and bring different textures together to find your own point of view."}
          </p>
          <p>
            {ar
              ? "اكتشف المجموعة وابدأ بالأساسيات التي تستطيع تنسيقها بطرق متعددة."
              : "Explore the collection and start with versatile pieces you can wear in different ways."}
          </p>
          <Link className="mp-underlink" to={href("/pages/journal")}>
            {ar ? "العودة إلى المجلة" : "Back to the journal"}
          </Link>
        </div>
      </article>
    ) : (
      <section className="mp-journal-page">
        <div className="mp-page-title">
          <h1>{ar ? "حكايات متروبوليتان" : "Metropolitan Stories"}</h1>
          <p>
            {ar
              ? "رؤية مختلفة لأسلوبك اليومي."
              : "A different perspective on everyday dressing."}
          </p>
        </div>
        <div className="mp-journal-grid">
          {STORIES.map((s) => (
            <Link
              to={href("/pages/journal?story=" + s.slug)}
              key={s.slug}
              className="mp-journal-card"
            >
              <Image value={media(s.image)} alt={s.title[locale]} />
              <div>
                <span>{ar ? "إلهام" : "STYLE NOTES"}</span>
                <h2>{s.title[locale]}</h2>
                <p>{s.summary[locale]}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }
  if (slug === "about-us")
    return (
      <article className="mp-about-page">
        <div className="mp-page-title">
          <h1>{ar ? "من نحن" : "About Us"}</h1>
          <p>
            {ar
              ? "رؤية هادئة للحياة اليومية."
              : "A considered perspective on the everyday."}
          </p>
        </div>
        <Image
          value={media("demo-01-image-with-text-01.webp")}
          alt={ar ? "تفاصيل المجموعة" : "Collection details"}
        />
        <div className="mp-about-copy">
          <h2>
            {ar ? "مساحة لأسلوبك الخاص" : "Room for your own point of view"}
          </h2>
          <p>
            {ar
              ? "نؤمن بأن الأسلوب الشخصي يتشكل مع الوقت. اكتشف قطعًا يمكنك تنسيقها على طريقتك، وإطلالات تمنح المألوف زاوية جديدة."
              : "Personal style takes shape over time. Discover a collection to make your own, with fresh perspectives on familiar silhouettes and everyday dressing."}
          </p>
          <Link to={href("/products")} className="mp-underlink">
            {ar ? "اكتشف المجموعة" : "Explore the collection"}
          </Link>
        </div>
      </article>
    );
  if (slug === "custom-care" || slug === "our-stores")
    return (
      <section className="mp-care-page">
        <div className="mp-page-title">
          <h1>
            {ar
              ? slug === "our-stores"
                ? "متاجرنا"
                : "خدمة العملاء"
              : slug === "our-stores"
                ? "Our Stores"
                : "Customer Care"}
          </h1>
        </div>
        <div className="mp-care-grid">
          <div>
            <h2>{ar ? "تواصل معنا" : "Get in touch"}</h2>
            {settings["contact-email"] ? (
              <a
                className="mp-underlink"
                href={`mailto:${settings["contact-email"]}`}
              >
                {String(settings["contact-email"])}
              </a>
            ) : null}
            {settings["contact-phone"] ? (
              <a
                href={`tel:${String(settings["contact-phone"]).replace(/\s/g, "")}`}
              >
                {String(settings["contact-phone"])}
              </a>
            ) : null}
            <Link className="mp-underlink" to={href("/account/orders")}>
              {ar ? "تتبع طلباتك" : "Track your orders"}
            </Link>
          </div>
          <div>
            <h2>{ar ? "قبل الشراء" : "Before you shop"}</h2>
            {[
              [
                ar ? "كيف أختار المقاس؟" : "How do I choose my size?",
                ar
                  ? "راجع دليل المقاسات وتفاصيل المنتج. إذا احتجت إلى مساعدة فتواصل مع المتجر."
                  : "Check the size guide and product details. Contact the store if you need help.",
              ],
              [
                ar ? "أين طلبي؟" : "Where is my order?",
                ar
                  ? "راجع طلباتك من حسابك للاطلاع على آخر تحديث."
                  : "Sign in to your account to see your order’s latest update.",
              ],
              [
                ar ? "كيف أعتني بالقطعة؟" : "How do I care for my pieces?",
                ar
                  ? "اتبع تعليمات العناية الموجودة على بطاقة المنتج."
                  : "Follow the care instructions on your garment’s label.",
              ],
              [
                ar ? "ما سياسة الاسترجاع؟" : "What is the return policy?",
                ar
                  ? "راجع سياسة الاسترجاع الخاصة بالمتجر قبل إتمام الطلب."
                  : "Check the store’s return policy before placing your order.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  return (
    <article className="content-page mp-content-page">
      <h1>{data.title}</h1>
      {data.paragraphs.length ? (
        data.paragraphs.map((p, i) => <p key={i}>{p}</p>)
      ) : (
        <>
          <p>
            {ar
              ? "يرجى التواصل مع المتجر للحصول على السياسة الحالية وتفاصيل المساعدة."
              : "Please contact the store for its current policy and assistance."}
          </p>
          <Link className="mp-underlink" to={href("/pages/custom-care")}>
            {ar ? "خدمة العملاء" : "Customer care"}
          </Link>
        </>
      )}
    </article>
  );
}
