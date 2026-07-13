# SCSS Architecture Guide

This document describes the full SCSS system for the KnowledgeHub client and explains **how to create a new theme** from scratch following the same patterns used by the Organic Shape Theme.

---

## Table of Contents

1. [Styles Folder Structure](#1-styles-folder-structure)
2. [Layer Responsibilities](#2-layer-responsibilities)
3. [Import Chain](#3-import-chain)
4. [How a Page Consumes Styles](#4-how-a-page-consumes-styles)
5. [Creating a New Theme — Step-by-Step](#5-creating-a-new-theme--step-by-step)
6. [Theme File Checklist](#6-theme-file-checklist)
7. [Naming Conventions](#7-naming-conventions)
8. [When to Put CSS Where](#8-when-to-put-css-where)
9. [Common Mistakes](#9-common-mistakes)

---

## 1. Styles Folder Structure

```
src/styles/
├── _variables.scss        # MD3 design tokens: colors, spacing, type scale, breakpoints,
│                          # + organic shape tokens ($organic-card, $organic-item, …)
├── _mixins.scss           # Typography, layout, button, and card mixins (imports _variables)
├── _animations.scss       # Shared @keyframes (float, morphShape, fadeIn)
├── _palettes.scss         # Named color palette maps for the organic theme
├── _organic-theme.scss    # Organic shape mixins (imports _animations, _palettes)
└── main.scss              # Global base styles: reset, body, typography, utility classes
```

### File roles at a glance

| File | Who imports it | What it provides |
|---|---|---|
| `_variables.scss` | `_mixins.scss`, page modules | All `$variable` tokens + organic shape tokens (`$organic-card`, …) |
| `_mixins.scss` | Every page `.module.scss` | Typography, layout, button helpers |
| `_animations.scss` | `_organic-theme.scss` | `@keyframes` |
| `_palettes.scss` | `_organic-theme.scss` | `$palette-*` maps |
| `_organic-theme.scss` | Organic-theme pages | Blob/shape/card mixins |
| `main.scss` | `src/index.js` (once globally) | Global reset + utility classes |

---

## 2. Layer Responsibilities

The SCSS system has three clear layers:

```
┌─────────────────────────────────────────────────────┐
│  3. Page Layer                                       │
│     PageName.module.scss                             │
│     — Layout grid, local variants, component wiring │
│     — Calls mixins; never defines raw colors        │
└────────────────┬────────────────────────────────────┘
                 │ @import
┌────────────────▼────────────────────────────────────┐
│  2. Theme Layer                                      │
│     _organic-theme.scss  (or future themes)          │
│     — Mixins parameterized by $palette               │
│     — Imports Animations + Palettes                 │
│     — Shape tokens live in Foundation (_variables)   │
└────────────────┬────────────────────────────────────┘
                 │ @import
┌────────────────▼────────────────────────────────────┐
│  1. Foundation Layer                                 │
│     _variables.scss   — MD3 tokens                  │
│     _mixins.scss      — Typography & layout helpers  │
│     _animations.scss  — @keyframes                   │
│     _palettes.scss    — Color maps                   │
└─────────────────────────────────────────────────────┘
```

**Rule:** Higher layers may import lower layers. Lower layers must never import higher layers. Page files never define colors — they only reference palette functions or mixin outputs.

---

## 3. Import Chain

### Standard page (no organic theme)

```scss
// SimpleListPage.module.scss
@import '../../styles/mixins';   // → pulls in _variables transitively

.container { max-width: $container-xl; }
.title     { @include headline-large; color: $color-on-surface; }
```

### Organic-theme page

```scss
// DetailPage.module.scss
@use 'sass:map';
@use 'sass:color';
@import '../../styles/mixins';         // → pulls in _variables (MD3 tokens + shape tokens)
@import '../../styles/organic-theme';  // → pulls animations + palettes

$page-palette: $palette-orange;

.detailPage { @include organic-page-wrapper($page-palette); }
```

> `@use 'sass:map'` and `@use 'sass:color'` must appear **before any `@import`** statements — this is a Sass module system requirement.

---

## 4. How a Page Consumes Styles

Each page folder contains exactly one `.module.scss` file scoped to that page. The pattern is:

```
src/pages/PageName/
├── PageName.jsx
└── PageName.module.scss
```

```scss
// PageName.module.scss

// 1. Sass built-ins (must be first)
@use 'sass:map';
@use 'sass:color';

// 2. Foundation imports
@import '../../styles/mixins';          // always
@import '../../styles/organic-theme';   // only if using organic theme

// 3. Palette declaration (one line)
$page-palette: $palette-orange;

// 4. Page-level structure
.pageName {
  @include organic-page-wrapper($page-palette);
}

// 5. Sections using theme mixins
.hero     { @include organic-hero($page-palette); }
.mainCard { @include organic-story-panel($page-palette); }

// 6. Page-specific layout (not in any mixin)
.contentGrid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: $spacing-8;
}
```

---

## 5. Creating a New Theme — Step-by-Step

Follow these steps when the organic theme doesn't fit and a new visual style is needed (e.g., a flat/minimal theme, a glassmorphism theme, etc.).

### Step 1 — Decide what the theme provides

A theme is a set of **mixins** that accept a configuration input (usually a palette map) and output a complete block of CSS. Identify:

- What visual patterns repeat across pages? (background style, card style, button style)
- What varies per page? (colors, perhaps corner radii)
- What is truly one-off per page? (grid columns, sidebar widths) — these stay in the page file

### Step 2 — Create a palette file (if colors vary per page)

If pages using this theme each have distinct colors, follow the same palette map pattern:

```scss
// src/styles/_palettes-glass.scss  (or add to _palettes.scss)

$glass-light: (
  'bg':      rgba(255, 255, 255, 0.15),
  'border':  rgba(255, 255, 255, 0.3),
  'tint':    rgba(100, 180, 255, 0.2),
  'shadow':  rgba(0, 80, 180, 0.2),
);

$glass-dark: (
  'bg':      rgba(20, 20, 40, 0.6),
  'border':  rgba(255, 255, 255, 0.1),
  'tint':    rgba(80, 130, 255, 0.15),
  'shadow':  rgba(0, 0, 0, 0.4),
);
```

Map keys can be named descriptively (not required to match `p1`/`p2`/`p3`/`p4`).

### Step 3 — Create the theme file

Name it `_[theme-name]-theme.scss`. Structure it the same way as `_organic-theme.scss`:

```scss
// src/styles/_glass-theme.scss

@use 'sass:map';
@use 'sass:color';
@import 'variables';
@import 'animations';           // include only if reusing shared keyframes
@import 'palettes-glass';       // your new palette file

// ─── Shape Tokens ────────────────────────────────────────────────
// Define the "language" of shapes for this theme
$glass-card:   16px;
$glass-button: 12px;

// ─── Palette Helpers ─────────────────────────────────────────────
@function gbg($p)    { @return map.get($p, 'bg'); }
@function gborder($p){ @return map.get($p, 'border'); }
@function gtint($p)  { @return map.get($p, 'tint'); }
@function gshadow($p){ @return map.get($p, 'shadow'); }

// ─────────────────────────────────────────────────────────────────
// PAGE-LEVEL MIXIN
// ─────────────────────────────────────────────────────────────────

@mixin glass-page-wrapper($palette) {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
}

// ─────────────────────────────────────────────────────────────────
// CARD MIXIN
// ─────────────────────────────────────────────────────────────────

@mixin glass-card($palette) {
  background: gbg($palette);
  border: 1px solid gborder($palette);
  border-radius: $glass-card;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px gshadow($palette);
}
```

### Step 4 — Use it in a page

```scss
// GlassPage.module.scss

@use 'sass:map';
@import '../../styles/mixins';
@import '../../styles/glass-theme';

$page-palette: $glass-light;

.glassPage { @include glass-page-wrapper($page-palette); }
.card      { @include glass-card($page-palette); }
```

### Step 5 — Document the theme

Create `documentation/[theme-name]-theme.md` following the same structure as `documentation/organic-theme.md`:
- Mixin reference table
- Palette slot descriptions
- Complete minimal example
- Page-to-palette map

### Step 6 — Register usage in this file

Update the [Theme Registry](#theme-registry) section at the bottom of this document.

---

## 6. Theme File Checklist

Use this checklist when creating a new theme file:

```
[ ] File named _[theme-name]-theme.scss in src/styles/
[ ] @use 'sass:map' and @use 'sass:color' at the top
[ ] Do NOT @import 'variables' — it arrives transitively via _mixins.scss (already imported by every page)
[ ] Palette map defined in _palettes.scss (or separate file)
[ ] Shape tokens defined in _variables.scss (not in the theme file itself)
[ ] Palette helper @functions defined (shorthand for map.get)
[ ] All mixins accept $palette as first argument
[ ] No hex color values hard-coded inside mixins — only p1/p2... functions
[ ] Responsive breakpoints use $breakpoint-* variables from _variables.scss
[ ] Elevation uses $elevation-* variables, not raw box-shadow values
[ ] Spacing uses $spacing-* variables, not raw px values
[ ] Documentation file created in documentation/
[ ] Theme registered in scss-architecture.md Theme Registry
```

---

## 7. Naming Conventions

### Files

| Type | Convention | Example |
|---|---|---|
| Theme file | `_[theme-name]-theme.scss` | `_organic-theme.scss`, `_glass-theme.scss` |
| Palette file | `_palettes.scss` (shared) or `_palettes-[theme].scss` | `_palettes.scss`, `_palettes-glass.scss` |
| Animation file | `_animations.scss` (shared) | `_animations.scss` |

### Variables

| Type | Convention | Example |
|---|---|---|
| Palette map | `$palette-[name]` | `$palette-orange`, `$palette-blue` |
| Shape token | `$[theme]-[element]` | `$organic-card`, `$glass-button` |
| Page-level palette | `$page-palette` (always this name) | `$page-palette: $palette-orange` |

### Mixins

| Type | Convention | Example |
|---|---|---|
| Page wrapper | `[theme]-page-wrapper($p)` | `organic-page-wrapper($p)` |
| Section | `[theme]-[section]($p)` | `organic-hero($p)`, `organic-hero-text-side($p)` |
| Card | `[theme]-[card-type]-card($p)` | `organic-sidebar-card($p)`, `glass-card($p)` |
| Element | `[theme]-[element]($p)` | `organic-badge($p)`, `organic-icon-box($p)` |
| Hover | `[theme]-[element]-hover($p)` | `organic-course-item-hover($p)` |

### Palette helper functions

```scss
// Single-letter shorthand for the palette slot name
@function p1($p) { @return map.get($p, 'p1'); }   // organic theme
@function gbg($p) { @return map.get($p, 'bg'); }   // glass theme
```

---

## 8. When to Put CSS Where

Use this decision tree to decide where new CSS belongs:

```
New CSS needed?
│
├── Is it a reusable visual pattern (blob, card shape, button style)?
│   └── Does it vary by color per page?
│       ├── YES → Add a mixin to _[theme]-theme.scss, parameterized by $palette
│       └── NO  → Add a regular mixin to _mixins.scss
│
├── Is it a color value?
│   └── Does it belong to a palette role (warm dominant, cool accent...)?
│       ├── YES → It belongs in $palette-* map in _palettes.scss
│       └── NO  → Check if it's a brand/semantic token → add to _variables.scss
│
├── Is it a @keyframes animation?
│   └── Add to _animations.scss
│
├── Is it a global body/reset/utility rule?
│   └── Add to main.scss
│
└── Is it page-specific layout (grid columns, sidebar width, etc.)?
    └── It stays in PageName.module.scss — call mixins for the visual style
```

---

## 9. Common Mistakes

### Hard-coding colors in page files

```scss
// ❌ Wrong
.badge { background: #f89d00; }

// ✅ Correct
.badge { @include organic-badge($page-palette); }
// or if you need a raw color value:
.badge { background: p1($page-palette); }
```

### Using deprecated `darken()` / `lighten()`

```scss
// ❌ Wrong — deprecated in modern Sass
background: darken($vibrant-orange, 10%);

// ✅ Correct
background: color.adjust(p1($page-palette), $lightness: -10%);
```

### Importing organic-theme without the Sass module declarations

```scss
// ❌ Wrong — @use must come before @import
@import '../../styles/organic-theme';
@use 'sass:color';   // ← too late, Sass will error

// ✅ Correct
@use 'sass:map';
@use 'sass:color';
@import '../../styles/mixins';
@import '../../styles/organic-theme';
```

### Duplicating shape tokens

```scss
// ❌ Wrong
.myCard { border-radius: 32px 8px 32px 8px; }

// ✅ Correct
.myCard { border-radius: $organic-card; }
```

### Importing a theme file in every component

Theme files (`_organic-theme.scss`) are meant for **page** `.module.scss` files only. Component-level files should only import `_mixins.scss`. Importing a heavy theme file in many small components causes unnecessary compiled CSS bloat.

```scss
// ❌ Wrong (inside a component)
// src/components/common/SomeButton/SomeButton.module.scss
@import '../../../styles/organic-theme';

// ✅ Correct
@import '../../../styles/mixins';
```

---

## Theme Registry

| Theme | File | Palette file | Pages using it |
|---|---|---|---|
| Organic Shape | `_organic-theme.scss` | `_palettes.scss` | `CommunityDetail` |
| *(reserved)* | `_glass-theme.scss` | `_palettes.scss` | — |
