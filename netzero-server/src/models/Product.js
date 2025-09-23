const { pool } = require('../config/database');

class Product {
  constructor(data) {
    this.id = data.id;
    this.project_id = data.project_id;
    this.title = data.title;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.type = data.type;
    this.address = data.address;
    this.coordinate = data.coordinate;
    this.stock_quantity = data.stock_quantity;
    this.isRecommend = data.isRecommend;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.user_id = data.user_id; // Product owner
  }

  // Create a new product
  static async create(productData) {
    const {
      project_id,
      title,
      description,
      price,
      category,
      type,
      address,
      coordinate,
      stock_quantity = 0,
      isRecommend = false,
      user_id
    } = productData;

    const query = `
      INSERT INTO products (
        project_id, title, description, price, category, type, 
        address, coordinate, stock_quantity, isRecommend, user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      project_id || null,
      title,
      description,
      price,
      category,
      type,
      address || null,
      coordinate || null,
      stock_quantity,
      isRecommend ? 1 : 0,
      user_id
    ]);

    return result.insertId;
  }

  // Find all products with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.firstName, u.lastName, u.email as owner_email
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }

    if (filters.type) {
      query += ' AND p.type = ?';
      params.push(filters.type);
    }

    if (filters.isRecommend !== undefined) {
      query += ' AND p.isRecommend = ?';
      params.push(filters.isRecommend ? 1 : 0);
    }

    if (filters.user_id) {
      query += ' AND p.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.inStock) {
      query += ' AND p.stock_quantity > 0';
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);

      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const [rows] = await pool.execute(query, params);
    return rows.map(row => new Product(row));
  }

  // Find product by ID
  static async findById(id) {
    const query = `
      SELECT p.*, u.firstName, u.lastName, u.email as owner_email
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;

    const [rows] = await pool.execute(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }

    return new Product(rows[0]);
  }

  // Find products by user ID (for seller dashboard)
  static async findByUserId(userId, filters = {}) {
    let query = `
      SELECT p.*, u.firstName, u.lastName, u.email as owner_email
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `;
    const params = [userId];

    if (filters.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }

    if (filters.type) {
      query += ' AND p.type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows.map(row => new Product(row));
  }

  // Search products by title
  static async search(searchTerm, filters = {}) {
    let query = `
      SELECT p.*, u.firstName, u.lastName, u.email as owner_email
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE (p.title LIKE ? OR p.description LIKE ?)
    `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];

    if (filters.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }

    if (filters.type) {
      query += ' AND p.type = ?';
      params.push(filters.type);
    }

    if (filters.inStock) {
      query += ' AND p.stock_quantity > 0';
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows.map(row => new Product(row));
  }

  // Get recommended products
  static async findRecommended() {
    const query = `
      SELECT p.*, u.firstName, u.lastName, u.email as owner_email
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.isRecommend = 1
      ORDER BY p.created_at DESC
    `;

    const [rows] = await pool.execute(query);
    return rows.map(row => new Product(row));
  }

  // Update product
  static async updateById(id, productData, userId) {
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
    } = productData;

    // First check if the product belongs to the user
    const product = await Product.findById(id);
    if (!product || product.user_id !== userId) {
      throw new Error('Product not found or access denied');
    }

    const query = `
      UPDATE products 
      SET project_id = ?, title = ?, description = ?, price = ?, 
          category = ?, type = ?, address = ?, coordinate = ?, 
          stock_quantity = ?, isRecommend = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    const [result] = await pool.execute(query, [
      project_id || null,
      title,
      description,
      price,
      category,
      type,
      address || null,
      coordinate || null,
      stock_quantity,
      isRecommend ? 1 : 0,
      id,
      userId
    ]);

    return result.affectedRows > 0;
  }

  // Delete product (only by owner or admin)
  static async deleteById(id, userId, isAdmin = false) {
    // First check if the product belongs to the user (unless admin)
    if (!isAdmin) {
      const product = await Product.findById(id);
      if (!product || product.user_id !== userId) {
        throw new Error('Product not found or access denied');
      }
    }

    const query = 'DELETE FROM products WHERE id = ?';
    const [result] = await pool.execute(query, [id]);

    return result.affectedRows > 0;
  }

  // Update stock quantity (for reservation confirmations)
  static async updateStockQuantity(id, quantity) {
    const query = `
      UPDATE products 
      SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [quantity, id]);
    return result.affectedRows > 0;
  }

  // Reduce stock quantity (when reservation is confirmed)
  static async reduceStock(id, quantity) {
    const query = `
      UPDATE products 
      SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND stock_quantity >= ?
    `;

    const [result] = await pool.execute(query, [quantity, id, quantity]);
    return result.affectedRows > 0;
  }

  // Get products by type (market, willing, barter)
  static async findByType(type) {
    const query = `
      SELECT p.*, u.firstName, u.lastName, u.email as owner_email
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.type = ?
      ORDER BY p.created_at DESC
    `;

    const [rows] = await pool.execute(query, [type]);
    return rows.map(row => new Product(row));
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      id: this.id,
      project_id: this.project_id,
      title: this.title,
      description: this.description,
      price: this.price,
      category: this.category,
      type: this.type,
      address: this.address,
      coordinate: this.coordinate,
      stock_quantity: this.stock_quantity,
      isRecommend: this.isRecommend,
      created_at: this.created_at,
      updated_at: this.updated_at,
      user_id: this.user_id,
      owner: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.owner_email
      }
    };
  }
}

module.exports = Product;