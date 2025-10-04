// Import for internal use
import { eventsService } from './events.js';
import { productsService } from './products.js';
import { reservationsService } from './reservations.js';
import { treesService } from './trees.js';
import { locationTreesService } from './locationTrees.js';
import { chatService } from './chat.js';
import AuthService, { authService } from './auth.js';
import UserService from './users.js';

// API Services Export
export { axiosInstance } from './client.js';
export { eventsService, EventsService } from './events.js';
export { productsService, ProductsService } from './products.js';
export { reservationsService, ReservationsService } from './reservations.js';
export { treesService, TreesService } from './trees.js';
export { locationTreesService, LocationTreesService } from './locationTrees.js';
export { chatService } from './chat.js';
export { authService, default as AuthService } from './auth.js';
export { default as UserService } from './users.js';
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
  auth: authService,
  users: UserService,
};
