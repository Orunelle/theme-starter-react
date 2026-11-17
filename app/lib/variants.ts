import { variantOptions } from "@orunelle/theme-sdk";
import type { Variant } from "@orunelle/theme-sdk/commerce";

/**
 * When a product has option variants (colour, size, …), an active variant with
 * no options at all is a leftover of the product's original single variant. It
 * can't be chosen in the picker, yet it would be selected first and added to
 * the cart. Drop it so the first real option is selected instead. Products
 * whose variants have no options are returned unchanged.
 */
export function purchasableVariants(
  variants: readonly Variant[],
): readonly Variant[] {
  const hasOptions = (v: Variant) => Object.keys(variantOptions(v)).length > 0;
  return variants.some((v) => v.isActive && hasOptions(v))
    ? variants.filter(hasOptions)
    : variants;
}
