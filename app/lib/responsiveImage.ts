/**
 * Store images served by the Orunelle API can be fetched at fixed smaller
 * widths (`?w=`). For those, this returns `srcSet` so the browser downloads
 * only the size it shows; any other URL is left as it is.
 */
const WIDTHS = [160, 320, 480, 640, 960, 1280, 1920];
const STORE_MEDIA =
  /\/api\/media\/serve\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/i;

export function responsiveImage(
  url: string,
  sizes: string,
): { src: string; srcSet?: string; sizes?: string } {
  if (!STORE_MEDIA.test(url)) return { src: url };
  return {
    src: `${url}?w=960`,
    srcSet: WIDTHS.map((w) => `${url}?w=${w} ${w}w`).join(", "),
    sizes,
  };
}
