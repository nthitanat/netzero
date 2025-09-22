import { eventsService } from '../api/events.js';

/**
 * Event image utilities for working with API image endpoints
 */

// Production base URL for static assets
const PRODUCTION_BASE_URL = "https://engagement.chula.ac.th/netzero";

/**
 * Get the appropriate static image URL based on the current environment
 * @param {string} imagePath - The relative image path (e.g., "/assets/images/landing/landing.png")
 * @returns {string} - The complete image URL
 */
export const getStaticImageUrl = (imagePath) => {
  // Ensure imagePath starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // In development or if NODE_ENV is not set, use original path
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    return normalizedPath;
  }
  
  // In production, prepend the production base URL
  return `${PRODUCTION_BASE_URL}${normalizedPath}`;
};

/**
 * Process an array of static image paths
 * @param {string[]} imagePaths - Array of image paths
 * @returns {string[]} - Array of processed image URLs
 */
export const getStaticImageUrls = (imagePaths) => {
  return imagePaths.map(path => getStaticImageUrl(path));
};

/**
 * Process an object containing static image properties
 * @param {Object} obj - Object that may contain image properties
 * @param {string[]} imageFields - Array of field names that contain image paths
 * @returns {Object} - Object with processed image URLs
 */
export const processStaticImageObject = (obj, imageFields = ['image', 'images', 'thumbnail', 'posterImage']) => {
  const processed = { ...obj };
  
  imageFields.forEach(field => {
    if (processed[field]) {
      if (Array.isArray(processed[field])) {
        processed[field] = getStaticImageUrls(processed[field]);
      } else {
        processed[field] = getStaticImageUrl(processed[field]);
      }
    }
  });
  
  return processed;
};

/**
 * Process an array of objects containing static image properties
 * @param {Object[]} objects - Array of objects that may contain image properties
 * @param {string[]} imageFields - Array of field names that contain image paths
 * @returns {Object[]} - Array of objects with processed image URLs
 */
export const processStaticImageObjects = (objects, imageFields = ['image', 'images', 'thumbnail', 'posterImage']) => {
  return objects.map(obj => processStaticImageObject(obj, imageFields));
};

// Get event thumbnail URL
export const getEventThumbnailUrl = (eventId) => {
  if (!eventId) return null;
  return eventsService.getEventThumbnailUrl(eventId);
};

// Get event poster URL
export const getEventPosterUrl = (eventId) => {
  if (!eventId) return null;
  return eventsService.getEventPosterUrl(eventId);
};

// Get fallback image for events
export const getEventFallbackImage = (event) => {
  const fallbackText = event?.title || event?.name || 'Event';
  return `/api/placeholder/800/400?text=${encodeURIComponent(fallbackText)}`;
};

// Get event images array for slideshows (prioritize API images, fallback to existing)
export const getEventImages = (event) => {
  if (!event || !event.id) return [];
  
  const images = [];
  
  // Add poster from API
  const posterUrl = getEventPosterUrl(event.id);
  if (posterUrl) {
    images.push(posterUrl);
  }
  
  // Add thumbnail from API if different from poster
  const thumbnailUrl = getEventThumbnailUrl(event.id);
  if (thumbnailUrl && thumbnailUrl !== posterUrl) {
    images.push(thumbnailUrl);
  }
  
  // Fallback to existing image properties if API images not available
  if (images.length === 0) {
    if (event.posterImage) images.push(event.posterImage);
    if (event.thumbnailImage && event.thumbnailImage !== event.posterImage) {
      images.push(event.thumbnailImage);
    }
    if (event.image && event.image !== event.posterImage && event.image !== event.thumbnailImage) {
      images.push(event.image);
    }
    if (event.images && Array.isArray(event.images)) {
      event.images.forEach(img => {
        if (!images.includes(img)) images.push(img);
      });
    }
    if (event.photos && Array.isArray(event.photos)) {
      event.photos.forEach(photo => {
        if (!images.includes(photo)) images.push(photo);
      });
    }
  }
  
  // If still no images, add fallback
  if (images.length === 0) {
    images.push(getEventFallbackImage(event));
  }
  
  return images;
};

// Get primary event image (poster preferred, then thumbnail, then fallback)
export const getEventPrimaryImage = (event) => {
  if (!event) return getEventFallbackImage(event);
  
  // Try poster from API first
  if (event.id) {
    const posterUrl = getEventPosterUrl(event.id);
    if (posterUrl) return posterUrl;
  }
  
  // Try existing posterImage
  if (event.posterImage) return event.posterImage;
  
  // Try thumbnail from API
  if (event.id) {
    const thumbnailUrl = getEventThumbnailUrl(event.id);
    if (thumbnailUrl) return thumbnailUrl;
  }
  
  // Try existing thumbnailImage
  if (event.thumbnailImage) return event.thumbnailImage;
  
  // Try other image properties
  if (event.image) return event.image;
  if (event.images && event.images.length > 0) return event.images[0];
  if (event.photos && event.photos.length > 0) return event.photos[0];
  
  // Fallback
  return getEventFallbackImage(event);
};

// Get event thumbnail image (thumbnail preferred, then poster, then fallback)
export const getEventThumbnailImage = (event) => {
  if (!event) return getEventFallbackImage(event);
  
  // Try thumbnail from API first
  if (event.id) {
    const thumbnailUrl = getEventThumbnailUrl(event.id);
    if (thumbnailUrl) return thumbnailUrl;
  }
  
  // Try existing thumbnailImage
  if (event.thumbnailImage) return event.thumbnailImage;
  
  // Fall back to poster
  return getEventPrimaryImage(event);
};

const imageUtils = {
  getEventThumbnailUrl,
  getEventPosterUrl,
  getEventFallbackImage,
  getEventImages,
  getEventPrimaryImage,
  getEventThumbnailImage,
  getStaticImageUrl,
  getStaticImageUrls,
  processStaticImageObject,
  processStaticImageObjects,
};

export default imageUtils;
