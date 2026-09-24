const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config/env');

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

function getUploadRoot() {
  return path.isAbsolute(config.upload.dir)
    ? config.upload.dir
    : path.resolve(__dirname, '../../', config.upload.dir);
}

function getImageType(req) {
  if (req.originalUrl.includes('/upload/thumbnail')) return 'thumbnail';
  if (req.originalUrl.includes('/upload/cover')) return 'cover';
  if (req.originalUrl.includes('/upload/images')) return 'images';
  if (req.originalUrl.includes('/upload/posterImage')) return 'posterImage';
  return req.params.imageType || 'photos';
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const resource = req.originalUrl.includes('/products/') ? 'products' : 'events';
    const directory = path.join(getUploadRoot(), resource, getImageType(req), String(req.params.id));
    try {
      fs.mkdirSync(directory, { recursive: true });
      callback(null, directory);
    } catch (error) {
      callback(error);
    }
  },
  filename(req, file, callback) {
    callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, callback) {
    if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) return callback(null, true);
    return callback(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  },
  limits: {
    fileSize: config.upload.maxSize,
    files: config.upload.maxFiles
  }
});

function uploadSingle(fieldName) {
  return upload.single(fieldName);
}

function uploadMultiple(fieldName, maxCount = config.upload.maxFiles) {
  return upload.array(fieldName, maxCount);
}

function handleUploadError(error, req, res, next) {
  if (!error) return next();
  let message = 'File upload error';
  if (error.code === 'LIMIT_FILE_SIZE') {
    message = `File too large. Maximum size is ${Math.round(config.upload.maxSize / (1024 * 1024))}MB.`;
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    message = `Too many files. Maximum is ${config.upload.maxFiles} files.`;
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    message = `Unexpected field in file upload: ${error.field}`;
  } else if (error.message.startsWith('Invalid file type')) {
    message = error.message;
  }
  return res.status(400).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
}

module.exports = { uploadSingle, uploadMultiple, handleUploadError };
