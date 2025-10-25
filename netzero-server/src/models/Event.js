const { executeQuery } = require('../config/database');
const { ensureModelTable } = require('../utils/databaseEnsure');

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
