/**
 * Example: How to add a new model with database ensure functionality
 * 
 * This example shows how to:
 * 1. Define a table schema in the model
 * 2. Create a model that uses the ensure utility
 * 3. Integrate with the existing system
 */

// ========================================
// Step 1: Create the model with schema
// ========================================

const { executeQuery, executeCommand } = require('../config/database');
const { ensureModelTable } = require('../utils/databaseEnsure');

class Notification {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.is_read = data.is_read;
    this.metadata = data.metadata;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Database schema definition - DEFINE THIS IN THE MODEL
  static getSchema() {
    return {
      tableName: 'notifications',
      columns: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        user_id: 'INT NOT NULL',
        type: "ENUM('info', 'warning', 'success', 'error') DEFAULT 'info'",
        title: 'VARCHAR(255) NOT NULL',
        message: 'TEXT NOT NULL',
        is_read: 'BOOLEAN DEFAULT FALSE',
        metadata: 'JSON NULL',
        expires_at: 'DATETIME NULL',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
      ],
      indexes: [
        'INDEX idx_notifications_user_id (user_id)',
        'INDEX idx_notifications_type (type)',
        'INDEX idx_notifications_is_read (is_read)',
        'INDEX idx_notifications_created_at (created_at)',
        'INDEX idx_notifications_expires_at (expires_at)'
      ]
    };
  }

  // Ensure table exists before any operations
  static async ensureTable() {
    return await ensureModelTable(Notification.getSchema());
  }

  // Create a new notification
  static async create(notificationData) {
    // Ensure table exists
    await Notification.ensureTable();
    
    const {
      user_id,
      type = 'info',
      title,
      message,
      metadata = null,
      expires_at = null
    } = notificationData;

    const query = `
      INSERT INTO notifications (user_id, type, title, message, metadata, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await executeCommand(query, [
      user_id,
      type,
      title,
      message,
      metadata ? JSON.stringify(metadata) : null,
      expires_at
    ]);

    return result.insertId;
  }

  // Find all notifications for a user
  static async findByUserId(userId, filters = {}) {
    // Ensure table exists
    await Notification.ensureTable();
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    const params = [userId];

    if (filters.unreadOnly) {
      query += ' AND is_read = FALSE';
    }

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    // Exclude expired notifications
    query += ' AND (expires_at IS NULL OR expires_at > NOW())';
    
    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => {
      // Parse JSON metadata
      if (row.metadata) {
        try {
          row.metadata = JSON.parse(row.metadata);
        } catch (e) {
          row.metadata = null;
        }
      }
      return new Notification(row);
    });
  }

  // Mark notification as read
  static async markAsRead(id, userId) {
    // Ensure table exists
    await Notification.ensureTable();
    
    const query = `
      UPDATE notifications 
      SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    const [result] = await executeCommand(query, [id, userId]);
    return result.affectedRows > 0;
  }

  // Delete expired notifications
  static async deleteExpired() {
    // Ensure table exists
    await Notification.ensureTable();
    
    const query = `
      DELETE FROM notifications 
      WHERE expires_at IS NOT NULL AND expires_at <= NOW()
    `;

    const [result] = await executeCommand(query);
    return result.affectedRows;
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      type: this.type,
      title: this.title,
      message: this.message,
      is_read: this.is_read,
      metadata: this.metadata,
      expires_at: this.expires_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

// ========================================
// Step 3: Usage examples
// ========================================

/*
// Create a notification
const notificationId = await Notification.create({
  user_id: 1,
  type: 'success',
  title: 'Order Confirmed',
  message: 'Your order has been confirmed and is being processed.',
  metadata: { order_id: 123, product_name: 'Organic Apples' },
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
});

// Get unread notifications
const unreadNotifications = await Notification.findByUserId(1, { 
  unreadOnly: true, 
  limit: 10 
});

// Mark as read
await Notification.markAsRead(notificationId, 1);

// Cleanup expired notifications (can be run as a cron job)
const deletedCount = await Notification.deleteExpired();
*/

// ========================================
// Step 4: Integration steps
// ========================================

/*
1. Create the model file: src/models/Notification.js (with getSchema() method)
2. Add the model import to src/initDatabase.js in getAllModelSchemas()
3. Create routes: src/routes/notificationRoutes.js
4. Create controller: src/controllers/NotificationController.js
5. Add routes to server.js:
   app.use(`${API_PREFIX}/${API_VERSION}/notifications`, notificationRoutes);
6. Test the functionality:
   npm run db:test
   
Key benefits of this approach:
- Schema is defined next to the model logic (better maintainability)
- No need to modify databaseEnsure.js for new models
- Each model owns its schema definition
- Easy to see what table structure a model expects
- Schema changes are version-controlled with the model
*/

module.exports = Notification;