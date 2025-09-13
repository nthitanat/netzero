# NetZero API Server

A RESTful API server built with Node.js, Express, and MySQL using MVC architecture pattern.

## Features

- ✅ **MVC Architecture** - Clean separation of concerns
- ✅ **RESTful API** - Standard HTTP methods and status codes
- ✅ **MySQL Database** - Robust data persistence
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Error Handling** - Centralized error management
- ✅ **Security** - Helmet, CORS, rate limiting
- ✅ **Logging** - Request/response logging
- ✅ **Environment Config** - Flexible configuration
- ✅ **Health Checks** - Server and database monitoring

## Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   # Copy and modify environment variables
   cp .env.example .env
   ```

3. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Base URL
```
http://127.0.0.1:3000/api/v1
```

### Events API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | Get all events with optional filtering |
| GET | `/events/:id` | Get specific event by ID |
| GET | `/events/category/:category` | Get events by category |
| GET | `/events/upcoming` | Get upcoming events |
| GET | `/events/search?q=term` | Search events |
| GET | `/events/statistics` | Get event statistics |
| POST | `/events` | Create new event |
| PUT | `/events/:id` | Update event |
| PATCH | `/events/:id/soft-delete` | Soft delete event |
| PATCH | `/events/:id/participants` | Update participant count |
| DELETE | `/events/:id` | Delete event permanently |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/db-test` | Database connection test |
| GET | `/` | API information |

## Request Examples

### Create Event
```bash
curl -X POST http://127.0.0.1:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "NetZero Workshop 2025",
    "description": "Learn about sustainable practices and carbon neutrality",
    "event_date": "2025-10-15T14:00:00.000Z",
    "location": "Bangkok, Thailand",
    "category": "workshop",
    "organizer": "NetZero Team",
    "contact_email": "events@netzero.com",
    "contact_phone": "+66123456789",
    "max_participants": 50,
    "registration_deadline": "2025-10-10T23:59:59.000Z"
  }'
```

### Get All Events
```bash
curl http://127.0.0.1:3000/api/v1/events
```

### Search Events
```bash
curl "http://127.0.0.1:3000/api/v1/events/search?q=workshop&category=workshop&limit=10"
```

### Filter Events
```bash
curl "http://127.0.0.1:3000/api/v1/events?category=workshop&location=Bangkok&limit=5"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "count": 10,
  "timestamp": "2025-09-12T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-09-12T10:30:00.000Z"
}
```

## Validation Rules

### Event Creation
- **title**: Required, 3-255 characters
- **description**: Required, 10-2000 characters
- **event_date**: Required, future date
- **location**: Required, 3-255 characters
- **category**: Required, valid category (workshop, seminar, conference, networking, training, webinar, other)
- **organizer**: Required, 2-255 characters
- **contact_email**: Required, valid email
- **contact_phone**: Optional, valid phone number
- **max_participants**: Required, 1-10000
- **registration_deadline**: Required, future date before event date

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=netzeroadmin
DB_PASSWORD=your_password
DB_NAME=netzero

# Security
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# API Configuration
API_VERSION=v1
API_PREFIX=/api

# CORS Configuration
CORS_ORIGIN=http://localhost:3001,http://127.0.0.1:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Project Structure

```
netzero-server/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── README.md                 # This file
└── src/
    ├── config/
    │   └── database.js       # Database configuration
    ├── controllers/
    │   └── EventController.js # Event business logic
    ├── models/
    │   └── Event.js          # Event data model
    ├── routes/
    │   └── eventRoutes.js    # Event API routes
    ├── middleware/
    │   ├── index.js          # Common middleware
    │   ├── errorHandler.js   # Error handling
    │   ├── rateLimiter.js    # Rate limiting
    │   └── validation.js     # Input validation
    └── utils/                # Utility functions
```

## Database Schema

The server expects an `events` table with the following structure:

```sql
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_date DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  category ENUM('workshop', 'seminar', 'conference', 'networking', 'training', 'webinar', 'other') NOT NULL,
  organizer VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  max_participants INT NOT NULL,
  current_participants INT DEFAULT 0,
  registration_deadline DATETIME NOT NULL,
  status ENUM('active', 'inactive', 'cancelled', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Request validation
- **Error Handling**: Secure error responses
- **Environment Variables**: Sensitive data protection

## Error Handling

The server includes comprehensive error handling:

- **Validation Errors**: 400 Bad Request
- **Not Found**: 404 Not Found
- **Database Errors**: 500 Internal Server Error
- **Rate Limiting**: 429 Too Many Requests

## Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Testing

Test the API endpoints:

```bash
# Health check
curl http://127.0.0.1:3000/health

# Database test
curl http://127.0.0.1:3000/db-test

# API info
curl http://127.0.0.1:3000/

# Get events
curl http://127.0.0.1:3000/api/v1/events
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure proper CORS origins
5. Set up reverse proxy (nginx)
6. Enable HTTPS
7. Configure monitoring

## Contributing

1. Follow MVC pattern
2. Add proper validation
3. Include error handling
4. Write tests
5. Update documentation

## License

MIT License
