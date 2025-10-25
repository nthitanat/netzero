const { ensureDatabase } = require('./utils/databaseEnsure');
const { testConnection } = require('./config/database');

// Import all models to get their schemas
const User = require('./models/User');
const Product = require('./models/Product');
const ProductReservation = require('./models/ProductReservation');
const Event = require('./models/Event');
const UserEvent = require('./models/UserEvent');
const EventProduct = require('./models/EventProduct');
const ChatApp = require('./models/ChatApp');

/**
 * Get schemas from all models
 */
function getAllModelSchemas() {
  const schemas = [];
  
  // Collect schemas from all models
  try {
    schemas.push(User.getSchema());
  } catch (error) {
    console.warn('Could not get User schema:', error.message);
  }
  
  try {
    schemas.push(Product.getSchema());
  } catch (error) {
    console.warn('Could not get Product schema:', error.message);
  }
  
  try {
    schemas.push(ProductReservation.getSchema());
  } catch (error) {
    console.warn('Could not get ProductReservation schema:', error.message);
  }
  
  try {
    schemas.push(Event.getSchema());
  } catch (error) {
    console.warn('Could not get Event schema:', error.message);
  }
  
  try {
    schemas.push(UserEvent.getSchema());
  } catch (error) {
    console.warn('Could not get UserEvent schema:', error.message);
  }
  
  try {
    schemas.push(EventProduct.getSchema());
  } catch (error) {
    console.warn('Could not get EventProduct schema:', error.message);
  }
  
  try {
    schemas.push(ChatApp.getSchema());
  } catch (error) {
    console.warn('Could not get ChatApp schema:', error.message);
  }
  
  return schemas;
}

/**
 * Initialize database structure
 * This should be called when the server starts
 */
async function initializeDatabase() {
  console.log('🔧 Initializing database...');
  
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Could not connect to database');
    }
    
    // Get all model schemas
    const modelSchemas = getAllModelSchemas();
    console.log(`📋 Found ${modelSchemas.length} model schemas`);
    
    // Ensure all tables exist with correct structure
    await ensureDatabase(modelSchemas);
    
    console.log('✅ Database initialization completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

module.exports = {
  initializeDatabase
};