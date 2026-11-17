// Run after building: node tests/commerce-browser.cjs. All writes use this in-memory API.
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const {
  mkdirSync,
  readFileSync,
  writeFileSync,
  realpathSync,
} = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const { chromium } = require(
  require.resolve("playwright", {
    paths: [root, path.resolve(root, "../../../apps/storefront")],
  }),
);
const output = path.join(root, ".impeccable/review/commerce-redesign");
const storeId = "00000000-0000-4000-8000-000000000001";
const product = {
  id: "chair",
  storeId,
  handle: "oak-lounge-chair",
  name: "Oak lounge chair",
  description:
    "<p>A comfortable place to pause.</p><ul><li>Solid oak frame</li><li>Removable linen cover</li></ul><p><strong>Care:</strong> Wipe clean with a soft cloth.</p><script>window.descriptionExecuted=true</script>",
  currency: "EGP",
  priceMinor: 1250000,
  compareAtPriceMinor: null,
  categoryId: null,
  translations: [
    {
      locale: "ar-EG",
      name: "كرسي استرخاء من البلوط",
      description:
        "<p>مكان مريح للاسترخاء.</p><ul><li>هيكل من خشب البلوط</li><li>غطاء كتان قابل للإزالة</li></ul><p><strong>العناية:</strong> ينظف بقطعة قماش ناعمة.</p>",
    },
  ],
  media: [
    {
      mediaType: "main_image",
      position: 0,
      asset: {
        resolvedCdnUrl: "/assets/furniture/living-chair.jpg",
        altText: "Oak lounge chair",
        mimeType: "image/jpeg",
        width: 2000,
        height: 3000,
      },
    },
  ],
};
const variants = [
  {
    id: "oak-natural",
    productId: "chair",
    sku: "OAK-NAT",
    size: "",
    color: "",
    options: { Finish: "Natural" },
    priceOverrideMinor: null,
    availableQuantity: 3,
    isActive: true,
  },
  {
    id: "oak-dark",
    productId: "chair",
    sku: "OAK-DARK",
    size: "",
    color: "",
    options: { Finish: "Dark" },
    priceOverrideMinor: null,
    availableQuantity: 1,
    isActive: true,
  },
];
let customer,
  addresses,
  cart,
  writes = [],
  failNext = false;
const totals = {
  taxInclusive: true,
  subtotalMinor: 1250000,
  shippingMinor: 5000,
  taxMinor: 0,
  discountMinor: 0,
  totalMinor: 1255000,
  amountDueMinor: 1255000,
  currency: "EGP",
};
const order = {
  id: "order-1",
  orderNumber: "ORD-1024",
  status: "confirmed",
  paymentStatus: "pending",
  paymentMethod: "cod",
  totals,
  delivery: { id: "delivery-1", name: "Standard delivery", amountMinor: 5000 },
  items: [
    {
      id: "item-1",
      name: "Oak lounge chair",
      quantity: 1,
      totalMinor: 1250000,
    },
  ],
};
function reset() {
  customer = {
    id: "customer-1",
    storeId,
    email: "amina@example.test",
    firstName: "Amina",
    lastName: "Hassan",
    phone: "01012345678",
    locale: "en-US",
    marketingConsent: false,
  };
  addresses = [
    {
      id: "address-1",
      label: "Home",
      recipientName: "Amina Hassan",
      phone: "01012345678",
      country: "EG",
      governorate: "EG-C",
      city: "EG-CITY",
      district: "Zamalek",
      street: "26 July Street",
      building: "12",
      floor: "2",
      apartment: "4",
      landmark: "",
      postalCode: "",
      isDefault: true,
    },
  ];
  order.items = [
    {
      id: "item-1",
      name: "Oak lounge chair",
      quantity: 1,
      totalMinor: 1250000,
    },
  ];
  order.totals = totals;
  cart = { id: "cart-1", currency: "EGP", version: 1, items: [] };
  writes = [];
}
function envelope(data, pagination) {
  return {
    success: true,
    data,
    error: null,
    meta: {
      requestId: "fixture-request",
      ...(pagination ? { pagination } : {}),
    },
  };
}
const api = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost"),
    route = url.pathname.replace("/api/storefront/fixture", "");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  res.setHeader("content-type", "application/json");
  if (req.method !== "GET") {
    writes.push({ route, method: req.method, body });
    if (failNext) {
      failNext = false;
      res.writeHead(422);
      res.end(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: "INVALID_QUANTITY" },
          meta: { requestId: "fixture-error" },
        }),
      );
      return;
    }
  }
  let data, pagination;
  if (route === "/auth/refresh")
    data = { accessToken: "fixture-access-token", user: customer };
  else if (route === "/auth/me") {
    if (req.method === "PATCH") Object.assign(customer, body);
    data = customer;
  } else if (route === "/auth/logout") data = { loggedOut: true };
  else if (route === "/products/oak-lounge-chair") data = product;
  else if (route === "/products/chair/variants") data = variants;
  else if (route === "/products") {
    data = [product];
    pagination = { page: 1, limit: 20, total: 1, pages: 1 };
  } else if (route === "/settings") data = {};
  else if (route === "/collections" || route === "/categories") {
    data = [];
    pagination = { page: 1, limit: 20, total: 0, pages: 1 };
  } else if (route === "/geo/governorates")
    data = [
      {
        code: "EG-C",
        name: url.searchParams.get("locale") === "ar" ? "القاهرة" : "Cairo",
      },
      { code: "EG-G", name: "Giza" },
    ];
  else if (route === "/geo/cities")
    data =
      url.searchParams.get("governorate") === "EG-C"
        ? [
            {
              id: "EG-CITY",
              name:
                url.searchParams.get("locale") === "ar" ? "الزمالك" : "Zamalek",
            },
          ]
        : [{ id: "EG-GIZA", name: "Giza city" }];
  else if (route === "/addresses") {
    if (req.method === "POST") {
      if (body.isDefault) addresses.forEach((a) => (a.isDefault = false));
      data = { id: `address-${addresses.length + 1}`, ...body };
      addresses.push(data);
    } else data = addresses;
  } else if (route.startsWith("/addresses/")) {
    const id = route.split("/").pop();
    if (req.method === "DELETE") {
      addresses = addresses.filter((a) => a.id !== id);
      data = {};
    } else {
      if (body.isDefault) addresses.forEach((a) => (a.isDefault = false));
      data = addresses.find((a) => a.id === id);
      Object.assign(data, body);
    }
  } else if (route === "/orders") {
    data = [order];
    pagination = { page: 1, limit: 20, total: 1, pages: 1 };
  } else if (route === "/orders/ORD-1024") data = order;
  else if (route === "/wishlist") data = { uncategorized: [], collections: [] };
  else if (route === "/cart") data = cart;
  else if (route === "/cart/items") {
    assert(
      Number.isInteger(body.quantity) &&
        body.quantity >= 1 &&
        body.quantity <=
          variants.find((v) => v.id === body.variantId).availableQuantity,
    );
    const variant = variants.find((v) => v.id === body.variantId),
      line = cart.items.find((l) => l.variantId === body.variantId);
    if (line) line.quantity += body.quantity;
    else
      cart.items.push({
        id: `line-${variant.id}`,
        variantId: variant.id,
        productId: product.id,
        sku: variant.sku,
        name: product.name,
        quantity: body.quantity,
        unitPriceMinor: product.priceMinor,
        availableQuantity: variant.availableQuantity,
        unavailable: false,
        productHandle: product.handle,
      });
    cart.version++;
    data = cart;
  } else if (route.startsWith("/cart/items/")) {
    const id = route.split("/").pop();
    if (req.method === "DELETE")
      cart.items = cart.items.filter((l) => l.id !== id);
    else {
      assert(
        Number.isInteger(body.quantity) &&
          body.quantity >= 1 &&
          body.quantity <= 3,
      );
      cart.items.find((l) => l.id === id).quantity = body.quantity;
    }
    cart.version++;
    data = cart;
  } else {
    res.writeHead(404);
    res.end(
      JSON.stringify({
        success: false,
        data: null,
        error: { code: "NOT_FOUND" },
        meta: { requestId: "fixture" },
      }),
    );
    return;
  }
  res.end(JSON.stringify(envelope(data, pagination)));
});
async function freePort() {
  const s = createServer();
  s.listen(0, "127.0.0.1");
  await once(s, "listening");
  const port = s.address().port;
  await new Promise((r) => s.close(r));
  return port;
}
(async () => {
  reset();
  mkdirSync(output, { recursive: true });
  api.listen(0, "127.0.0.1");
  await once(api, "listening");
  const port = await freePort(),
    origin = `http://127.0.0.1:${port}`;
  const configuration = {
    ...JSON.parse(readFileSync(path.join(root, "defaults.json"))),
    installationId: storeId,
  };
  const bindings = [
    {
      origin,
      apiOrigin: `http://127.0.0.1:${api.address().port}`,
      store: {
        id: storeId,
        slug: "fixture",
        name: { en: "Furniture test store", ar: "متجر الأثاث التجريبي" },
      },
      release: "commerce-test",
      configurationRevision: 1,
      currency: "EGP",
      market: "EG",
      configuration,
    },
  ];
  const adapter = path.join(
    realpathSync(path.join(root, "node_modules/@orunelle/theme-runtime")),
    "dist/host/serve-node.mjs",
  );
  const child = spawn(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `import { serveNode } from ${JSON.stringify(adapter)}; const s = await serveNode({entry:'dist/server/server.js',assets:'dist/client',port:${port}}); process.on('SIGTERM',()=>s.close(()=>process.exit(0)));`,
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        ORUNELLE_STOREFRONT_BINDINGS: JSON.stringify(bindings),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let logs = "";
  child.stdout.on("data", (c) => (logs += c));
  child.stderr.on("data", (c) => (logs += c));
  let browser;
  try {
    for (let i = 0; i < 100; i++) {
      try {
        const r = await fetch(origin + "/en/products/oak-lounge-chair");
        if (r.ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    browser = await chromium.launch({ args: ["--no-sandbox"] });
    const results = [];
    for (const locale of ["en", "ar"])
      for (const width of process.env.FURNITURE_PRINT_ONLY
        ? [1440]
        : [1440, 390]) {
        reset();
        const context = await browser.newContext({
          viewport: { width, height: 950 },
          reducedMotion: "reduce",
        });
        const page = await context.newPage(),
          errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.addInitScript(() => {
          window.print = () => {
            window.printCount = (window.printCount || 0) + 1;
          };
        });
        const go = async (route) => {
          await page.goto(`${origin}/${locale}${route}`, {
            waitUntil: "networkidle",
          });
        };
        const capture = async (name) => {
          await page.evaluate(() => document.fonts.ready);
          const active = page.locator(
            '.furniture-account-navigation [aria-current="page"]',
          );
          if (await active.count()) {
            assert.equal(await active.count(), 1);
            if (width === 390) {
              const box = await active.boundingBox();
              assert(
                box.x >= 19 && box.x + box.width <= width - 19,
                `${name}: current account tab is clipped`,
              );
            }
          }
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
            `${name} ${locale} ${width} overflows`,
          );
          await page.screenshot({
            path: path.join(output, `${name}-${locale}-${width}.png`),
            fullPage: true,
          });
        };
        if (process.env.FURNITURE_PRINT_ONLY) {
          await go("/account/orders/ORD-1024");
          await page.locator(".furniture-order-table").waitFor();
          const pdf = await page.pdf({
            path: path.join(output, `invoice-${locale}.pdf`),
            format: "A4",
            printBackground: true,
          });
          const pages = [...pdf.toString("latin1").matchAll(/\/Type \/Page\b/g)]
            .length;
          console.log(JSON.stringify({ locale, invoicePages: pages }));
          assert.equal(
            pages,
            1,
            "A one-item invoice should print without blank trailing pages",
          );
          order.items = Array.from({ length: 36 }, (_, i) => ({
            id: `item-${i + 1}`,
            name: `Oak lounge chair ${i + 1}`,
            quantity: 1,
            totalMinor: 1250000,
          }));
          order.totals = {
            ...totals,
            subtotalMinor: 45000000,
            totalMinor: 45005000,
            amountDueMinor: 45005000,
          };
          await go("/account/orders/ORD-1024");
          await page
            .locator(".furniture-order-table tbody tr")
            .nth(35)
            .waitFor();
          const longPdf = await page.pdf({
            path: path.join(output, `invoice-long-${locale}.pdf`),
            format: "A4",
            printBackground: true,
          });
          const longPages = [
            ...longPdf.toString("latin1").matchAll(/\/Type \/Page\b/g),
          ].length;
          assert(
            longPages >= 2 && longPages <= 4,
            `Unexpected long-invoice pagination: ${longPages}`,
          );
          console.log(JSON.stringify({ locale, longInvoicePages: longPages }));
          await context.close();
          continue;
        }
        await go("/products/oak-lounge-chair");
        await page
          .locator(".furniture-buy .product-add:not([disabled])")
          .waitFor();
        assert.equal(
          await page.locator(".furniture-rich-description li").count(),
          2,
        );
        assert.equal(
          await page.evaluate(() => window.descriptionExecuted),
          undefined,
        );
        const image = await page
          .locator(".product-gallery-main img")
          .boundingBox();
        if (
          image.x < 0 ||
          image.x + image.width > width + 1 ||
          image.height > 590
        ) {
          await page.screenshot({
            path: path.join(output, `image-failure-${locale}-${width}.png`),
            fullPage: true,
          });
          throw new Error(JSON.stringify({ locale, width, image }));
        }
        const quantity = page.locator(".furniture-buy input[type=number]");
        for (const invalid of ["0", "-2", "1.5", "99", ""]) {
          await quantity.fill(invalid);
          assert.equal(await quantity.getAttribute("aria-invalid"), "true");
          assert.equal(await page.locator(".product-add").isDisabled(), true);
        }
        await quantity.fill("3");
        assert.equal(
          await page
            .locator(".furniture-buy .furniture-quantity button")
            .last()
            .isDisabled(),
          true,
        );
        await page
          .locator(".product-option-value", { hasText: "Dark" })
          .click();
        assert.equal(await quantity.inputValue(), "1");
        await page
          .locator(".product-option-value", { hasText: "Natural" })
          .click();
        await quantity.fill("2");
        await capture("product");
        await page.locator(".product-add").click();
        await page.locator(".furniture-cart-drawer[open]").waitFor();
        assert.equal(
          await page.locator(".furniture-cart-count").textContent(),
          "2",
        );
        assert.equal(
          await page.locator("dialog .furniture-toast").first().isVisible(),
          true,
        );
        await capture("drawer");
        await page.keyboard.press("Escape");
        assert.equal(
          await page.locator(".furniture-cart-drawer").evaluate((d) => d.open),
          false,
        );
        await page.locator(".furniture-cart-trigger").click();
        await page.locator(".furniture-cart-drawer[open]").waitFor();
        await page.keyboard.press("Escape");
        assert.equal(
          await page
            .locator(".furniture-cart-trigger")
            .evaluate((e) => e === document.activeElement),
          true,
        );
        await go("/cart");
        await page.locator(".furniture-cart-line").waitFor();
        await capture("cart");
        await page.locator(".furniture-cart-line input").fill("1");
        await page
          .locator(".furniture-cart-controls .furniture-text-button")
          .first()
          .click();
        await page.waitForFunction(
          () =>
            document.querySelector(".furniture-cart-count")?.textContent ===
            "1",
        );
        await go("/account");
        await page.locator(".furniture-order-row").waitFor();
        await capture("account");
        await go("/account/profile");
        await page.locator('input[name="firstName"]').fill("Amina Updated");
        await page
          .locator("form.store-form")
          .first()
          .locator('button[type="submit"], button:not([type])')
          .first()
          .click();
        await page.waitForFunction(() =>
          [...document.querySelectorAll(".furniture-toast")].some((e) =>
            /saved|حفظ/.test(e.textContent),
          ),
        );
        assert.equal(customer.firstName, "Amina Updated");
        await go("/account/addresses");
        await page.locator(".furniture-address-card").waitFor();
        await page.locator(".furniture-address-card button").first().click();
        const governorate = page.locator('select[name="governorate"]'),
          city = page.locator('select[name="city"]');
        await city
          .locator('option[value="EG-CITY"]')
          .waitFor({ state: "attached" });
        assert.equal(await page.locator('select[name="label"]').count(), 1);
        await governorate.selectOption("EG-G");
        assert.equal(await city.inputValue(), "");
        await city
          .locator('option[value="EG-GIZA"]')
          .waitFor({ state: "attached" });
        await city.selectOption("EG-GIZA");
        await capture("addresses");
        await page.locator(".furniture-address-submit button").click();
        await page
          .locator(".furniture-address-editor")
          .waitFor({ state: "detached" });
        assert.equal(addresses[0].governorate, "EG-G");
        assert.equal(addresses[0].city, "EG-GIZA");
        await go("/account/orders");
        await page.locator(".furniture-order-link").first().click();
        await page.locator(".furniture-order-table").waitFor();
        await capture("order");
        await page.locator(".furniture-order-details button").click();
        assert.equal(await page.evaluate(() => window.printCount), 1);
        await page.emulateMedia({ media: "print" });
        assert.equal(
          await page
            .locator(".furniture-order-details")
            .evaluate((e) => getComputedStyle(e).visibility),
          "visible",
        );
        assert.equal(
          await page
            .locator(".furniture-header")
            .evaluate((e) => getComputedStyle(e).visibility),
          "hidden",
        );
        await page.emulateMedia({ media: "screen" });
        await go("/account/orders/ORD-1024?print=true");
        await page.waitForFunction(() => window.printCount === 1);
        await go("/cart");
        await page.locator(".furniture-cart-line").waitFor();
        failNext = true;
        await page
          .locator(".furniture-cart-controls .furniture-text-button")
          .last()
          .click();
        await page.locator(".form-error").waitFor();
        assert.equal(cart.items.length, 1);
        assert.equal(
          await page
            .locator('.furniture-toasts:visible [role="alert"]')
            .first()
            .isVisible(),
          true,
        );
        await page
          .locator(".furniture-cart-controls .furniture-text-button")
          .last()
          .click();
        await page.locator(".furniture-cart-empty").waitFor();
        assert.equal(await page.locator(".furniture-cart-count").count(), 0);
        assert.deepEqual(
          errors,
          [],
          `${locale} ${width}: ${errors.join("; ")}`,
        );
        results.push({ locale, width, result: "passed" });
        await context.close();
      }
    if (!process.env.FURNITURE_PRINT_ONLY)
      writeFileSync(
        path.join(output, "browser-results.json"),
        JSON.stringify(
          {
            results,
            scope: "Local in-memory API; no real customer/order writes",
          },
          null,
          2,
        ),
      );
    console.log(JSON.stringify(results));
  } catch (error) {
    console.error(logs.slice(-6000));
    throw error;
  } finally {
    await browser?.close();
    child.kill();
    await new Promise((r) => api.close(r));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
