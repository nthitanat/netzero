# Organic Shape Theme — Usage Guide

The **Organic Shape Theme** is a reusable SCSS layer that provides the floating blob decorations, morphing image frames, asymmetric card shapes, and vibrant color fills seen on `CommunityDetail`. Any page can adopt this visual language with a different color palette by importing one file and declaring one variable.

---

## Table of Contents

1. [File Overview](#1-file-overview)
2. [How It All Connects](#2-how-it-all-connects)
3. [Palette System](#3-palette-system)
4. [Shape Tokens](#4-shape-tokens)
5. [Mixin Reference](#5-mixin-reference)
6. [Applying the Theme to a New Page](#6-applying-the-theme-to-a-new-page)
7. [Adding a New Palette](#7-adding-a-new-palette)
8. [Page-to-Palette Map](#8-page-to-palette-map)
9. [Do / Don't](#9-do--dont)

---

## 1. File Overview

| File | Purpose |
|---|---|
| `src/styles/_variables.scss` | MD3 design tokens **and** organic shape tokens (`$organic-card`, `$organic-item`, …) |
| `src/styles/_palettes.scss` | Defines named color palette maps (`$palette-orange`, `$palette-blue`, …) |
| `src/styles/_animations.scss` | Shared `@keyframes`: `float`, `morphShape`, `fadeIn` |
| `src/styles/_organic-theme.scss` | All structural mixins — imports `_animations` and `_palettes` |

A page only needs to import `_mixins.scss` and `_organic-theme.scss`. `_animations.scss` and `_palettes.scss` are pulled in transitively by `_organic-theme`. `_variables.scss` (which contains the shape tokens) is pulled in transitively by `_mixins.scss`, which every organic-theme page already imports.

---

## 2. How It All Connects

```
PageName.module.scss
  ├── @import '../../styles/mixins'
  │     └── @import 'variables'      ← MD3 tokens + organic shape tokens
  │                                    ($color-surface, $spacing-*, $organic-card, …)
  └── @import '../../styles/organic-theme'
        ├── @import 'animations'     ← float, morphShape, fadeIn
        └── @import 'palettes'       ← $palette-orange, $palette-blue, …
```

> `_organic-theme.scss` does **not** import `_variables` itself — it relies on `_mixins.scss` already being present in every page file, which brings variables in transitively. This avoids duplicate imports.

---

## 3. Palette System

### Structure

Each palette is a SCSS **map** with exactly four named slots:

| Key | Role | Used by |
|---|---|---|
| `p1` | Dominant warm — primary blobs, badges, borders | page background blobs, badge bg, highlight block border |
| `p2` | Secondary warm — softer highlights | stat card bg tint, highlight block fill, title gradient end |
| `p3` | Earthy / nature — tags, icons, course items | collab tags, course icon bg, share button border |
| `p4` | Cool contrast — meta chips, share button accent | meta chip bg, share button icon, course item hover |

### Available Palettes

```scss
// _palettes.scss

$palette-orange: ( 'p1': #f89d00, 'p2': #ffeb79, 'p3': #b5c57c, 'p4': #6df5d1 );
$palette-blue:   ( 'p1': #3B82F6, 'p2': #93C5FD, 'p3': #6EE7B7, 'p4': #67E8F9 );
$palette-purple: ( 'p1': #8B5CF6, 'p2': #C4B5FD, 'p3': #86EFAC, 'p4': #7DD3FC );
$palette-rose:   ( 'p1': #F43F5E, 'p2': #FDA4AF, 'p3': #86EFAC, 'p4': #7DD3FC );
$palette-teal:   ( 'p1': #14B8A6, 'p2': #99F6E4, 'p3': #BEF264, 'p4': #93C5FD );
```

### Palette Helper Functions

Inside `_organic-theme.scss`, four shorthand functions allow readable mixin bodies:

```scss
p1($palette)  // → map.get($palette, 'p1')
p2($palette)  // → map.get($palette, 'p2')
p3($palette)  // → map.get($palette, 'p3')
p4($palette)  // → map.get($palette, 'p4')
```

These are available in page files too once you import `organic-theme`.

---

## 4. Shape Tokens

The "language" of the organic theme — all asymmetric `border-radius` values are defined in `_variables.scss` (so they're available to any file that imports `_mixins.scss`, even without the full organic theme):

| Token | Value | Used for |
|---|---|---|
| `$organic-card` | `32px 8px 32px 8px` | Large content cards, sidebar cards |
| `$organic-card-small` | `24px 6px 24px 6px` | Product cards |
| `$organic-item` | `16px 4px 16px 4px` | List rows, info items, highlight blocks |
| `$organic-badge` | `20px 5px 20px 5px` | Category / type badges |
| `$organic-tag` | `12px 3px 12px 3px` | Collab tags, meta chips |
| `$organic-icon` | `16px 4px 16px 4px` | Icon box containers |
| `$organic-tab` | `12px 12px 0 0` | Tab navigation buttons |

Use these tokens directly in page SCSS when adding new elements so the shape language stays consistent:

```scss
.myNewCard {
  border-radius: $organic-card;
}
```

---

## 5. Mixin Reference

All mixins accept `$palette` as their first (and usually only) argument. Calls like `@include organic-hero($page-palette)` inject a full block of CSS — no further customization needed for standard usage.

### Page-Level

| Mixin | What it outputs |
|---|---|
| `organic-page-wrapper($p)` | `min-height: 100vh`, vertical gradient background, two large floating blobs via `::before`/`::after` |

### Hero Section

| Mixin | What it outputs |
|---|---|
| `organic-hero($p)` | Full-width hero with diagonal gradient bg + two floating blobs |
| `organic-hero-image-side($p)` | Left panel of the hero split: centered flex + radial glow pseudo |
| `organic-image-frame($p)` | Morphing blob image container with colored box-shadow rings + `morphShape` animation |
| `organic-hero-text-side($p)` | Right panel: angled `clip-path` background, two small decorative blobs |

### Labels & Tags

| Mixin | What it outputs |
|---|---|
| `organic-badge($p)` | Solid gradient pill — uses `p1` as fill |
| `organic-collab-tag($p)` | Soft tinted tag — uses `p3`/`p4` |
| `organic-meta-chip($p)` | Inline chip row with icon — uses `p4` tint and icon color |

### Cards

| Mixin | What it outputs |
|---|---|
| `organic-card-base($p)` | White bg, `$organic-card` radius, `$elevation-1`, `overflow: hidden`, `position: relative` |
| `organic-stat-card($p, $nth)` | Full stat card — flex layout, icon with tinted bg, nth-keyed blob in `::before`. Pass `1`–`4` for `$nth`. |
| `organic-sidebar-card($p)` | Sidebar card with border, elevation-2, two small blobs |
| `organic-quick-info-card($p)` | Gradient-background variant of sidebar card |

### Tab Navigation

| Mixin | What it outputs |
|---|---|
| `organic-tab-hover($p)` | Hover state gradient bg + organic tab radius |
| `organic-tab-active($p)` | Active state: `p1` bottom border, stronger gradient |

### Content Panels (Tab content areas)

| Mixin | What it outputs |
|---|---|
| `organic-story-panel($p)` | Card base + top-right and bottom-left blobs (story/about tabs) |
| `organic-journey-panel($p)` | Card base + bottom-left and top-right blobs |
| `organic-media-panel($p)` | Card base + top-left and bottom-right blobs |
| `organic-products-panel($p)` | Card base + top-right and bottom-left blobs (stronger opacity) |

### Text & UI Elements

| Mixin | What it outputs |
|---|---|
| `organic-highlight-block($p)` | Quoted/lead text block — left border `p1`, gradient fill all four p values |
| `organic-icon-box($p)` | Small square icon container, `p1`/`p2` gradient bg |
| `organic-share-button($p)` | Outlined button using `p3` border and `p4` icon |
| `organic-title-underline($p)` | Gradient `border-bottom` using `p1→p2→p4` |
| `organic-title-underline-green($p)` | Gradient `border-bottom` using `p3→p4` (for sidebar titles) |

### Layout Utilities

| Mixin | What it outputs |
|---|---|
| `organic-content-grid-blobs($p)` | Two large animated blobs on the content grid `::before`/`::after` |
| `organic-sidebar-glow($p)` | Ambient soft glow behind sidebar sticky wrapper |
| `organic-course-icon($p)` | Course icon box using `p3` gradient |
| `organic-course-item-hover($p)` | Hover state for course list items |
| `organic-product-card-hover($p)` | Hover `box-shadow` using `p1` and `p4` |

---

## 6. Applying the Theme to a New Page

### Step 1 — Import and declare palette

```scss
// MyPage.module.scss

@use 'sass:map';
@use 'sass:color';
@import '../../styles/mixins';
@import '../../styles/organic-theme';

// ─── Choose one palette ───────────────────────────────────────────
$page-palette: $palette-blue;    // ← swap this to change all colors
```

### Step 2 — Apply page-level mixins

```scss
.myPage {
  @include organic-page-wrapper($page-palette);
}

.hero {
  @include organic-hero($page-palette);
}

.heroImageSide {
  @include organic-hero-image-side($page-palette);
}

.heroImageContainer {
  @include organic-image-frame($page-palette);
}

.heroTextSide {
  @include organic-hero-text-side($page-palette);
}
```

### Step 3 — Apply card and content mixins

```scss
.storyTab    { @include organic-story-panel($page-palette); }
.journeyTab  { @include organic-journey-panel($page-palette); }
.mediaTab    { @include organic-media-panel($page-palette); }

.badge       { @include label-large; @include organic-badge($page-palette); }
.storyLead   { @include title-large; @include organic-highlight-block($page-palette); }
```

### Step 4 — Apply sidebar and stat cards

```scss
.leaderCard  { @include organic-sidebar-card($page-palette); }
.quickInfoCard { @include organic-quick-info-card($page-palette); }

// For stat cards, pass the 1-based position so each gets a different colored blob
.statCard {
  @include organic-stat-card($page-palette, 1);
  &:nth-child(2) { @include organic-stat-card($page-palette, 2); }
  &:nth-child(3) { @include organic-stat-card($page-palette, 3); }
  &:nth-child(4) { @include organic-stat-card($page-palette, 4); }
}
```

### Step 5 — Use shape tokens for new elements

```scss
// Any new element — use shape tokens instead of hard-coding px values
.myNewItem {
  border-radius: $organic-item;   // 16px 4px 16px 4px
}

.myNewTag {
  border-radius: $organic-tag;    // 12px 3px 12px 3px
  background: rgba(p3($page-palette), 0.2);
  color: color.adjust(p3($page-palette), $lightness: -25%);
}
```

### Step 6 — Use `@keyframes` for animated elements

The animations are available globally once `organic-theme` is imported. Reference them by name:

```scss
.myAnimatedElement {
  animation: float 20s ease-in-out infinite;
  // or: morphShape 15s ease-in-out infinite
  // or: fadeIn 0.4s ease
}
```

### Complete minimal example

```scss
@use 'sass:map';
@use 'sass:color';
@import '../../styles/mixins';
@import '../../styles/organic-theme';

$page-palette: $palette-purple;

.myDetailPage     { @include organic-page-wrapper($page-palette); }
.hero             { @include organic-hero($page-palette); }
.heroImageSide    { @include organic-hero-image-side($page-palette); }
.heroImageContainer { @include organic-image-frame($page-palette); }
.heroTextSide     { @include organic-hero-text-side($page-palette); }
.badge            { @include label-large; @include organic-badge($page-palette); }
.mainPanel        { @include organic-story-panel($page-palette); }
.sideCard         { @include organic-sidebar-card($page-palette); }
```

---

## 7. Adding a New Palette

Open `src/styles/_palettes.scss` and add a new map:

```scss
// ─── Sunset / Coral ──────────────────────────────────────────────
// Used by: EventDetail
$palette-coral: (
  'p1': #FF6B6B,   // dominant warm (coral red)
  'p2': #FFD93D,   // secondary warm (yellow)
  'p3': #6BCB77,   // earthy (green)
  'p4': #4D96FF,   // cool contrast (blue)
);
```

**Color selection guidelines:**

- `p1` should be saturated and warm — it appears most often and at the highest opacity
- `p2` should be a lighter, desaturated version of `p1` or a warm neighbor on the color wheel
- `p3` should feel "natural" / earthy — greens, sage, muted yellows work well
- `p4` should contrast `p1` in hue temperature — a cool blue, cyan, or sky color reads best
- Avoid choosing two colors in the same hue family for all four slots — contrast between warm (`p1`/`p2`) and cool (`p3`/`p4`) is what makes the palette feel lively

---

## 8. Page-to-Palette Map

| Page | Palette |
|---|---|
| `CommunityDetail` | `$palette-orange` |
| `KnowledgeHub` *(reserved)* | `$palette-blue` |
| `CourseDetail` *(reserved)* | `$palette-purple` |
| `Showroom` *(reserved)* | `$palette-rose` |
| `About` *(reserved)* | `$palette-teal` |

Update this table when a new page adopts the theme.

---

## 9. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Import `_organic-theme.scss` and use `$page-palette` | Hard-code hex color values in page `.module.scss` files |
| Use `$organic-card`, `$organic-item`, etc. for border-radius | Write `border-radius: 32px 8px 32px 8px` directly |
| Call `p1($page-palette)` / `p3($page-palette)` for one-off colors | Reference `$palette-orange` slots directly in page files |
| Add new palettes to `_palettes.scss` | Define `$my-color: #f89d00` inside a page module |
| Use `color.adjust(p1($page-palette), $lightness: -10%)` | Use the deprecated `darken()` function |
| Use `@include organic-card-base($p)` then add page-specific layout on top | Duplicate blob `::before`/`::after` CSS in page files |
