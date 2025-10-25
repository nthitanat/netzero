const { executeQuery, executeCommand } = require('../config/database');
const { ensureModelTable } = require('../utils/databaseEnsure');

// Helper function to convert ISO datetime to MySQL format
const formatDateTimeForMySQL = (isoDateTime) => {
  if (!isoDateTime) return null;
  const date = new Date(isoDateTime);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

class Event {
  // Database schema definition
  static getSchema() {
    return {
      tableName: 'events',
      columns: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        title: 'VARCHAR(255) NOT NULL',
        description: 'TEXT',
        event_date: 'DATETIME NOT NULL',
        location: 'VARCHAR(255)',
        category: 'VARCHAR(100)',
        organizer: 'VARCHAR(255)',
        contact_email: 'VARCHAR(255)',
        contact_phone: 'VARCHAR(20)',
        max_participants: 'INT DEFAULT 0',
        current_participants: 'INT DEFAULT 0',
        registration_deadline: 'DATETIME NULL',
        status: "ENUM('active', 'cancelled', 'completed') DEFAULT 'active'",
        isRecommended: 'BOOLEAN DEFAULT FALSE',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      indexes: [
        'INDEX idx_events_event_date (event_date)',
        'INDEX idx_events_category (category)',
        'INDEX idx_events_status (status)',
        'INDEX idx_events_isRecommended (isRecommended)',
        'INDEX idx_events_created_at (created_at)'
      ]
    };
  }

  // Ensure table exists before any operations
  static async ensureTable() {
    return await ensureModelTable(Event.getSchema());
  }

  // Create a new event
  static async create(eventData) {
    try {
      // Ensure table exists
      await Event.ensureTable();
      
      const {
        title,
        description,
        event_date,
        location,
        category,
        organizer,
        contact_email,
        contact_phone,
        max_participants = 0,
        registration_deadline,
        status = 'active',
        isRecommended = false
      } = eventData;
      
      const query = `
        INSERT INTO events (
          title, description, event_date, location, category, organizer,
          contact_email, contact_phone, max_participants, registration_deadline,
          status, isRecommended
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await executeCommand(query, [
        title,
        description || null,
        formatDateTimeForMySQL(event_date),
        location || null,
        category || null,
        organizer || null,
        contact_email || null,
        contact_phone || null,
        max_participants,
        formatDateTimeForMySQL(registration_deadline),
        status,
        isRecommended ? 1 : 0
      ]);
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating event: ${error.message}`);
    }
  }

  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.event_date = data.event_date;
    this.location = data.location;
    this.category = data.category;
    this.organizer = data.organizer;
    this.contact_email = data.contact_email;
    this.contact_phone = data.contact_phone;
    this.max_participants = data.max_participants;
    this.current_participants = data.current_participants || 0;
    this.registration_deadline = data.registration_deadline;
    this.status = data.status || 'active';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.isRecommended = data.isRecommended
  }

  // Get all events - simple implementation
  static async findAll() {
    try {
      // Ensure table exists
      await Event.ensureTable();
      
      const query = 'SELECT * FROM events ORDER BY created_at DESC';
      const results = await executeQuery(query);
      return results.map(row => new Event(row));
    } catch (error) {
      throw new Error(`Error fetching events: ${error.message}`);
    }
  }

  // Get event by ID
  static async findById(id) {
    try {
      // Ensure table exists
      await Event.ensureTable();
      
      const query = 'SELECT * FROM events WHERE id = ?';
      const results = await executeQuery(query, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new Event(results[0]);
    } catch (error) {
      throw new Error(`Error fetching event by ID: ${error.message}`);
    }
  }

  // Get events by category
  static async findByCategory(category) {
    try {
      const query = 'SELECT * FROM events WHERE category = ? AND status = "active" ORDER BY created_at DESC';
      const results = await executeQuery(query, [category]);
      return results.map(row => new Event(row));
    } catch (error) {
      throw new Error(`Error fetching events by category: ${error.message}`);
    }
  }

  // Get events by name (search in title)
  static async findByName(name) {
    try {
      const query = 'SELECT * FROM events WHERE title LIKE ? AND status = "active" ORDER BY created_at DESC';
      const searchTerm = `%${name}%`;
      const results = await executeQuery(query, [searchTerm]);
      return results.map(row => new Event(row));
    } catch (error) {
      throw new Error(`Error searching events by name: ${error.message}`);
    }
  }

  // Get recommended events
  static async findRecommended() {
    try {
      const query = 'SELECT * FROM events WHERE isRecommended = 1 AND status = "active" ORDER BY created_at DESC';
      const results = await executeQuery(query);
      return results.map(row => new Event(row));
    } catch (error) {
      throw new Error(`Error fetching recommended events: ${error.message}`);
    }
  }

  // Delete event by ID (hard delete)
  static async deleteById(id) {
    try {
      const query = 'DELETE FROM events WHERE id = ?';
      const [result] = await executeCommand(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting event: ${error.message}`);
    }
  }

  // Soft delete event (mark as cancelled)
  static async softDeleteById(id) {
    try {
      const query = `
        UPDATE events 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      const [result] = await executeCommand(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error soft deleting event: ${error.message}`);
    }
  }

  // Delete event with ownership check
  static async deleteByIdWithOwnership(eventId, userId) {
    try {
      // Import UserEvent here to avoid circular dependency
      const UserEvent = require('./UserEvent');
      
      // Check if user owns the event
      const ownsEvent = await UserEvent.userOwnsEvent(userId, eventId);
      
      if (!ownsEvent) {
        throw new Error('User does not have permission to delete this event');
      }

      // Delete the event
      return await Event.deleteById(eventId);
    } catch (error) {
      throw new Error(`Error deleting event with ownership check: ${error.message}`);
    }
  }

  // Soft delete event with ownership check
  static async softDeleteByIdWithOwnership(eventId, userId) {
    try {
      // Import UserEvent here to avoid circular dependency
      const UserEvent = require('./UserEvent');
      
      // Check if user owns the event
      const ownsEvent = await UserEvent.userOwnsEvent(userId, eventId);
      
      if (!ownsEvent) {
        throw new Error('User does not have permission to delete this event');
      }

      // Soft delete the event
      return await Event.softDeleteById(eventId);
    } catch (error) {
      throw new Error(`Error soft deleting event with ownership check: ${error.message}`);
    }
  }

  // Update event with ownership check
  static async updateByIdWithOwnership(eventId, userId, updateData) {
    try {
      // Import UserEvent here to avoid circular dependency
      const UserEvent = require('./UserEvent');
      
      // Check if user owns the event
      const ownsEvent = await UserEvent.userOwnsEvent(userId, eventId);
      
      if (!ownsEvent) {
        throw new Error('User does not have permission to update this event');
      }

      // Build update query dynamically based on provided fields
      const allowedFields = ['title', 'description', 'event_date', 'location', 'category', 'organizer', 'contact_email', 'contact_phone', 'max_participants', 'registration_deadline', 'status'];
      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          // Format datetime fields for MySQL
          if (key === 'event_date' || key === 'registration_deadline') {
            updateValues.push(formatDateTimeForMySQL(value));
          } else {
            updateValues.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields provided for update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(eventId);

      const query = `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`;
      const [result] = await executeCommand(query, updateValues);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating event with ownership check: ${error.message}`);
    }
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      event_date: this.event_date,
      location: this.location,
      category: this.category,
      organizer: this.organizer,
      contact_email: this.contact_email,
      contact_phone: this.contact_phone,
      max_participants: this.max_participants,
      current_participants: this.current_participants,
      registration_deadline: this.registration_deadline,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      isRecommended: this.isRecommended
    };
  }
}

module.exports = Event;
