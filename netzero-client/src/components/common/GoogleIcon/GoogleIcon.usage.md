# GoogleIcon Component Usage Guide

## Overview
The GoogleIcon component provides a modern, minimalist way to display Google Material Icons throughout the application. It replaces the previous ThaiIcon component with a comprehensive set of modern icons suitable for sustainable and eco-friendly applications.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `iconType` | string | "eco" | The type of icon to display |
| `size` | string | "medium" | Size of the icon (small, medium, large, extraLarge) |
| `className` | string | "" | Additional CSS classes |
| `variant` | string | "outlined" | Icon variant (outlined or filled) |

## Available Icon Types

### Nature & Sustainability
- `eco` - Eco/sustainability icon
- `nature` - Nature icon
- `local_florist` - Flower/plant icon
- `park` - Park icon
- `forest` - Forest icon
- `agriculture` - Agriculture icon

### Business & Shopping
- `shopping_cart` - Shopping cart icon
- `add_shopping_cart` - Add to cart icon
- `store` - Store icon
- `inventory` - Inventory/package icon
- `local_shipping` - Shipping icon

### Location & Places
- `location_on` - Location pin icon
- `place` - Place marker icon
- `map` - Map icon
- `room` - Room/venue icon

### Events & Calendar
- `event` - Event icon
- `calendar_today` - Calendar icon
- `schedule` - Schedule icon
- `celebration` - Celebration icon

### Rating & Quality
- `star` - Filled star icon
- `star_outline` - Outline star icon
- `grade` - Grade icon
- `verified` - Verified icon
- `quality_check` - Quality check icon

### Actions & Navigation
- `close` - Close/X icon
- `arrow_back` - Back arrow
- `arrow_forward` - Forward arrow
- `expand_more` - Expand/dropdown icon
- `menu` - Menu icon
- `more_vert` - More options (vertical)

### Alerts & Status
- `warning` - Warning icon
- `error` - Error icon
- `info` - Info icon
- `check_circle` - Success/check icon
- `notification_important` - Important notification

### Content & Media
- `image` - Image icon
- `photo` - Photo icon
- `video_library` - Video library icon
- `article` - Article icon

### Food & Health
- `restaurant` - Restaurant icon
- `local_cafe` - Cafe icon
- `health_and_safety` - Health icon
- `spa` - Spa/wellness icon

## Size Options
- `small` - 18px
- `medium` - 24px  
- `large` - 32px
- `extraLarge` - 48px

## Usage Examples

### Basic Usage
```jsx
import { GoogleIcon } from "../components/common";

// Default eco icon
<GoogleIcon />

// Specific icon with size
<GoogleIcon iconType="shopping_cart" size="large" />

// With custom styling
<GoogleIcon 
  iconType="location_on" 
  size="medium" 
  className="custom-icon-style" 
/>
```

### In Navigation
```jsx
const navItems = [
  { path: "/events", icon: "event", label: "กิจกรรม" },
  { path: "/market", icon: "store", label: "ตลาด" }
];
```

### In Product Cards
```jsx
<div className={styles.DetailItem}>
  <GoogleIcon iconType="location_on" size="small" />
  <span>{product.origin}</span>
</div>

<div className={styles.DetailItem}>
  <GoogleIcon iconType="inventory" size="small" />
  <span>{product.weight}</span>
</div>
```

### In Buttons
```jsx
<button className={styles.ActionButton}>
  <GoogleIcon iconType="shopping_cart" size="medium" />
  Add to Cart
</button>

<button className={styles.CloseButton}>
  <GoogleIcon iconType="close" size="small" />
</button>
```

### Status Indicators
```jsx
// Success state
<GoogleIcon iconType="check_circle" size="small" />

// Warning state
<GoogleIcon iconType="warning" size="small" />

// Error state
<GoogleIcon iconType="error" size="small" />
```

## Variants
The component supports two Material Icons variants:
- `outlined` (default) - Uses Material Symbols Outlined
- `filled` - Uses Material Icons

```jsx
<GoogleIcon iconType="star" variant="outlined" />
<GoogleIcon iconType="star" variant="filled" />
```

## Hover Effects
The component includes built-in hover effects:
- Scale transform (1.1x)
- Brightness increase (1.2x)
- Color change to primary color
- Smooth transitions

## Accessibility
- Icons are properly labeled with semantic HTML
- Keyboard navigation support through click handlers
- Font-based rendering for crisp display at all sizes
- Optimized for screen readers

## Migration from ThaiIcon
The GoogleIcon component replaces ThaiIcon with the following mapping:

| Old ThaiIcon | New GoogleIcon |
|--------------|----------------|
| leaf | eco |
| bamboo | nature |
| lotus | local_florist |
| calendar | event |
| shopping | store |
| cart | shopping_cart |
| location | location_on |
| package | inventory |
| warning | warning |
| close | close |

## Best Practices
1. Use semantic icon names that match the content/action
2. Keep icon sizes consistent within the same UI section
3. Use hover states for interactive icons
4. Provide proper context/labels for accessibility
5. Choose appropriate variants (outlined vs filled) consistently
6. Test icon visibility across different backgrounds
