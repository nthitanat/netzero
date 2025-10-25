# Add Product to Event Feature - Implementation Summary

## Overview
This document describes the implementation of the "Add Product to Event" feature in the Seller Dashboard, allowing sellers to assign their products to multiple events with quantity management and validation.

## Feature Requirements
✅ Sellers can add products to multiple events  
✅ Quantity validation ensures assignments don't exceed unassigned stock  
✅ Multi-event selection support  
✅ Real-time stock quantity tracking  
✅ Auto-confirm for owned events, pending for others  
✅ 4-file component architecture (JSX, useHook, Handler, SCSS)  

---

## Backend Implementation

### 1. Database Schema

#### `event_products` Table
```sql
CREATE TABLE event_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  product_id INT NOT NULL,
  event_price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  status ENUM('pending', 'confirmed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_event_product (event_id, product_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_event_products_event_id (event_id),
  INDEX idx_event_products_product_id (product_id),
  INDEX idx_event_products_status (status)
);
```

#### `products` Table Updates
- Added `unassigned_stock_quantity` column to track stock not yet assigned to events

#### `product_reservations` Table Updates
- Added `event_id` column to link reservations with events
- Updated `option_of_delivery` ENUM to include 'event' option

### 2. Backend Files Created/Modified

#### `src/models/EventProduct.js`
- **Purpose**: Model for event-product relationship CRUD operations
- **Key Methods**:
  - `create(eventProductData)` - Create event-product assignment
  - `findById(id)` - Get specific assignment
  - `findByEventAndProduct(eventId, productId)` - Check if exists
  - `getEventsByProductId(productId)` - Get all events for a product
  - `getProductsByEventId(eventId)` - Get all products for an event
  - `update(id, updates)` - Update assignment details
  - `delete(id)` - Remove assignment
  - `updateStatus(id, status)` - Change pending/confirmed status

#### `src/controllers/EventProductController.js`
- **Purpose**: Request handling and business logic
- **Key Features**:
  - Ownership validation (auto-confirm for event owners)
  - Stock quantity validation
  - Batch operations support
- **Endpoints**:
  - `POST /event-products` - Create assignment(s)
  - `GET /event-products` - List all
  - `GET /event-products/:id` - Get specific
  - `GET /events/:eventId/products` - Products by event
  - `GET /products/:productId/events` - Events by product
  - `PUT /event-products/:id` - Update assignment
  - `DELETE /event-products/:id` - Remove assignment
  - `PATCH /event-products/:id/status` - Update status

#### `src/routes/eventProductRoutes.js`
- **Purpose**: API routing with authentication
- **Protected Routes**: All create/update/delete operations
- **Public Routes**: GET operations for browsing

#### `src/middleware/auth.js` - Updates
- **Added**: `checkEventOwnership` middleware
- **Functionality**: Sets `req.userOwnsEvent` flag for controllers to use

---

## Frontend Implementation

### 1. API Service Layer

#### `src/api/eventProducts.js`
```javascript
// Key Methods:
- getAllEventProducts() - Fetch all assignments
- getEventsByProductId(productId) - Get events for product
- getProductsByEventId(eventId) - Get products for event
- addProductToEvents(productId, eventAssignments) - Batch assign product to multiple events
- addProductsToEvent(eventId, productAssignments) - Batch assign multiple products to event
- updateEventProduct(id, updates) - Update assignment
- updateEventProductStatus(id, status) - Update status
- deleteEventProduct(id) - Remove assignment
```

### 2. Component Architecture

#### `AddProductToEventDialog/` (4-file structure)

**AddProductToEventDialog.jsx**
- Stateless UI component
- Displays event selection dropdown
- Shows quantity inputs with validation
- Real-time remaining quantity calculation
- Error and loading states

**useAddProductToEventDialog.js**
- State management hook
- Properties:
  - `events` - Available events list
  - `eventAssignments` - Map of eventId to quantity
  - `isLoading` - Loading state
  - `error` - Error messages
  - `remainingQuantity` - Calculated available stock

**AddProductToEventDialogHandler.js**
- Business logic handlers
- Key Functions:
  - `handleLoadEvents()` - Fetch user's events
  - `handleEventSelect(eventId, selected)` - Toggle event selection
  - `handleQuantityChange(eventId, quantity)` - Update quantity
  - `handleSubmit()` - Submit assignments to API
  - `validateAssignments()` - Validate before submit

**AddProductToEventDialog.module.scss**
- Follows existing design system
- Uses mixins from `main.scss`
- Glassmorphism styling
- Mobile-responsive layout

### 3. Integration with SellerDashboard

#### `useSellerDashboard.js` - State Updates
```javascript
// New state properties:
showAddToEventDialog: false,
productForEvent: null
```

#### `SellerDashboardHandler.js` - New Handlers
```javascript
handleAddProductToEvent(product) {
  // Opens dialog with selected product
}

handleCloseAddToEventDialog() {
  // Closes dialog and clears state
}

handleAddToEventSuccess(assignments) {
  // Refreshes products to show updated stock quantities
  // Shows success message
}
```

#### `SellerDashboard.jsx` - Rendering
```jsx
<AddProductToEventDialog
  isOpen={stateSellerDashboard.showAddToEventDialog}
  product={stateSellerDashboard.productForEvent}
  onClose={handlers.handleCloseAddToEventDialog}
  onSuccess={handlers.handleAddToEventSuccess}
/>
```

### 4. ProductManagementPanel Updates

#### New Props
- `onAddToEvent` - Callback for Add to Event button

#### UI Updates
- Added "Add to Event" button (calendar icon) on product cards
- Button disabled when `unassigned_stock_quantity` is 0
- Shows both total stock and unassigned stock in product meta

#### SCSS Updates
```scss
.AddToEventButton {
  @include bg-color-palette("primary-color-2");
  @include text-color-palette("white");
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

---

## User Workflow

### Seller Journey
1. Navigate to Seller Dashboard → Products tab
2. Click calendar icon on product card (if unassigned stock > 0)
3. Dialog opens showing:
   - Product details
   - List of seller's events (from `user_events` table)
   - Quantity inputs for each event
   - Remaining unassigned quantity
4. Select events and enter quantities
5. Validation ensures total doesn't exceed unassigned stock
6. Click "Add to Events"
7. API creates assignments:
   - Status = 'confirmed' if seller owns the event
   - Status = 'pending' if event owned by others
8. Product list refreshes showing updated stock

### Event Owner Journey
- When event owner adds their own product: instant confirmation
- When another seller adds to event owner's event: requires approval (future enhancement)

---

## Data Flow

### Add Product to Event Flow
```
ProductCard (UI)
  ↓ (click Add to Event button)
SellerDashboardHandler.handleAddProductToEvent(product)
  ↓ (sets state)
AddProductToEventDialog (opens)
  ↓ (loads events)
userEventsService.getMyEvents()
  ↓ (user selects events + quantities)
AddProductToEventDialogHandler.handleSubmit()
  ↓ (validates)
eventProductsService.addProductToEvents(productId, assignments)
  ↓ (API POST request)
EventProductController.create()
  ↓ (checks ownership)
auth.checkEventOwnership middleware
  ↓ (creates assignments)
EventProduct.create()
  ↓ (success callback)
SellerDashboardHandler.handleAddToEventSuccess()
  ↓ (refreshes products)
productsService.getMyProducts()
  ↓ (UI updates)
ProductManagementPanel (shows updated stock)
```

---

## Key Features

### 1. Stock Quantity Management
- **Total Stock**: `products.stock_quantity` - All available stock
- **Unassigned Stock**: `products.unassigned_stock_quantity` - Not assigned to events
- **Event Stock**: `event_products.stock_quantity` - Assigned to specific event

### 2. Multi-Event Assignment
- Batch API call: `POST /event-products` with array of assignments
- Single transaction for all assignments
- Validation ensures sum doesn't exceed available stock

### 3. Ownership-Based Status
```javascript
// In EventProductController.create()
const status = req.userOwnsEvent ? 'confirmed' : 'pending';
```
- Sellers who own the event: auto-confirmed
- Other sellers: pending approval (can be managed in future enhancement)

### 4. Real-time Validation
```javascript
// In useAddProductToEventDialog.js
const totalAssignedQuantity = Object.values(eventAssignments)
  .reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
const remainingQuantity = maxQuantity - totalAssignedQuantity;
```
- Live calculation of remaining stock
- Prevents over-assignment
- Visual feedback in UI

---

## Component Props Interface

### AddProductToEventDialog
```typescript
interface AddProductToEventDialogProps {
  isOpen: boolean;              // Controls dialog visibility
  product: Product | null;      // Product to assign
  onClose: () => void;          // Close handler
  onSuccess: (assignments: EventAssignment[]) => void;  // Success callback
}

interface Product {
  id: number;
  title: string;
  unassigned_stock_quantity: number;
  // ... other fields
}

interface EventAssignment {
  event_id: number;
  event_title: string;
  quantity: number;
  event_price: number;
}
```

---

## File Structure

```
netzero-server/
├── src/
│   ├── models/
│   │   └── EventProduct.js          ✅ NEW
│   ├── controllers/
│   │   └── EventProductController.js ✅ NEW
│   ├── routes/
│   │   └── eventProductRoutes.js    ✅ NEW
│   └── middleware/
│       └── auth.js                  ✅ UPDATED (checkEventOwnership)

netzero-client/
├── src/
│   ├── api/
│   │   ├── eventProducts.js         ✅ NEW
│   │   └── index.js                 ✅ UPDATED (export eventProductsService)
│   ├── components/
│   │   └── dashboard/
│   │       ├── AddProductToEventDialog/
│   │       │   ├── AddProductToEventDialog.jsx              ✅ NEW
│   │       │   ├── useAddProductToEventDialog.js            ✅ NEW
│   │       │   ├── AddProductToEventDialogHandler.js        ✅ NEW
│   │       │   └── AddProductToEventDialog.module.scss      ✅ NEW
│   │       ├── ProductManagementPanel/
│   │       │   ├── ProductManagementPanel.jsx               ✅ UPDATED
│   │       │   └── ProductManagementPanel.module.scss       ✅ UPDATED
│   │       └── index.js             ✅ UPDATED (export AddProductToEventDialog)
│   └── pages/
│       └── SellerDashboard/
│           ├── SellerDashboard.jsx           ✅ UPDATED
│           ├── useSellerDashboard.js         ✅ UPDATED
│           └── SellerDashboardHandler.js     ✅ UPDATED
```

---

## Testing Checklist

### Backend
- [ ] Create event-product assignment (owned event)
- [ ] Create event-product assignment (other's event)
- [ ] Verify status auto-confirmation for owned events
- [ ] Test batch assignment (product to multiple events)
- [ ] Validate stock quantity constraints
- [ ] Test duplicate prevention (UNIQUE constraint)
- [ ] Verify CASCADE delete behavior

### Frontend
- [ ] Dialog opens when clicking Add to Event button
- [ ] Events load from userEventsService
- [ ] Event selection toggles correctly
- [ ] Quantity input updates state
- [ ] Remaining quantity calculates correctly
- [ ] Validation prevents over-assignment
- [ ] Submit sends correct API payload
- [ ] Success callback refreshes products
- [ ] Close handler clears state
- [ ] Button disabled when unassigned_stock_quantity = 0
- [ ] Mobile responsive layout

### Integration
- [ ] Complete flow from button click to product refresh
- [ ] Error handling displays properly
- [ ] Loading states show correctly
- [ ] Stock quantities update after assignment

---

## Future Enhancements

### 1. Event Owner Approval System
- Add approval workflow for pending assignments
- Notification system for event owners
- Approve/Reject UI in Event Dashboard

### 2. Bulk Operations
- Assign multiple products to single event
- Copy assignments from one event to another
- Template-based assignment

### 3. Price Management
- Event-specific pricing overrides
- Discount/markup configuration
- Price history tracking

### 4. Analytics
- Track which products perform best at events
- Event sales reporting
- Stock utilization metrics

### 5. Inventory Sync
- Real-time stock updates during events
- Reserve system for event stock
- Automatic replenishment triggers

---

## API Endpoints Reference

### Event Products

#### Create Assignment(s)
```http
POST /api/event-products
Authorization: Bearer <token>
Content-Type: application/json

// Single assignment
{
  "event_id": 1,
  "product_id": 5,
  "event_price": 120,
  "stock_quantity": 10
}

// Batch assignment
[
  {
    "event_id": 1,
    "product_id": 5,
    "event_price": 120,
    "stock_quantity": 10
  },
  {
    "event_id": 2,
    "product_id": 5,
    "event_price": 130,
    "stock_quantity": 15
  }
]
```

#### Get Events by Product
```http
GET /api/products/:productId/events
```

Response:
```json
[
  {
    "id": 1,
    "event_id": 1,
    "event_title": "Green Market Fair",
    "event_date": "2024-02-15",
    "event_price": 120,
    "stock_quantity": 10,
    "status": "confirmed"
  }
]
```

#### Update Assignment
```http
PUT /api/event-products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_price": 125,
  "stock_quantity": 12
}
```

#### Update Status
```http
PATCH /api/event-products/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

#### Delete Assignment
```http
DELETE /api/event-products/:id
Authorization: Bearer <token>
```

---

## Architecture Compliance

### ✅ 4-File Component Pattern
- **JSX**: Stateless presentational component
- **useHook**: State management with useState/useEffect
- **Handler**: Business logic and event handlers
- **SCSS**: Modular styling with design system mixins

### ✅ API Logic Separation
- All API calls in `src/api/eventProducts.js`
- No axios calls in components
- Centralized error handling

### ✅ State Management
- Page-level state in `useSellerDashboard.js`
- Stateless components receive props
- Handlers in separate files

### ✅ Design System
- SCSS mixins from `main.scss`
- Consistent color palette
- Glassmorphism styling
- Mobile-first responsive design

---

## Conclusion

The "Add Product to Event" feature is now fully implemented with:
- ✅ Complete backend infrastructure (model, controller, routes, middleware)
- ✅ Frontend dialog component following 4-file architecture
- ✅ Integration with Seller Dashboard
- ✅ Stock quantity validation and management
- ✅ Ownership-based auto-confirmation
- ✅ Multi-event batch assignment support
- ✅ Real-time UI feedback and validation

The implementation follows the project's architectural patterns and is ready for testing and deployment.
