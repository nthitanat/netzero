# SearchContainer Component

A pure search component for the NetZero project. This component provides a clean, reusable search input with focus states and optional clear functionality. It should be used as a building block for page-specific search components.

## Design Philosophy

The SearchContainer is designed to be a **pure search component** that handles only search input functionality. It does not include any filtering, sorting, or other business logic. Page-specific search components should wrap this component to add their own business logic.

## Usage

### Basic Implementation

```jsx
import { SearchContainer } from "../../components/common";

<SearchContainer
  searchQuery={currentQuery}
  onSearchChange={handleSearchChange}
  placeholder="ค้นหา..."
/>
```

### Advanced Usage

```jsx
<SearchContainer
  searchQuery={searchQuery}
  onSearchChange={handleSearchChange}
  placeholder="ค้นหาสินค้า..."
  className="my-custom-search-styles"
  showClearButton={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchQuery` | `string` | `""` | Current search query value |
| `onSearchChange` | `function` | - | Callback function called when search input changes |
| `placeholder` | `string` | `"ค้นหา..."` | Placeholder text for the search input |
| `className` | `string` | `""` | Additional CSS classes to apply |
| `showClearButton` | `boolean` | `true` | Whether to show the clear button when there's text |

## Event Handling

The `onSearchChange` callback receives the current search query string:

```javascript
const handleSearchChange = (query) => {
  console.log('Search query:', query);
  setSearchQuery(query);
  // Add your search logic here
};
```

## Page-Specific Implementation Pattern

For page-specific search functionality, create a wrapper component:

```jsx
// EventSearchContainer.jsx
import React from "react";
import { SearchContainer } from "../../common";

export default function EventSearchContainer({ searchQuery, onSearchChange }) {
  return (
    <SearchContainer
      searchQuery={searchQuery}
      placeholder="ค้นหางานด้วย ID..."
      onSearchChange={onSearchChange}
    />
  );
}
```

## Integration Examples

### Market Page (Already Implemented)
```jsx
// SearchOverlay.jsx - Market page search overlay
<SearchContainer
  searchQuery={searchQuery}
  onSearchChange={onSearchChange}
  placeholder="ค้นหาสินค้า..."
/>
```

### Events Page (New Implementation)
```jsx
// EventSearchContainer.jsx - Events page search component
<SearchContainer
  searchQuery={searchQuery}
  placeholder="ค้นหางานด้วย ID..."
  onSearchChange={onSearchChange}
/>
```

## Features

### Pure Search Functionality
- Clean search input with icon
- Real-time search query updates
- Optional clear button functionality
- Focus and blur state management

### Responsive Design
- Mobile-optimized input sizing
- Touch-friendly clear button
- Scalable typography

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus indicators

## Styling

The component uses scoped SCSS modules with the NetZero design system:
- Consistent color palette using mixins
- Responsive typography
- Smooth focus transitions
- Glass morphism design elements

## State Management

The component manages its own internal state for:
- Current query value
- Focus/blur states
- Input interactions

External state synchronization through props ensures the component stays in sync with parent components.

## Best Practices

### Do ✅
- Use as a building block for page-specific search
- Pass search queries through props for external state management
- Implement search logic in parent components or handlers
- Use appropriate placeholders for different contexts

### Don't ❌
- Add filtering or business logic directly to this component
- Use for anything other than pure search input
- Hardcode search behavior for specific pages
- Bypass the component architecture pattern

## Component Architecture

Follows the NetZero 4-file component pattern:
- `SearchContainer.jsx` - React component (presentation only)
- `SearchContainer.module.scss` - Scoped styles with design system
- `useSearchContainer.js` - State management hook
- `SearchContainerHandler.js` - Event handlers and input logic
