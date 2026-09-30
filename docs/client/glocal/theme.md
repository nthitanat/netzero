Here's the updated theme with Material Design 3 tokens, Google Fonts, and Material Symbols:

---

# Chulalongkorn University — Material Design Theme

## Google Fonts & Icons Import

```html
<!-- In <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Noto+Sans+Thai:wght@300;400;500;700&display=swap" rel="stylesheet">

<!-- Material Symbols (Outlined style — sharp & minimal) -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
```

---

## SCSS

```scss
// ─────────────────────────────────────────────────────────────────
// Chulalongkorn University
// Material Design 3 Theme  ×  CU Brand Identity Manual (2020)
// ─────────────────────────────────────────────────────────────────

@use 'sass:color';

// ─── Google Fonts ────────────────────────────────────────────────

$font-sans:     'Roboto', sans-serif;
$font-thai:     'Noto Sans Thai', sans-serif;
$font-body:     $font-sans;
$font-icon:     'Material Symbols Outlined';

// ─── CU Brand Seed Colours ───────────────────────────────────────

$cu-pink:       #DB5F8E;   // PANTONE 7424U — primary
$cu-silver:     #898989;   // PANTONE 877C  — secondary

// ─── MD3 Color Tokens (generated from $cu-pink seed) ─────────────

// Primary
$color-primary:               $cu-pink;                               // #DB5F8E
$color-on-primary:            #FFFFFF;
$color-primary-container:     color.adjust($cu-pink, $lightness: 36%); // ~#F7C5D8
$color-on-primary-container:  color.adjust($cu-pink, $lightness: -28%);// ~#6B0D32

// Secondary (neutral pink-grey)
$color-secondary:             #735660;
$color-on-secondary:          #FFFFFF;
$color-secondary-container:   #FFD9E3;
$color-on-secondary-container:#2C151C;

// Tertiary (silver from brand)
$color-tertiary:              $cu-silver;                              // #898989
$color-on-tertiary:           #FFFFFF;
$color-tertiary-container:    #E0E0E0;
$color-on-tertiary-container: #1A1A1A;

// Surface & Background
$color-background:            #FFFBFF;
$color-on-background:         #1E1A1B;
$color-surface:               #FFFBFF;
$color-on-surface:            #1E1A1B;
$color-surface-variant:       #F3DEE5;
$color-on-surface-variant:    #51434A;
$color-surface-container-low: #FBF0F3;
$color-surface-container:     #F5EBEe;
$color-surface-container-high:#EFE5E8;
$color-inverse-surface:       #341F25;
$color-inverse-on-surface:    #FAEDF2;

// Outline
$color-outline:               #84737A;
$color-outline-variant:       #D5C2C9;

// Error
$color-error:                 #BA1A1A;
$color-on-error:              #FFFFFF;
$color-error-container:       #FFDAD6;
$color-on-error-container:    #410002;

// Scrim / Shadow
$color-scrim:                 rgba(0, 0, 0, 0.32);

// ─── Elevation (MD3 surface tones via box-shadow) ─────────────────

$elevation-0: none;
$elevation-1: 0px 1px 2px rgba(0,0,0,.10), 0px 1px 3px 1px rgba(0,0,0,.08);
$elevation-2: 0px 1px 2px rgba(0,0,0,.10), 0px 2px 6px 2px rgba(0,0,0,.08);
$elevation-3: 0px 4px 8px 3px rgba(0,0,0,.10), 0px 1px 3px rgba(0,0,0,.12);
$elevation-4: 0px 6px 10px 4px rgba(0,0,0,.10), 0px 2px 3px rgba(0,0,0,.12);

// ─── Shape / Border Radius (MD3 shape scale) ──────────────────────

$shape-none:         0px;
$shape-extra-small:  4px;
$shape-small:        8px;
$shape-medium:       12px;
$shape-large:        16px;
$shape-extra-large:  28px;
$shape-full:         9999px;

// ─── Type Scale (MD3) ─────────────────────────────────────────────

// Display
$typescale-display-large:   57px;
$typescale-display-medium:  45px;
$typescale-display-small:   36px;

// Headline
$typescale-headline-large:  32px;
$typescale-headline-medium: 28px;
$typescale-headline-small:  24px;

// Title
$typescale-title-large:     22px;
$typescale-title-medium:    16px;
$typescale-title-small:     14px;

// Body
$typescale-body-large:      16px;
$typescale-body-medium:     14px;
$typescale-body-small:      12px;

// Label
$typescale-label-large:     14px;
$typescale-label-medium:    12px;
$typescale-label-small:     11px;

// Weights
$font-weight-light:     300;
$font-weight-regular:   400;
$font-weight-medium:    500;
$font-weight-bold:      700;

// ─── Spacing ──────────────────────────────────────────────────────

$spacing-1:   4px;
$spacing-2:   8px;
$spacing-3:   12px;
$spacing-4:   16px;
$spacing-5:   20px;
$spacing-6:   24px;
$spacing-8:   32px;
$spacing-10:  40px;
$spacing-12:  48px;
$spacing-16:  64px;

// ─── Motion (MD3 duration + easing) ──────────────────────────────

$motion-duration-short1:  50ms;
$motion-duration-short2:  100ms;
$motion-duration-medium1: 200ms;
$motion-duration-medium2: 300ms;
$motion-duration-long:    400ms;

$motion-easing-standard:         cubic-bezier(0.2, 0, 0, 1);
$motion-easing-standard-decel:   cubic-bezier(0, 0, 0, 1);
$motion-easing-standard-accel:   cubic-bezier(0.3, 0, 1, 1);
$motion-easing-emphasized:       cubic-bezier(0.2, 0, 0, 1);

// ─── Material Icon Helper ─────────────────────────────────────────
//
//   Usage in HTML:
//     <span class="material-symbols-outlined">home</span>
//
//   Control axes in CSS:
.material-symbols-outlined {
  font-family:              $font-icon;
  font-variation-settings:  'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size:                24px;
  line-height:              1;
  user-select:              none;

  // Filled variant
  &.filled  { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  // Size helpers
  &.sm      { font-size: 20px; }
  &.lg      { font-size: 40px; }
}

// ─── Base Resets (MD3-flavoured) ──────────────────────────────────

*,
*::before,
*::after { box-sizing: border-box; }

html {
  font-size:                $typescale-body-large;
  -webkit-font-smoothing:   antialiased;
  -moz-osx-font-smoothing:  grayscale;
}

body {
  font-family:    $font-body;
  font-weight:    $font-weight-regular;
  background:     $color-background;
  color:          $color-on-background;
  margin:         0;
  line-height:    1.5;

  // Switch to Thai stack for :lang(th) subtrees
  &:lang(th),
  :lang(th) { font-family: $font-thai; }
}

// ─── Component Tokens (spot examples) ────────────────────────────

// Filled button
.btn-filled {
  background:         $color-primary;
  color:              $color-on-primary;
  border:             none;
  border-radius:      $shape-full;
  padding:            $spacing-2 $spacing-6;
  font-family:        $font-body;
  font-size:          $typescale-label-large;
  font-weight:        $font-weight-medium;
  letter-spacing:     0.1px;
  cursor:             pointer;
  box-shadow:         $elevation-0;
  transition:         box-shadow $motion-duration-medium1 $motion-easing-standard,
                      background $motion-duration-short2 $motion-easing-standard;

  &:hover  { box-shadow: $elevation-1; }
  &:active { box-shadow: $elevation-0; }
}

// Tonal button (lighter brand surface)
.btn-tonal {
  background:     $color-primary-container;
  color:          $color-on-primary-container;
  border:         none;
  border-radius:  $shape-full;
  padding:        $spacing-2 $spacing-6;
  font-size:      $typescale-label-large;
  font-weight:    $font-weight-medium;
  cursor:         pointer;
}

// Card
.card {
  background:     $color-surface;
  border-radius:  $shape-medium;
  box-shadow:     $elevation-1;
  padding:        $spacing-6;
  transition:     box-shadow $motion-duration-medium1 $motion-easing-standard;

  &:hover { box-shadow: $elevation-2; }
}

// Chip
.chip {
  display:        inline-flex;
  align-items:    center;
  gap:            $spacing-1;
  background:     $color-surface-variant;
  color:          $color-on-surface-variant;
  border:         1px solid $color-outline-variant;
  border-radius:  $shape-small;
  padding:        $spacing-1 $spacing-3;
  font-size:      $typescale-label-large;
  font-weight:    $font-weight-medium;
}

// Text field outline
.field {
  position:       relative;

  input {
    width:          100%;
    background:     transparent;
    border:         1px solid $color-outline;
    border-radius:  $shape-extra-small;
    padding:        $spacing-4;
    font-family:    $font-body;
    font-size:      $typescale-body-large;
    color:          $color-on-surface;
    outline:        none;
    transition:     border-color $motion-duration-short2 $motion-easing-standard;

    &:focus {
      border-color: $color-primary;
      border-width: 2px;
    }
  }
}
```

---

## Quick Reference

```
Google Fonts  →  Roboto (EN) · Noto Sans Thai (TH)
Material Icons→  Material Symbols Outlined (variable font)
Primary       →  #DB5F8E  (PANTONE 7424U — CU Pink)
Surface       →  #FFFBFF  (MD3 warm white)
Shape scale   →  4 / 8 / 12 / 16 / 28 / 9999px
Elevation     →  0–4 (box-shadow layered system)
Motion        →  200–300ms · cubic-bezier standard easing
```