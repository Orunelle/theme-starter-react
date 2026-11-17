import { Link } from "@tanstack/react-router";
import { useStorefront, type RoutePageData } from "@orunelle/theme-sdk";
import { Image } from "../home/Sections";
import { media } from "../../lib/editorial";
import { Pagination } from "../common/commerce";
export function CollectionListPage({
  data,
}: {
  data: Extract<RoutePageData, { kind: "collections" }>;
}) {
  const { locale } = useStorefront();
  return (
    <section className="mp-collection-index">
      <h1>{data.title}</h1>
      {data.collections.length ? (
        <div className="mp-collection-grid">
          {data.collections.map((item, i) => (
            <Link
              key={item.id}
              to={
                data.basePath === "categories"
                  ? "/$locale/categories/$slug"
                  : "/$locale/collections/$slug"
              }
              params={{ locale, slug: item.slug }}
            >
              <Image
                value={media(
                  `demo-01-${i % 2 ? "layout-collection-02" : "layout-collection-01"}.webp`,
                )}
                alt={item.name}
              />
              <div>
                <h2>{item.name}</h2>
                <span className="mp-underlink">
                  {locale === "ar" ? "اكتشف المجموعة" : "View Collection"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mp-empty">
          {locale === "ar"
            ? "لا توجد مجموعات متاحة حاليًا."
            : "No collections are available yet."}
        </p>
      )}
      <Pagination {...data.pagination} />
    </section>
  );
}
