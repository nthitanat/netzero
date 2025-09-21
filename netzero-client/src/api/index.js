// Import for internal use
import { eventsService } from './events.js';
import { productsService } from './products.js';
import { treesService } from './trees.js';
import { locationTreesService } from './locationTrees.js';
import AuthService from './auth.js';
import UserService from './users.js';

// API Services Export
export { axiosInstance } from './client.js';
export { eventsService, EventsService } from './events.js';
export { productsService, ProductsService } from './products.js';
export { treesService, TreesService } from './trees.js';
export { locationTreesService, LocationTreesService } from './locationTrees.js';
export { default as AuthService } from './auth.js';
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
  trees: treesService,
  locationTrees: locationTreesService,
  auth: AuthService,
  users: UserService,
};
