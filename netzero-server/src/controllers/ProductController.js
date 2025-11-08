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
      
      // Validate and set limit with proper error handling
      if (limit) {
        const parsedLimit = parseInt(limit);
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid limit parameter: must be a positive integer',
            timestamp: new Date().toISOString()
          });
        }
        filters.limit = parsedLimit;
      }
      
      // Validate and set offset with proper error handling
      if (offset) {
        const parsedOffset = parseInt(offset);
        if (isNaN(parsedOffset) || parsedOffset < 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid offset parameter: must be a non-negative integer',
            timestamp: new Date().toISOString()
          });
        }
        filters.offset = parsedOffset;
      }

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
      const userRole = req.user.role;
      const isAdmin = userRole === 'admin';
      const isCommunityHead = userRole === 'community_head';

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
        // Regular user or community_head - check ownership in the model
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

  // DELETE /api/v1/products/:id - Delete product (only by owner, community_head, or admin)
  static async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      const userId = req.user.userId;
      const userRole = req.user.role;
      const isAdmin = userRole === 'admin';

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

  // GET /api/v1/products/:id/images - Get all product images metadata
  static async getAllProductImages(req, res) {
    try {
      const productId = req.params.id;
      
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }

      const imagesDir = path.join(__dirname, '../../files/products/images', productId.toString());
      const images = [];

      // Check if images directory exists
      if (fs.existsSync(imagesDir)) {
        // Read all files in the images directory
        const files = fs.readdirSync(imagesDir);
        
        // Filter and process image files
        const imageFiles = files.filter(file => file.match(/^image_(\d+)\.png$/));
        
        for (const file of imageFiles) {
          const imageIdMatch = file.match(/^image_(\d+)\.png$/);
          if (imageIdMatch) {
            const imageId = parseInt(imageIdMatch[1]);
            const filePath = path.join(imagesDir, file);
            const stats = fs.statSync(filePath);
            
            images.push({
              imageId: imageId,
              filename: file,
              url: `${req.protocol}://${req.get('host')}/api/v1/products/${productId}/images/${imageId}`,
              size: stats.size,
              exists: true,
              lastModified: stats.mtime
            });
          }
        }
        
        // Sort images by imageId
        images.sort((a, b) => a.imageId - b.imageId);
      }

      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');

      res.status(200).json({
        success: true,
        message: 'Product images metadata retrieved successfully',
        data: {
          productId: parseInt(productId),
          images: images,
          totalImages: images.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getAllProductImages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product images metadata',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/products/:id/images/:imageId - Get specific product image
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
    console.log('\n🔵 === THUMBNAIL UPLOAD REQUEST START ===');
    console.log('📋 Request Details:', {
      productId: req.params.id,
      userId: req.user?.userId,
      userRole: req.user?.role,
      hasFile: !!req.file,
      contentType: req.headers['content-type'],
      url: req.originalUrl,
      method: req.method
    });

    try {
      const productId = req.params.id;
      const userId = req.user.userId;
      const userRole = req.user.role;
      const isAdmin = userRole === 'admin';

      console.log('✅ Step 1: Validating product ID...');
      if (!productId || isNaN(productId)) {
        console.error('❌ FAIL: Invalid product ID:', productId);
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
          timestamp: new Date().toISOString()
        });
      }
      console.log('✅ Product ID valid:', productId);

      // Check if product exists and user has permission
      console.log('✅ Step 2: Checking if product exists...');
      const product = await Product.findById(productId);
      if (!product) {
        console.error('❌ FAIL: Product not found with ID:', productId);
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          timestamp: new Date().toISOString()
        });
      }
      console.log('✅ Product found:', { id: product.id, user_id: product.user_id, name: product.name });

      // Allow admin, community_head, and product owner
      console.log('✅ Step 3: Checking permissions...');
      console.log('Permission check:', { isAdmin, productOwnerId: product.user_id, requestUserId: userId });
      if (!isAdmin && product.user_id !== userId) {
        console.error('❌ FAIL: Access denied. User', userId, 'is not owner of product owned by', product.user_id);
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only upload images for your own products.',
          timestamp: new Date().toISOString()
        });
      }
      console.log('✅ User has permission to upload');

      console.log('✅ Step 4: Checking uploaded file...');
      if (!req.file) {
        console.error('❌ FAIL: No file in request');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          timestamp: new Date().toISOString()
        });
      }
      console.log('✅ File received:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });

      // Rename file to standard format: thumbnail_{productId}.png
      console.log('✅ Step 5: Renaming file to standard format...');
      const uploadedFilePath = req.file.path;
      const standardFileName = `thumbnail_${productId}.png`;
      const standardFilePath = path.join(path.dirname(uploadedFilePath), standardFileName);
      
      console.log('File paths:', {
        uploaded: uploadedFilePath,
        standard: standardFilePath,
        directory: path.dirname(uploadedFilePath)
      });

      // Check if directory exists
      if (!fs.existsSync(path.dirname(uploadedFilePath))) {
        console.error('❌ FAIL: Upload directory does not exist:', path.dirname(uploadedFilePath));
        throw new Error('Upload directory does not exist');
      }

      // Rename the uploaded file
      try {
        fs.renameSync(uploadedFilePath, standardFilePath);
        console.log('✅ File renamed successfully');
      } catch (renameError) {
        console.error('❌ FAIL: Error renaming file:', renameError);
        throw renameError;
      }

      console.log('✅ Step 6: Generating file URL...');
      const fileUrl = generateFileUrl(req, getRelativePath(standardFilePath));
      console.log('✅ File URL generated:', fileUrl);

      const responseData = {
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
      };

      console.log('✅ SUCCESS: Thumbnail upload completed');
      console.log('Response data:', responseData);
      console.log('🔵 === THUMBNAIL UPLOAD REQUEST END ===\n');

      res.status(200).json(responseData);

    } catch (error) {
      console.error('❌ ERROR in uploadProductThumbnail:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        path: error.path
      });
      console.log('🔵 === THUMBNAIL UPLOAD REQUEST END (ERROR) ===\n');

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
      const userRole = req.user.role;
      const isAdmin = userRole === 'admin';

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

      // Allow admin, community_head, and product owner
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
      const userRole = req.user.role;
      const isAdmin = userRole === 'admin';

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

      // Allow admin, community_head, and product owner
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