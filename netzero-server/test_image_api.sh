#!/bin/bash

# Test script for Event Image API
# Make sure your server is running before executing this script

SERVER_URL="http://localhost:3000"
EVENT_ID="1"

echo "=== Event Image API Test Script ==="
echo "Server URL: $SERVER_URL"
echo "Testing with Event ID: $EVENT_ID"
echo ""

# Test 1: Get event (should show null images initially)
echo "1. Getting event details..."
curl -s -X GET "$SERVER_URL/api/v1/events/$EVENT_ID" | jq '.'
echo ""

# Test 2: Create a test image file
echo "2. Creating test image files..."
# Create a simple test image (1x1 pixel PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA6xSQUwAAAABJRU5ErkJggg==" | base64 -d > test_thumbnail.png
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA6xSQUwAAAABJRU5ErkJggg==" | base64 -d > test_poster.png
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA6xSQUwAAAABJRU5ErkJggg==" | base64 -d > test_photo1.png
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA6xSQUwAAAABJRU5ErkJggg==" | base64 -d > test_photo2.png
echo "Test image files created."
echo ""

# Test 3: Upload thumbnail
echo "3. Uploading thumbnail..."
curl -s -X POST "$SERVER_URL/api/v1/events/$EVENT_ID/upload/thumbnail" \
  -F "thumbnail=@test_thumbnail.png" | jq '.'
echo ""

# Test 4: Upload poster image
echo "4. Uploading poster image..."
curl -s -X POST "$SERVER_URL/api/v1/events/$EVENT_ID/upload/posterImage" \
  -F "posterImage=@test_poster.png" | jq '.'
echo ""

# Test 5: Upload photos
echo "5. Uploading photos..."
curl -s -X POST "$SERVER_URL/api/v1/events/$EVENT_ID/upload/photos" \
  -F "photos=@test_photo1.png" \
  -F "photos=@test_photo2.png" | jq '.'
echo ""

# Test 6: Get event again (should show uploaded images)
echo "6. Getting event details after uploads..."
curl -s -X GET "$SERVER_URL/api/v1/events/$EVENT_ID" | jq '.'
echo ""

# Test 7: Test image serving (just check if endpoint responds)
echo "7. Testing image serving..."
# Extract image URL from event and test it
IMAGE_URL=$(curl -s -X GET "$SERVER_URL/api/v1/events/$EVENT_ID" | jq -r '.data.thumbnail')
if [ "$IMAGE_URL" != "null" ] && [ "$IMAGE_URL" != "" ]; then
    echo "Testing thumbnail URL: $IMAGE_URL"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL")
    echo "HTTP Status: $HTTP_STATUS"
fi
echo ""

# Test 8: Delete specific photo
echo "8. Deleting first photo..."
curl -s -X DELETE "$SERVER_URL/api/v1/events/$EVENT_ID/images/photos?photoIndex=0" | jq '.'
echo ""

# Test 9: Delete thumbnail
echo "9. Deleting thumbnail..."
curl -s -X DELETE "$SERVER_URL/api/v1/events/$EVENT_ID/images/thumbnail" | jq '.'
echo ""

# Test 10: Get event final state
echo "10. Final event state..."
curl -s -X GET "$SERVER_URL/api/v1/events/$EVENT_ID" | jq '.'
echo ""

# Cleanup
echo "Cleaning up test files..."
rm -f test_thumbnail.png test_poster.png test_photo1.png test_photo2.png

echo "=== Test completed ==="
echo ""
echo "Expected behavior:"
echo "- Steps 3-5: Should successfully upload images and return URLs"
echo "- Step 6: Should show uploaded image URLs in event data"
echo "- Step 7: Should return HTTP 200 for image serving"
echo "- Step 8: Should remove one photo from the array"
echo "- Step 9: Should remove thumbnail (set to null)"
echo "- Step 10: Should show updated state without thumbnail and with one photo removed"
