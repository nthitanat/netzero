const UserEvent = require('../models/UserEvent');
const Event = require('../models/Event');

class UserEventController {
  
  // Get all events for a specific user
  static async getUserEvents(req, res, next) {
    try {
      const { userId } = req.params;
      
      // Validate userId
      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid user ID is required'
        });
      }

      const events = await UserEvent.getEventsByUserId(parseInt(userId));
      
      res.status(200).json({
        success: true,
        message: 'User events retrieved successfully',
        data: events
      });
      
    } catch (error) {
      console.error('Error in getUserEvents:', error);
      next(error);
    }
  }

  // Get events owned by the authenticated user
  static async getMyEvents(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      
      // Validate userId from auth token
      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid authentication token'
        });
      }

      const events = await UserEvent.getEventsByUserId(parseInt(userId));
      
      res.status(200).json({
        success: true,
        message: 'My events retrieved successfully',
        data: events
      });
      
    } catch (error) {
      console.error('Error in getMyEvents:', error);
      next(error);
    }
  }

  // Create user-event relationship (join event)
  static async joinEvent(req, res, next) {
    try {
      const { userId, eventId } = req.body;
      
      // Validate input
      if (!userId || !eventId || isNaN(parseInt(userId)) || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid user ID and event ID are required'
        });
      }

      // Check if event exists
      const event = await Event.findById(parseInt(eventId));
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      const userEventId = await UserEvent.create(parseInt(userId), parseInt(eventId));
      
      res.status(201).json({
        success: true,
        message: 'User joined event successfully',
        data: { id: userEventId }
      });
      
    } catch (error) {
      console.error('Error in joinEvent:', error);
      next(error);
    }
  }

  // Remove user-event relationship (leave event)
  static async leaveEvent(req, res, next) {
    try {
      const { userId, eventId } = req.params;
      
      // Validate input
      if (!userId || !eventId || isNaN(parseInt(userId)) || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid user ID and event ID are required'
        });
      }

      const removed = await UserEvent.remove(parseInt(userId), parseInt(eventId));
      
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'User-event relationship not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User left event successfully'
      });
      
    } catch (error) {
      console.error('Error in leaveEvent:', error);
      next(error);
    }
  }

  // Get all users for a specific event
  static async getEventUsers(req, res, next) {
    try {
      const { eventId } = req.params;
      
      // Validate eventId
      if (!eventId || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid event ID is required'
        });
      }

      const users = await UserEvent.getUsersByEventId(parseInt(eventId));
      
      res.status(200).json({
        success: true,
        message: 'Event users retrieved successfully',
        data: users
      });
      
    } catch (error) {
      console.error('Error in getEventUsers:', error);
      next(error);
    }
  }

  // Check if user owns/is associated with an event
  static async checkOwnership(req, res, next) {
    try {
      const { userId, eventId } = req.params;
      
      // Validate input
      if (!userId || !eventId || isNaN(parseInt(userId)) || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid user ID and event ID are required'
        });
      }

      const ownsEvent = await UserEvent.userOwnsEvent(parseInt(userId), parseInt(eventId));
      
      res.status(200).json({
        success: true,
        message: 'Ownership check completed',
        data: { ownsEvent }
      });
      
    } catch (error) {
      console.error('Error in checkOwnership:', error);
      next(error);
    }
  }
}

module.exports = UserEventController;