import { describe, expect, it } from "vitest";
import { initialSelection, matchVariant } from "@orunelle/theme-sdk";
import type { Variant } from "@orunelle/theme-sdk/commerce";
import { purchasableVariants } from "../app/lib/variants";

const variant = (id: string, options: Record<string, string>): Variant => ({
  id,
  productId: "p",
  sku: id,
  size: "",
  color: "",
  options,
  colorHex: "",
  priceOverrideMinor: null,
  availableQuantity: 5,
  isActive: true,
});

describe("purchasableVariants", () => {
  it("drops a leftover option-less variant so the real option is selected", () => {
    const list = [variant("base", {}), variant("yellow", { اللون: "Yellow" })];
    const kept = purchasableVariants(list);
    expect(kept.map((v) => v.id)).toEqual(["yellow"]);
    const selection = initialSelection(kept);
    expect(selection).toEqual({ اللون: "Yellow" });
    expect(matchVariant(kept, selection)?.id).toBe("yellow");
  });

  it("keeps products without options unchanged", () => {
    const list = [variant("only", {})];
    expect(purchasableVariants(list)).toBe(list);
  });

  it("keeps the legacy size/colour fields as options", () => {
    const legacy = { ...variant("red", {}), color: "Red" };
    const list = [variant("base", {}), legacy];
    expect(purchasableVariants(list).map((v) => v.id)).toEqual(["red"]);
  });
});
