const { executeQuery, executeCommand } = require('../config/database');
const { ensureModelTable } = require('../utils/databaseEnsure');

class EventProduct {
  // Database schema definition
  static getSchema() {
    return {
      tableName: 'event_products',
      columns: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        event_id: 'INT NOT NULL',
        product_id: 'INT NOT NULL',
        event_price: 'DECIMAL(10, 2) NOT NULL',
        stock_quantity: 'INT DEFAULT 0',
        status: "ENUM('pending', 'confirmed') NOT NULL DEFAULT 'pending'",
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'UNIQUE KEY unique_event_product (event_id, product_id)',
        'FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE',
        'FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE'
      ],
      indexes: [
        'INDEX idx_event_products_event_id (event_id)',
        'INDEX idx_event_products_product_id (product_id)',
        'INDEX idx_event_products_status (status)'
      ]
    };
  }

  // Ensure table exists before any operations
  static async ensureTable() {
    return await ensureModelTable(EventProduct.getSchema());
  }

  constructor(data) {
    this.id = data.id;
    this.event_id = data.event_id;
    this.product_id = data.product_id;
    this.event_price = data.event_price;
    this.stock_quantity = data.stock_quantity;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      event_id: this.event_id,
      product_id: this.product_id,
      event_price: parseFloat(this.event_price),
      stock_quantity: this.stock_quantity,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Create a new event product
  static async create(eventProductData) {
    await EventProduct.ensureTable();
    
    const {
      event_id,
      product_id,
      event_price,
      stock_quantity = 0,
      status = 'pending'
    } = eventProductData;

    const query = `
      INSERT INTO event_products (
        event_id, product_id, event_price, stock_quantity, status
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await executeCommand(query, [
      event_id,
      product_id,
      event_price,
      stock_quantity,
      status
    ]);

    return result.insertId;
  }

  // Find event product by ID
  static async findById(id) {
    await EventProduct.ensureTable();
    
    const query = `
      SELECT ep.*, 
             e.title AS event_title, e.event_date, e.location AS event_location, e.status AS event_status,
             p.title AS product_title, p.description AS product_description, p.category AS product_category
      FROM event_products ep
      LEFT JOIN events e ON ep.event_id = e.id
      LEFT JOIN products p ON ep.product_id = p.id
      WHERE ep.id = ?
    `;

    const rows = await executeQuery(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }

    return new EventProduct(rows[0]);
  }

  // Find all event products with optional filters
  static async findAll(filters = {}) {
    await EventProduct.ensureTable();
    
    let query = `
      SELECT ep.*, 
             e.title AS event_title, e.event_date, e.location AS event_location, e.status AS event_status,
             p.title AS product_title, p.description AS product_description, p.category AS product_category
      FROM event_products ep
      LEFT JOIN events e ON ep.event_id = e.id
      LEFT JOIN products p ON ep.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.event_id) {
      query += ' AND ep.event_id = ?';
      params.push(filters.event_id);
    }

    if (filters.product_id) {
      query += ' AND ep.product_id = ?';
      params.push(filters.product_id);
    }

    if (filters.status) {
      query += ' AND ep.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY ep.created_at DESC';

    const rows = await executeQuery(query, params);
    return rows.map(row => new EventProduct(row));
  }

  // Get all events for a specific product
  static async getEventsByProductId(productId) {
    await EventProduct.ensureTable();
    
    const query = `
      SELECT 
        e.id AS event_id,
        e.title AS event_title,
        e.event_date,
        e.location,
        e.status,
        ep.event_price,
        ep.stock_quantity,
        ep.status AS event_product_status,
        ep.id AS event_product_id
      FROM event_products ep
      JOIN events e ON ep.event_id = e.id
      WHERE ep.product_id = ?
      ORDER BY e.event_date ASC
    `;

    const rows = await executeQuery(query, [productId]);
    return rows;
  }

  // Get all products for a specific event
  static async getProductsByEventId(eventId) {
    await EventProduct.ensureTable();
    
    const query = `
      SELECT 
        p.id AS product_id,
        p.title AS product_title,
        p.description,
        p.category,
        p.price AS original_price,
        ep.event_price,
        ep.stock_quantity,
        ep.status AS event_product_status,
        ep.id AS event_product_id
      FROM event_products ep
      JOIN products p ON ep.product_id = p.id
      WHERE ep.event_id = ?
      ORDER BY ep.created_at DESC
    `;

    const rows = await executeQuery(query, [eventId]);
    return rows;
  }

  // Update event product
  static async updateById(id, eventProductData) {
    await EventProduct.ensureTable();
    
    const {
      event_price,
      stock_quantity,
      status
    } = eventProductData;

    const query = `
      UPDATE event_products 
      SET event_price = ?, stock_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await executeCommand(query, [
      event_price,
      stock_quantity,
      status,
      id
    ]);

    return result.affectedRows > 0;
  }

  // Delete event product
  static async deleteById(id) {
    await EventProduct.ensureTable();
    
    const query = 'DELETE FROM event_products WHERE id = ?';
    const [result] = await executeCommand(query, [id]);
    
    return result.affectedRows > 0;
  }

  // Check if event product already exists
  static async findByEventAndProduct(eventId, productId) {
    await EventProduct.ensureTable();
    
    const query = `
      SELECT * FROM event_products 
      WHERE event_id = ? AND product_id = ?
    `;

    const rows = await executeQuery(query, [eventId, productId]);
    
    if (rows.length === 0) {
      return null;
    }

    return new EventProduct(rows[0]);
  }
}

module.exports = EventProduct;
