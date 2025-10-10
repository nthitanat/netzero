# Database Architecture Documentation

## Overview

This document describes the centralized database architecture implemented in the NetZero project, which provides standardized, type-safe database operations with proper error handling and transaction support.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database Functions](#database-functions)
- [Migration from Direct Pool Usage](#migration-from-direct-pool-usage)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Transaction Management](#transaction-management)
- [Error Handling](#error-handling)
- [Backward Compatibility](#backward-compatibility)

## Architecture Overview

The database layer consists of three specialized functions that replace direct `pool.execute()` calls:

```
┌─────────────────────────────────────────────────┐
│                Application Layer                │
├─────────────────────────────────────────────────┤
│                 Model Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │executeQuery │ │executeCommand│ │executeTransaction│
│  │             │ │             │ │             │ │
│  │  SELECT     │ │INSERT/UPDATE│ │ Multiple    │ │
│  │ Operations  │ │   DELETE    │ │ Operations  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────┤
│              Database Config Layer              │
│              (Centralized Functions)            │
├─────────────────────────────────────────────────┤
│                MySQL Pool                       │
│            (Connection Management)              │
└─────────────────────────────────────────────────┘
```

## Database Functions

### 1. executeQuery() - SELECT Operations

**Purpose**: Execute SELECT queries that return data rows.

```javascript
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows; // Returns only the data rows
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
```

**Use Cases**:
- Fetching user data
- Getting product listings
- Retrieving any data from database
- Count queries
- Aggregation queries

**Return Value**: Array of data rows (destructured from MySQL result)

### 2. executeCommand() - INSERT/UPDATE/DELETE Operations

**Purpose**: Execute data modification queries that need access to result metadata.

```javascript
const executeCommand = async (query, params = []) => {
  try {
    const result = await pool.execute(query, params);
    return result; // Returns full result [result, fields]
  } catch (error) {
    console.error('Database command error:', error);
    throw error;
  }
};
```

**Use Cases**:
- Creating new records (need `insertId`)
- Updating existing records (need `affectedRows`)
- Deleting records (need `affectedRows`)
- Any operation requiring result metadata

**Return Value**: Full MySQL result array `[result, fields]`
- `result.insertId` - ID of newly inserted record
- `result.affectedRows` - Number of rows affected
- `result.changedRows` - Number of rows actually changed
- `result.warningCount` - Number of warnings

### 3. executeTransaction() - Multi-Operation Transactions

**Purpose**: Execute multiple related operations as a single atomic transaction.

```javascript
const executeTransaction = async (operations) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of operations) {
      const result = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Database transaction error:', error);
    throw error;
  } finally {
    connection.release();
  }
};
```

**Use Cases**:
- User registration (create user + profile + settings)
- Financial transactions (debit + credit + audit log)
- Complex data updates requiring consistency
- Any multi-step operation that must succeed or fail together

**Return Value**: Array of results from each operation

## Migration from Direct Pool Usage

### Before (Old Pattern)
```javascript
// Direct pool usage - inconsistent patterns
const { pool } = require('../config/database');

// SELECT - manual destructuring
const [rows] = await pool.execute(query, [email]);
return rows[0] || null;

// INSERT - manual result handling
const [result] = await pool.execute(query, params);
return result.insertId;

// No centralized error handling
```

### After (New Pattern)
```javascript
// Centralized functions - consistent patterns
const { executeQuery, executeCommand } = require('../config/database');

// SELECT - clean data access
const rows = await executeQuery(query, [email]);
return rows[0] || null;

// INSERT - clear intent and result handling
const [result] = await executeCommand(query, params);
return result.insertId;

// Centralized error handling and logging
```

## Best Practices

### 1. Choose the Right Function

| Operation Type | Function | Reason |
|----------------|----------|--------|
| `SELECT` | `executeQuery` | Need only data rows |
| `INSERT` | `executeCommand` | Need `insertId` |
| `UPDATE` | `executeCommand` | Need `affectedRows` |
| `DELETE` | `executeCommand` | Need `affectedRows` |
| Multiple related operations | `executeTransaction` | Need atomicity |

### 2. Error Handling

```javascript
// ✅ Good - Let centralized functions handle errors
try {
  const users = await executeQuery('SELECT * FROM users WHERE active = ?', [true]);
  return users;
} catch (error) {
  // Handle business logic errors, database errors already logged
  throw new Error('Failed to fetch active users');
}

// ❌ Avoid - Don't duplicate database error handling
try {
  const [rows] = await pool.execute(query, params);
  return rows;
} catch (error) {
  console.error('Database error:', error); // Duplicates centralized logging
  throw error;
}
```

### 3. Transaction Guidelines

```javascript
// ✅ Good - Related operations in single transaction
await executeTransaction([
  { query: 'INSERT INTO users (...) VALUES (...)', params: userData },
  { query: 'INSERT INTO profiles (user_id, ...) VALUES (LAST_INSERT_ID(), ...)', params: profileData },
  { query: 'INSERT INTO audit_log (...) VALUES (...)', params: auditData }
]);

// ❌ Avoid - Separate operations that should be atomic
await executeCommand('INSERT INTO users ...', userData);
await executeCommand('INSERT INTO profiles ...', profileData); // Could fail leaving orphaned user
```

## Examples

### User Model Implementation

```javascript
const { executeQuery, executeCommand } = require('../config/database');

class User {
  // SELECT operation - get clean data
  static async findById(id) {
    const query = 'SELECT id, email, firstName, lastName FROM users WHERE id = ?';
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  // INSERT operation - get insertId
  static async create(userData) {
    const query = 'INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)';
    const [result] = await executeCommand(query, [
      userData.email, 
      userData.hashedPassword, 
      userData.firstName, 
      userData.lastName
    ]);
    return result.insertId;
  }

  // UPDATE operation - check success
  static async updateById(id, userData) {
    const query = 'UPDATE users SET firstName = ?, lastName = ? WHERE id = ?';
    const [result] = await executeCommand(query, [
      userData.firstName, 
      userData.lastName, 
      id
    ]);
    return result.affectedRows > 0;
  }

  // DELETE operation - check success
  static async softDelete(id) {
    const query = 'UPDATE users SET isActive = FALSE WHERE id = ?';
    const [result] = await executeCommand(query, [id]);
    return result.affectedRows > 0;
  }
}
```

### Transaction Example

```javascript
// Complex user registration with profile and settings
const createCompleteUser = async (userData, profileData) => {
  return await executeTransaction([
    {
      query: 'INSERT INTO users (email, password) VALUES (?, ?)',
      params: [userData.email, userData.hashedPassword]
    },
    {
      query: 'INSERT INTO user_profiles (user_id, first_name, last_name, phone) VALUES (LAST_INSERT_ID(), ?, ?, ?)',
      params: [profileData.firstName, profileData.lastName, profileData.phone]
    },
    {
      query: 'INSERT INTO user_settings (user_id, theme, notifications, privacy) VALUES (LAST_INSERT_ID(), ?, ?, ?)',
      params: ['light', true, 'private']
    },
    {
      query: 'INSERT INTO audit_log (action, user_id, details) VALUES (?, LAST_INSERT_ID(), ?)',
      params: ['USER_CREATED', JSON.stringify({ source: 'registration' })]
    }
  ]);
};

// Usage
try {
  const results = await createCompleteUser(userData, profileData);
  const [userResult, profileResult, settingsResult, auditResult] = results;
  
  return {
    userId: userResult[0].insertId,
    success: true,
    message: 'User created successfully with complete profile'
  };
} catch (error) {
  // All operations rolled back automatically
  return {
    success: false,
    message: 'User registration failed',
    error: error.message
  };
}
```

## Transaction Management

### ACID Properties Guaranteed

1. **Atomicity**: All operations succeed together, or none do
2. **Consistency**: Database never left in invalid state  
3. **Isolation**: Transactions don't interfere with each other
4. **Durability**: Committed changes are permanent

### Automatic Behaviors

#### ✅ Automatic Commit
```javascript
// If ALL operations succeed:
await connection.commit(); // Makes all changes permanent
return results;
```

#### 🔄 Automatic Rollback
```javascript
// If ANY operation fails:
catch (error) {
  await connection.rollback(); // Undoes ALL changes in transaction
  throw error;
}
```

#### 🔒 Guaranteed Connection Release
```javascript
// ALWAYS executed, regardless of success/failure:
finally {
  connection.release(); // Returns connection to pool
}
```

### Connection Pool Protection

Without proper connection management:
```javascript
// ❌ DANGEROUS - Can cause connection leaks
const connection = await pool.getConnection();
// ... operations ...
connection.release(); // Might never execute if error occurs!

// Result: Pool exhaustion → Application crash
```

With `executeTransaction`:
```javascript
// ✅ SAFE - Connection always returned
const executeTransaction = async (operations) => {
  const connection = await pool.getConnection();
  try {
    // ... transaction logic ...
  } finally {
    connection.release(); // GUARANTEED to execute
  }
};
```

## Error Handling

### Centralized Error Logging

All database functions provide consistent error logging:

```javascript
// executeQuery errors
console.error('Database query error:', error);

// executeCommand errors  
console.error('Database command error:', error);

// executeTransaction errors
console.error('Database transaction error:', error);
```

### Error Propagation

```javascript
// Functions re-throw errors for application handling
try {
  const users = await executeQuery(query, params);
} catch (error) {
  // Error already logged by executeQuery
  // Handle application-specific logic here
  if (error.code === 'ER_NO_SUCH_TABLE') {
    throw new Error('User table does not exist');
  }
  throw error;
}
```

## Backward Compatibility

### Existing Code Continues Working

```javascript
// ✅ Still supported - existing models can continue using pool directly
const { pool } = require('../config/database');

class Product {
  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  }
}
```

### Gradual Migration Path

1. **Phase 1**: New models use centralized functions
2. **Phase 2**: Refactor existing models incrementally  
3. **Phase 3**: Deprecated direct pool usage (optional)

### Export Compatibility

```javascript
// database.js exports both old and new approaches
module.exports = {
  pool,              // ← Existing code compatibility
  executeQuery,      // ← New centralized functions
  executeCommand,
  executeTransaction,
  // ... other functions
};
```

## Performance Considerations

### Connection Pooling

- **Pool Size**: Currently configured for 10 concurrent connections
- **Queue Management**: Automatic queuing when pool is full
- **Connection Reuse**: Efficient connection lifecycle management

### Transaction Efficiency

```javascript
// ✅ Efficient - Single connection for related operations
await executeTransaction([
  { query: 'INSERT INTO orders ...', params: orderData },
  { query: 'INSERT INTO order_items ...', params: itemsData },
  { query: 'UPDATE inventory ...', params: inventoryData }
]);

// ❌ Inefficient - Multiple connections for related operations  
await executeCommand('INSERT INTO orders ...', orderData);
await executeCommand('INSERT INTO order_items ...', itemsData);
await executeCommand('UPDATE inventory ...', inventoryData);
```

## Future Enhancements

### Planned Improvements

1. **Query Caching**: Add caching layer for frequently accessed data
2. **Performance Monitoring**: Track query execution times and patterns
3. **Connection Analytics**: Monitor pool utilization and bottlenecks
4. **Prepared Statement Optimization**: Enhanced prepared statement management
5. **Read Replicas**: Support for read/write splitting

### Extension Points

```javascript
// Future: Query caching wrapper
const executeQueryWithCache = async (query, params, cacheOptions) => {
  const cacheKey = generateCacheKey(query, params);
  const cached = await cache.get(cacheKey);
  
  if (cached && !cacheOptions.skipCache) {
    return cached;
  }
  
  const result = await executeQuery(query, params);
  await cache.set(cacheKey, result, cacheOptions.ttl);
  return result;
};
```

---

## Conclusion

The centralized database architecture provides:

- **🎯 Type Safety**: Clear function purposes and return types
- **🛡️ Error Consistency**: Standardized error handling and logging  
- **📊 Appropriate Returns**: Right data for each operation type
- **🔄 Transaction Safety**: ACID compliance with automatic rollback
- **🔒 Resource Management**: Guaranteed connection cleanup
- **⚡ Performance**: Efficient connection pooling and transaction batching
- **🔧 Maintainability**: Centralized database logic for easier updates
- **📈 Scalability**: Foundation for advanced features like caching and monitoring

This architecture ensures robust, maintainable, and scalable database operations while maintaining full backward compatibility with existing code.