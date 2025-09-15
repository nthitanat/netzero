#!/bin/bash
#npx serve -s web -l 3000
#sudo bash ./deploy.sh
# Deployment script for NetZero React app
# This script builds the React app, renames build folder to web, and moves it to netzero folder

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Navigate to the client directory
cd netzero-client

echo "📦 Building React application..."
 npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed - build directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Navigate back to parent directory
cd ..

# Remove existing web directory if it exists
if [ -d "web" ]; then
    echo "🗑️  Removing existing web directory..."
    rm -rf web
fi

echo "📁 Renaming build folder to web and moving to netzero directory..."

# Move and rename the build folder
mv netzero-client/build web

echo "✅ Deployment completed successfully!"
echo "📍 Web files are now available in: $(pwd)/web"

# Optional: Show directory contents
echo "📋 Web directory contents:"
ls -la web/
