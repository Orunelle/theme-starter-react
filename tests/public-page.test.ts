import { describe, expect, it } from "vitest";
import { pageSearch } from "../app/lib/publicPage";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

describe("public page navigation", () => {
  it("keeps omitted search parameters optional and preserves valid searches", () => {
    expect(pageSearch({})).toEqual({});
    expect(pageSearch({ page: "2", q: "chair" })).toEqual({
      page: 2,
      q: "chair",
    });
  });

  it("rejects invalid page numbers and oversized/non-string search terms", () => {
    for (const input of [
      { page: 0 },
      { page: -1 },
      { page: 1.5 },
      { page: 10001 },
      { q: 5 },
      { q: "x".repeat(201) },
    ])
      expect(() => pageSearch(input)).toThrow();
  });
});

describe("theme translations", () => {
  it("ships matching, nonempty English and Arabic dictionaries", () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
    expect(Object.values(ar).every((text) => text.trim().length > 0)).toBe(
      true,
    );
    expect(ar["purchase.unavailable"]).not.toEqual(en["purchase.unavailable"]);
  });
});
