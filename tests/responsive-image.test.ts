import { describe, expect, it } from "vitest";
import { responsiveImage } from "../app/lib/responsiveImage";

const media =
  "https://api.orunelle.com/api/media/serve/360caaee-12d3-485f-977a-cb810187f7f2/99cecefe-1e09-4df5-9fa8-86c2497ee736";

describe("responsiveImage", () => {
  it("offers fixed widths for store media", () => {
    const image = responsiveImage(media, "50vw");
    expect(image.src).toBe(`${media}?w=960`);
    expect(image.sizes).toBe("50vw");
    expect(image.srcSet?.split(", ")).toEqual(
      [160, 320, 480, 640, 960, 1280, 1920].map((w) => `${media}?w=${w} ${w}w`),
    );
  });
  it("leaves other images alone", () => {
    for (const url of ["/images/hero.jpg", "https://cdn.example.com/a.jpg", `${media}?w=320`]) {
      expect(responsiveImage(url, "100vw")).toEqual({ src: url });
    }
  });
});
