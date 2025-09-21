const { body } = require('express-validator');

// Validation rules for user registration
const validateRegistration = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for user profile update
const validateUserUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),

  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Profile image must be a valid URL')
];

// Validation rules for password update
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('New password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

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
  validateRegistration,
  validateLogin,
  validateUserUpdate,
  validatePasswordUpdate,
  createEventValidation,
  updateEventValidation
};
