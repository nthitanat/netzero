# NetZero Products and Reservations System Implementation

## Overview
This document outlines the complete implementation of the Products and Product Reservations system for the NetZero project. The system includes full CRUD operations, image management, and reservation handling with proper authorization.

## 🗄️ Database Schema

### Products Table
```sql
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type ENUM('market', 'willing', 'barter') NOT NULL,
    address TEXT NULL,
    coordinate VARCHAR(255) NULL,
    stock_quantity INT DEFAULT 0,
    isRecommend BOOLEAN DEFAULT FALSE,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Product Reservations Table
```sql
CREATE TABLE IF NOT EXISTS product_reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    note TEXT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## 🚀 Server-Side Implementation

### Models
- **Product.js**: Complete model with CRUD operations, search, filtering, and authorization
- **ProductReservation.js**: Reservation management with status updates and stock quantity handling

### Controllers
- **ProductController.js**: RESTful API endpoints for products with image upload/retrieval
- **ProductReservationController.js**: Reservation management with proper authorization

### API Routes

#### Products API (`/api/v1/products`)
```javascript
// Public routes
GET    /                           // Get all products (with filters)
GET    /type/:type                 // Get products by type (market, willing, barter)
GET    /recommended                // Get recommended products
GET    /search/:searchTerm         // Search products
GET    /:id                        // Get product by ID
GET    /:id/thumbnail              // Get product thumbnail
GET    /:id/cover                  // Get product cover image
GET    /:id/images/:imageId        // Get product images

// Protected routes (require authentication)
GET    /my                         // Get current user's products
POST   /                           // Create new product
PUT    /:id                        // Update product (owner/admin only)
DELETE /:id                        // Delete product (owner/admin only)
POST   /:id/upload/thumbnail       // Upload thumbnail (owner/admin only)
POST   /:id/upload/cover           // Upload cover image (owner/admin only)
POST   /:id/upload/images          // Upload product images (owner/admin only)
```

#### Reservations API (`/api/v1/reservations`)
```javascript
// All routes require authentication
GET    /                           // Get reservations (with filters)
GET    /my                         // Get user's reservations (as customer)
GET    /my-products                // Get reservations for user's products (as seller)
GET    /stats                      // Get reservation statistics
GET    /:id                        // Get reservation by ID
POST   /                           // Create new reservation
PUT    /:id                        // Update reservation
DELETE /:id                        // Delete reservation
POST   /:id/confirm                // Confirm reservation (product owner only)
POST   /:id/cancel                 // Cancel reservation
PUT    /:id/status                 // Update reservation status (product owner only)
```

### Image Management
- Uses the same pipeline as events
- Supports thumbnail, cover, and multiple product images
- Automatic file naming: `thumbnail_{productId}.png`, `cover_{productId}.png`, `image_{index}.png`
- File organization: `/files/products/{imageType}/{productId}/`

## 💻 Client-Side Implementation

### API Services
- **products.js**: Complete products API service with caching
- **reservations.js**: Reservations API service with status management utilities

### Updated API Structure
```javascript
import { api } from './api';

// Products
const products = await api.products.getProducts();
const product = await api.products.getProductById(1);
const myProducts = await api.products.getMyProducts();
await api.products.createProduct(productData);
await api.products.updateProduct(id, productData);
await api.products.deleteProduct(id);

// Reservations
const reservations = await api.reservations.getMyReservations();
const productReservations = await api.reservations.getMyProductReservations();
await api.reservations.createReservation(reservationData);
await api.reservations.confirmReservation(reservationId);
await api.reservations.cancelReservation(reservationId);
```

## 🔧 Setup Instructions

### 1. Database Setup
```bash
# Run the SQL scripts in order:
mysql -u your_user -p your_database < netzero-server/sql/create_products_tables.sql
mysql -u your_user -p your_database < netzero-server/sql/insert_sample_products.sql
```

### 2. Server Setup
```bash
cd netzero-server
npm install
npm start
```

### 3. Client Setup
```bash
cd netzero-client
npm install
npm start
```

### 4. Create Image Directories
The following directories are automatically created by the server, but you can also create them manually:
```bash
mkdir -p netzero-server/files/products/thumbnail
mkdir -p netzero-server/files/products/cover
mkdir -p netzero-server/files/products/images
```

## 🔐 Authorization Rules

### Products
- **View**: Public (anyone can view products)
- **Create**: Authenticated users only
- **Update/Delete**: Product owner or admin only
- **Image Upload**: Product owner or admin only

### Reservations
- **View**: User can see their own reservations + reservations for their products
- **Create**: Authenticated users (cannot reserve own products)
- **Update**: Reservation owner or product owner
- **Confirm**: Product owner only
- **Cancel**: Reservation owner or product owner
- **Delete**: Reservation owner, product owner, or admin

## 📱 Product Types

### Market (`type: 'market'`)
- Regular marketplace products for sale
- Pricing in Thai Baht
- Stock quantity management

### Willing (`type: 'willing'`)
- Products owners are willing to trade/exchange
- May accept barter or different forms of payment
- Community sharing focus

### Barter (`type: 'barter'`)
- Direct product-for-product exchanges
- No monetary transactions
- Trade negotiation through reservation notes

## 🔄 Reservation Workflow

1. **Customer creates reservation** (status: `pending`)
   - Specifies quantity and optional note
   - System validates stock availability
   - Cannot reserve own products

2. **Product owner reviews reservation**
   - Can view customer details and notes
   - Can confirm, update status, or cancel

3. **Confirmation process** (status: `confirmed`)
   - Automatically reduces product stock quantity
   - Uses database transactions for consistency
   - Cannot be reversed (would need new reservation)

4. **Cancellation** (status: `cancelled`)
   - Can be done by customer or product owner
   - Only pending reservations can be cancelled
   - No stock quantity changes

## 🎯 Next Steps (Not Yet Implemented)

### Immediate Priority
1. **Update existing product components** (Market, Willing, BarterTrade pages)
   - Replace dummy data with real API calls
   - Update image fetching to use new API endpoints

2. **Create seller dashboard**
   - Product management interface
   - Reservation management for sellers
   - Add/edit/delete products
   - Confirm/cancel reservations

### Future Enhancements
- Push notifications for reservation updates
- Advanced search with filters
- Product reviews and ratings
- Bulk operations for products
- Analytics dashboard for sellers
- Mobile app integration

## 🐛 Testing

### API Testing
You can test the APIs using the server's built-in documentation at:
- `http://localhost:3001/` - API overview with all endpoints
- `http://localhost:3001/health` - Health check

### Sample API Calls
```bash
# Get all products
curl http://localhost:3001/api/v1/products

# Get products by type
curl http://localhost:3001/api/v1/products/type/market

# Get recommended products
curl http://localhost:3001/api/v1/products/recommended

# Search products
curl http://localhost:3001/api/v1/products/search/เสื้อผ้า

# Create reservation (requires auth token)
curl -X POST http://localhost:3001/api/v1/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2, "note": "ต้องการรับที่ตลาด"}'
```

## 📞 Support

For questions or issues:
1. Check the API documentation at `http://localhost:3001/`
2. Review the server logs for detailed error information
3. Ensure database tables are properly created
4. Verify authentication tokens are valid
5. Check file permissions for image upload directories

---

**Note**: This implementation provides a solid foundation for the NetZero products and reservations system. The architecture supports easy extension and modification as requirements evolve.