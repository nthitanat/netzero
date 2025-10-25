const EventProduct = require('../models/EventProduct');
const UserEvent = require('../models/UserEvent');
const Product = require('../models/Product');
const Event = require('../models/Event');

class EventProductController {
  // GET /api/v1/event-products - Get all event products with optional filters
  static async getAllEventProducts(req, res) {
    try {
      const { event_id, product_id, status } = req.query;

      const filters = {};
      if (event_id) filters.event_id = parseInt(event_id);
      if (product_id) filters.product_id = parseInt(product_id);
      if (status) filters.status = status;

      const eventProducts = await EventProduct.findAll(filters);

      res.status(200).json({
        success: true,
        message: 'Event products retrieved successfully',
        data: eventProducts.map(ep => ep.toJSON()),
        count: eventProducts.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getAllEventProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event products',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/event-products/:id - Get event product by ID
  static async getEventProductById(req, res) {
    try {
      const eventProductId = req.params.id;

      if (!eventProductId || isNaN(eventProductId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const eventProduct = await EventProduct.findById(eventProductId);

      if (!eventProduct) {
        return res.status(404).json({
          success: false,
          message: 'Event product not found',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Event product retrieved successfully',
        data: eventProduct.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getEventProductById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/event-products/product/:productId/events - Get all events for a product
  static async getEventsByProductId(req, res) {
    try {
      const productId = req.params.productId;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }

      const events = await EventProduct.getEventsByProductId(productId);

      res.status(200).json({
        success: true,
        message: 'Events for product retrieved successfully',
        data: events,
        count: events.length,
        product: {
          id: product.id,
          title: product.title
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getEventsByProductId:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events for product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/event-products/event/:eventId/products - Get all products for an event
  static async getProductsByEventId(req, res) {
    try {
      const eventId = req.params.eventId;

      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
          timestamp: new Date().toISOString()
        });
      }

      const products = await EventProduct.getProductsByEventId(eventId);

      res.status(200).json({
        success: true,
        message: 'Products for event retrieved successfully',
        data: products,
        count: products.length,
        event: {
          id: event.id,
          title: event.title
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getProductsByEventId:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products for event',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/event-products - Create a new event product
  // Requires authentication and checks event ownership via middleware
  static async createEventProduct(req, res) {
    try {
      const {
        event_id,
        product_id,
        event_price,
        stock_quantity
      } = req.body;

      // Validation
      if (!event_id || !product_id || !event_price) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: event_id, product_id, event_price',
          timestamp: new Date().toISOString()
        });
      }

      // Validate event_price
      if (isNaN(event_price) || event_price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Event price must be a valid positive number',
          timestamp: new Date().toISOString()
        });
      }

      // Check if event exists
      const event = await Event.findById(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if product exists
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if event product already exists
      const existingEventProduct = await EventProduct.findByEventAndProduct(event_id, product_id);
      if (existingEventProduct) {
        return res.status(409).json({
          success: false,
          message: 'This product is already assigned to this event',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user owns the event (set by middleware)
      const userId = req.user.userId || req.user.id;
      const userOwnsEvent = req.userOwnsEvent; // Set by checkEventOwnership middleware

      // Determine status based on ownership
      const status = userOwnsEvent ? 'confirmed' : 'pending';

      const eventProductData = {
        event_id: parseInt(event_id),
        product_id: parseInt(product_id),
        event_price: parseFloat(event_price),
        stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
        status
      };

      const eventProductId = await EventProduct.create(eventProductData);
      const newEventProduct = await EventProduct.findById(eventProductId);

      res.status(201).json({
        success: true,
        message: `Event product created successfully with status: ${status}`,
        data: newEventProduct.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in createEventProduct:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create event product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // PUT /api/v1/event-products/:id - Update event product
  // Requires authentication and checks event ownership via middleware
  static async updateEventProduct(req, res) {
    try {
      const eventProductId = req.params.id;

      if (!eventProductId || isNaN(eventProductId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Get existing event product
      const existingEventProduct = await EventProduct.findById(eventProductId);
      if (!existingEventProduct) {
        return res.status(404).json({
          success: false,
          message: 'Event product not found',
          timestamp: new Date().toISOString()
        });
      }

      const {
        event_price,
        stock_quantity,
        status
      } = req.body;

      // Validate event_price if provided
      if (event_price !== undefined && (isNaN(event_price) || event_price < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Event price must be a valid positive number',
          timestamp: new Date().toISOString()
        });
      }

      // Validate status if provided
      if (status && !['pending', 'confirmed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either pending or confirmed',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user owns the event (set by middleware)
      const userOwnsEvent = req.userOwnsEvent; // Set by checkEventOwnership middleware

      // Prepare update data
      const updateData = {
        event_price: event_price !== undefined ? parseFloat(event_price) : existingEventProduct.event_price,
        stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : existingEventProduct.stock_quantity,
        status: userOwnsEvent && status ? status : existingEventProduct.status
      };

      // If user doesn't own the event, they can't change status to confirmed
      if (!userOwnsEvent && status === 'confirmed') {
        return res.status(403).json({
          success: false,
          message: 'Only event owners can confirm event products',
          timestamp: new Date().toISOString()
        });
      }

      const success = await EventProduct.updateById(eventProductId, updateData);

      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update event product',
          timestamp: new Date().toISOString()
        });
      }

      const updatedEventProduct = await EventProduct.findById(eventProductId);

      res.status(200).json({
        success: true,
        message: 'Event product updated successfully',
        data: updatedEventProduct.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in updateEventProduct:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update event product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // DELETE /api/v1/event-products/:id - Delete event product
  static async deleteEventProduct(req, res) {
    try {
      const eventProductId = req.params.id;

      if (!eventProductId || isNaN(eventProductId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if event product exists
      const eventProduct = await EventProduct.findById(eventProductId);
      if (!eventProduct) {
        return res.status(404).json({
          success: false,
          message: 'Event product not found',
          timestamp: new Date().toISOString()
        });
      }

      const success = await EventProduct.deleteById(eventProductId);

      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete event product',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Event product deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in deleteEventProduct:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete event product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = EventProductController;
