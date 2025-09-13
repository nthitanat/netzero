# ReserveDialog Component

A React component for handling product reservations with quantity selection in the Netzero marketplace.

## Features

- **Quantity Selection**: Users can select the quantity they want to reserve
- **Stock Validation**: Prevents reserving more than available quantity
- **Price Calculation**: Shows total price based on selected quantity
- **API Integration**: Uses axios instance to create transactions and update product quantities
- **Error Handling**: Displays appropriate error messages for various scenarios
- **Theme Support**: Supports market, barter, and willing themes

## Usage

### Basic Example

```jsx
import React, { useState } from 'react';
import { ReserveDialog } from '../../components/market';

function ProductPage() {
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleReservationSuccess = (reservationData) => {
    const { transaction, updatedProduct, reservedQuantity } = reservationData;
    
    console.log('Reservation successful:', {
      productId: transaction.productId,
      quantity: reservedQuantity,
      totalPrice: transaction.totalPrice
    });
    
    // Handle successful reservation
    alert(`Reserved ${reservedQuantity} items successfully!`);
    setShowReserveDialog(false);
  };

  return (
    <div>
      <button onClick={() => setShowReserveDialog(true)}>
        Reserve Product
      </button>
      
      <ReserveDialog
        product={selectedProduct}
        isOpen={showReserveDialog}
        onClose={() => setShowReserveDialog(false)}
        onReservationSuccess={handleReservationSuccess}
        theme="market"
      />
    </div>
  );
}
```

### Integration with ProductModal

The ReserveDialog is automatically integrated with the ProductModal component:

```jsx
import { ProductModal } from '../../components/market';

<ProductModal
  product={product}
  isOpen={showModal}
  onClose={handleCloseModal}
  onReservationSuccess={handleReservationSuccess}
  theme="market"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `product` | Object | - | **Required.** Product object containing id, title, price, quantity, etc. |
| `isOpen` | Boolean | `false` | Controls dialog visibility |
| `onClose` | Function | - | Callback when dialog is closed |
| `onReservationSuccess` | Function | - | Callback when reservation is successful |
| `theme` | String | `"market"` | Theme variant: "market", "barter", or "willing" |
| `className` | String | `""` | Additional CSS classes |

## Product Object Structure

The product object should contain the following properties:

```javascript
{
  id: 1,
  title: "Product Name",
  price: 850,
  quantity: 8,           // Available quantity
  inStock: true,
  images: ["/path/to/image.jpg"],
  thumbnail: "/path/to/thumbnail.jpg",
  origin: "Bangkok",
  category: "Electronics"
}
```

## API Endpoints

The component makes the following API calls:

### Create Transaction
```
POST /api/product-transactions
{
  productId: number,
  productTitle: string,
  quantity: number,
  unitPrice: number,
  totalPrice: number,
  userId: number,
  status: "reserved",
  timestamp: string,
  productOrigin: string,
  productCategory: string
}
```

### Update Product Quantity
```
PUT /api/products/:id
{
  ...productData,
  quantity: updatedQuantity,
  inStock: quantity > 0
}
```

## Callbacks

### onReservationSuccess

Called when a reservation is successfully created:

```javascript
const handleReservationSuccess = (reservationData) => {
  const { transaction, updatedProduct, reservedQuantity } = reservationData;
  
  // transaction: The created transaction object
  // updatedProduct: Product with updated quantity
  // reservedQuantity: Number of items reserved
};
```

## Error Handling

The component handles various error scenarios:

- **Invalid Quantity**: Shows error for quantities <= 0 or > available stock
- **API Errors**: Displays appropriate messages for different HTTP status codes
- **Network Issues**: Shows generic error message for connection problems

## Styling

The component uses SCSS modules with theme-specific styling:

```scss
// Market theme (green)
.Container.market-theme {
  @include market-glassmorphism-card;
}

// Barter theme
.Container.barter-theme {
  @include glassmorphism-card;
}

// Willing theme (blue)
.Container.willing-theme {
  @include willing-glassmorphism-card;
}
```

## Dependencies

- React 17+
- Axios (via apiClient)
- GoogleIcon component
- SCSS with theme mixins

## Development Notes

- Uses dummy API endpoints (not yet implemented on server)
- Simulates realistic API delays for better UX
- Includes loading states and error handling
- Responsive design for mobile devices
- Keyboard navigation support (ESC to close)
