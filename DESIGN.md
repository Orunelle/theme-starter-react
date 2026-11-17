---
name: Metropolitan
description: A restrained editorial fashion storefront with full-bleed photography and compact shopping controls.
colors:
  ink: "#33383c"
  paper: "#fff"
  muted: "#62666a"
  line: "#dedede"
  tint: "#f2f2f2"
  action-hover: "#181c1e"
  dark-paper: "#141718"
  dark-ink: "#f1f1ef"
  dark-muted: "#b7bbbc"
  dark-line: "#3e4345"
  dark-tint: "#24292b"
  dialog-backdrop: "#0008"
  zoom-backdrop: "#000a"
typography:
  display:
    fontFamily: '"Metropolitan Inter", "Metropolitan Arabic", sans-serif'
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.4
  headline:
    fontFamily: '"Metropolitan Inter", "Metropolitan Arabic", sans-serif'
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.4
  title:
    fontFamily: '"Metropolitan Inter", "Metropolitan Arabic", sans-serif'
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: '"Metropolitan Inter", "Metropolitan Arabic", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '"Metropolitan Inter", "Metropolitan Arabic", sans-serif'
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.6
  wordmark:
    fontFamily: '"Metropolitan Inter", "Metropolitan Arabic", sans-serif'
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "-0.04em"
  arabic-body:
    fontFamily: '"Metropolitan Arabic", "Metropolitan Inter", sans-serif'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  square: "0"
  circular: "50%"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  text: "12px"
  mobile-gutter: "16px"
  control-gap: "20px"
  gutter: "24px"
  panel: "32px"
  section-mobile: "75px"
  section-desktop: "150px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    height: "40px"
  button-underlined:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0 0 4px"
  input-newsletter:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "12px 14px"
  navigation:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0 24px"
    height: "56px"
  product-card:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "0"
  sale-label:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "1px 5px"
  product-info-tab:
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0 0 5px"
  product-info-tab-selected:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0 0 5px"
  side-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0"
    width: "340px"
---

# Design System: Metropolitan

## Overview

**Creative North Star: "Metropolitan Editorial"**

Metropolitan is a precise editorial fashion storefront whose visual authority is the user-selected Metropolitan reference. Full-height photography, fine dividers, compact sans-serif type and square forms keep garments and collections prominent. The interface is restrained, with generous space between editorial sections and dense, unboxed merchandise within them.

English and Arabic share the same hierarchy. Arabic uses the bundled Arabic family and right-to-left layout, while the wordmark retains its left-to-right direction. Merchant content and colors can change through the native theme editor without replacing this visual grammar.

**Key Characteristics:**

- Full-bleed editorial photography and portrait product imagery.
- Small, regular-to-medium typography with underlined actions and selected states.
- Flat white and charcoal surfaces, fine gray rules, and square controls.
- Responsive product shelves, native dialogs, and complete English/Arabic presentation.

The frontmatter records the implemented default tokens. `app/styles/app.css` is the styling source; `app/styles/fonts.css` supplies bundled fonts. The native editor manifest is `orunelle.theme.json`; `defaults.json` supplies editable composition. The pinned visual reference is [Metropolitan](https://metropolitan-main.myshopify.com/).

## Colors

The default palette is achromatic, allowing fashion photography to provide seasonal color.

### Primary

- **Ink** (`ink`): primary copy, selected controls, fine emphasis and solid purchase actions. Maps to `--mp-ink`.
- **Action Hover** (`action-hover`): the shared `--store-accent-hover` token; use only where a shared commerce control consumes it.

### Neutral

- **Paper** (`paper`): page, header, footer and dialog surfaces; inverse text on solid purchase controls. Maps to `--mp-paper`.
- **Muted** (`muted`): secondary descriptions, supporting copy, unselected tabs and availability text. Maps to `--mp-muted`.
- **Line** (`line`): fine dividers and field outlines. Maps to `--mp-line`.
- **Tint** (`tint`): product image grounds, story surfaces and filter areas. Maps to `--mp-tint`.
- **Dialog Backdrop** and **Zoom Backdrop**: translucent black layers that distinguish native modal surfaces from the page.
- **Dark Paper, Ink, Muted, Line and Tint**: the implemented optional dark-mode replacements for the corresponding five shell variables. Photographic overlays retain white text.

Merchant header/footer colors and text colors use their dedicated editor settings. Section background and foreground settings may override the defaults. The default action setting feeds the shared store accent; bespoke purchase buttons use shell ink and paper.

**The Photography First Rule.** Let imagery carry color and atmosphere; default interface chrome remains neutral.

## Typography

**Display and Body Font:** Metropolitan Inter, then Metropolitan Arabic, then sans-serif. These are local font-face names; Inter is bundled in regular and medium weights (400, 500). The bundled Arabic family provides regular through bold (400–700).

**Arabic Font:** Metropolitan Arabic, then Metropolitan Inter, then sans-serif. Use normal tracking in RTL content. Keep the wordmark LTR.

**Character:** Small, clean sans-serif typography supports close browsing. Hierarchy comes from spacing, placement and medium weight, with restrained size changes.

### Hierarchy

- **Display:** frontmatter `display`; the modest page/hero title role. Mobile hero headings step down (18px).
- **Headline:** frontmatter `headline`; section introductions and desktop product titles. Product titles use a slightly roomier line height (1.5).
- **Title:** frontmatter `title`; product card names. Mobile product names and prices reduce together (11px).
- **Body:** frontmatter `body`; navigation, descriptions and ordinary controls. Section introduction copy is capped (410px desktop, 310px mobile).
- **Label:** frontmatter `label`; quiet supporting controls and stock copy. Compact badges and journal category labels use micro type (9px).
- **Wordmark:** frontmatter `wordmark`; centered navigation identity. On mobile the size reduces (18px).
- **Long-form exception:** journal and information copy is larger and airier (14px/1.9); journal article titles use a distinct editorial scale (32px desktop, 26px mobile).

## Layout

The shell spans the viewport. Most content uses a consistent desktop inset (`gutter`); the mobile header, catalog and journal use `mobile-gutter`. Full-bleed product and editorial media meet the screen edges. Section spacing uses `section-desktop`, reducing to `section-mobile`; content within a section remains compact.

- **Header:** three columns (`1fr auto 1fr`), centered wordmark, menu at inline start and tools at inline end. Its desktop height is the navigation token; mobile height is slightly shorter (54px). On the home page it overlays the initial hero, then becomes a solid sticky header after scrolling (30px).
- **Hero:** viewport height (`100svh`) with a desktop minimum (580px), a mobile minimum (560px), center-cropped cover imagery, a caption near the bottom and controls below it. Editorial banners use similar full-height media; mobile banners reduce to `80svh` with a minimum (500px).
- **Products:** four columns on desktop, two on mobile, with a hairline horizontal gap. Product shelves scroll horizontally with snap alignment, exposing four desktop or two mobile cards at once. Catalog dense mode uses six desktop columns; its CSS supports three mobile columns, while the density buttons are hidden on mobile.
- **Product detail:** desktop gallery takes 62.4% and the information column fills the remainder. Information sticks below the header (56px), using generous internal side padding (12%). The gallery starts with a full-width image, then paired images with a hairline gap. At mobile widths the information follows the gallery in normal flow, padded (32px 24px).
- **Editorial:** equal and offset image pairs, three-wide look shelves, a split story block and staggered four-column journal compose the desktop page. Mobile stacks split sections, shows a partial look card (78% of viewport), and uses a two-column journal.
- **Footer:** newsletter plus five link columns on wide screens, fewer columns at the intermediate breakpoint, then a full-width newsletter and two-column links on mobile.
- **Breakpoints:** compact desktop behavior begins at `max-width: 1100px`; mobile composition begins at `max-width: 767px`. Preserve logical inline spacing and mirrored placement for Arabic.

## Elevation & Depth

Ordinary cards, account surfaces and shopping controls are flat, without decorative shadows. Tonal image grounds, hairline borders and whitespace supply separation. Native dialogs occupy the browser's modal layer. Menu/search/look dialogs and the bag dim the page with the dialog backdrop and blur (5px); zoom uses its darker backdrop and blur (4px).

**The Flat Surface Rule.** Separate ordinary content with space, image edges and fine rules; reserve dimming and blur for modal backdrops.

## Shapes

Use square corners for buttons, fields, swatches, product imagery, gallery tiles, cards and dialogs. Square describes the corner treatment: standard product media is portrait (3:4), not a square crop. The featured single-product image is square. Circular exceptions are functional markers: carousel dots, the light-mode symbol and the outlined lookbook plus control. Dividers and outlines are fine (1px). Keyboard focus uses a visible current-color outline (2px) offset from the target (5px).

## Components

### Buttons and underlined links

Solid purchase controls use ink on paper in reverse, square edges and a compact minimum height from `button-primary`. Quantity sits alongside in its own outlined square control (134px wide, 40px high). Underlined actions carry a fine current-color rule, with the frontmatter padding; hover reduces opacity (0.72). Disabled buttons lower opacity (0.5). Preserve focus visibility rather than adding decorative lift.

### Fields

Newsletter fields sit within a thin outlined row and use `input-newsletter` padding. Search in the side panel is a minimal bottom-rule field; catalog search uses an outlined row with a solid trailing submit action. Selects retain native behavior and square borders. Form colors follow the shell and theme modes.

### Navigation and dialogs

Navigation is compact with thin authored SVG icons. Mobile retains menu, centered wordmark, search and bag; language remains accessible inside navigation. The menu dialog is inset from the viewport and uses the `side-panel` width; search is wider (510px). Both use desktop insets (24px), reducing on mobile (12px), where the panels nearly fill the viewport. The bag anchors to the inline end, is full-height and wider (450px desktop, full-width mobile). Retain native dialog semantics, close controls, Escape handling and focus behavior.

### Product cards and badges

Cards have no enclosing border, radius or shadow. Portrait imagery sits on tint; name and price sit underneath with inset metadata (15px 24px 0 desktop; 12px 14px 0 mobile). Where a second image exists, pointer hover reveals it. Model view chooses that alternate image directly. A tiny square sale label sits at the media's inline-end upper corner; price comparisons remain muted and struck through.

### Tabs and variants

Collection tabs and product information tabs use muted labels with a fine ink underline for selection. Product information is an inline **Details / Materials & Care** tablist and panel, with keyboard Arrow/Home/End navigation. Preserve this final implementation. Variant values use compact square controls and selected emphasis; color swatches remain small squares. The size guide expands inline above the purchase row.

### Catalog controls

Provide separate **Regular grid** and **Dense grid** buttons with distinct authored grid SVGs and `aria-pressed` states. Selected controls use ink and a fine underline; unselected controls are muted. Keep Product/Model image choices distinct from grid density. The filter area appears beneath the toolbar on a tint surface.

### Hero carousel and editorial media

Two photographic hero slides crossfade (800ms ease) on a timer (6500ms). Thin authored SVG chevrons and two small outlined dots provide manual control; the current dot fills white. Pause automatic change on pointer hover or focus, and suppress automatic change for reduced-motion users. Product image fades use a shorter transition (350ms); lookbook hover scales imagery subtly (1.025 over 450ms). Reduced motion collapses transition and animation durations (0.01ms).

### Commerce notices

Retain the theme's small muted sample-product and demo notices. Live products, inventory, cart and checkout come from Orunelle SDK/API state. Local demo mode is visibly identified, and its checkout cannot place orders. Carry this distinction into empty, bag and product states without changing the restrained visual hierarchy.

## Do's and Don'ts

### Do:

- Do keep editorial media dominant and surrounding controls compact.
- Do use the bundled Inter and Arabic families, logical spacing, and visible keyboard focus.
- Do retain inline Details and Materials & Care tabs on product pages.
- Do show distinct regular and dense grid icons with a clear selected state on desktop.
- Do keep local demo notices visible wherever sample commerce is presented.

### Don't:

- Don't add rounded card shells, pill actions, decorative shadows, or a new accent palette to the default theme.
- Don't enlarge routine headings into display typography or box every product into a panel.
- Don't replace authored SVG hero chevrons with font glyphs.
- Don't present demo inventory, sample products, or demo checkout as live merchant commerce.
