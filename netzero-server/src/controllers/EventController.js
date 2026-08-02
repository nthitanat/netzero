const Event = require('../models/Event');
const path = require('path');
const fs = require('fs');

class EventController {
  // GET /api/v1/events - Get all events
  static async getAllEvents(req, res, next) {
    try {
      const events = await Event.findAll();
      
      res.status(200).json({
        success: true,
        message: 'Events retrieved successfully',
        data: events.map(event => event.toJSON()),
        count: events.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getAllEvents:', error);
      next(error);
    }
  }

  // GET /api/v1/events/:id - Get event by ID
  static async getEventById(req, res, next) {
    try {
      const eventId = req.params.id;
      
      // Validate event ID
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const event = await Event.findById(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Event retrieved successfully',
        data: event.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getEventById:', error);
      next(error);
    }
  }

  // GET /api/v1/events/:id/poster - Get event poster image
  static async getEventPosterImage(req, res, next) {
    try {
      const eventId = req.params.id;
      
      // Validate event ID
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Construct the exact file path: files/events/posterImage/{eventId}/poster_{eventId}.png
      const posterFileName = `poster_${eventId}.png`;
      const posterPath = path.join(__dirname, '../../files/events/posterImage', eventId.toString(), posterFileName);
      
      // Check if file exists
      if (!fs.existsSync(posterPath)) {
        return res.status(404).json({
          success: false,
          message: 'Poster image file not found',
          timestamp: new Date().toISOString()
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for images
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
      // Send the file
      res.sendFile(posterPath, (err) => {
        if (err) {
          console.error('Error sending poster image:', err);
          if (!res.headersSent) {
            next(err);
          }
        }
      });

    } catch (error) {
      console.error('Error in getEventPosterImage:', error);
      next(error);
    }
  }

  // GET /api/v1/events/:id/thumbnail - Get event thumbnail image
  static async getEventThumbnail(req, res, next) {
    try {
      const eventId = req.params.id;
      
      // Validate event ID
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Construct the exact file path: files/events/thumbnail/{eventId}/thumbnail_{eventId}.png
      const thumbnailFileName = `thumbnail_${eventId}.png`;
      const thumbnailPath = path.join(__dirname, '../../files/events/thumbnail', eventId.toString(), thumbnailFileName);
      
      // Check if file exists
      if (!fs.existsSync(thumbnailPath)) {
        return res.status(404).json({
          success: false,
          message: 'Thumbnail image file not found',
          timestamp: new Date().toISOString()
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for images
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
      // Send the file
      res.sendFile(thumbnailPath, (err) => {
        if (err) {
          console.error('Error sending thumbnail image:', err);
          if (!res.headersSent) {
            next(err);
          }
        }
      });

    } catch (error) {
      console.error('Error in getEventThumbnail:', error);
      next(error);
    }
  }

  // GET /api/v1/events/category/:category - Get events by category
  static async getEventsByCategory(req, res, next) {
    try {
      const category = req.params.category;
      
      // Validate category parameter
      if (!category || category.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category parameter is required',
          timestamp: new Date().toISOString()
        });
      }

      const events = await Event.findByCategory(category);
      
      res.status(200).json({
        success: true,
        message: `Events in category '${category}' retrieved successfully`,
        data: events.map(event => event.toJSON()),
        count: events.length,
        category: category,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getEventsByCategory:', error);
      next(error);
    }
  }

  // GET /api/v1/events/search/:name - Get events by name (search)
  static async getEventByName(req, res, next) {
    try {
      const name = req.params.name;
      
      // Validate name parameter
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Name parameter is required',
          timestamp: new Date().toISOString()
        });
      }

      const events = await Event.findByName(name);
      
      res.status(200).json({
        success: true,
        message: `Events matching '${name}' retrieved successfully`,
        data: events.map(event => event.toJSON()),
        count: events.length,
        searchTerm: name,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getEventByName:', error);
      next(error);
    }
  }

  // GET /api/v1/events/recommended - Get recommended events
  static async getRecommendedEvents(req, res, next) {
    try {
      const events = await Event.findRecommended();
      
      res.status(200).json({
        success: true,
        message: 'Recommended events retrieved successfully',
        data: events.map(event => event.toJSON()),
        count: events.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getRecommendedEvents:', error);
      next(error);
    }
  }

  // POST /api/v1/events - Create new event
  static async createEvent(req, res, next) {
    try {
      const {
        title,
        description,
        event_date,
        location,
        category,
        organizer,
        contact_email,
        contact_phone,
        max_participants,
        registration_deadline,
        status = 'active',
        isRecommended = false
      } = req.body;

      // Validate required fields
      if (!title || !event_date) {
        return res.status(400).json({
          success: false,
          message: 'Title and event date are required',
          timestamp: new Date().toISOString()
        });
      }

      // Validate event date is in the future
      const eventDate = new Date(event_date);
      if (eventDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Event date must be in the future',
          timestamp: new Date().toISOString()
        });
      }

      // Create event using Event model's create method (we need to add this)
      const eventData = {
        title,
        description,
        event_date,
        location,
        category,
        organizer,
        contact_email,
        contact_phone,
        max_participants: max_participants || 0,
        registration_deadline,
        status,
        isRecommended: isRecommended ? 1 : 0
      };

      const eventId = await Event.create(eventData);

      // Get the created event
      const createdEvent = await Event.findById(eventId);

      // Auto-join the event for the creator to establish ownership
      const UserEvent = require('../models/UserEvent');
      const userId = req.user.userId || req.user.id; // Support both userId and id
      await UserEvent.create(userId, eventId);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: createdEvent ? createdEvent.toJSON() : { id: eventId },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in createEvent:', error);
      next(error);
    }
  }

  // DELETE /api/v1/events/:id - Delete event (with ownership check)
  static async deleteEvent(req, res, next) {
    try {
      const eventId = req.params.id;
      const userId = req.user.id; // From auth middleware
      
      // Validate event ID
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if event exists first
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
          timestamp: new Date().toISOString()
        });
      }

      // Delete event with ownership check
      const deleted = await Event.deleteByIdWithOwnership(parseInt(eventId), userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Event not found or already deleted',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      next(error);
    }
  }

  // PUT /api/v1/events/:id/cancel - Soft delete (cancel) event
  static async cancelEvent(req, res, next) {
    try {
      const eventId = req.params.id;
      const userId = req.user.id; // From auth middleware
      
      // Validate event ID
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if event exists first
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
          timestamp: new Date().toISOString()
        });
      }

      // Cancel event with ownership check
      const cancelled = await Event.softDeleteByIdWithOwnership(parseInt(eventId), userId);
      
      if (!cancelled) {
        return res.status(404).json({
          success: false,
          message: 'Event not found or already cancelled',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Event cancelled successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in cancelEvent:', error);
      next(error);
    }
  }

  // PUT /api/v1/events/:id - Update event (with ownership check)
  static async updateEvent(req, res, next) {
    try {
      const eventId = req.params.id;
      const userId = req.user.id; // From auth middleware
      const updateData = req.body;
      
      // Validate event ID
      if (!eventId || isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if event exists first
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
          timestamp: new Date().toISOString()
        });
      }

      // Update event with ownership check
      const updated = await Event.updateByIdWithOwnership(parseInt(eventId), userId, updateData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Event not found or no changes made',
          timestamp: new Date().toISOString()
        });
      }

      // Fetch updated event
      const updatedEvent = await Event.findById(eventId);

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent ? updatedEvent.toJSON() : null,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in updateEvent:', error);
      next(error);
    }
  }
}

module.exports = EventController;
