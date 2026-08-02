const { pool } = require('../config/database');

class ProductReservation {
  // Database schema definition
  static getSchema() {
    return {
      tableName: 'product_reservations',
      columns: {
        reservation_id: 'INT AUTO_INCREMENT PRIMARY KEY',
        user_id: 'INT NOT NULL',
        product_id: 'INT NOT NULL',
        event_id: 'INT NULL COMMENT \'Event where product was reserved, if applicable\'',
        quantity: 'INT NOT NULL',
        reserved_unit_price: 'DECIMAL(10,2) NOT NULL COMMENT \'Price per unit at time of reservation\'',
        note: 'TEXT NULL',
        shipping_address: 'TEXT NULL',
        option_of_delivery: "ENUM('pickup','delivery','event') NOT NULL DEFAULT 'delivery'",
        user_note: 'TEXT NULL',
        seller_note: 'TEXT NULL',
        pickup_date: 'DATETIME NULL',
        status: "ENUM('pending','confirmed','cancelled') DEFAULT 'pending'",
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE',
        'FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL'
      ],
      indexes: [
        'INDEX idx_reservations_user_id (user_id)',
        'INDEX idx_reservations_product_id (product_id)',
        'INDEX idx_reservations_event_id (event_id)',
        'INDEX idx_reservations_status (status)',
        'INDEX idx_reservations_created_at (created_at)',
        'INDEX idx_pickup_date (pickup_date)',
        'INDEX idx_option_of_delivery (option_of_delivery)'
      ]
    };
  }

  constructor(data) {
    this.reservation_id = data.reservation_id;
    this.user_id = data.user_id;
    this.product_id = data.product_id;
    this.event_id = data.event_id;
    this.quantity = data.quantity;
    this.reserved_unit_price = data.reserved_unit_price;
    this.note = data.note;
    this.shipping_address = data.shipping_address;
    this.option_of_delivery = data.option_of_delivery;
    this.user_note = data.user_note;
    this.seller_note = data.seller_note;
    this.pickup_date = data.pickup_date;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new reservation
  static async create(reservationData) {
    const {
      user_id,
      product_id,
      event_id,
      quantity,
      reserved_unit_price,
      note,
      shipping_address,
      option_of_delivery = 'delivery',
      user_note,
      pickup_date,
      status = 'pending'
    } = reservationData;

    const query = `
      INSERT INTO product_reservations (user_id, product_id, event_id, quantity, reserved_unit_price, note, shipping_address, option_of_delivery, user_note, pickup_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      user_id,
      product_id,
      event_id || null,
      quantity,
      reserved_unit_price,
      note || null,
      shipping_address || null,
      option_of_delivery,
      user_note || null,
      pickup_date || null,
      status
    ]);

    return result.insertId;
  }

  // Find all reservations with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        pr.*,
        p.title as product_title,
        p.price as product_price,
        p.type as product_type,
        p.user_id as product_owner_id,
        u.firstName as customer_firstName,
        u.lastName as customer_lastName,
        u.email as customer_email,
        u.phoneNumber as customer_phone,
        owner.firstName as owner_firstName,
        owner.lastName as owner_lastName,
        owner.email as owner_email,
        e.id as event_id,
        e.title as event_title,
        e.location as event_location,
        e.event_date as event_date
      FROM product_reservations pr
      LEFT JOIN products p ON pr.product_id = p.id
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN users owner ON p.user_id = owner.id
      LEFT JOIN events e ON pr.event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND pr.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.product_id) {
      query += ' AND pr.product_id = ?';
      params.push(filters.product_id);
    }

    if (filters.product_owner_id) {
      query += ' AND p.user_id = ?';
      params.push(filters.product_owner_id);
    }

    if (filters.status) {
      query += ' AND pr.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY pr.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);

      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const [rows] = await pool.execute(query, params);
    return rows.map(row => ({
      ...new ProductReservation(row),
      product: {
        id: row.product_id,
        title: row.product_title,
        price: row.product_price,
        type: row.product_type,
        owner_id: row.product_owner_id
      },
      customer: {
        firstName: row.customer_firstName,
        lastName: row.customer_lastName,
        email: row.customer_email,
        phone: row.customer_phone
      },
      owner: {
        firstName: row.owner_firstName,
        lastName: row.owner_lastName,
        email: row.owner_email
      },
      event: row.event_id ? {
        id: row.event_id,
        title: row.event_title,
        location: row.event_location,
        event_date: row.event_date
      } : null
    }));
  }

  // Find reservation by ID
  static async findById(reservationId) {
    const query = `
      SELECT 
        pr.*,
        p.title as product_title,
        p.price as product_price,
        p.type as product_type,
        p.user_id as product_owner_id,
        u.firstName as customer_firstName,
        u.lastName as customer_lastName,
        u.email as customer_email,
        u.phoneNumber as customer_phone,
        owner.firstName as owner_firstName,
        owner.lastName as owner_lastName,
        owner.email as owner_email,
        e.id as event_id,
        e.title as event_title,
        e.location as event_location,
        e.event_date as event_date
      FROM product_reservations pr
      LEFT JOIN products p ON pr.product_id = p.id
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN users owner ON p.user_id = owner.id
      LEFT JOIN events e ON pr.event_id = e.id
      WHERE pr.reservation_id = ?
    `;

    const [rows] = await pool.execute(query, [reservationId]);
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...new ProductReservation(row),
      product: {
        id: row.product_id,
        title: row.product_title,
        price: row.product_price,
        type: row.product_type,
        owner_id: row.product_owner_id
      },
      customer: {
        firstName: row.customer_firstName,
        lastName: row.customer_lastName,
        email: row.customer_email,
        phone: row.customer_phone
      },
      owner: {
        firstName: row.owner_firstName,
        lastName: row.owner_lastName,
        email: row.owner_email
      },
      event: row.event_id ? {
        id: row.event_id,
        title: row.event_title,
        location: row.event_location,
        event_date: row.event_date
      } : null
    };
  }

  // Find reservations by user ID (customer's reservations)
  static async findByUserId(userId) {
    return ProductReservation.findAll({ user_id: userId });
  }

  // Find reservations for products owned by a user (seller's reservations)
  static async findByProductOwnerId(ownerId) {
    return ProductReservation.findAll({ product_owner_id: ownerId });
  }

  // Find reservations by product ID
  static async findByProductId(productId) {
    return ProductReservation.findAll({ product_id: productId });
  }

  // Update reservation status
  static async updateStatus(reservationId, status, userId, isAdmin = false) {
    // First check permissions
    const reservation = await ProductReservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Only product owner or admin can update status
    if (!isAdmin && reservation.product.owner_id !== userId) {
      throw new Error('Access denied. Only product owner can update reservation status');
    }

    const query = `
      UPDATE product_reservations 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE reservation_id = ?
    `;

    const [result] = await pool.execute(query, [status, reservationId]);
    return result.affectedRows > 0;
  }

  // Update reservation details
  static async updateById(reservationId, updateData, userId) {
    const { 
      quantity, 
      note, 
      shipping_address, 
      option_of_delivery,
      user_note,
      seller_note,
      pickup_date,
      status 
    } = updateData;

    // First check if the reservation belongs to the user or if user is the product owner
    const reservation = await ProductReservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // User can update their own reservations or product owner can update reservations for their products
    if (reservation.user_id !== userId && reservation.product.owner_id !== userId) {
      throw new Error('Access denied');
    }

    const query = `
      UPDATE product_reservations 
      SET quantity = ?, note = ?, shipping_address = ?, option_of_delivery = ?, user_note = ?, seller_note = ?, pickup_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE reservation_id = ?
    `;

    const [result] = await pool.execute(query, [
      quantity,
      note || null,
      shipping_address || null,
      option_of_delivery || 'delivery',
      user_note || null,
      seller_note || null,
      pickup_date || null,
      status,
      reservationId
    ]);

    return result.affectedRows > 0;
  }

  // Delete reservation
  static async deleteById(reservationId, userId, isAdmin = false) {
    // First check permissions
    const reservation = await ProductReservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // User can delete their own reservations, product owner can delete reservations for their products, or admin can delete any
    if (!isAdmin && reservation.user_id !== userId && reservation.product.owner_id !== userId) {
      throw new Error('Access denied');
    }

    const query = 'DELETE FROM product_reservations WHERE reservation_id = ?';
    const [result] = await pool.execute(query, [reservationId]);

    return result.affectedRows > 0;
  }

  // Confirm reservation and reduce stock
  static async confirmReservation(reservationId, userId, isAdmin = false) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get reservation details
      const reservation = await ProductReservation.findById(reservationId);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Check permissions (only product owner or admin can confirm)
      if (!isAdmin && reservation.product.owner_id !== userId) {
        throw new Error('Access denied. Only product owner can confirm reservations');
      }

      // Check if reservation is still pending
      if (reservation.status !== 'pending') {
        throw new Error('Only pending reservations can be confirmed');
      }

      // Get current product stock
      const [productRows] = await connection.execute(
        'SELECT stock_quantity FROM products WHERE id = ?',
        [reservation.product_id]
      );

      if (productRows.length === 0) {
        throw new Error('Product not found');
      }

      const currentStock = productRows[0].stock_quantity;

      // Check if sufficient stock is available
      if (currentStock < reservation.quantity) {
        throw new Error('Insufficient stock available');
      }

      // Update reservation status to confirmed
      await connection.execute(
        'UPDATE product_reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE reservation_id = ?',
        ['confirmed', reservationId]
      );

      // Reduce product stock (always)
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [reservation.quantity, reservation.product_id]
      );

      // If reservation is for an event, reduce event_product stock_quantity
      // If NOT for an event, reduce unassigned_stock_quantity
      if (reservation.event_id) {
        // Event delivery - reduce event product stock
        const [eventProductRows] = await connection.execute(
          'SELECT stock_quantity FROM event_products WHERE event_id = ? AND product_id = ?',
          [reservation.event_id, reservation.product_id]
        );

        if (eventProductRows.length > 0) {
          const eventStock = eventProductRows[0].stock_quantity;
          
          // Check if sufficient event stock is available
          if (eventStock < reservation.quantity) {
            throw new Error('Insufficient event stock available');
          }

          // Reduce event_product stock
          await connection.execute(
            'UPDATE event_products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ? AND product_id = ?',
            [reservation.quantity, reservation.event_id, reservation.product_id]
          );
        } else {
          throw new Error('Event product assignment not found');
        }
      } else {
        // Pickup or delivery - reduce unassigned stock
        await connection.execute(
          'UPDATE products SET unassigned_stock_quantity = unassigned_stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [reservation.quantity, reservation.product_id]
        );
      }

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Cancel reservation (by customer or product owner)
  static async cancelReservation(reservationId, userId, isAdmin = false) {
    const reservation = await ProductReservation.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // User can cancel their own reservations, product owner can cancel reservations for their products, or admin can cancel any
    if (!isAdmin && reservation.user_id !== userId && reservation.product.owner_id !== userId) {
      throw new Error('Access denied');
    }

    // Can only cancel pending reservations
    if (reservation.status !== 'pending') {
      throw new Error('Only pending reservations can be cancelled');
    }

    const query = `
      UPDATE product_reservations 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE reservation_id = ?
    `;

    const [result] = await pool.execute(query, [reservationId]);
    return result.affectedRows > 0;
  }

  // Get reservation statistics for a product owner
  static async getOwnerStats(ownerId) {
    const query = `
      SELECT 
        COUNT(*) as total_reservations,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
      FROM product_reservations pr
      LEFT JOIN products p ON pr.product_id = p.id
      WHERE p.user_id = ?
    `;

    const [rows] = await pool.execute(query, [ownerId]);
    return rows[0];
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      reservation_id: this.reservation_id,
      user_id: this.user_id,
      product_id: this.product_id,
      quantity: this.quantity,
      note: this.note,
      shipping_address: this.shipping_address,
      option_of_delivery: this.option_of_delivery,
      user_note: this.user_note,
      seller_note: this.seller_note,
      pickup_date: this.pickup_date,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = ProductReservation;