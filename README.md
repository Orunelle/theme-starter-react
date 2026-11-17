# Orunelle theme starter

A complete, editable Orunelle storefront theme to start from. It is a working
bilingual (English/Arabic) fashion storefront built on the Orunelle Theme
Platform v2 with React and TanStack Start. Keep what you need, restyle the rest.

## Start a new theme

1. Click **Use this template** on GitHub, then clone your new repository.
2. Give the theme its own identity:
   - `orunelle.theme.json`: set `id` (unique, lowercase), `version` and `name`.
   - `package.json`: set `name` and `description`.
3. Replace the sample photography in `public/` with images you are allowed to
   publish, and update `ASSET-SOURCES.json`.

## Run

Use Node 22.12+ and the pinned pnpm version.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm check:manifest
pnpm test
pnpm build
pnpm preview --port 3050
```

Open `http://127.0.0.1:3050/en` or `/ar`. The local preview uses a labeled
sample catalog and a browser-local demo bag. It cannot create orders or take
payments. Installed stores use their real Orunelle catalog, stock, cart,
customers and checkout.

The Orunelle SDK packages install from `vendor/*.tgz` (see `pnpm-workspace.yaml`).

## Included

- Full-height two-slide hero, transparent/sticky navigation, keyboard-accessible menu and search panels, light/dark control and language switching.
- Men/women product shelves, collection sorting and image/model views, image hover states, paired collections, editorial banners and a featured-product carousel.
- Product variants, quantity validation, size guidance, native image zoom with navigation, bag drawer and cart page.
- Six shoppable looks, journal index and articles, about, customer-care and store-information presentations.
- Existing Orunelle email/Google account, recovery, customer orders/addresses/wishlist and checkout integrations.
- Merchant-editable home composition, images, colors, text, navigation, collection/product bindings, branding and contact details.
- Self-hosted Inter and Arabic fonts. Bundled key editorial media with embedded source provenance; additional sample/editorial media initially references the inspected demo CDN.

## Merchant setup

Merchants change the brand, images, copy and links in the theme editor and bind
product shelves to their collections. Contact email and phone are blank by
default. Newsletter subscriptions require a configured HTTPS endpoint that
accepts an email and affirmative consent; the interface never claims success
without a successful response. Sample products appear only in fixture mode.

## Source and publication

`app/` owns routes, components, integrations and styles; `locales/` holds shared
commerce translations; `public/` holds bundled media and fonts.
`orunelle.theme.json` and `defaults.json` define the native editor contract.
`app/routeTree.gen.ts` is generated.

```sh
pnpm exec orunelle-theme pack --output my-theme-0.1.0.theme-source.json
pnpm exec orunelle-theme build --output .orunelle/artifact-new
pnpm exec orunelle-theme login
pnpm exec orunelle-theme upload
pnpm exec orunelle-theme status
pnpm exec orunelle-theme submit
```

Use a fresh output directory for each managed build. Upload creates an author
release; platform approval, runtime admission and merchant publication are
separate steps.
