import { useEffect, useState } from "react";
import {
  useStorefront,
  useAssetUrl,
  useThemeRuntime,
  type ThemeNodeProps,
  type PublicProduct,
} from "@orunelle/theme-sdk";
import { useText, useHref } from "../../hooks/useThemeSettings";
import { ThemeLink } from "../common/ThemeLink";
import { ProductCard } from "../product/ProductCard";
import { Icon } from "../icons";
import { LOOKS, STORIES, media } from "../../lib/editorial";
import { demoItems as samples } from "../../lib/demo-data";
import { responsiveImage } from "../../lib/responsiveImage";

function sectionColors(settings: ThemeNodeProps["settings"]) {
  return {
    backgroundColor:
      settings.background && settings.background !== "#ffffff"
        ? String(settings.background)
        : undefined,
    color:
      settings.color && settings.color !== "#33383c"
        ? String(settings.color)
        : undefined,
  };
}

export function Image({
  value,
  alt = "",
  priority = false,
  className = "",
  sizes = "100vw",
}: {
  value: unknown;
  alt?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const { media: uploaded } = useThemeRuntime();
  const assetUrl = useAssetUrl();
  const raw =
    typeof value === "object" && value !== null && "assetId" in value
      ? uploaded.find(
          (i) => i.id === String((value as { assetId: unknown }).assetId),
        )?.url
      : String(value ?? "");
  const src = raw?.startsWith("public/") ? assetUrl(raw) : raw;
  if (!src || (!/^https:\/\//.test(src) && !/^\/(?!\/)/.test(src)))
    return <span className={`mp-media-empty ${className}`} aria-hidden />;
  return (
    <img
      {...responsiveImage(src, sizes)}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
function Intro({
  settings,
  children,
}: {
  settings: ThemeNodeProps["settings"];
  children?: React.ReactNode;
}) {
  const text = useText(),
    href = useHref();
  return (
    <div className="mp-section-intro">
      <h2>{text(settings, "title")}</h2>
      {text(settings, "text") ? <p>{text(settings, "text")}</p> : null}
      {text(settings, "button") ? (
        <ThemeLink
          className="mp-underlink"
          href={href(String(settings.href ?? "/products"))}
        >
          {text(settings, "button")}
        </ThemeLink>
      ) : null}
      {children}
    </div>
  );
}
export function Hero({ id, settings }: ThemeNodeProps) {
  const text = useText(),
    href = useHref(),
    { locale } = useStorefront();
  const [slide, setSlide] = useState(0),
    [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = window.setInterval(() => setSlide((v) => (v + 1) % 2), 6500);
    return () => clearInterval(timer);
  }, [paused]);
  return (
    <section
      className="mp-hero"
      id={`section-${id}`}
      aria-roledescription="carousel"
      aria-label={
        locale === "ar" ? "المجموعات المميزة" : "Featured collections"
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <h1 className="sr-only">{text(settings, "title")}</h1>
      {[0, 1].map((i) => (
        <div
          className="mp-hero-slide"
          data-current={slide === i}
          key={i}
          aria-hidden={slide !== i}
        >
          <Image
            value={
              settings[i ? "image-secondary" : "image"] ||
              settings[i ? "image-secondary-url" : "image-url"]
            }
            priority={i === 0}
          />
          <div className="mp-hero-caption">
            <h2>{text(settings, i ? "title-secondary" : "title")}</h2>
            <ThemeLink
              href={href(
                String(settings[i ? "href-secondary" : "href"] ?? "/products"),
              )}
              className="mp-underlink"
            >
              {text(settings, i ? "button-secondary" : "button")}
            </ThemeLink>
          </div>
        </div>
      ))}
      <div className="mp-carousel-controls">
        <button
          onClick={() => setSlide((s) => 1 - s)}
          aria-label={locale === "ar" ? "الشريحة السابقة" : "Previous slide"}
        >
          <Icon name="chevron-left" size={14} />
        </button>
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`${locale === "ar" ? "الشريحة" : "Slide"} ${i + 1}`}
            aria-current={slide === i ? "true" : undefined}
            className="mp-carousel-dot"
          />
        ))}
        <button
          onClick={() => setSlide((s) => 1 - s)}
          aria-label={locale === "ar" ? "الشريحة التالية" : "Next slide"}
        >
          <Icon name="chevron-right" size={14} />
        </button>
      </div>
    </section>
  );
}
export function Products({ id, settings }: ThemeNodeProps) {
  const { products, resources } = useThemeRuntime(),
    { locale, commerce } = useStorefront(),
    ar = locale === "ar";
  const [gender, setGender] = useState("Men");
  const resourceId = (value: unknown) =>
    value && typeof value === "object" && "id" in value
      ? String((value as { id: unknown }).id)
      : "";
  const collection = resourceId(settings.collection),
    secondary = resourceId(settings["collection-secondary"]);
  const picked =
    resources?.collections?.[
      gender === "Women" && secondary ? secondary : collection
    ]?.products;
  let visible: readonly PublicProduct[] = picked ?? products;
  if (commerce !== "api")
    visible = visible.filter((p) =>
      samples.find((s) => s.product.id === p.id)?.tags.includes(gender),
    );
  const offset = Number(settings.offset ?? 0) / 2;
  visible = visible.slice(offset, offset + Number(settings.limit ?? 8));
  return (
    <section
      id={`section-${id}`}
      className="mp-product-shelf"
      style={sectionColors(settings)}
    >
      <Intro settings={settings}>
        {commerce !== "api" || secondary ? (
          <div
            className="mp-tabs"
            role="tablist"
            aria-label={ar ? "المجموعة" : "Collection"}
          >
            {["Men", "Women"].map((label) => (
              <button
                key={label}
                role="tab"
                aria-selected={gender === label}
                onClick={() => setGender(label)}
              >
                {ar ? (label === "Men" ? "رجال" : "نساء") : label}
              </button>
            ))}
          </div>
        ) : null}
      </Intro>
      {visible.length ? (
        <div className="product-grid mp-shelf-grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mp-empty">
          {ar
            ? "لا توجد منتجات لعرضها حاليًا."
            : "No products are available yet."}
        </p>
      )}
    </section>
  );
}
export function Split({ id, settings }: ThemeNodeProps) {
  const text = useText(),
    href = useHref();
  return (
    <section
      id={`section-${id}`}
      className="mp-editorial-split"
      data-layout={String(settings.layout ?? "equal")}
    >
      {[0, 1].map((i) => (
        <ThemeLink
          href={href(
            String(settings[i ? "href-secondary" : "href"] ?? "/products"),
          )}
          key={i}
          className="mp-editorial-tile"
        >
          <Image
            value={
              settings[i ? "image-secondary" : "image"] ||
              settings[i ? "image-secondary-url" : "image-url"]
            }
            alt={text(settings, i ? "title-secondary" : "title")}
          />
          <div>
            <h2>{text(settings, i ? "title-secondary" : "title")}</h2>
            <span className="mp-underlink">{text(settings, "button")}</span>
          </div>
        </ThemeLink>
      ))}
    </section>
  );
}
export function Banner({ id, settings }: ThemeNodeProps) {
  const text = useText(),
    href = useHref();
  return (
    <section id={`section-${id}`} className="mp-editorial-banner">
      <Image value={settings.image || settings["image-url"]} />
      <div>
        <h2>{text(settings, "title")}</h2>
        <p>{text(settings, "text")}</p>
        <ThemeLink
          href={href(String(settings.href ?? "/products"))}
          className="mp-underlink"
        >
          {text(settings, "button")}
        </ThemeLink>
      </div>
    </section>
  );
}
export function Lookbook({ id, settings }: ThemeNodeProps) {
  const { locale } = useStorefront(),
    href = useHref();
  return (
    <section
      id={`section-${id}`}
      className="mp-lookbook-shelf"
      style={sectionColors(settings)}
    >
      <Intro settings={settings} />
      <div className="mp-looks-row">
        {LOOKS.map((look, i) => (
          <ThemeLink
            className="mp-look-card"
            key={look.slug}
            href={href("/pages/lookbook?look=" + i)}
          >
            <Image value={media(look.image)} alt={look.name[locale]} />
            <h3>{look.name[locale]}</h3>
            <span className="mp-look-open">
              <Icon name="plus" size={17} />
            </span>
          </ThemeLink>
        ))}
      </div>
    </section>
  );
}
export function Story({ id, settings }: ThemeNodeProps) {
  const text = useText(),
    href = useHref();
  return (
    <section
      id={`section-${id}`}
      className="mp-story"
      style={sectionColors(settings)}
    >
      <Image value={settings.image || settings["image-url"]} />
      <div>
        <h2>{text(settings, "title")}</h2>
        <p>{text(settings, "text")}</p>
        <ThemeLink
          className="mp-underlink"
          href={href(String(settings.href ?? "/pages/about-us"))}
        >
          {text(settings, "button")}
        </ThemeLink>
      </div>
    </section>
  );
}
export function Journal({ id, settings }: ThemeNodeProps) {
  const { locale } = useStorefront(),
    href = useHref();
  return (
    <section
      id={`section-${id}`}
      className="mp-journal"
      style={sectionColors(settings)}
    >
      <Intro settings={settings} />
      <div className="mp-journal-grid">
        {STORIES.slice(0, 4).map((story) => (
          <ThemeLink
            href={href("/pages/journal?story=" + story.slug)}
            key={story.slug}
            className="mp-journal-card"
          >
            <Image value={media(story.image)} alt={story.title[locale]} />
            <div>
              <span>{locale === "ar" ? "إلهام" : "STYLE NOTES"}</span>
              <h3>{story.title[locale]}</h3>
              <p>{story.summary[locale]}</p>
            </div>
          </ThemeLink>
        ))}
      </div>
    </section>
  );
}

export function Featured({ id, settings }: ThemeNodeProps) {
  const { products, resources } = useThemeRuntime(),
    { locale } = useStorefront(),
    text = useText(),
    href = useHref(),
    [index, setIndex] = useState(0);
  const picked =
    settings.product &&
    typeof settings.product === "object" &&
    "id" in settings.product
      ? resources?.products?.[String(settings.product.id)]
      : undefined;
  const choices = picked ? [picked] : products.slice(-3),
    current = choices[index % Math.max(1, choices.length)];
  return (
    <section
      id={`section-${id}`}
      className="mp-featured-pair"
      style={sectionColors(settings)}
    >
      <div className="mp-featured-product">
        {current ? (
          <ProductCard product={current} />
        ) : (
          <p>
            {locale === "ar"
              ? "لا توجد منتجات متاحة حاليًا."
              : "No products are available yet."}
          </p>
        )}
        {choices.length > 1 ? (
          <div className="mp-featured-controls">
            <button
              onClick={() =>
                setIndex((v) => (v - 1 + choices.length) % choices.length)
              }
              aria-label={
                locale === "ar" ? "المنتج السابق" : "Previous product"
              }
            >
              <Icon name="arrow" size={14} />
            </button>
            {choices.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setIndex(i)}
                aria-label={`${locale === "ar" ? "المنتج" : "Product"} ${i + 1}`}
                aria-current={index % choices.length === i ? "true" : undefined}
                className="mp-featured-dot"
              />
            ))}
            <button
              onClick={() => setIndex((v) => (v + 1) % choices.length)}
              aria-label={locale === "ar" ? "المنتج التالي" : "Next product"}
            >
              <Icon name="arrow" size={14} />
            </button>
          </div>
        ) : null}
      </div>
      <ThemeLink
        className="mp-featured-collection"
        href={href(String(settings.href ?? "/products"))}
      >
        <Image
          value={settings.image || settings["image-url"]}
          alt={text(settings, "title")}
        />
        <div>
          <h2>{text(settings, "title")}</h2>
          <span className="mp-underlink">{text(settings, "button")}</span>
        </div>
      </ThemeLink>
    </section>
  );
}
