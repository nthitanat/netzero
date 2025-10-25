const { executeQuery, executeCommand } = require('../config/database');
const { ensureModelTable } = require('../utils/databaseEnsure');
const bcrypt = require('bcryptjs');

class User {
  // Database schema definition
  static getSchema() {
    return {
      tableName: 'users',
      columns: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        email: 'VARCHAR(255) UNIQUE NOT NULL',
        password: 'VARCHAR(255) NOT NULL',
        firstName: 'VARCHAR(100) NOT NULL',
        lastName: 'VARCHAR(100) NOT NULL',
        role: "ENUM('user', 'admin', 'seller', 'community_head') DEFAULT 'user'",
        profileImage: 'TEXT NULL',
        phoneNumber: 'VARCHAR(20) NULL',
        address: 'TEXT NULL',
        isActive: 'BOOLEAN DEFAULT TRUE',
        emailVerified: 'BOOLEAN DEFAULT FALSE',
        lastLogin: 'DATETIME NULL',
        createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      indexes: [
        'INDEX idx_users_email (email)',
        'INDEX idx_users_role (role)',
        'INDEX idx_users_isActive (isActive)',
        'INDEX idx_users_createdAt (createdAt)'
      ]
    };
  }

  // Ensure table exists before any operations
  static async ensureTable() {
    return await ensureModelTable(User.getSchema());
  }
  static async create(userData) {
    // Ensure table exists
    await User.ensureTable();
    
    const { email, password, firstName, lastName, role = 'user', profileImage, phoneNumber, address } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password, firstName, lastName, role, profileImage, phoneNumber, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await executeCommand(query, [
      email, 
      hashedPassword, 
      firstName, 
      lastName, 
      role, 
      profileImage || null, 
      phoneNumber || null, 
      address || null
    ]);
    
    return result.insertId;
  }

  static async findByEmail(email) {
    // Ensure table exists
    await User.ensureTable();
    
    const query = `
      SELECT id, email, password, firstName, lastName, role, profileImage, phoneNumber, address, 
             isActive, emailVerified, lastLogin, createdAt, updatedAt
      FROM users 
      WHERE email = ? AND isActive = TRUE
    `;
    
    const rows = await executeQuery(query, [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const query = `
      SELECT id, email, firstName, lastName, role, profileImage, phoneNumber, address, 
             isActive, emailVerified, lastLogin, createdAt, updatedAt
      FROM users 
      WHERE id = ? AND isActive = TRUE
    `;
    
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  static async findByIdWithPassword(id) {
    const query = `
      SELECT id, email, password, firstName, lastName, role, profileImage, phoneNumber, address, 
             isActive, emailVerified, lastLogin, createdAt, updatedAt
      FROM users 
      WHERE id = ? AND isActive = TRUE
    `;
    
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  static async updateById(id, userData) {
    const { firstName, lastName, profileImage, phoneNumber, address } = userData;
    
    const query = `
      UPDATE users 
      SET firstName = ?, lastName = ?, profileImage = ?, phoneNumber = ?, address = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND isActive = TRUE
    `;
    
    const [result] = await executeCommand(query, [
      firstName, 
      lastName, 
      profileImage || null, 
      phoneNumber || null, 
      address || null, 
      id
    ]);
    
    return result.affectedRows > 0;
  }

  static async updatePassword(id, newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users 
      SET password = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND isActive = TRUE
    `;
    
    const [result] = await executeCommand(query, [hashedPassword, id]);
    return result.affectedRows > 0;
  }

  static async updateLastLogin(id) {
    const query = `
      UPDATE users 
      SET lastLogin = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND isActive = TRUE
    `;
    
    const [result] = await executeCommand(query, [id]);
    return result.affectedRows > 0;
  }

  static async softDelete(id) {
    const query = `
      UPDATE users 
      SET isActive = FALSE, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND isActive = TRUE
    `;
    
    const [result] = await executeCommand(query, [id]);
    return result.affectedRows > 0;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async emailExists(email, excludeId = null) {
    let query = `SELECT id FROM users WHERE email = ? AND isActive = TRUE`;
    let params = [email];
    
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    
    const rows = await executeQuery(query, params);
    return rows.length > 0;
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT id, email, firstName, lastName, role, profileImage, phoneNumber, address, 
             isActive, emailVerified, lastLogin, createdAt, updatedAt
      FROM users 
      WHERE isActive = TRUE
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const rows = await executeQuery(query, [limit, offset]);
    return rows;
  }

  static async getTotalCount() {
    const query = `SELECT COUNT(*) as count FROM users WHERE isActive = TRUE`;
    const rows = await executeQuery(query);
    return rows[0].count;
  }
}

module.exports = User;