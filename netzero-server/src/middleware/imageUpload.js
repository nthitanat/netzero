const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for both events and products
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('🟡 Multer: Processing file destination...');
    const id = req.params.id;
    
    // Extract image type from the URL path
    let imageType = 'photos'; // default
    
    if (req.originalUrl.includes('/upload/thumbnail')) {
      imageType = 'thumbnail';
    } else if (req.originalUrl.includes('/upload/cover')) {
      imageType = 'cover';
    } else if (req.originalUrl.includes('/upload/images')) {
      imageType = 'images';
    } else if (req.originalUrl.includes('/upload/posterImage')) {
      imageType = 'posterImage';
    } else if (req.params.imageType) {
      // Fallback to route parameter if available
      imageType = req.params.imageType;
    }
    
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
    
    console.log('🟡 Multer: Upload path details:', {
      id,
      imageType,
      isEventRoute,
      isProductRoute,
      url: req.originalUrl,
      uploadPath
    });
    
    // Create directory if it doesn't exist
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Multer: Directory created/verified:', uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      console.error('❌ Multer: Failed to create directory:', error);
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}_${timestamp}${ext}`;
    
    console.log('🟡 Multer: Generating filename:', {
      original: file.originalname,
      generated: filename,
      mimetype: file.mimetype,
      size: file.size
    });
    
    cb(null, filename);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  console.log('🟡 Multer: Filtering file type:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ Multer: File type accepted');
    cb(null, true);
  } else {
    console.error('❌ Multer: Invalid file type rejected:', file.mimetype);
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
  if (!error) {
    return next();
  }

  console.error('❌ Multer Upload Error:', {
    message: error.message,
    code: error.code,
    field: error.field,
    type: error.constructor.name,
    url: req.originalUrl
  });

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      console.error('❌ File size limit exceeded');
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      console.error('❌ File count limit exceeded');
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.',
        error: error.message
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      console.error('❌ Unexpected file field:', error.field);
      return res.status(400).json({
        success: false,
        message: `Unexpected field in file upload: ${error.field}. Expected field name may be different.`,
        error: error.message,
        hint: 'Check that the form field name matches the server expectation'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    console.error('❌ Invalid file type');
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  console.error('❌ Generic upload error:', error);
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
