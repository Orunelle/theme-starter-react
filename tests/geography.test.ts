import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGeography } from "../app/lib/geography";
afterEach(() => vi.unstubAllGlobals());
describe("delivery location API", () => {
  it("uses store-bound transport, locale and encoded parent codes", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ success: true, data: [{ id: "EG-CITY", name: "القاهرة" }] }));
    vi.stubGlobal("fetch", fetch);
    expect(await loadGeography("cities", "ar", "EG-C")).toEqual([{ value: "EG-CITY", name: "القاهرة" }]);
    const [url, options] = fetch.mock.calls[0]!;
    expect(url).toBe("/__commerce/geo/cities?locale=ar&country=EG&governorate=EG-C");
    expect(options.credentials).toBe("same-origin");
  });
  it("rejects unsuccessful and malformed directories instead of offering invented options", async () => {
    for (const result of [{ success: false, data: [] }, { success: true, data: [{}] }, { success: true, data: null }]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(result)));
      await expect(loadGeography("governorates", "en")).rejects.toThrow();
    }
  });
});
