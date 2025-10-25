#!/usr/bin/env node

/**
 * Test script for database ensure utility
 * This script tests various scenarios to ensure the utility works correctly
 */

require('dotenv').config();
const { 
  ensureDatabase, 
  ensureTable, 
  tableExists,
  getTableStructure
} = require('../src/utils/databaseEnsure');
const { testConnection } = require('../src/config/database');

// Import models to get their schemas
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const ProductReservation = require('../src/models/ProductReservation');
const Event = require('../src/models/Event');
const ChatApp = require('../src/models/ChatApp');

async function runTests() {
  console.log('🧪 Testing Database Ensure Utility');
  console.log('==================================\n');

  try {
    // Test 1: Database connection
    console.log('Test 1: Database Connection');
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✅ Database connection successful\n');
    } else {
      throw new Error('Database connection failed');
    }

    // Test 2: Get model schemas
    console.log('Test 2: Model Schemas');
    const modelSchemas = [
      User.getSchema(),
      Product.getSchema(),
      ProductReservation.getSchema(),
      Event.getSchema(),
      ChatApp.getSchema()
    ];
    console.log('📋 Model schemas:', modelSchemas.map(s => s.tableName));
    console.log(`✅ Found ${modelSchemas.length} model schemas\n`);

    // Test 3: Check if tables exist (before ensure)
    console.log('Test 3: Table Existence Check');
    const tableChecks = {};
    for (const schema of modelSchemas) {
      const exists = await tableExists(schema.tableName);
      tableChecks[schema.tableName] = exists;
      console.log(`  ${exists ? '✅' : '❌'} ${schema.tableName}: ${exists ? 'exists' : 'missing'}`);
    }
    console.log('');

    // Test 4: Ensure individual table
    console.log('Test 4: Individual Table Ensure');
    const testSchema = User.getSchema();
    console.log(`🔧 Ensuring table: ${testSchema.tableName}`);
    await ensureTable(testSchema);
    console.log('✅ Individual table ensure completed\n');

    // Test 5: Get table structure
    console.log('Test 5: Table Structure Retrieval');
    const tableName = testSchema.tableName;
    if (await tableExists(tableName)) {
      const structure = await getTableStructure(tableName);
      if (structure && structure.columns) {
        console.log(`📊 ${tableName} structure:`);
        console.log(`  Columns: ${Object.keys(structure.columns).length}`);
        console.log(`  Indexes: ${structure.indexes ? structure.indexes.length : 0}`);
        console.log(`  Foreign Keys: ${structure.foreignKeys ? structure.foreignKeys.length : 0}`);
        console.log('✅ Table structure retrieved successfully\n');
      } else {
        console.log('❌ Could not retrieve table structure\n');
      }
    }

    // Test 6: Ensure entire database
    console.log('Test 6: Full Database Ensure');
    console.log('🔧 Ensuring entire database structure...');
    await ensureDatabase(modelSchemas);
    console.log('✅ Full database ensure completed\n');

    // Test 7: Verify all tables exist (after ensure)
    console.log('Test 7: Final Table Verification');
    let allTablesExist = true;
    for (const schema of modelSchemas) {
      const exists = await tableExists(schema.tableName);
      console.log(`  ${exists ? '✅' : '❌'} ${schema.tableName}: ${exists ? 'exists' : 'missing'}`);
      if (!exists) allTablesExist = false;
    }

    if (allTablesExist) {
      console.log('\n🎉 All tests passed successfully!');
      console.log('   Database structure is ready for use.');
    } else {
      console.log('\n⚠️  Some tables are still missing after ensure.');
    }

  } catch (error) {
    console.error('\n💥 Test failed:');
    console.error(error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\nFull error:', error);
    }
    
    return false;
  }

  return true;
}

async function main() {
  const success = await runTests();
  process.exit(success ? 0 : 1);
}

// Handle errors
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

// Run tests
main();