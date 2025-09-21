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

# Navigate back to project root directory
cd ../../

# Remove existing web directory if it exists
if [ -d "netzero" ]; then
    echo "🗑️  Removing existing web directory..."
    rm -rf netzero
fi

echo "📁 Renaming build folder to web..."

# Move and rename the build folder
mv netzero-deploy/netzero-client/build netzero

echo "✅ Deployment completed successfully!"
echo "📍 Web files are now available in: $(pwd)/netzero"

# Optional: Show directory contents
echo "📋 Web directory contents:"
ls -la netzero/
