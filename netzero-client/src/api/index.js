// Import for internal use
import { eventsService } from './events.js';
import { productsService } from './products.js';
import { reservationsService } from './reservations.js';
import { treesService } from './trees.js';
import { locationTreesService } from './locationTrees.js';
import { chatService } from './chat.js';
import { eventProductsService } from './eventProducts.js';
import { userEventsService } from './userEvents.js';
import { authService } from './auth.js';
import { userService } from './users.js';
import { surveysService } from './surveys.js';
import { productSurveyService } from './productSurveys.js';

// API Services Export
export { axiosInstance } from './client.js';
export { eventsService } from './events.js';
export { productsService } from './products.js';
export { reservationsService } from './reservations.js';
export { treesService } from './trees.js';
export { locationTreesService } from './locationTrees.js';
export { chatService } from './chat.js';
export { eventProductsService } from './eventProducts.js';
export { userEventsService } from './userEvents.js';
export { authService } from './auth.js';
export { userService } from './users.js';
export { surveysService } from './surveys.js';
export { productSurveyService } from './productSurveys.js';
export { 
  ApiResponse, 
  PaginatedResponse, 
  ApiError, 
  API_STATUS, 
  API_ERROR_TYPES,
  apiCache,
  createApiConfig 
} from './types.js';

// Convenience exports for common operations
export const api = {
  events: eventsService,
  products: productsService,
  reservations: reservationsService,
  trees: treesService,
  locationTrees: locationTreesService,
  chat: chatService,
  eventProducts: eventProductsService,
  userEvents: userEventsService,
  auth: authService,
  users: userService,
  surveys: surveysService,
  productSurveys: productSurveyService,
};
