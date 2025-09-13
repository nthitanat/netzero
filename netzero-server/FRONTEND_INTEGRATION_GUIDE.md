# Frontend Integration Guide - Event API

This guide provides complete instructions for frontend developers to integrate with the Event API, including image upload and management functionality.

## Table of Contents
1. [API Base Configuration](#api-base-configuration)
2. [Event CRUD Operations](#event-crud-operations)
3. [Image Upload & Management](#image-upload--management)
4. [JavaScript/TypeScript Examples](#javascripttypescript-examples)
5. [React.js Integration](#reactjs-integration)
6. [Vue.js Integration](#vuejs-integration)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## API Base Configuration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
// For production, replace with your domain
// const API_BASE_URL = 'https://yourdomain.com/api/v1';
```

### Common Headers
```javascript
const defaultHeaders = {
  'Content-Type': 'application/json',
  // Add authentication headers if needed
  // 'Authorization': `Bearer ${token}`
};
```

## Event CRUD Operations

### 1. Get All Events
```javascript
// GET /api/v1/events
const getEvents = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Available filters
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.location) queryParams.append('location', filters.location);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.offset) queryParams.append('offset', filters.offset);
  
  const response = await fetch(`${API_BASE_URL}/events?${queryParams}`, {
    method: 'GET',
    headers: defaultHeaders
  });
  
  return await response.json();
};

// Usage example
const events = await getEvents({
  category: 'Technology',
  status: 'active',
  limit: 10
});
```

### 2. Get Single Event
```javascript
// GET /api/v1/events/:id
const getEvent = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'GET',
    headers: defaultHeaders
  });
  
  return await response.json();
};

// Usage
const event = await getEvent(1);
```

### 3. Create Event
```javascript
// POST /api/v1/events
const createEvent = async (eventData) => {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(eventData)
  });
  
  return await response.json();
};

// Usage
const newEvent = await createEvent({
  title: 'Tech Conference 2025',
  description: 'Annual technology conference',
  event_date: '2025-12-01T10:00:00',
  location: 'Convention Center',
  category: 'Technology',
  organizer: 'Tech Corp',
  contact_email: 'contact@techcorp.com',
  contact_phone: '+1234567890',
  max_participants: 500,
  registration_deadline: '2025-11-25T23:59:59'
});
```

### 4. Update Event
```javascript
// PUT /api/v1/events/:id
const updateEvent = async (eventId, updateData) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'PUT',
    headers: defaultHeaders,
    body: JSON.stringify(updateData)
  });
  
  return await response.json();
};

// Usage
const updatedEvent = await updateEvent(1, {
  title: 'Updated Event Title',
  max_participants: 600
});
```

### 5. Delete Event
```javascript
// DELETE /api/v1/events/:id
const deleteEvent = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  
  return await response.json();
};

// Soft delete (set status to inactive)
// PATCH /api/v1/events/:id/soft-delete
const softDeleteEvent = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/soft-delete`, {
    method: 'PATCH',
    headers: defaultHeaders
  });
  
  return await response.json();
};
```

## Image Upload & Management

### 1. Upload Thumbnail
```javascript
// POST /api/v1/events/:id/upload/thumbnail
const uploadThumbnail = async (eventId, imageFile) => {
  const formData = new FormData();
  formData.append('thumbnail', imageFile);
  
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/upload/thumbnail`, {
    method: 'POST',
    body: formData // Don't set Content-Type header for FormData
  });
  
  return await response.json();
};

// Usage
const fileInput = document.getElementById('thumbnail-input');
const file = fileInput.files[0];
const result = await uploadThumbnail(1, file);
```

### 2. Upload Poster Image
```javascript
// POST /api/v1/events/:id/upload/posterImage
const uploadPoster = async (eventId, imageFile) => {
  const formData = new FormData();
  formData.append('posterImage', imageFile);
  
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/upload/posterImage`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};
```

### 3. Upload Multiple Photos
```javascript
// POST /api/v1/events/:id/upload/photos
const uploadPhotos = async (eventId, imageFiles) => {
  const formData = new FormData();
  
  // Add multiple files
  Array.from(imageFiles).forEach(file => {
    formData.append('photos', file);
  });
  
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/upload/photos`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Usage with multiple files
const fileInput = document.getElementById('photos-input');
const files = fileInput.files;
const result = await uploadPhotos(1, files);
```

### 4. Delete Images
```javascript
// Delete thumbnail or poster
const deleteImage = async (eventId, imageType) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/images/${imageType}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  
  return await response.json();
};

// Delete specific photo
const deletePhoto = async (eventId, photoIndex) => {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/images/photos?photoIndex=${photoIndex}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  
  return await response.json();
};

// Usage
await deleteImage(1, 'thumbnail');
await deletePhoto(1, 0); // Delete first photo
```

## JavaScript/TypeScript Examples

### TypeScript Interfaces
```typescript
interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  category: string;
  organizer: string;
  contact_email: string;
  contact_phone?: string;
  max_participants: number;
  current_participants: number;
  registration_deadline: string;
  status: 'active' | 'inactive' | 'cancelled' | 'completed';
  thumbnail?: string;
  posterImage?: string;
  photos?: string; // JSON string of photo URLs
  created_at: string;
  updated_at: string;
  is_full: boolean;
  registration_open: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  timestamp: string;
}

interface EventFilters {
  category?: string;
  status?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
```

### Event API Service Class
```typescript
class EventApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:3000/api/v1') {
    this.baseUrl = baseUrl;
  }
  
  async getEvents(filters?: EventFilters): Promise<ApiResponse<Event[]>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${this.baseUrl}/events?${queryParams}`);
    return await response.json();
  }
  
  async getEvent(id: number): Promise<ApiResponse<Event>> {
    const response = await fetch(`${this.baseUrl}/events/${id}`);
    return await response.json();
  }
  
  async createEvent(eventData: Partial<Event>): Promise<ApiResponse<Event>> {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    return await response.json();
  }
  
  async uploadThumbnail(eventId: number, file: File): Promise<ApiResponse<Event>> {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const response = await fetch(`${this.baseUrl}/events/${eventId}/upload/thumbnail`, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  }
  
  // Helper method to parse photos JSON
  getEventPhotos(event: Event): string[] {
    if (!event.photos) return [];
    try {
      return JSON.parse(event.photos);
    } catch {
      return [];
    }
  }
}

// Usage
const eventApi = new EventApiService();
const events = await eventApi.getEvents({ category: 'Technology' });
```

## React.js Integration

### Event List Component
```jsx
import React, { useState, useEffect } from 'react';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    fetchEvents();
  }, [filters]);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents(filters);
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="event-list">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

const EventCard = ({ event }) => {
  const photos = event.photos ? JSON.parse(event.photos) : [];
  
  return (
    <div className="event-card">
      {event.thumbnail && (
        <img 
          src={event.thumbnail} 
          alt={event.title}
          className="event-thumbnail"
        />
      )}
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>📅 {new Date(event.event_date).toLocaleDateString()}</p>
      <p>📍 {event.location}</p>
      <p>👥 {event.current_participants}/{event.max_participants}</p>
      
      {photos.length > 0 && (
        <div className="event-photos">
          {photos.slice(0, 3).map((photo, index) => (
            <img 
              key={index}
              src={photo}
              alt={`${event.title} photo ${index + 1}`}
              className="event-photo-thumbnail"
            />
          ))}
          {photos.length > 3 && <span>+{photos.length - 3} more</span>}
        </div>
      )}
    </div>
  );
};
```

### Image Upload Component
```jsx
import React, { useState } from 'react';

const EventImageUpload = ({ eventId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleThumbnailUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const result = await uploadThumbnail(eventId, file);
      if (result.success) {
        onUploadSuccess(result.data);
        alert('Thumbnail uploaded successfully!');
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (error) {
      alert('Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };
  
  const handlePhotosUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      const result = await uploadPhotos(eventId, files);
      if (result.success) {
        onUploadSuccess(result.data);
        alert(`${files.length} photos uploaded successfully!`);
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (error) {
      alert('Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="image-upload">
      <div className="upload-section">
        <label htmlFor="thumbnail-upload">Upload Thumbnail:</label>
        <input
          id="thumbnail-upload"
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
          disabled={uploading}
        />
      </div>
      
      <div className="upload-section">
        <label htmlFor="photos-upload">Upload Photos:</label>
        <input
          id="photos-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotosUpload}
          disabled={uploading}
        />
      </div>
      
      {uploading && <div className="uploading">Uploading...</div>}
    </div>
  );
};
```

## Vue.js Integration

### Event List Component (Vue 3)
```vue
<template>
  <div class="event-list">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <EventCard 
        v-for="event in events" 
        :key="event.id" 
        :event="event"
        @update="fetchEvents"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import EventCard from './EventCard.vue';

export default {
  name: 'EventList',
  components: { EventCard },
  setup() {
    const events = ref([]);
    const loading = ref(true);
    const filters = reactive({});
    
    const fetchEvents = async () => {
      try {
        loading.value = true;
        const response = await getEvents(filters);
        if (response.success) {
          events.value = response.data;
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(fetchEvents);
    
    return {
      events,
      loading,
      fetchEvents
    };
  }
};
</script>
```

### Image Upload Component (Vue 3)
```vue
<template>
  <div class="image-upload">
    <div class="upload-section">
      <label>Upload Thumbnail:</label>
      <input
        ref="thumbnailInput"
        type="file"
        accept="image/*"
        @change="handleThumbnailUpload"
        :disabled="uploading"
      />
    </div>
    
    <div class="upload-section">
      <label>Upload Photos:</label>
      <input
        ref="photosInput"
        type="file"
        accept="image/*"
        multiple
        @change="handlePhotosUpload"
        :disabled="uploading"
      />
    </div>
    
    <div v-if="uploading" class="uploading">Uploading...</div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'EventImageUpload',
  props: {
    eventId: {
      type: Number,
      required: true
    }
  },
  emits: ['upload-success'],
  setup(props, { emit }) {
    const uploading = ref(false);
    const thumbnailInput = ref(null);
    const photosInput = ref(null);
    
    const handleThumbnailUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        uploading.value = true;
        const result = await uploadThumbnail(props.eventId, file);
        if (result.success) {
          emit('upload-success', result.data);
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        uploading.value = false;
      }
    };
    
    const handlePhotosUpload = async (event) => {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      
      try {
        uploading.value = true;
        const result = await uploadPhotos(props.eventId, files);
        if (result.success) {
          emit('upload-success', result.data);
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        uploading.value = false;
      }
    };
    
    return {
      uploading,
      thumbnailInput,
      photosInput,
      handleThumbnailUpload,
      handlePhotosUpload
    };
  }
};
</script>
```

## Error Handling

### Global Error Handler
```javascript
class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.status = status;
    this.response = response;
  }
}

const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'API request failed',
      response.status,
      data
    );
  }
  
  return data;
};

// Usage in API calls
const getEventsWithErrorHandling = async (filters = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events?${new URLSearchParams(filters)}`);
    return await handleApiResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API errors
      console.error('API Error:', error.message);
      if (error.status === 401) {
        // Handle authentication error
        redirectToLogin();
      }
    } else {
      // Handle network errors
      console.error('Network Error:', error.message);
    }
    throw error;
  }
};
```

### Form Validation
```javascript
const validateEventData = (eventData) => {
  const errors = {};
  
  if (!eventData.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!eventData.event_date) {
    errors.event_date = 'Event date is required';
  } else if (new Date(eventData.event_date) <= new Date()) {
    errors.event_date = 'Event date must be in the future';
  }
  
  if (!eventData.location?.trim()) {
    errors.location = 'Location is required';
  }
  
  if (!eventData.contact_email?.trim()) {
    errors.contact_email = 'Contact email is required';
  } else if (!/\S+@\S+\.\S+/.test(eventData.contact_email)) {
    errors.contact_email = 'Invalid email format';
  }
  
  if (eventData.max_participants && eventData.max_participants <= 0) {
    errors.max_participants = 'Max participants must be greater than 0';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};
```

### Image Upload Validation
```javascript
const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
  }
  
  return true;
};

const uploadWithValidation = async (eventId, file, uploadFunction) => {
  try {
    validateImageFile(file);
    return await uploadFunction(eventId, file);
  } catch (error) {
    alert(error.message);
    throw error;
  }
};
```

## Best Practices

### 1. Image Optimization
```javascript
// Compress image before upload
const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Usage
const optimizedFile = await compressImage(originalFile);
await uploadThumbnail(eventId, optimizedFile);
```

### 2. Caching Strategy
```javascript
// Simple cache implementation
class EventCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear() {
    this.cache.clear();
  }
}

const eventCache = new EventCache();

const getCachedEvent = async (eventId) => {
  const cacheKey = `event:${eventId}`;
  let event = eventCache.get(cacheKey);
  
  if (!event) {
    const response = await getEvent(eventId);
    if (response.success) {
      event = response.data;
      eventCache.set(cacheKey, event);
    }
  }
  
  return event;
};
```

### 3. Progress Tracking for Large Uploads
```javascript
const uploadWithProgress = (eventId, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    xhr.open('POST', `${API_BASE_URL}/events/${eventId}/upload/thumbnail`);
    xhr.send(formData);
  });
};

// Usage
await uploadWithProgress(eventId, file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
  updateProgressBar(progress);
});
```

### 4. Lazy Loading for Images
```javascript
// Intersection Observer for lazy loading
const createLazyImageLoader = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  
  return {
    observe: (img) => imageObserver.observe(img),
    disconnect: () => imageObserver.disconnect()
  };
};

// Usage in React
const LazyImage = ({ src, alt, className }) => {
  const imgRef = useRef();
  const [loader] = useState(() => createLazyImageLoader());
  
  useEffect(() => {
    if (imgRef.current) {
      loader.observe(imgRef.current);
    }
    
    return () => loader.disconnect();
  }, [loader]);
  
  return (
    <img
      ref={imgRef}
      data-src={src}
      alt={alt}
      className={`lazy ${className}`}
      style={{ backgroundColor: '#f0f0f0' }}
    />
  );
};
```

This comprehensive guide provides frontend developers with everything they need to integrate with your Event API, including all the new image functionality. The examples cover multiple frameworks and include best practices for production use.
