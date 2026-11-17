import { describe, expect, it } from "vitest";
import { quantityLimit, validQuantity } from "../app/lib/quantity";
import { descriptionHtml } from "../app/lib/description";

describe("stock-aware quantities", () => {
  it("rejects fractions, empty/zero, negatives, non-finite values and overstock", () => {
    for (const quantity of [0, -1, 1.5, NaN, Infinity, 4])
      expect(validQuantity(quantity, 3)).toBe(false);
    expect(validQuantity(1, 3)).toBe(true);
    expect(validQuantity(3, 3)).toBe(true);
    expect(validQuantity(1, 0)).toBe(false);
  });
  it("uses finite stock and caps the supported order quantity", () => {
    expect(quantityLimit(3)).toBe(3);
    expect(quantityLimit(400)).toBe(99);
    for (const stock of [0, -1, NaN, Infinity])
      expect(quantityLimit(stock)).toBe(0);
  });
});
describe("rich product descriptions", () => {
  it("retains paragraphs, headings, lists, emphasis and safe links", () => {
    const html =
      '<h2>Care</h2><p><strong>Oak &amp; linen</strong></p><ul><li>Clean gently</li></ul><a href="https://example.com/care">Care guide</a>';
    expect(descriptionHtml(html)).toBe(html);
  });
  it("removes executable content, event handlers and unsafe URL schemes", () => {
    const html = descriptionHtml(
      '<script>alert(1)</script><p onclick="alert(1)">Safe</p><a href="javascript:alert(1)">Link</a><img src=x onerror="alert(1)"><iframe src="https://evil.test"></iframe>',
    );
    expect(html).toBe("<p>Safe</p><a>Link</a>");
  });
});
