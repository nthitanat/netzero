const { body } = require('express-validator');

// Validation rules for creating an event
const createEventValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('event_date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Event date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Location must be between 3 and 255 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['workshop', 'seminar', 'conference', 'networking', 'training', 'webinar', 'other'])
    .withMessage('Invalid category'),

  body('organizer')
    .notEmpty()
    .withMessage('Organizer is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Organizer must be between 2 and 255 characters'),

  body('contact_email')
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .withMessage('Valid email is required'),

  body('contact_phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('max_participants')
    .notEmpty()
    .withMessage('Maximum participants is required')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Maximum participants must be between 1 and 10000'),

  body('registration_deadline')
    .notEmpty()
    .withMessage('Registration deadline is required')
    .isISO8601()
    .withMessage('Registration deadline must be a valid date')
    .custom((value, { req }) => {
      const deadline = new Date(value);
      const eventDate = new Date(req.body.event_date);
      const now = new Date();
      
      if (deadline <= now) {
        throw new Error('Registration deadline must be in the future');
      }
      
      if (deadline >= eventDate) {
        throw new Error('Registration deadline must be before event date');
      }
      
      return true;
    }),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'cancelled', 'completed'])
    .withMessage('Invalid status')
];

// Validation rules for updating an event
const updateEventValidation = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),

  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('event_date')
    .optional()
    .isISO8601()
    .withMessage('Event date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('location')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Location must be between 3 and 255 characters'),

  body('category')
    .optional()
    .isIn(['workshop', 'seminar', 'conference', 'networking', 'training', 'webinar', 'other'])
    .withMessage('Invalid category'),

  body('organizer')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Organizer must be between 2 and 255 characters'),

  body('contact_email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),

  body('contact_phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('max_participants')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Maximum participants must be between 1 and 10000'),

  body('registration_deadline')
    .optional()
    .isISO8601()
    .withMessage('Registration deadline must be a valid date')
    .custom((value, { req }) => {
      const deadline = new Date(value);
      const eventDate = req.body.event_date ? new Date(req.body.event_date) : null;
      const now = new Date();
      
      if (deadline <= now) {
        throw new Error('Registration deadline must be in the future');
      }
      
      if (eventDate && deadline >= eventDate) {
        throw new Error('Registration deadline must be before event date');
      }
      
      return true;
    }),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'cancelled', 'completed'])
    .withMessage('Invalid status'),

  body('current_participants')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current participants must be a non-negative integer')
];

module.exports = {
  createEventValidation,
  updateEventValidation
};
