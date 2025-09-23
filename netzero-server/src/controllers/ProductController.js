const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
const { generateFileUrl, getRelativePath } = require('../middleware/imageUpload');

class ProductController {
  // GET /api/v1/products - Get all products with optional filters
  static async getAllProducts(req, res) {
    try {
      const {
        category,
        type,
        isRecommend,
        inStock,
        limit,
        offset
      } = req.query;

      const filters = {};
      
      if (category) filters.category = category;
      if (type) filters.type = type;
      if (isRecommend !== undefined) filters.isRecommend = isRecommend === 'true';
      if (inStock === 'true') filters.inStock = true;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const products = await Product.findAll(filters);
      
      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: products.map(product => product.toJSON()),
        count: products.length,
        filters: filters,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/:id - Get product by ID
  static async getProductById(req, res) {
    try {
      const productId = req.params.id;
      
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getProductById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/products - Create a new product
  static async createProduct(req, res) {
    try {
      const {
        project_id,
        title,
        description,
        price,
        category,
        type,
        address,
        coordinate,
        stock_quantity,
        isRecommend
      } = req.body;

      // Validation
      if (!title || !description || !price || !category || !type) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: title, description, price, category, type',
          timestamp: new Date().toISOString()
        });
      }

      // Validate type
      const validTypes = ['market', 'willing', 'barter'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be one of: market, willing, barter',
          timestamp: new Date().toISOString()
        });
      }

      // Validate price
      if (isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number',
          timestamp: new Date().toISOString()
        });
      }

      const productData = {
        project_id,
        title,
        description,
        price: parseFloat(price),
        category,
        type,
        address,
        coordinate,
        stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
        isRecommend: isRecommend === true || isRecommend === 'true',
        user_id: req.user.userId // From auth middleware
      };

      const productId = await Product.create(productData);
      const newProduct = await Product.findById(productId);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in createProduct:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // PUT /api/v1/products/:id - Update product (only by owner or admin)
  static async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const {
        project_id,
        title,
        description,
        price,
        category,
        type,
        address,
        coordinate,
        stock_quantity,
        isRecommend
      } = req.body;

      // Validate type if provided
      if (type) {
        const validTypes = ['market', 'willing', 'barter'];
        if (!validTypes.includes(type)) {
          return res.status(400).json({
            success: false,
            message: 'Type must be one of: market, willing, barter',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Validate price if provided
      if (price !== undefined && (isNaN(price) || price < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number',
          timestamp: new Date().toISOString()
        });
      }

      const updateData = {};
      if (project_id !== undefined) updateData.project_id = project_id;
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (category) updateData.category = category;
      if (type) updateData.type = type;
      if (address !== undefined) updateData.address = address;
      if (coordinate !== undefined) updateData.coordinate = coordinate;
      if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);
      if (isRecommend !== undefined) updateData.isRecommend = isRecommend === true || isRecommend === 'true';

      // For admin, skip user ownership check
      if (isAdmin) {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found',
            timestamp: new Date().toISOString()
          });
        }

        // Admin can update any product directly
        const success = await Product.updateById(productId, updateData, product.user_id);
        if (!success) {
          return res.status(500).json({
            success: false,
            message: 'Failed to update product',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Regular user - check ownership in the model
        const success = await Product.updateById(productId, updateData, userId);
        if (!success) {
          return res.status(404).json({
            success: false,
            message: 'Product not found or access denied',
            timestamp: new Date().toISOString()
          });
        }
      }

      const updatedProduct = await Product.findById(productId);
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in updateProduct:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // DELETE /api/v1/products/:id - Delete product (only by owner or admin)
  static async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const success = await Product.deleteById(productId, userId, isAdmin);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or access denied',
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/my - Get current user's products
  static async getMyProducts(req, res) {
    try {
      const userId = req.user.userId;
      const { category, type } = req.query;

      const filters = {};
      if (category) filters.category = category;
      if (type) filters.type = type;

      const products = await Product.findByUserId(userId, filters);
      
      res.status(200).json({
        success: true,
        message: 'User products retrieved successfully',
        data: products.map(product => product.toJSON()),
        count: products.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getMyProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user products',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/search/:searchTerm - Search products
  static async searchProducts(req, res) {
    try {
      const searchTerm = req.params.searchTerm;
      const { category, type, inStock } = req.query;

      if (!searchTerm || searchTerm.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Search term is required',
          timestamp: new Date().toISOString()
        });
      }

      const filters = {};
      if (category) filters.category = category;
      if (type) filters.type = type;
      if (inStock === 'true') filters.inStock = true;

      const products = await Product.search(searchTerm, filters);
      
      res.status(200).json({
        success: true,
        message: `Products matching '${searchTerm}' retrieved successfully`,
        data: products.map(product => product.toJSON()),
        count: products.length,
        searchTerm: searchTerm,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in searchProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search products',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/recommended - Get recommended products
  static async getRecommendedProducts(req, res) {
    try {
      const products = await Product.findRecommended();
      
      res.status(200).json({
        success: true,
        message: 'Recommended products retrieved successfully',
        data: products.map(product => product.toJSON()),
        count: products.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getRecommendedProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommended products',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/type/:type - Get products by type
  static async getProductsByType(req, res) {
    try {
      const type = req.params.type;
      
      const validTypes = ['market', 'willing', 'barter'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be one of: market, willing, barter',
          timestamp: new Date().toISOString()
        });
      }

      const products = await Product.findByType(type);
      
      res.status(200).json({
        success: true,
        message: `Products of type '${type}' retrieved successfully`,
        data: products.map(product => product.toJSON()),
        count: products.length,
        type: type,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getProductsByType:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products by type',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/:id/thumbnail - Get product thumbnail image
  static async getProductThumbnail(req, res) {
    try {
      const productId = req.params.id;
      
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const thumbnailFileName = `thumbnail_${productId}.png`;
      const thumbnailPath = path.join(__dirname, '../../files/products/thumbnail', productId.toString(), thumbnailFileName);
      
      if (!fs.existsSync(thumbnailPath)) {
        return res.status(404).json({
          success: false,
          message: 'Thumbnail image file not found',
          timestamp: new Date().toISOString()
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
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
      console.error('Error in getProductThumbnail:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve thumbnail image',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/:id/cover - Get product cover image
  static async getProductCover(req, res) {
    try {
      const productId = req.params.id;
      
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const coverFileName = `cover_${productId}.png`;
      const coverPath = path.join(__dirname, '../../files/products/cover', productId.toString(), coverFileName);
      
      if (!fs.existsSync(coverPath)) {
        return res.status(404).json({
          success: false,
          message: 'Cover image file not found',
          timestamp: new Date().toISOString()
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
      res.sendFile(coverPath, (err) => {
        if (err) {
          console.error('Error sending cover image:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Failed to serve cover image',
              error: err.message,
              timestamp: new Date().toISOString()
            });
          }
        }
      });

    } catch (error) {
      console.error('Error in getProductCover:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cover image',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/:id/images/:imageId - Get product images
  static async getProductImages(req, res) {
    try {
      const productId = req.params.id;
      const imageId = req.params.imageId;
      
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      if (!imageId || isNaN(imageId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const imageFileName = `image_${imageId}.png`;
      const imagePath = path.join(__dirname, '../../files/products/images', productId.toString(), imageFileName);
      
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({
          success: false,
          message: 'Product image file not found',
          timestamp: new Date().toISOString()
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
      res.sendFile(imagePath, (err) => {
        if (err) {
          console.error('Error sending product image:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Failed to serve product image',
              error: err.message,
              timestamp: new Date().toISOString()
            });
          }
        }
      });

    } catch (error) {
      console.error('Error in getProductImages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product image',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/products/:id/upload/thumbnail - Upload product thumbnail
  static async uploadProductThumbnail(req, res) {
    try {
      const productId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if product exists and user has permission
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }

      if (!isAdmin && product.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only upload images for your own products.',
          timestamp: new Date().toISOString()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          timestamp: new Date().toISOString()
        });
      }

      // Rename file to standard format: thumbnail_{productId}.png
      const uploadedFilePath = req.file.path;
      const standardFileName = `thumbnail_${productId}.png`;
      const standardFilePath = path.join(path.dirname(uploadedFilePath), standardFileName);

      // Rename the uploaded file
      fs.renameSync(uploadedFilePath, standardFilePath);

      const fileUrl = generateFileUrl(req, getRelativePath(standardFilePath));

      res.status(200).json({
        success: true,
        message: 'Product thumbnail uploaded successfully',
        data: {
          productId: parseInt(productId),
          filename: standardFileName,
          path: getRelativePath(standardFilePath),
          url: fileUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in uploadProductThumbnail:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload thumbnail',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/products/:id/upload/cover - Upload product cover image
  static async uploadProductCover(req, res) {
    try {
      const productId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if product exists and user has permission
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }

      if (!isAdmin && product.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only upload images for your own products.',
          timestamp: new Date().toISOString()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          timestamp: new Date().toISOString()
        });
      }

      // Rename file to standard format: cover_{productId}.png
      const uploadedFilePath = req.file.path;
      const standardFileName = `cover_${productId}.png`;
      const standardFilePath = path.join(path.dirname(uploadedFilePath), standardFileName);

      // Rename the uploaded file
      fs.renameSync(uploadedFilePath, standardFilePath);

      const fileUrl = generateFileUrl(req, getRelativePath(standardFilePath));

      res.status(200).json({
        success: true,
        message: 'Product cover uploaded successfully',
        data: {
          productId: parseInt(productId),
          filename: standardFileName,
          path: getRelativePath(standardFilePath),
          url: fileUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in uploadProductCover:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload cover image',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/products/:id/upload/images - Upload product images
  static async uploadProductImages(req, res) {
    try {
      const productId = req.params.id;
      const userId = req.user.userId;
      const isAdmin = req.user.role === 'admin';

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if product exists and user has permission
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }

      if (!isAdmin && product.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only upload images for your own products.',
          timestamp: new Date().toISOString()
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
          timestamp: new Date().toISOString()
        });
      }

      const uploadedFiles = [];

      // Process each uploaded file
      req.files.forEach((file, index) => {
        const standardFileName = `image_${index + 1}.png`;
        const standardFilePath = path.join(path.dirname(file.path), standardFileName);

        // Rename the uploaded file
        fs.renameSync(file.path, standardFilePath);

        const fileUrl = generateFileUrl(req, getRelativePath(standardFilePath));

        uploadedFiles.push({
          filename: standardFileName,
          path: getRelativePath(standardFilePath),
          url: fileUrl,
          size: file.size,
          mimetype: file.mimetype,
          index: index + 1
        });
      });

      res.status(200).json({
        success: true,
        message: 'Product images uploaded successfully',
        data: {
          productId: parseInt(productId),
          files: uploadedFiles,
          totalFiles: uploadedFiles.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in uploadProductImages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload product images',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = ProductController;