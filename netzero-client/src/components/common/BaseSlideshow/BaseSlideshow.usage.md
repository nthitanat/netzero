# BaseSlideshow Component Usage Examples

The `BaseSlideshow` component is a reusable slideshow component that provides core navigation and slide changing logic. It can be used for any type of content that needs to be displayed in a carousel/slideshow format.

## Basic Usage

```jsx
import { BaseSlideshow } from '../../components/common';

// Basic slideshow with custom slide rendering
<BaseSlideshow
  items={items}
  renderSlide={renderSlideFunction}
  onSlideClick={handleSlideClick}
/>
```

## Configuration Options

### Core Config Object
```jsx
config={{
  autoPlay: true,              // Enable/disable autoplay
  autoPlayInterval: 3000,      // Autoplay interval in ms
  infinite: true,              // Enable infinite loop
  showControls: true,          // Show navigation controls
  showIndicators: true,        // Show indicator dots
  pauseOnHover: true          // Pause autoplay on hover
}}
```

### Controls Config Object
```jsx
controlsConfig={{
  showNavButtons: true,        // Show previous/next buttons
  showIndicatorDots: true,     // Show indicator dots
  navButtonStyle: "default",   // "default", "minimal", "large"
  indicatorStyle: "default"    // "default", "minimal", "large", "rectangular"
}}
```

## Current Implementations

### 1. ImageSlideshow (Images Only)

```jsx
// Simplified image slideshow using BaseSlideshow
<ImageSlideshow 
  images={imageUrls} 
  alt="Gallery images" 
  className="custom-class"
/>
```

**Features:**
- ✅ Auto-transforms image URLs to slideshow items
- ✅ Minimal navigation controls
- ✅ No infinite loop (better UX for images)
- ✅ Custom image-specific styling

### 2. RecommendedCarousel (Event Cards)

```jsx
// Event carousel with rich content using BaseSlideshow
<RecommendedCarousel 
  events={eventsList} 
  onEventClick={handleEventClick} 
/>
```

**Features:**
- ✅ Rich event card rendering with images, titles, metadata
- ✅ Large navigation controls for better visibility
- ✅ Infinite loop for continuous browsing
- ✅ Custom event-specific styling and interactions

## Custom Implementation Examples

### Product Slideshow
```jsx
const ProductSlideshow = ({ products, onProductClick }) => {
  const renderProductSlide = (product, index) => (
    <div className="product-slide">
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.price}</p>
        <button onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );

  return (
    <BaseSlideshow
      items={products}
      renderSlide={renderProductSlide}
      onSlideClick={(product) => onProductClick(product.id)}
      config={{
        autoPlay: true,
        autoPlayInterval: 5000,
        infinite: true,
        showControls: true,
        showIndicators: true,
        pauseOnHover: true
      }}
      controlsConfig={{
        navButtonStyle: "default",
        indicatorStyle: "rectangular"
      }}
    />
  );
};
```

### Testimonial Slideshow
```jsx
const TestimonialSlideshow = ({ testimonials }) => {
  const renderTestimonialSlide = (testimonial, index) => (
    <div className="testimonial-slide">
      <blockquote>"{testimonial.quote}"</blockquote>
      <cite>- {testimonial.author}, {testimonial.company}</cite>
    </div>
  );

  return (
    <BaseSlideshow
      items={testimonials}
      renderSlide={renderTestimonialSlide}
      config={{
        autoPlay: true,
        autoPlayInterval: 6000,
        infinite: true,
        showControls: false,    // Text-only, minimal controls
        showIndicators: true,
        pauseOnHover: true
      }}
      controlsConfig={{
        showNavButtons: false,
        indicatorStyle: "minimal"
      }}
    />
  );
};
```

## Props Documentation

### Required Props
- `items`: Array of items to display in slides
- `renderSlide`: Function that renders each slide `(item, index) => JSX`

### Optional Props
- `onSlideClick`: Callback when slide is clicked `(item, index) => void`
- `config`: Configuration object for slideshow behavior
- `controlsConfig`: Configuration object for navigation controls
- `className`: Additional CSS class for the slideshow container

### Render Slide Function
```jsx
const renderSlide = (item, index) => {
  // Return JSX for individual slide
  // `item` is the current data item
  // `index` is the slide position
  return (
    <div className="custom-slide">
      {/* Your slide content here */}
    </div>
  );
};
```

## Architecture Benefits

### Common Functionality (BaseSlideshow)
- ✅ Slide navigation logic (prev/next/indicator)
- ✅ Auto-play functionality with pause/resume
- ✅ Infinite loop support
- ✅ Touch/swipe support (future enhancement)
- ✅ Keyboard navigation (future enhancement)
- ✅ Responsive behavior
- ✅ Transition animations
- ✅ Configurable controls and indicators

### Implementation-Specific
- ✅ Custom slide rendering
- ✅ Content-specific styling
- ✅ Domain-specific interactions
- ✅ Custom data transformations
- ✅ Specialized click handlers

## Migration from Old Pattern

### Before (Custom Implementation)
```jsx
// Every slideshow had duplicate logic:
- useSlideshow hook with state management
- SlideshowHandler with navigation logic
- Complex slide track rendering
- Manual indicator/control management
- Duplicate autoplay logic
```

### After (BaseSlideshow Pattern)
```jsx
// Clean separation of concerns:
- BaseSlideshow handles all navigation logic
- Implementation focuses on content rendering
- Configuration-driven behavior
- Consistent UX across all slideshows
- Easy to test and maintain
```
