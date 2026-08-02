const EventProduct = require('../models/EventProduct');
const UserEvent = require('../models/UserEvent');
const Product = require('../models/Product');
const Event = require('../models/Event');

class EventProductController {
  // GET /api/v1/event-products - Get all event products with optional filters
  static async getAllEventProducts(req, res, next) {
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
      next(error);
    }
  }

  // GET /api/v1/event-products/:id - Get event product by ID
  static async getEventProductById(req, res, next) {
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
      next(error);
    }
  }

  // GET /api/v1/event-products/product/:productId/events - Get all events for a product
  static async getEventsByProductId(req, res, next) {
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
      next(error);
    }
  }

  // GET /api/v1/event-products/event/:eventId/products - Get all products for an event
  static async getProductsByEventId(req, res, next) {
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
      next(error);
    }
  }

  // POST /api/v1/event-products - Create a new event product
  // Requires authentication and checks event ownership via middleware
  static async createEventProduct(req, res, next) {
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
      const userRole = req.user.role;
      const userOwnsEvent = req.userOwnsEvent; // Set by checkEventOwnership middleware

      // Check if user owns the product (product.user_id is the seller/owner)
      const userOwnsProduct = product.user_id === userId;
      const isAdmin = userRole === 'admin';

      console.log('🔍 Event Product Creation Authorization Check:', {
        userId,
        userRole,
        productUserId: product.user_id,
        userOwnsProduct,
        userOwnsEvent,
        isAdmin
      });

      // Only product owner or admin can add product to event
      if (!userOwnsProduct && !isAdmin) {
        console.log('❌ Authorization failed: User does not own product and is not admin');
        return res.status(403).json({
          success: false,
          message: 'Only the product owner or admin can add this product to an event',
          timestamp: new Date().toISOString()
        });
      }

      // Validate stock_quantity against unassigned_stock_quantity only if user owns both or is admin
      const requestedQuantity = stock_quantity ? parseInt(stock_quantity) : 0;
      const availableUnassigned = product.unassigned_stock_quantity || 0;

      if ((userOwnsEvent && userOwnsProduct) || isAdmin) {
        // User owns both event and product, or is admin - validate and reduce unassigned stock
        if (requestedQuantity > availableUnassigned) {
          return res.status(400).json({
            success: false,
            message: `Insufficient unassigned stock. Available: ${availableUnassigned}, Requested: ${requestedQuantity}`,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Determine status based on ownership
      // Admin or event owner can confirm immediately
      const status = (userOwnsEvent || isAdmin) ? 'confirmed' : 'pending';

      const eventProductData = {
        event_id: parseInt(event_id),
        product_id: parseInt(product_id),
        event_price: parseFloat(event_price),
        stock_quantity: requestedQuantity,
        status
      };

      const eventProductId = await EventProduct.create(eventProductData);

      // Reduce unassigned_stock_quantity if user owns both event and product, or is admin
      if ((userOwnsEvent && userOwnsProduct) || isAdmin) {
        const newUnassignedQuantity = availableUnassigned - requestedQuantity;
        await Product.updateUnassignedStockQuantity(product_id, newUnassignedQuantity, userId);
      }

      const newEventProduct = await EventProduct.findById(eventProductId);

      res.status(201).json({
        success: true,
        message: `Event product created successfully with status: ${status}`,
        data: newEventProduct.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in createEventProduct:', error);
      next(error);
    }
  }

  // PUT /api/v1/event-products/:id - Update event product
  // Requires authentication and checks event ownership via middleware
  static async updateEventProduct(req, res, next) {
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
      const userId = req.user.userId || req.user.id;
      const userOwnsEvent = req.userOwnsEvent; // Set by checkEventOwnership middleware

      // If stock_quantity is being updated, validate against unassigned stock (only if user owns both)
      let newUnassignedQuantity = null;
      if (stock_quantity !== undefined) {
        const product = await Product.findById(existingEventProduct.product_id);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found',
            timestamp: new Date().toISOString()
          });
        }

        const userOwnsProduct = product.user_id === userId;

        // Only validate and update unassigned stock if user owns both event and product
        if (userOwnsEvent && userOwnsProduct) {
          const currentAssigned = existingEventProduct.stock_quantity;
          const newAssigned = parseInt(stock_quantity);
          const difference = newAssigned - currentAssigned;

          // Calculate what would be the new unassigned quantity
          const currentUnassigned = product.unassigned_stock_quantity || 0;
          newUnassignedQuantity = currentUnassigned - difference;

          if (newUnassignedQuantity < 0) {
            return res.status(400).json({
              success: false,
              message: `Insufficient unassigned stock. Available: ${currentUnassigned}, Additional needed: ${difference}`,
              timestamp: new Date().toISOString()
            });
          }
        }
      }

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
        return next(new Error('Failed to update event product'));
      }

      // Update product's unassigned_stock_quantity if stock_quantity was changed
      if (newUnassignedQuantity !== null) {
        // userId is already available from the UPDATE method's userId variable
        await Product.updateUnassignedStockQuantity(existingEventProduct.product_id, newUnassignedQuantity, userId);
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
      next(error);
    }
  }

  // PATCH /api/v1/event-products/:id - Update event product with stock calculation
  // Updates both event_products and products tables in a transaction
  static async patchEventProduct(req, res, next) {
    try {
      const eventProductId = req.params.id;
      const userId = req.user.userId || req.user.id;

      if (!eventProductId || isNaN(eventProductId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const { event_price, stock_quantity } = req.body;

      // Validate at least one field is provided
      if (event_price === undefined && stock_quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (event_price or stock_quantity) must be provided',
          timestamp: new Date().toISOString()
        });
      }

      // Validate event_price if provided
      if (event_price !== undefined && (isNaN(event_price) || event_price < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Event price must be a valid positive number',
          timestamp: new Date().toISOString()
        });
      }

      // Validate stock_quantity if provided
      if (stock_quantity !== undefined && (isNaN(stock_quantity) || stock_quantity < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Stock quantity must be a valid non-negative number',
          timestamp: new Date().toISOString()
        });
      }

      const updateData = {};
      if (event_price !== undefined) updateData.event_price = parseFloat(event_price);
      if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);

      // Call the model method that handles transaction and stock calculation
      const updatedEventProduct = await EventProduct.updateEventProduct(
        eventProductId,
        updateData,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Event product updated successfully',
        data: {
          id: updatedEventProduct.id,
          event_id: updatedEventProduct.event_id,
          product_id: updatedEventProduct.product_id,
          event_price: parseFloat(updatedEventProduct.event_price),
          stock_quantity: updatedEventProduct.stock_quantity,
          status: updatedEventProduct.status,
          event_title: updatedEventProduct.event_title,
          event_date: updatedEventProduct.event_date,
          event_location: updatedEventProduct.event_location,
          product_title: updatedEventProduct.product_title,
          product_stock_quantity: updatedEventProduct.product_stock_quantity,
          product_unassigned_stock_quantity: updatedEventProduct.product_unassigned_stock_quantity,
          created_at: updatedEventProduct.created_at,
          updated_at: updatedEventProduct.updated_at
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in patchEventProduct:', error);
      next(error);
    }
  }

  // DELETE /api/v1/event-products/:id - Delete event product
  static async deleteEventProduct(req, res, next) {
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

      // Get product and check ownership to restore unassigned quantity
      const product = await Product.findById(eventProduct.product_id);
      if (product) {
        const userId = req.user.userId || req.user.id;
        const userOwnsProduct = product.user_id === userId;
        
        // Check if user owns the event
        const userOwnsEvent = await UserEvent.findByEventAndUser(eventProduct.event_id, userId);
        
        // Only restore unassigned_stock_quantity if user owns both product and event
        if (userOwnsProduct && userOwnsEvent) {
          const restoredQuantity = (product.unassigned_stock_quantity || 0) + eventProduct.stock_quantity;
          await Product.updateUnassignedStockQuantity(eventProduct.product_id, restoredQuantity, userId);
        }
      }

      const success = await EventProduct.deleteById(eventProductId);

      if (!success) {
        return next(new Error('Failed to delete event product'));
      }

      res.status(200).json({
        success: true,
        message: 'Event product deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in deleteEventProduct:', error);
      next(error);
    }
  }
}

module.exports = EventProductController;
