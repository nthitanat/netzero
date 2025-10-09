# NetZero Chat System

A comprehensive chat application system for NetZero platform that allows users to create and manage AI-powered chat applications related to their products.

## 🏗️ Architecture

### Components

1. **Main Server** (`netzero-server`) - Port 3001
   - Manages chat applications (CRUD operations)
   - User authentication and authorization
   - Product management integration

2. **Chat Server** (`netzero-chat-server`) - Port 3004
   - Handles real-time chat communication
   - AI response generation (placeholder for OpenAI integration)
   - Chat message processing

3. **Client** (`netzero-client`) - Port 3000
   - Chat applications management UI
   - Interactive chat interface modal
   - User-friendly chat experience

## 📊 Database Schema

### `chatApps` Table
```sql
CREATE TABLE chatApps (
  id VARCHAR(36) PRIMARY KEY,           -- Unique chat ID
  owner_id INT NOT NULL,                -- FK to users table
  product_id INT NOT NULL,              -- FK to products table
  title VARCHAR(255) NOT NULL,          -- Chat title
  description TEXT,                     -- Chat description
  status ENUM('active', 'closed', 'archived') DEFAULT 'active',
  isActive BOOLEAN DEFAULT TRUE,        -- Soft delete flag
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 14.0.0
- MySQL database
- Existing NetZero main server and client setup

### Installation

1. **Setup Chat Server Dependencies**
   ```bash
   cd netzero-chat-server
   npm install
   ```

2. **Create Database Table**
   ```bash
   mysql -u netzeroadmin -p netzero < netzero-server/sql/create_chat_apps_table.sql
   ```

3. **Environment Variables**
   
   Ensure your `.env` file contains:
   ```env
   # Database Configuration
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=netzeroadmin
   DB_PASSWORD=your_password
   DB_NAME=netzero
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   
   # Chat Server Port
   CHAT_PORT=3004
   
   # Client Configuration
   REACT_APP_CHAT_SERVER_URL=http://127.0.0.1:3004/api/v1/chat
   ```

### Running the System

1. **Start Main Server** (Terminal 1)
   ```bash
   cd netzero-server
   npm start
   ```

2. **Start Chat Server** (Terminal 2)
   ```bash
   cd netzero-chat-server
   npm start
   ```

3. **Start Client** (Terminal 3)
   ```bash
   cd netzero-client
   npm start
   ```

## 📡 API Endpoints

### Main Server - Chat Applications (`/api/v1/chatapps`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all chat applications | No |
| GET | `/my` | Get user's chat applications | Yes |
| GET | `/:id` | Get chat application by ID | No |
| POST | `/` | Create new chat application | Yes |
| PUT | `/:id` | Update chat application | Yes |
| DELETE | `/:id` | Delete chat application | Yes |
| GET | `/statistics` | Get chat statistics | No |

### Chat Server - Communication (`/api/v1/chat`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| GET | `/:chatid` | Get chat welcome message | Optional |
| POST | `/:chatid/message` | Send message to chat | Yes |
| GET | `/:chatid/history` | Get chat history | Optional |

## 💬 Usage Examples

### Creating a Chat Application

```javascript
import { chatService } from './api/chat';

const newChat = await chatService.createChatApp({
  product_id: 123,
  title: "Discussion about Organic Rice",
  description: "Chat about organic rice varieties and farming methods"
});
```

### Sending a Message

```javascript
const response = await chatService.sendMessage(
  'chat-001', 
  'Hello, I would like to know more about organic rice farming.'
);

console.log(response.data.botResponse);
// Output: AI-generated response about organic rice farming
```

### Getting Chat Applications

```javascript
const myChats = await chatService.getMyChatApps();
console.log(myChats.data.chatApps);
```

## 🎨 UI Components

### Chat Page (`/chat`)
- Displays chat applications in card format
- Search and filter functionality  
- Statistics dashboard
- Create new chat button

### Chat Modal
- Interactive chat interface
- Real-time message display
- Message input with validation
- Auto-scroll to latest messages

## 🔧 Configuration

### Chat Server Settings
- **Port**: 3004 (configurable via `CHAT_PORT`)
- **Rate Limiting**: 100 requests/minute per IP
- **Message Limit**: 1000 characters per message
- **Authentication**: JWT Bearer tokens

### Client Settings
- **Chat Server URL**: Configurable via `REACT_APP_CHAT_SERVER_URL`
- **Auto-refresh**: Chat history updates automatically
- **Modal System**: Responsive design with mobile support

## 🛡️ Security Features

- JWT authentication for sensitive operations
- Rate limiting on chat endpoints
- Input validation and sanitization
- CORS configuration
- SQL injection prevention
- XSS protection

## 🚧 Future Enhancements

### Phase 1 - AI Integration
- [ ] OpenAI API integration
- [ ] Context-aware responses
- [ ] Product-specific knowledge base

### Phase 2 - Real-time Features
- [ ] WebSocket implementation
- [ ] Live typing indicators
- [ ] Push notifications
- [ ] Online user status

### Phase 3 - Advanced Features
- [ ] File sharing in chats
- [ ] Voice messages
- [ ] Chat analytics
- [ ] Multi-language support

## 📝 Sample Data

The system includes sample chat applications:

```sql
INSERT INTO chatApps VALUES
('chat-001', 1, 1, 'Chat about Organic Rice', 'Discussion about organic rice varieties'),
('chat-002', 1, 2, 'Tree Planting Discussion', 'Planning for community tree planting'),
('chat-003', 2, 3, 'Local Vegetables Exchange', 'Exchange information about vegetables');
```

## 🐛 Troubleshooting

### Common Issues

1. **Chat Server Connection Failed**
   - Check if chat server is running on port 3004
   - Verify `REACT_APP_CHAT_SERVER_URL` configuration

2. **Authentication Errors**
   - Ensure JWT_SECRET is consistent across servers
   - Check if user is logged in before accessing protected routes

3. **Database Connection Issues**
   - Verify database credentials in `.env`
   - Ensure `chatApps` table exists

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development npm start
```

## 🤝 Contributing

1. Follow existing code patterns and conventions
2. Add proper error handling and validation
3. Include JSDoc comments for functions
4. Test thoroughly before submitting

## 📄 License

This project is part of the NetZero platform and follows the same licensing terms.