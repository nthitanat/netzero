# ItemCard Component Usage Examples

The `ItemCard` component is a reusable card skeleton that provides the basic structure (image slideshow, content container, badges) while allowing specific implementations to define their own content through render props.

## Basic Usage

```jsx
import { ItemCard } from '../../components/common';

// Basic item card with custom content rendering
<ItemCard
  item={item}
  onItemClick={handleItemClick}
  renderContent={(item, state, handlers) => (
    <div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  )}
/>
```

## Architecture Overview

### What ItemCard Provides (Skeleton)
- ✅ **Card Container**: Basic card structure with hover effects
- ✅ **Image Slideshow**: Thumbnail container with slideshow functionality
- ✅ **Badge System**: Positioned badge overlays on images
- ✅ **Content Container**: Structured content area with proper padding
- ✅ **Basic Interactions**: Click handling, hover states

### What Implementations Provide (Content)
- ✅ **Content Rendering**: Custom content layout via `renderContent` prop
- ✅ **Styling**: Component-specific styles for title, description, actions, etc.
- ✅ **Business Logic**: Domain-specific handlers and interactions
- ✅ **Data Formatting**: Custom date formatting, text processing, etc.

## Current Implementation Examples

### 1. EventCard Implementation

```jsx
// EventCard using ItemCard skeleton
export default function EventCard({ event, onEventClick }) {
    // Event-specific logic and formatting
    const formatThaiDate = (dateString) => { /* ... */ };
    
    // Configure badges
    const badges = [
        {
            text: event.category,
            icon: "leaf",
            position: "TopRight",
            style: { backgroundColor: "var(--primary-color-2)", color: "white" }
        }
    ];
    
    // Render event-specific content
    const renderEventContent = (event, state, handlers) => (
        <div className={styles.EventContent}>
            <h3 className={styles.Title}>{event.title}</h3>
            <p className={styles.Description}>{event.description}</p>
            
            <div className={styles.EventDetails}>
                <div className={styles.DetailItem}>
                    <GoogleIcon iconType="calendar_today" size="small" />
                    <span className={styles.DetailText}>
                        {formatThaiDate(event.date)}
                    </span>
                </div>
                <div className={styles.DetailItem}>
                    <GoogleIcon iconType="location_on" size="small" />
                    <span className={styles.DetailText}>{event.location}</span>
                </div>
            </div>
            
            <div className={styles.ActionContainer}>
                <button 
                    className={styles.LearnMoreButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        handlers.handleLearnMore();
                    }}
                >
                    ดูรายละเอียด
                    <span className={styles.ArrowIcon}>→</span>
                </button>
            </div>
        </div>
    );
    
    return (
        <ItemCard
            item={event}
            onItemClick={onEventClick}
            badges={badges}
            renderContent={renderEventContent}
            config={{
                showThumbnail: true,
                thumbnailHeight: 220,
                borderRadius: 24
            }}
        />
    );
}
```

### 2. Custom Implementation Examples

#### Product Card
```jsx
const ProductCard = ({ product, onProductClick, onAddToCart }) => {
    const badges = [];
    
    if (product.discount > 0) {
        badges.push({
            text: `${product.discount}% OFF`,
            position: "TopRight",
            style: { backgroundColor: "var(--secondary-color-1)", color: "white" }
        });
    }
    
    if (product.isNew) {
        badges.push({
            text: "NEW",
            position: "TopLeft",
            style: { backgroundColor: "var(--primary-color-3)", color: "var(--primary-color-1)" }
        });
    }

    const renderProductContent = (product, state, handlers) => (
        <div className={styles.ProductContent}>
            <h3 className={styles.ProductName}>{product.name}</h3>
            <div className={styles.PriceContainer}>
                <span className={styles.CurrentPrice}>฿{product.currentPrice}</span>
                {product.originalPrice && (
                    <span className={styles.OriginalPrice}>฿{product.originalPrice}</span>
                )}
            </div>
            <div className={styles.Rating}>
                <span>{product.rating} ⭐ ({product.reviewCount} reviews)</span>
            </div>
            <div className={styles.ProductActions}>
                <button 
                    className={styles.AddToCartButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                >
                    Add to Cart
                </button>
                <button 
                    className={styles.WishlistButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Handle wishlist
                    }}
                >
                    ♡
                </button>
            </div>
        </div>
    );

    return (
        <ItemCard
            item={product}
            onItemClick={() => onProductClick(product.id)}
            badges={badges}
            renderContent={renderProductContent}
            config={{
                showThumbnail: true,
                thumbnailHeight: 200,
                borderRadius: 16
            }}
        />
    );
};
```

#### Article Card
```jsx
const ArticleCard = ({ article, onArticleClick }) => {
    const badges = [
        {
            text: article.category,
            position: "TopLeft",
            style: { backgroundColor: "var(--primary-color-3)", color: "var(--primary-color-1)" }
        }
    ];

    const renderArticleContent = (article, state, handlers) => (
        <div className={styles.ArticleContent}>
            <h3 className={styles.ArticleTitle}>{article.title}</h3>
            <p className={styles.ArticleExcerpt}>{article.excerpt}</p>
            
            <div className={styles.ArticleMeta}>
                <span className={styles.Author}>By {article.author}</span>
                <span className={styles.ReadTime}>{article.readTime} min read</span>
                <span className={styles.PublishDate}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                </span>
            </div>
            
            <div className={styles.ArticleActions}>
                <button 
                    className={styles.ReadMoreButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        onArticleClick(article.slug);
                    }}
                >
                    Read More →
                </button>
            </div>
        </div>
    );

    return (
        <ItemCard
            item={article}
            onItemClick={() => onArticleClick(article.slug)}
            badges={badges}
            renderContent={renderArticleContent}
            config={{
                showThumbnail: true,
                thumbnailHeight: 160,
                borderRadius: 12
            }}
        />
    );
};
```

## Props Documentation

### ItemCard Props

#### Required Props
- `item`: Object - The data item to display
- `renderContent`: Function - Renders the card content `(item, state, handlers) => JSX`

#### Optional Props
- `onItemClick`: Function - Callback when card is clicked `(itemId, item) => void`
- `badges`: Array - Badge configuration objects
- `config`: Object - Card configuration options
- `className`: String - Additional CSS classes

#### Config Object
```jsx
config={{
  showThumbnail: true,      // Show/hide image slideshow
  thumbnailHeight: 220,     // Height in pixels
  borderRadius: 24         // Border radius in pixels
}}
```

#### Badge Object
```jsx
{
  text: "Badge Text",
  icon: "google-icon-name",   // Optional GoogleIcon
  position: "TopRight",     // "TopRight", "TopLeft", "BottomRight", "BottomLeft"
  style: {                 // Custom styles
    backgroundColor: "var(--primary-color-2)",
    color: "white"
  }
}
```

#### RenderContent Function
```jsx
const renderContent = (item, state, handlers) => {
  // item: The data object
  // state: ItemCard internal state (isHovered, isLoading, etc.)
  // handlers: ItemCard handlers (handleCardClick, etc.)
  
  return (
    <div className={styles.CustomContent}>
      {/* Your custom content here */}
    </div>
  );
};
```

## Benefits of This Architecture

### ✅ Clear Separation of Concerns
- **ItemCard**: Handles card structure, image slideshow, badges, hover effects
- **Implementations**: Focus on content rendering and domain-specific logic

### ✅ Maximum Flexibility
- Custom content layout for each card type
- Domain-specific styling and interactions
- Reusable card shell with unlimited content variations

### ✅ Consistent UX
- All cards have the same hover effects and transitions
- Consistent image slideshow behavior
- Unified badge positioning system

### ✅ Easy Testing
- ItemCard skeleton can be tested independently
- Content rendering can be tested in isolation
- Clear boundaries make mocking easier

### ✅ Maintainable Code
- Changes to card structure happen in one place
- Content-specific changes don't affect the skeleton
- Easy to add new card types without duplicating structure

## Migration Guide

### From Old ItemCard (Config-Based)
```jsx
// OLD: Configuration-driven approach
<ItemCard
  item={item}
  detailItems={[...]}
  actions={[...]}
  config={{ showDescription: true, descriptionLines: 3 }}
/>

// NEW: Render props approach
<ItemCard
  item={item}
  renderContent={(item, state, handlers) => (
    <CustomContent item={item} />
  )}
/>
```

### Creating New Card Types
1. **Create component following 4-file pattern**
2. **Import ItemCard from common**
3. **Define renderContent function**
4. **Add component-specific styling**
5. **Handle domain-specific interactions**

This architecture ensures that ItemCard remains a pure, reusable skeleton while allowing unlimited customization for specific use cases.
