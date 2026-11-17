import type { PublicProduct } from "@orunelle/theme-sdk";
import type { Variant } from "@orunelle/theme-sdk/commerce";
import data from "./demo-data.json";
export const demoItems = data as readonly {
  product: PublicProduct;
  variants: Variant[];
  tags: string[];
  type: string;
}[];

export const demoProducts = demoItems.map((item) => item.product);
