const { executeQuery, executeCommand } = require('../config/database');

class UserEvent {
  // Database schema definition
  static getSchema() {
    return {
      tableName: 'user_events',
      columns: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        user_id: 'INT NOT NULL',
        event_id: 'INT NOT NULL',
        joined_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      },
      indexes: [
        'INDEX idx_user_events_user_id (user_id)',
        'INDEX idx_user_events_event_id (event_id)',
        'INDEX idx_user_events_joined_at (joined_at)',
        'UNIQUE INDEX unique_user_event (user_id, event_id)'
      ],
      foreignKeys: [
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE',
        'FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE'
      ]
    };
  }

  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.event_id = data.event_id;
    this.joined_at = data.joined_at;
  }

  // Create a new user-event relationship
  static async create(userId, eventId) {
    try {
      const query = `
        INSERT INTO user_events (user_id, event_id)
        VALUES (?, ?)
      `;
      
      const [result] = await executeCommand(query, [userId, eventId]);
      return result.insertId;
    } catch (error) {
      // Handle duplicate entry error
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('User is already associated with this event');
      }
      throw new Error(`Error creating user-event relationship: ${error.message}`);
    }
  }

  // Get all events for a specific user
  static async getEventsByUserId(userId) {
    try {
      const query = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.event_date,
          e.location,
          e.status,
          e.created_at,
          ue.joined_at
        FROM user_events ue
        JOIN events e ON ue.event_id = e.id
        WHERE ue.user_id = ?
        ORDER BY e.event_date DESC
      `;
      
      const results = await executeQuery(query, [userId]);
      return results;
    } catch (error) {
      throw new Error(`Error fetching events for user: ${error.message}`);
    }
  }

  // Check if user owns/is associated with an event
  static async userOwnsEvent(userId, eventId) {
    try {
      const query = `
        SELECT id FROM user_events 
        WHERE user_id = ? AND event_id = ?
      `;
      
      const results = await executeQuery(query, [userId, eventId]);
      return results.length > 0;
    } catch (error) {
      throw new Error(`Error checking event ownership: ${error.message}`);
    }
  }

  // Get all users for a specific event
  static async getUsersByEventId(eventId) {
    try {
      const query = `
        SELECT 
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          ue.joined_at
        FROM user_events ue
        JOIN users u ON ue.user_id = u.id
        WHERE ue.event_id = ? AND u.isActive = TRUE
        ORDER BY ue.joined_at DESC
      `;
      
      const results = await executeQuery(query, [eventId]);
      return results;
    } catch (error) {
      throw new Error(`Error fetching users for event: ${error.message}`);
    }
  }

  // Remove user-event relationship
  static async remove(userId, eventId) {
    try {
      const query = `
        DELETE FROM user_events 
        WHERE user_id = ? AND event_id = ?
      `;
      
      const [result] = await executeCommand(query, [userId, eventId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error removing user-event relationship: ${error.message}`);
    }
  }

  // Get user-event relationship details
  static async findByUserAndEvent(userId, eventId) {
    try {
      const query = `
        SELECT * FROM user_events 
        WHERE user_id = ? AND event_id = ?
      `;
      
      const results = await executeQuery(query, [userId, eventId]);
      return results[0] ? new UserEvent(results[0]) : null;
    } catch (error) {
      throw new Error(`Error finding user-event relationship: ${error.message}`);
    }
  }

  // Alias for findByUserAndEvent (event first, user second)
  static async findByEventAndUser(eventId, userId) {
    return UserEvent.findByUserAndEvent(userId, eventId);
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      event_id: this.event_id,
      joined_at: this.joined_at
    };
  }
}

module.exports = UserEvent;