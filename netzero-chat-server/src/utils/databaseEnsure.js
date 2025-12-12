const { pool, executeQuery, executeCommand } = require('../config/database');

/**
 * Check if a table exists in the database
 */
async function tableExists(tableName) {
  try {
    const query = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = ?
    `;
    const [result] = await executeQuery(query, [tableName]);
    return result.count > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error.message);
    return false;
  }
}

/**
 * Get current table structure
 */
async function getTableStructure(tableName) {
  try {
    const query = `DESCRIBE ${tableName}`;
    const columns = await executeQuery(query);
    
    // Get indexes
    let indexes = [];
    try {
      const indexQuery = `SHOW INDEX FROM ${tableName}`;
      indexes = await executeQuery(indexQuery);
    } catch (indexError) {
      console.warn(`Could not retrieve indexes for ${tableName}:`, indexError.message);
      indexes = [];
    }
    
    // Get foreign keys - use a simpler query that's more compatible
    let foreignKeys = [];
    try {
      const fkQuery = `
        SELECT 
          COLUMN_NAME,
          CONSTRAINT_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ? 
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `;
      foreignKeys = await executeQuery(fkQuery, [tableName]);
    } catch (fkError) {
      console.warn(`Could not retrieve foreign keys for ${tableName}:`, fkError.message);
      foreignKeys = [];
    }
    
    return {
      columns: columns.reduce((acc, col) => {
        acc[col.Field] = {
          type: col.Type,
          null: col.Null,
          key: col.Key,
          default: col.Default,
          extra: col.Extra
        };
        return acc;
      }, {}),
      indexes: indexes,
      foreignKeys: foreignKeys
    };
  } catch (error) {
    console.error(`Error getting table structure for ${tableName}:`, error.message);
    return null;
  }
}

/**
 * Create a table with the specified schema
 */
async function createTable(schema) {
  try {
    const { tableName, columns, foreignKeys = [], indexes = [] } = schema;
    
    // Build CREATE TABLE statement
    const columnDefs = Object.entries(columns).map(([name, definition]) => {
      return `${name} ${definition}`;
    });
    
    let createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${columnDefs.join(',\n        ')}
    `;
    
    // Add foreign keys to CREATE TABLE statement
    if (foreignKeys.length > 0) {
      createTableSQL += ',\n        ' + foreignKeys.join(',\n        ');
    }
    
    createTableSQL += '\n      )';
    
    console.log(`Creating table ${tableName}...`);
    await executeCommand(createTableSQL);
    
    // Add indexes separately (they might already exist)
    for (const indexDef of indexes) {
      try {
        // Extract index name and columns from definition like "INDEX idx_users_email (email)"
        const indexMatch = indexDef.match(/INDEX\s+(\w+)\s*\(([^)]+)\)/i);
        if (!indexMatch) {
          console.warn(`Warning: Could not parse index definition: ${indexDef}`);
          continue;
        }
        
        const indexName = indexMatch[1];
        const indexColumns = indexMatch[2];
        
        // Create proper CREATE INDEX SQL
        const indexSQL = `CREATE INDEX ${indexName} ON ${tableName} (${indexColumns})`;
        await executeCommand(indexSQL);
      } catch (indexError) {
        // Ignore errors if index already exists
        if (!indexError.message.includes('Duplicate key name')) {
          console.warn(`Warning: Could not create index for ${tableName}:`, indexError.message);
        }
      }
    }
    
    console.log(`✅ Table ${tableName} created successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating table ${schema.tableName}:`, error.message);
    throw error;
  }
}

/**
 * Add missing columns to an existing table
 */
async function addMissingColumns(tableName, currentStructure, targetSchema) {
  const { columns: targetColumns } = targetSchema;
  const currentColumns = currentStructure.columns;
  
  const missingColumns = [];
  
  for (const [columnName, columnDef] of Object.entries(targetColumns)) {
    if (!currentColumns[columnName]) {
      missingColumns.push({ name: columnName, definition: columnDef });
    }
  }
  
  if (missingColumns.length === 0) {
    return true;
  }
  
  console.log(`Adding ${missingColumns.length} missing columns to ${tableName}...`);
  
  for (const column of missingColumns) {
    try {
      const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.definition}`;
      await executeCommand(alterSQL);
      console.log(`  ✅ Added column ${column.name}`);
    } catch (error) {
      console.error(`  ❌ Error adding column ${column.name}:`, error.message);
      throw error;
    }
  }
  
  return true;
}

/**
 * Add missing indexes to a table
 */
async function addMissingIndexes(tableName, targetSchema) {
  const { indexes = [] } = targetSchema;
  
  if (indexes.length === 0) {
    return true;
  }
  
  console.log(`Checking indexes for ${tableName}...`);
  
  for (const indexDef of indexes) {
    try {
      // Extract index name and columns from definition like "INDEX idx_users_email (email)"
      const indexMatch = indexDef.match(/INDEX\s+(\w+)\s*\(([^)]+)\)/i);
      if (!indexMatch) {
        console.warn(`  ⚠️ Could not parse index definition: ${indexDef}`);
        continue;
      }
      
      const indexName = indexMatch[1];
      const indexColumns = indexMatch[2];
      
      // Check if index exists
      const checkIndexQuery = `
        SELECT COUNT(*) as count 
        FROM information_schema.statistics 
        WHERE table_schema = DATABASE() 
          AND table_name = ? 
          AND index_name = ?
      `;
      const [result] = await executeQuery(checkIndexQuery, [tableName, indexName]);
      
      if (result.count === 0) {
        // Create proper CREATE INDEX SQL
        const createIndexSQL = `CREATE INDEX ${indexName} ON ${tableName} (${indexColumns})`;
        await executeCommand(createIndexSQL);
        console.log(`  ✅ Added index ${indexName}`);
      }
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.warn(`  ⚠️ Could not create index for ${tableName}:`, error.message);
      }
    }
  }
  
  return true;
}

/**
 * Ensure a single table exists with correct structure
 * @param {Object} schema - The table schema object
 */
async function ensureTable(schema) {
  if (!schema) {
    throw new Error('Schema is required');
  }
  
  if (!schema.tableName) {
    throw new Error('Schema must have a tableName property');
  }
  
  const { tableName } = schema;
  
  try {
    console.log(`\n🔍 Checking table: ${tableName}`);
    
    const exists = await tableExists(tableName);
    
    if (!exists) {
      console.log(`📝 Table ${tableName} does not exist, creating...`);
      await createTable(schema);
      return true;
    }
    
    console.log(`✅ Table ${tableName} exists, checking structure...`);
    const currentStructure = await getTableStructure(tableName);
    
    if (!currentStructure) {
      console.warn(`⚠️  Could not retrieve structure for table ${tableName}, skipping structure verification`);
      console.log(`✅ Table ${tableName} structure verification skipped (table exists)`);
      return true;
    }
    
    // Add missing columns
    await addMissingColumns(tableName, currentStructure, schema);
    
    // Add missing indexes
    await addMissingIndexes(tableName, schema);
    
    console.log(`✅ Table ${tableName} structure verified`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error ensuring table ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * Ensure all database tables exist with correct structure
 * @param {Array} modelSchemas - Array of model schemas to ensure
 */
async function ensureDatabase(modelSchemas = []) {
  console.log('🚀 Starting database structure verification...');
  
  try {
    if (modelSchemas.length === 0) {
      console.log('⚠️  No model schemas provided to ensure');
      return true;
    }
    
    // Sort schemas by dependencies (users first, then others)
    const sortedSchemas = sortSchemasByDependencies(modelSchemas);
    
    for (const schema of sortedSchemas) {
      await ensureTable(schema);
    }
    
    console.log('\n🎉 Database structure verification completed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n💥 Database structure verification failed:', error.message);
    throw error;
  }
}

/**
 * Sort schemas by their dependencies
 */
function sortSchemasByDependencies(schemas) {
  // Simple dependency sorting - put users first, then others
  return schemas.sort((a, b) => {
    if (a.tableName === 'users') return -1;
    if (b.tableName === 'users') return 1;
    if (a.tableName === 'products') return -1;
    if (b.tableName === 'products') return 1;
    return 0;
  });
}

/**
 * Ensure specific model table exists
 * This function should be called by each model with its schema
 * @param {Object} schema - The model's schema definition
 */
async function ensureModelTable(schema) {
  if (!schema) {
    throw new Error('Schema is required');
  }
  
  return ensureTable(schema);
}

module.exports = {
  ensureDatabase,
  ensureModelTable,
  ensureTable,
  tableExists,
  getTableStructure,
  createTable,
  addMissingColumns,
  addMissingIndexes,
  sortSchemasByDependencies
};
