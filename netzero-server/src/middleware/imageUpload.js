const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for both events and products
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const id = req.params.id;
    const imageType = req.params.imageType || 'photos'; // default to photos
    
    // Determine if this is for events or products based on the route
    const isEventRoute = req.originalUrl.includes('/events/');
    const isProductRoute = req.originalUrl.includes('/products/');
    
    let uploadPath;
    if (isEventRoute) {
      uploadPath = path.join(process.cwd(), 'files', 'events', imageType, id);
    } else if (isProductRoute) {
      uploadPath = path.join(process.cwd(), 'files', 'products', imageType, id);
    } else {
      // Default to events for backward compatibility
      uploadPath = path.join(process.cwd(), 'files', 'events', imageType, id);
    }
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}_${timestamp}${ext}`;
    
    cb(null, filename);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Middleware for single image upload (thumbnail, posterImage)
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Middleware for multiple image upload (photos)
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in file upload.',
        error: error.message
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'File upload error',
    error: error.message
  });
};

// Helper function to generate file URL for events and products
const generateFileUrl = (req, relativePath) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  // Determine if this is for events or products
  const isEventRoute = req.originalUrl.includes('/events/');
  const isProductRoute = req.originalUrl.includes('/products/');
  
  if (isEventRoute) {
    return `${baseUrl}/api/v1/events/images/${relativePath}`;
  } else if (isProductRoute) {
    return `${baseUrl}/api/v1/products/images/${relativePath}`;
  } else {
    // Default to events for backward compatibility
    return `${baseUrl}/api/v1/events/images/${relativePath}`;
  }
};

// Helper function to get relative path from absolute path
const getRelativePath = (absolutePath) => {
  const filesIndex = absolutePath.indexOf('files');
  return absolutePath.substring(filesIndex);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  generateFileUrl,
  getRelativePath
};
