# Event Image Management API

This documentation covers the new image management features for events, including thumbnail, poster image, and photos.

## Database Changes

The `events` table now includes three new fields:
- `thumbnail` (TEXT) - URL to the event thumbnail image
- `posterImage` (TEXT) - URL to the event poster image  
- `photos` (TEXT) - JSON array of photo URLs

## File Storage Structure

Images are stored in the following directory structure:
```
files/
└── events/
    ├── thumbnail/
    │   └── {eventId}/
    ├── posterImage/
    │   └── {eventId}/
    └── photos/
        └── {eventId}/
```

## API Endpoints

### Upload Images

#### Upload Thumbnail
```
POST /api/v1/events/{id}/upload/thumbnail
Content-Type: multipart/form-data

Form Data:
- thumbnail: [image file]
```

#### Upload Poster Image
```
POST /api/v1/events/{id}/upload/posterImage
Content-Type: multipart/form-data

Form Data:
- posterImage: [image file]
```

#### Upload Photos (Multiple)
```
POST /api/v1/events/{id}/upload/photos
Content-Type: multipart/form-data

Form Data:
- photos: [image file 1]
- photos: [image file 2]
- ... (up to 10 files)
```

### Serve Images

#### Get Any Event Image
```
GET /api/v1/events/images/{path}
```

Examples:
- `GET /api/v1/events/images/events/thumbnail/123/image_1634567890.jpg`
- `GET /api/v1/events/images/events/posterImage/123/poster_1634567890.png`
- `GET /api/v1/events/images/events/photos/123/photo1_1634567890.jpg`

### Delete Images

#### Delete Thumbnail or Poster Image
```
DELETE /api/v1/events/{id}/images/thumbnail
DELETE /api/v1/events/{id}/images/posterImage
```

#### Delete All Photos
```
DELETE /api/v1/events/{id}/images/photos
```

#### Delete Specific Photo
```
DELETE /api/v1/events/{id}/images/photos?photoIndex=0
```

## Response Format

### Upload Success Response
```json
{
  "success": true,
  "message": "thumbnail uploaded successfully",
  "data": {
    "id": 1,
    "title": "Event Title",
    "thumbnail": "http://localhost:3000/api/v1/events/images/events/thumbnail/1/image_1634567890.jpg",
    "posterImage": null,
    "photos": null,
    // ... other event fields
  },
  "uploadedFiles": [
    "http://localhost:3000/api/v1/events/images/events/thumbnail/1/image_1634567890.jpg"
  ],
  "timestamp": "2023-10-18T12:34:56.789Z"
}
```

### Event Response (with images)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Sample Event",
    "description": "Event description",
    "thumbnail": "http://localhost:3000/api/v1/events/images/events/thumbnail/1/thumb_1634567890.jpg",
    "posterImage": "http://localhost:3000/api/v1/events/images/events/posterImage/1/poster_1634567890.png",
    "photos": "[\"http://localhost:3000/api/v1/events/images/events/photos/1/photo1_1634567890.jpg\", \"http://localhost:3000/api/v1/events/images/events/photos/1/photo2_1634567890.jpg\"]",
    // ... other event fields
  }
}
```

## File Restrictions

- **Allowed formats**: JPEG, JPG, PNG, GIF, WebP
- **Maximum file size**: 5MB per file
- **Maximum photos**: 10 files per upload
- **File naming**: Original name + timestamp + extension

## Error Handling

### File Upload Errors
- `400 Bad Request`: Invalid file type, file too large, too many files
- `404 Not Found`: Event not found
- `500 Internal Server Error`: Server-side upload error

### File Serving Errors
- `404 Not Found`: Image file not found
- `500 Internal Server Error`: Server-side serving error

## Usage Examples

### Upload Thumbnail with curl
```bash
curl -X POST \
  http://localhost:3000/api/v1/events/1/upload/thumbnail \
  -H 'Content-Type: multipart/form-data' \
  -F 'thumbnail=@/path/to/image.jpg'
```

### Upload Multiple Photos with curl
```bash
curl -X POST \
  http://localhost:3000/api/v1/events/1/upload/photos \
  -H 'Content-Type: multipart/form-data' \
  -F 'photos=@/path/to/photo1.jpg' \
  -F 'photos=@/path/to/photo2.jpg'
```

### Delete Specific Photo with curl
```bash
curl -X DELETE \
  http://localhost:3000/api/v1/events/1/images/photos?photoIndex=0
```

## JavaScript Frontend Example

```javascript
// Upload thumbnail
const uploadThumbnail = async (eventId, file) => {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const response = await fetch(`/api/v1/events/${eventId}/upload/thumbnail`, {
    method: 'POST',
    body: formData
  });

  return await response.json();
};

// Upload multiple photos
const uploadPhotos = async (eventId, files) => {
  const formData = new FormData();
  for (let file of files) {
    formData.append('photos', file);
  }

  const response = await fetch(`/api/v1/events/${eventId}/upload/photos`, {
    method: 'POST',
    body: formData
  });

  return await response.json();
};
```

## Notes

1. Images are automatically served with proper caching headers (1 year cache)
2. Old images are automatically deleted when uploading new ones (for thumbnail and posterImage)
3. Photos are appended to existing photos array unless specifically deleted
4. File URLs are automatically generated and included in event responses
5. The `photos` field in the database stores a JSON string of the photo URLs array
