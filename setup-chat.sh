#!/bin/bash
# Setup script for NetZero Chat Application

echo "🚀 Setting up NetZero Chat Application..."
echo "=========================================="

# Setup chat server dependencies
echo "📦 Installing chat server dependencies..."
cd netzero-chat-server
npm install
cd ..

echo "✅ Chat server dependencies installed"

echo ""
echo "🗄️  Database Setup"
echo "=================="
echo "Please run the following SQL file to create the chatApps table:"
echo "📁 File: netzero-server/sql/create_chat_apps_table.sql"
echo ""
echo "You can run it using:"
echo "mysql -u netzeroadmin -p netzero < netzero-server/sql/create_chat_apps_table.sql"

echo ""
echo "🚀 Starting Servers"
echo "=================="
echo "To start the chat application, you need to run both servers:"
echo ""
echo "1. Main Server (Terminal 1):"
echo "   cd netzero-server && npm start"
echo ""
echo "2. Chat Server (Terminal 2):"
echo "   cd netzero-chat-server && npm start"
echo ""
echo "3. Client (Terminal 3):"
echo "   cd netzero-client && npm start"
echo ""
echo "🌐 URLs:"
echo "   Main Server: http://127.0.0.1:3001"
echo "   Chat Server: http://127.0.0.1:3004"
echo "   Client: http://127.0.0.1:3000"
echo ""
echo "💬 Chat Features:"
echo "   • Chat Applications Management: http://127.0.0.1:3000/#/chat"
echo "   • API Documentation: http://127.0.0.1:3001/ and http://127.0.0.1:3004/"
echo ""
echo "✅ Setup complete! Happy chatting! 🎉"