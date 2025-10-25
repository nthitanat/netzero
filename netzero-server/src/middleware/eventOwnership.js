const UserEvent = require('../models/UserEvent');

/**
 * Middleware to check if the authenticated user owns/is associated with an event
 * Requires authentication middleware to be run first to populate req.user
 */
const checkEventOwnership = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get event ID from params
    const { eventId } = req.params;
    const { id: userId } = req.user;

    if (!eventId || isNaN(parseInt(eventId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid event ID is required'
      });
    }

    // Check if user owns the event
    const ownsEvent = await UserEvent.userOwnsEvent(parseInt(userId), parseInt(eventId));

    if (!ownsEvent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to access this event'
      });
    }

    // Add eventId to request for use in controller
    req.eventId = parseInt(eventId);
    
    next();
  } catch (error) {
    console.error('Error in checkEventOwnership middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify event ownership',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user owns event but allow admin override
 * Useful for admin operations that should bypass ownership checks
 */
const checkEventOwnershipOrAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { eventId } = req.params;
    const { id: userId, role } = req.user;

    if (!eventId || isNaN(parseInt(eventId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid event ID is required'
      });
    }

    // Allow admin users to bypass ownership check
    if (role === 'admin') {
      req.eventId = parseInt(eventId);
      req.isAdmin = true;
      return next();
    }

    // Check if user owns the event
    const ownsEvent = await UserEvent.userOwnsEvent(parseInt(userId), parseInt(eventId));

    if (!ownsEvent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to access this event'
      });
    }

    req.eventId = parseInt(eventId);
    req.isAdmin = false;
    
    next();
  } catch (error) {
    console.error('Error in checkEventOwnershipOrAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify event ownership',
      error: error.message
    });
  }
};

/**
 * Middleware to optionally check event ownership
 * Useful for endpoints that provide different data based on ownership
 */
const optionalEventOwnership = async (req, res, next) => {
  try {
    if (req.user && req.user.id && req.params.eventId) {
      const { eventId } = req.params;
      const { id: userId } = req.user;

      if (!isNaN(parseInt(eventId))) {
        try {
          const ownsEvent = await UserEvent.userOwnsEvent(parseInt(userId), parseInt(eventId));
          req.ownsEvent = ownsEvent;
          req.eventId = parseInt(eventId);
        } catch (error) {
          console.error('Error checking optional ownership:', error);
          req.ownsEvent = false;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in optionalEventOwnership middleware:', error);
    // Don't fail the request, just continue without ownership info
    req.ownsEvent = false;
    next();
  }
};

module.exports = {
  checkEventOwnership,
  checkEventOwnershipOrAdmin,
  optionalEventOwnership
};