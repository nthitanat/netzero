const ProductReservation = require('../models/ProductReservation');
const Product = require('../models/Product');

class ProductReservationController {
  // GET /api/v1/reservations - Get all reservations (with filters)
  static async getAllReservations(req, res) {
    try {
      const {
        user_id,
        product_id,
        product_owner_id,
        status,
        limit,
        offset
      } = req.query;

      const filters = {};
      
      if (user_id) filters.user_id = parseInt(user_id);
      if (product_id) filters.product_id = parseInt(product_id);
      if (product_owner_id) filters.product_owner_id = parseInt(product_owner_id);
      if (status) filters.status = status;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const reservations = await ProductReservation.findAll(filters);
      
      res.status(200).json({
        success: true,
        message: 'Reservations retrieved successfully',
        data: reservations,
        count: reservations.length,
        filters: filters,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getAllReservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reservations',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/reservations/:id - Get reservation by ID
  static async getReservationById(req, res) {
    try {
      const reservationId = req.params.id;
      
      if (!reservationId || isNaN(reservationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reservation ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const reservation = await ProductReservation.findById(reservationId);
      
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check permissions - user can see their own reservations or reservations for their products
      const userId = req.user.userId;
      if (reservation.user_id !== userId && 
          reservation.product.owner_id !== userId && 
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Reservation retrieved successfully',
        data: reservation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getReservationById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reservation',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/reservations - Create a new reservation
  static async createReservation(req, res) {
    try {
      const {
        product_id,
        quantity,
        note
      } = req.body;

      // Validation
      if (!product_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: product_id, quantity',
          timestamp: new Date().toISOString()
        });
      }

      if (isNaN(product_id) || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and quantity must be valid positive numbers',
          timestamp: new Date().toISOString()
        });
      }

      // Check if product exists and has sufficient stock
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is trying to reserve their own product
      if (product.user_id === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reserve your own product',
          timestamp: new Date().toISOString()
        });
      }

      // Check stock availability
      if (product.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.stock_quantity}`,
          timestamp: new Date().toISOString()
        });
      }

      const reservationData = {
        user_id: req.user.userId,
        product_id: parseInt(product_id),
        quantity: parseInt(quantity),
        note,
        status: 'pending'
      };

      const reservationId = await ProductReservation.create(reservationData);
      const newReservation = await ProductReservation.findById(reservationId);
      
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: newReservation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in createReservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create reservation',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // PUT /api/v1/reservations/:id - Update reservation
  static async updateReservation(req, res) {
    try {
      const reservationId = req.params.id;
      const userId = req.user.userId;

      if (!reservationId || isNaN(reservationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reservation ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const { quantity, note, status } = req.body;

      // Validate quantity if provided
      if (quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a valid positive number',
          timestamp: new Date().toISOString()
        });
      }

      // Validate status if provided
      if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: pending, confirmed, cancelled',
          timestamp: new Date().toISOString()
        });
      }

      const updateData = {};
      if (quantity !== undefined) updateData.quantity = parseInt(quantity);
      if (note !== undefined) updateData.note = note;
      if (status) updateData.status = status;

      const success = await ProductReservation.updateById(reservationId, updateData, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found or access denied',
          timestamp: new Date().toISOString()
        });
      }

      const updatedReservation = await ProductReservation.findById(reservationId);
      
      res.status(200).json({
        success: true,
        message: 'Reservation updated successfully',
        data: updatedReservation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in updateReservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reservation',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // DELETE /api/v1/reservations/:id - Delete reservation
  static async deleteReservation(req, res) {
    try {
      const reservationId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!reservationId || isNaN(reservationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reservation ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const success = await ProductReservation.deleteById(reservationId, userId, isAdmin);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found or access denied',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Reservation deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in deleteReservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete reservation',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/reservations/my - Get current user's reservations
  static async getMyReservations(req, res) {
    try {
      const userId = req.user.userId;
      const { status } = req.query;

      const filters = { user_id: userId };
      if (status) filters.status = status;

      const reservations = await ProductReservation.findAll(filters);
      
      res.status(200).json({
        success: true,
        message: 'User reservations retrieved successfully',
        data: reservations,
        count: reservations.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getMyReservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user reservations',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/reservations/my-products - Get reservations for current user's products
  static async getMyProductReservations(req, res) {
    try {
      const userId = req.user.userId;
      const { status } = req.query;

      const filters = { product_owner_id: userId };
      if (status) filters.status = status;

      const reservations = await ProductReservation.findAll(filters);
      
      res.status(200).json({
        success: true,
        message: 'Product reservations retrieved successfully',
        data: reservations,
        count: reservations.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getMyProductReservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product reservations',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/reservations/:id/confirm - Confirm reservation and reduce stock
  static async confirmReservation(req, res) {
    try {
      const reservationId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!reservationId || isNaN(reservationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reservation ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const success = await ProductReservation.confirmReservation(reservationId, userId, isAdmin);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to confirm reservation. Check permissions and stock availability.',
          timestamp: new Date().toISOString()
        });
      }

      const confirmedReservation = await ProductReservation.findById(reservationId);
      
      res.status(200).json({
        success: true,
        message: 'Reservation confirmed successfully',
        data: confirmedReservation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in confirmReservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm reservation',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/reservations/:id/cancel - Cancel reservation
  static async cancelReservation(req, res) {
    try {
      const reservationId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!reservationId || isNaN(reservationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reservation ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const success = await ProductReservation.cancelReservation(reservationId, userId, isAdmin);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to cancel reservation. Check permissions or reservation status.',
          timestamp: new Date().toISOString()
        });
      }

      const cancelledReservation = await ProductReservation.findById(reservationId);
      
      res.status(200).json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: cancelledReservation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in cancelReservation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel reservation',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // PUT /api/v1/reservations/:id/status - Update reservation status (for product owners)
  static async updateReservationStatus(req, res) {
    try {
      const reservationId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';
      const { status } = req.body;

      if (!reservationId || isNaN(reservationId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reservation ID provided',
          timestamp: new Date().toISOString()
        });
      }

      if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be one of: pending, confirmed, cancelled',
          timestamp: new Date().toISOString()
        });
      }

      const success = await ProductReservation.updateStatus(reservationId, status, userId, isAdmin);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Reservation not found or access denied',
          timestamp: new Date().toISOString()
        });
      }

      const updatedReservation = await ProductReservation.findById(reservationId);
      
      res.status(200).json({
        success: true,
        message: 'Reservation status updated successfully',
        data: updatedReservation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in updateReservationStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reservation status',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/reservations/stats - Get reservation statistics for current user (as product owner)
  static async getReservationStats(req, res) {
    try {
      const userId = req.user.userId;

      const stats = await ProductReservation.getOwnerStats(userId);
      
      res.status(200).json({
        success: true,
        message: 'Reservation statistics retrieved successfully',
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getReservationStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reservation statistics',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/:productId/reservations - Get reservations for a specific product
  static async getProductReservations(req, res) {
    try {
      const productId = req.params.productId;
      const userId = req.user.userId;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user owns the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }

      if (product.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view reservations for your own products.',
          timestamp: new Date().toISOString()
        });
      }

      const reservations = await ProductReservation.findByProductId(productId);
      
      res.status(200).json({
        success: true,
        message: 'Product reservations retrieved successfully',
        data: reservations,
        count: reservations.length,
        product: product.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getProductReservations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product reservations',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = ProductReservationController;