const { pool } = require('../config/database');

class ChatApp {
  constructor(data = {}) {
    this.id = data.id || null;
    this.owner_id = data.owner_id || null;
    this.product_id = data.product_id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.status = data.status || 'active';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Get all chat applications
  static async getAll(filters = {}) {
    try {
      // Simplified query without JOINs
      let query = `
        SELECT 
          c.id,
          c.owner_id,
          c.product_id,
          c.title,
          c.description,
          c.status,
          c.isActive,
          c.createdAt,
          c.updatedAt
        FROM chatApps c
        WHERE c.isActive = ?
      `;

      const params = [1];

      // Add filters with proper type conversion
      if (filters.owner_id && filters.owner_id !== 'undefined' && filters.owner_id !== '') {
        query += ' AND c.owner_id = ?';
        params.push(parseInt(filters.owner_id));
      }

      if (filters.product_id && filters.product_id !== 'undefined' && filters.product_id !== '') {
        query += ' AND c.product_id = ?';
        params.push(parseInt(filters.product_id));
      }

      if (filters.status && filters.status !== 'undefined' && filters.status !== '' && filters.status !== 'all') {
        query += ' AND c.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY c.createdAt DESC';

      // Always add a limit (default to 50 if not specified) - use string interpolation instead of parameter
      let limitValue = 50;
      if (filters.limit && filters.limit !== 'undefined' && filters.limit !== '' && parseInt(filters.limit) > 0) {
        limitValue = parseInt(filters.limit);
      }
      query += ` LIMIT ${limitValue}`;

      const [rows] = await pool.execute(query, params);
      console.log('Debug - Raw rows returned:', rows);
      console.log('Debug - Number of rows:', rows.length);
      
      const mappedResults = rows.map(row => new ChatApp(row));
      console.log('Debug - Mapped results:', mappedResults);
      return mappedResults;
    } catch (error) {
      throw new Error(`Error getting chat applications: ${error.message}`);
    }
  }

  // Get chat application by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          c.id,
          c.owner_id,
          c.product_id,
          c.title,
          c.description,
          c.status,
          c.isActive,
          c.createdAt,
          c.updatedAt,
          u.firstName AS ownerFirstName,
          u.lastName AS ownerLastName,
          u.email AS ownerEmail,
          p.title AS productName,
          p.type AS productType,
          p.price AS productPrice
        FROM chatApps c
        JOIN users u ON c.owner_id = u.id
        JOIN products p ON c.product_id = p.id
        WHERE c.id = ? AND c.isActive = TRUE
      `;
    
      const [rows] = await pool.execute(query, [id]);
      console.log('rows', rows);
      return rows.length > 0 ? new ChatApp(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error getting chat application by ID: ${error.message}`);
    }
  }

  // Get chat applications by user ID
  static async getByUserId(userId) {
    try {
      const query = `
        SELECT 
          c.id,
          c.owner_id,
          c.product_id,
          c.title,
          c.description,
          c.status,
          c.isActive,
          c.createdAt,
          c.updatedAt,
          u.firstName AS ownerFirstName,
          u.lastName AS ownerLastName,
          u.email AS ownerEmail,
          p.title AS productName,
          p.type AS productType,
          p.price AS productPrice
        FROM chatApps c
        JOIN users u ON c.owner_id = u.id
        JOIN products p ON c.product_id = p.id
        WHERE c.owner_id = ? AND c.isActive = TRUE
        ORDER BY c.createdAt DESC
      `;

      const [rows] = await pool.execute(query, [userId]);
      return rows.map(row => new ChatApp(row));
    } catch (error) {
      throw new Error(`Error getting chat applications by user ID: ${error.message}`);
    }
  }

  // Create new chat application
  async create() {
    try {
      const query = `
        INSERT INTO chatApps (
          id, owner_id, product_id, title, description, status, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      // Generate UUID for chat ID
      const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const [result] = await pool.execute(query, [
        chatId,
        this.owner_id,
        this.product_id,
        this.title,
        this.description,
        this.status,
        this.isActive
      ]);

      if (result.affectedRows > 0) {
        this.id = chatId;
        return await ChatApp.getById(chatId);
      }

      throw new Error('Failed to create chat application');
    } catch (error) {
      throw new Error(`Error creating chat application: ${error.message}`);
    }
  }

  // Update chat application
  async update(updateData) {
    try {
      const allowedFields = ['title', 'description', 'status'];
      const updateFields = [];
      const params = [];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          params.push(updateData[field]);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updatedAt
      updateFields.push('updatedAt = CURRENT_TIMESTAMP');
      params.push(this.id);

      const query = `
        UPDATE chatApps 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND isActive = TRUE
      `;

      const [result] = await pool.execute(query, params);

      if (result.affectedRows > 0) {
        // Update instance properties
        Object.assign(this, updateData);
        return await ChatApp.getById(this.id);
      }

      throw new Error('Chat application not found or no changes made');
    } catch (error) {
      throw new Error(`Error updating chat application: ${error.message}`);
    }
  }

  // Soft delete chat application
  async delete() {
    try {
      const query = `
        UPDATE chatApps 
        SET isActive = FALSE, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ? AND isActive = TRUE
      `;

      const [result] = await pool.execute(query, [this.id]);

      if (result.affectedRows > 0) {
        this.isActive = false;
        return true;
      }

      throw new Error('Chat application not found');
    } catch (error) {
      throw new Error(`Error deleting chat application: ${error.message}`);
    }
  }

  // Check if user owns the chat application
  static async isOwner(chatId, userId) {
    try {
      const query = `
        SELECT owner_id 
        FROM chatApps 
        WHERE id = ? AND isActive = TRUE
      `;

      const [rows] = await pool.execute(query, [chatId]);
      return rows.length > 0 && rows[0].owner_id === userId;
    } catch (error) {
      throw new Error(`Error checking chat ownership: ${error.message}`);
    }
  }

  // Get chat statistics
  static async getStatistics(userId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as totalChats,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeChats,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closedChats,
          SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archivedChats
        FROM chatApps
        WHERE isActive = TRUE
      `;

      const params = [];

      if (userId) {
        query += ' AND owner_id = ?';
        params.push(userId);
      }

      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting chat statistics: ${error.message}`);
    }
  }
}

module.exports = ChatApp;
