#!/usr/bin/env node

/**
 * Standalone script to ensure database structure
 * Run this script to create/update all database tables
 * 
 * Usage:
 *   node scripts/ensureDatabase.js
 *   npm run db:ensure
 */

require('dotenv').config();
const { initializeDatabase } = require('../src/initDatabase');

async function main() {
  console.log('🚀 NetZero Database Structure Utility');
  console.log('=====================================\n');
  
  try {
    await initializeDatabase();
    console.log('\n🎉 Database structure ensured successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Failed to ensure database structure:');
    console.error(error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\nFull error:', error);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Check your .env file for correct database credentials');
    console.log('  2. Ensure MySQL server is running');
    console.log('  3. Verify database exists and user has proper permissions');
    console.log('  4. Check network connectivity to database host');
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled promise rejection:');
  console.error(error.message);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:');
  console.error(error.message);
  process.exit(1);
});

// Run the script
main();