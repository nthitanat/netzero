# Event Products API Documentation

## Overview
The Event Products feature allows mapping products to events with event-specific pricing and stock quantities. Event owners can confirm product assignments, while others create pending assignments.

## Database Changes

### 1. New Table: `event_products`
Maps which products are available at which events.

**Columns:**
- `id` - Primary key
- `event_id` - Foreign key to events table
- `product_id` - Foreign key to products table
- `event_price` - Event-specific price for the product
- `stock_quantity` - Stock available at this event
- `status` - Either 'pending' or 'confirmed'
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Business Logic:**
- If user owns the event → status is 'confirmed'
- If user doesn't own the event → status is 'pending'
- Event owners can approve pending assignments

### 2. Updated Table: `products`
**New Column:**
- `unassigned_stock_quantity` - Stock available for assignment to events

### 3. Updated Table: `product_reservations`
**New Columns:**
- `event_id` - Foreign key to events (nullable)
- `option_of_delivery` - Updated enum: 'pickup', 'delivery', 'event'

## API Endpoints

### Base URL
`http://localhost:3001/api/v1/event-products`

---

### 1. Get All Event Products
**GET** `/api/v1/event-products`

**Query Parameters:**
- `event_id` (optional) - Filter by event
- `product_id` (optional) - Filter by product
- `status` (optional) - Filter by status ('pending' or 'confirmed')

**Response:**
```json
{
  "success": true,
  "message": "Event products retrieved successfully",
  "data": [
    {
      "id": 1,
      "event_id": 5,
      "product_id": 10,
      "event_price": 150.00,
      "stock_quantity": 50,
      "status": "confirmed",
      "created_at": "2025-10-25T10:00:00.000Z",
      "updated_at": "2025-10-25T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl -X GET "http://localhost:3001/api/v1/event-products?event_id=5"
```

---

### 2. Get Event Product by ID
**GET** `/api/v1/event-products/:id`

**Response:**
```json
{
  "success": true,
  "message": "Event product retrieved successfully",
  "data": {
    "id": 1,
    "event_id": 5,
    "product_id": 10,
    "event_price": 150.00,
    "stock_quantity": 50,
    "status": "confirmed"
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:3001/api/v1/event-products/1"
```

---

### 3. Get All Events for a Product
**GET** `/api/v1/event-products/product/:productId/events`

**Response:**
```json
{
  "success": true,
  "message": "Events for product retrieved successfully",
  "data": [
    {
      "event_id": 5,
      "event_title": "Community Market Day",
      "event_date": "2025-11-15T09:00:00.000Z",
      "location": "Community Center",
      "status": "upcoming",
      "event_price": 150.00,
      "stock_quantity": 50,
      "event_product_status": "confirmed",
      "event_product_id": 1
    }
  ],
  "count": 1,
  "product": {
    "id": 10,
    "title": "Organic Vegetables"
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:3001/api/v1/event-products/product/10/events"
```

---

### 4. Get All Products for an Event
**GET** `/api/v1/event-products/event/:eventId/products`

**Response:**
```json
{
  "success": true,
  "message": "Products for event retrieved successfully",
  "data": [
    {
      "product_id": 10,
      "product_title": "Organic Vegetables",
      "description": "Fresh organic vegetables",
      "category": "Food",
      "original_price": 200.00,
      "event_price": 150.00,
      "stock_quantity": 50,
      "event_product_status": "confirmed",
      "event_product_id": 1
    }
  ],
  "count": 1,
  "event": {
    "id": 5,
    "title": "Community Market Day"
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:3001/api/v1/event-products/event/5/products"
```

---

### 5. Create Event Product (Protected)
**POST** `/api/v1/event-products`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event_id": 5,
  "product_id": 10,
  "event_price": 150.00,
  "stock_quantity": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event product created successfully with status: confirmed",
  "data": {
    "id": 1,
    "event_id": 5,
    "product_id": 10,
    "event_price": 150.00,
    "stock_quantity": 50,
    "status": "confirmed"
  }
}
```

**Status Logic:**
- If user owns the event → `status: 'confirmed'`
- If user doesn't own the event → `status: 'pending'`

**Example:**
```bash
curl -X POST "http://localhost:3001/api/v1/event-products" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 5,
    "product_id": 10,
    "event_price": 150.00,
    "stock_quantity": 50
  }'
```

---

### 6. Update Event Product (Protected)
**PUT** `/api/v1/event-products/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event_price": 175.00,
  "stock_quantity": 60,
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event product updated successfully",
  "data": {
    "id": 1,
    "event_id": 5,
    "product_id": 10,
    "event_price": 175.00,
    "stock_quantity": 60,
    "status": "confirmed"
  }
}
```

**Authorization:**
- Only event owners can change status to 'confirmed'
- Non-owners can update price and stock but cannot confirm

**Example:**
```bash
curl -X PUT "http://localhost:3001/api/v1/event-products/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_price": 175.00,
    "stock_quantity": 60,
    "status": "confirmed"
  }'
```

---

### 7. Delete Event Product (Protected)
**DELETE** `/api/v1/event-products/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "Event product deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3001/api/v1/event-products/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Middleware

### checkEventOwnership
Automatically applied to CREATE and UPDATE operations.

**Functionality:**
1. Extracts event_id from request (body, params, or existing event product)
2. Checks if authenticated user owns the event via `user_events` table
3. Sets `req.userOwnsEvent` boolean flag
4. Controller uses this flag to determine status and permissions

**Usage in Controller:**
```javascript
const status = userOwnsEvent ? 'confirmed' : 'pending';
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Required fields: event_id, product_id, event_price"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Only event owners can confirm event products"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Event product not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "This product is already assigned to this event"
}
```

---

## Business Workflow

### Scenario 1: Event Owner Adds Product
1. Event owner creates event_product
2. `checkEventOwnership` confirms ownership
3. Status automatically set to 'confirmed'
4. Product immediately available at event

### Scenario 2: Seller Proposes Product
1. Seller (non-owner) creates event_product
2. `checkEventOwnership` confirms non-ownership
3. Status automatically set to 'pending'
4. Event owner reviews and can update status to 'confirmed'

### Scenario 3: Updating Event Product
1. Anyone can update price/stock
2. Only event owners can change status to 'confirmed'
3. Middleware validates ownership before allowing confirmation

---

## Testing

### Test Event Owner Creating Product
```bash
# Login as event owner (community_head role)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoic2VsbGVyMUBuZXR6ZXJvLmNvbSIsInJvbGUiOiJjb21tdW5pdHlfaGVhZCIsImlhdCI6MTc2MTM4MzMxMCwiZXhwIjoxNzYxOTg4MTEwfQ.9JA0YyjHwUSakP6XnvGuV2lsTXQK3BC-Jv6vxDWfeS4"

# Create event product (should be confirmed)
curl -X POST "http://localhost:3001/api/v1/event-products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "product_id": 1,
    "event_price": 150.00,
    "stock_quantity": 50
  }'

# Get events for a product
curl -X GET "http://localhost:3001/api/v1/event-products/product/1/events"

# Get products for an event
curl -X GET "http://localhost:3001/api/v1/event-products/event/1/products"
```

---

## Integration Points

### With Products
- Uses `unassigned_stock_quantity` to track available stock
- When assigning to event, decrement `unassigned_stock_quantity`
- When removing from event, increment `unassigned_stock_quantity`

### With Reservations
- `product_reservations.event_id` links reservation to event
- `product_reservations.option_of_delivery = 'event'` for event pickups

### With Events
- Event owners have full control via `user_events` table
- Event status affects product availability

---

## Next Steps

### Recommended Enhancements
1. Stock Management: Automatically sync stock quantities
2. Approval Workflow: Notifications for pending event products
3. Bulk Operations: Assign multiple products to event at once
4. Event Statistics: Total products, revenue forecasts per event
5. Product Filtering: Show only confirmed products to public
