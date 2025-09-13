const Event = require('../models/Event');
const path = require('path');
const fs = require('fs');

class EventController {
  // GET /api/v1/events - Get all events
  static async getAllEvents(req, res) {
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
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/events/:id - Get event by ID
  static async getEventById(req, res) {
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
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/events/:id/poster - Get event poster image
  static async getEventPosterImage(req, res) {
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
            res.status(500).json({
              success: false,
              message: 'Failed to serve poster image',
              error: err.message,
              timestamp: new Date().toISOString()
            });
          }
        }
      });

    } catch (error) {
      console.error('Error in getEventPosterImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve poster image',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/events/:id/thumbnail - Get event thumbnail image
  static async getEventThumbnail(req, res) {
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
            res.status(500).json({
              success: false,
              message: 'Failed to serve thumbnail image',
              error: err.message,
              timestamp: new Date().toISOString()
            });
          }
        }
      });

    } catch (error) {
      console.error('Error in getEventThumbnail:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve thumbnail image',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/events/category/:category - Get events by category
  static async getEventsByCategory(req, res) {
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
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events by category',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/events/search/:name - Get events by name (search)
  static async getEventByName(req, res) {
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
      res.status(500).json({
        success: false,
        message: 'Failed to search events by name',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/events/recommended - Get recommended events
  static async getRecommendedEvents(req, res) {
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
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommended events',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = EventController;
