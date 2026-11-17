import images from "./editorial-media.json";
export const media = (name: string) =>
  (images as Record<string, string>)[name] ?? "";
export const LOOKS = [
  {
    slug: "workroom",
    name: { en: "The Workroom", ar: "روح الاستوديو" },
    image: "demo-01-lookbook-page-01.webp",
    products: ["exchange-pinstripe-blazer", "ticker-pinstripe-trouser"],
  },
  {
    slug: "sharp-shoulders",
    name: { en: "Sharp Shoulders", ar: "قَصّات واضحة" },
    image: "demo-01-lookbook-page-02.webp",
    products: ["studio-wool-blazer", "bishop-wrap-skirt"],
  },
  {
    slug: "cold-front",
    name: { en: "Cold Front", ar: "إطلالة للأيام الباردة" },
    image: "demo-01-lookbook-page-03.webp",
    products: ["ainsworth-overcoat", "moorland-crewneck"],
  },
  {
    slug: "essential-line",
    name: { en: "The Essential Line", ar: "خطوط أساسية" },
    image: "demo-01-lookbook-page-04.webp",
    products: ["cobble-cable-sweater", "basin-wide-jean"],
  },
  {
    slug: "layered-ease",
    name: { en: "Layered Ease", ar: "طبقات بانسيابية" },
    image: "demo-01-lookbook-page-05.webp",
    products: ["drift-zip-cardigan", "waverly-utility-top"],
  },
  {
    slug: "warm-weather",
    name: { en: "Warm Weather Tailoring", ar: "أناقة الأيام الدافئة" },
    image: "demo-01-lookbook-page-06.webp",
    products: ["cabana-camp-shirt", "harrow-textured-short"],
  },
];
export const STORIES = [
  {
    slug: "capsule-wardrobe",
    title: {
      en: "How to Build a Capsule Wardrobe",
      ar: "كيف تبني خزانة ملابس متكاملة",
    },
    summary: {
      en: "Start with the pieces you love. Find new ways to put them together.",
      ar: "ابدأ بالقطع التي تحبها، واكتشف طرقًا جديدة لتنسيقها.",
    },
    image: "demo-01-blog-page-portrait-01.webp",
  },
  {
    slug: "quiet-elegance",
    title: { en: "The Return of Quiet Elegance", ar: "عودة الأناقة الهادئة" },
    summary: {
      en: "A closer look at clean lines, tonal layers and considered details.",
      ar: "نظرة إلى الخطوط الهادئة والطبقات المتناسقة والتفاصيل المدروسة.",
    },
    image: "demo-01-blog-page-square-02.webp",
  },
  {
    slug: "seasonal-notes",
    title: { en: "Notes from the New Season", ar: "ملاحظات من الموسم الجديد" },
    summary: {
      en: "Fresh proportions and familiar favorites, seen from a new angle.",
      ar: "نِسَب جديدة وقطع مألوفة، من زاوية مختلفة.",
    },
    image: "demo-01-blog-page-portrait-03.webp",
  },
  {
    slug: "neutrals",
    title: {
      en: "Neutrals, Reconsidered",
      ar: "الألوان المحايدة، برؤية جديدة",
    },
    summary: {
      en: "Explore the subtle differences that bring a tonal wardrobe to life.",
      ar: "اكتشف الفروق البسيطة التي تضيف حياة إلى إطلالاتك المحايدة.",
    },
    image: "demo-01-blog-page-square-04.webp",
  },
];
