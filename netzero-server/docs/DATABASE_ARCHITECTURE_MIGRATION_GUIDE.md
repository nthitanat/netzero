# Database Migration Guide

## Overview

This guide helps developers migrate from direct `pool.execute()` usage to the new centralized database functions (`executeQuery`, `executeCommand`, `executeTransaction`).

## Quick Migration Checklist

- [ ] Update imports to include new functions
- [ ] Replace SELECT operations with `executeQuery`
- [ ] Replace INSERT/UPDATE/DELETE operations with `executeCommand` 
- [ ] Group related operations into `executeTransaction`
- [ ] Test that return values remain the same
- [ ] Remove manual error logging (now centralized)

## Step-by-Step Migration

### 1. Update Imports

**Before:**
```javascript
const { pool } = require('../config/database');
```

**After:**
```javascript
const { executeQuery, executeCommand, executeTransaction } = require('../config/database');
// Keep pool if you need gradual migration: const { pool, executeQuery, executeCommand } = require('../config/database');
```

### 2. Migrate SELECT Operations

**Pattern: Query that returns data**

**Before:**
```javascript
static async findById(id) {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
}
```

**After:**
```javascript
static async findById(id) {
  const query = 'SELECT * FROM users WHERE id = ?';
  const rows = await executeQuery(query, [id]);
  return rows[0] || null;
}
```

**Key Changes:**
- `executeQuery` returns rows directly (no destructuring needed)
- Same return value for your function
- Centralized error logging

### 3. Migrate INSERT Operations

**Pattern: Create new records, need insertId**

**Before:**
```javascript
static async create(userData) {
  const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
  const [result] = await pool.execute(query, [userData.email, userData.password]);
  return result.insertId;
}
```

**After:**
```javascript
static async create(userData) {
  const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
  const [result] = await executeCommand(query, [userData.email, userData.password]);
  return result.insertId;
}
```

**Key Changes:**
- Use `executeCommand` for INSERT operations
- Still destructure to get `result.insertId`
- Same return value for your function

### 4. Migrate UPDATE Operations

**Pattern: Modify existing records, check success**

**Before:**
```javascript
static async updateById(id, userData) {
  const query = 'UPDATE users SET firstName = ?, lastName = ? WHERE id = ?';
  const [result] = await pool.execute(query, [userData.firstName, userData.lastName, id]);
  return result.affectedRows > 0;
}
```

**After:**
```javascript
static async updateById(id, userData) {
  const query = 'UPDATE users SET firstName = ?, lastName = ? WHERE id = ?';
  const [result] = await executeCommand(query, [userData.firstName, userData.lastName, id]);
  return result.affectedRows > 0;
}
```

**Key Changes:**
- Use `executeCommand` for UPDATE operations
- Still destructure to get `result.affectedRows`
- Same return value for your function

### 5. Migrate DELETE Operations

**Pattern: Remove records, check success**

**Before:**
```javascript
static async deleteById(id) {
  const query = 'DELETE FROM users WHERE id = ?';
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
}
```

**After:**
```javascript
static async deleteById(id) {
  const query = 'DELETE FROM users WHERE id = ?';
  const [result] = await executeCommand(query, [id]);
  return result.affectedRows > 0;
}
```

### 6. Create Transactions for Related Operations

**Pattern: Multiple operations that should succeed or fail together**

**Before (Unsafe):**
```javascript
static async createUserWithProfile(userData, profileData) {
  // ❌ Not atomic - could fail partially
  const userQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
  const [userResult] = await pool.execute(userQuery, [userData.email, userData.password]);
  
  const profileQuery = 'INSERT INTO profiles (user_id, first_name) VALUES (?, ?)';
  const [profileResult] = await pool.execute(profileQuery, [userResult.insertId, profileData.firstName]);
  
  return userResult.insertId;
}
```

**After (Safe):**
```javascript
static async createUserWithProfile(userData, profileData) {
  // ✅ Atomic - all operations succeed or all fail
  const results = await executeTransaction([
    {
      query: 'INSERT INTO users (email, password) VALUES (?, ?)',
      params: [userData.email, userData.password]
    },
    {
      query: 'INSERT INTO profiles (user_id, first_name) VALUES (LAST_INSERT_ID(), ?)',
      params: [profileData.firstName]
    }
  ]);
  
  return results[0][0].insertId; // Get insertId from first operation
}
```

## Common Migration Patterns

### Pattern 1: Simple SELECT with Single Result

```javascript
// Before
const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
return rows[0] || null;

// After  
const rows = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
return rows[0] || null;
```

### Pattern 2: SELECT with Multiple Results

```javascript
// Before
const [rows] = await pool.execute('SELECT * FROM users WHERE active = ?', [true]);
return rows;

// After
const rows = await executeQuery('SELECT * FROM users WHERE active = ?', [true]);
return rows;
```

### Pattern 3: COUNT/Aggregate Queries

```javascript
// Before
const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
return rows[0].count;

// After
const rows = await executeQuery('SELECT COUNT(*) as count FROM users');
return rows[0].count;
```

### Pattern 4: INSERT with Generated ID

```javascript
// Before
const [result] = await pool.execute('INSERT INTO products (name, price) VALUES (?, ?)', [name, price]);
return result.insertId;

// After
const [result] = await executeCommand('INSERT INTO products (name, price) VALUES (?, ?)', [name, price]);
return result.insertId;
```

### Pattern 5: UPDATE with Success Check

```javascript
// Before
const [result] = await pool.execute('UPDATE products SET price = ? WHERE id = ?', [price, id]);
return result.affectedRows > 0;

// After
const [result] = await executeCommand('UPDATE products SET price = ? WHERE id = ?', [price, id]);
return result.affectedRows > 0;
```

## Migration by Model Type

### User Model - Complete Example

**Before:**
```javascript
const { pool } = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create(userData) {
    const [result] = await pool.execute('INSERT INTO users (email, password) VALUES (?, ?)', 
      [userData.email, userData.password]);
    return result.insertId;
  }

  static async updateById(id, userData) {
    const [result] = await pool.execute('UPDATE users SET firstName = ? WHERE id = ?', 
      [userData.firstName, id]);
    return result.affectedRows > 0;
  }
}
```

**After:**
```javascript
const { executeQuery, executeCommand } = require('../config/database');

class User {
  static async findByEmail(email) {
    const rows = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create(userData) {
    const [result] = await executeCommand('INSERT INTO users (email, password) VALUES (?, ?)', 
      [userData.email, userData.password]);
    return result.insertId;
  }

  static async updateById(id, userData) {
    const [result] = await executeCommand('UPDATE users SET firstName = ? WHERE id = ?', 
      [userData.firstName, id]);
    return result.affectedRows > 0;
  }
}
```

## Testing Your Migration

### 1. Verify Return Values

```javascript
// Test that migrated functions return the same values
const testMigration = async () => {
  // Test SELECT
  const user = await User.findById(1);
  console.log('User object structure:', user); // Should be unchanged
  
  // Test INSERT  
  const newUserId = await User.create(userData);
  console.log('New user ID:', newUserId); // Should be number
  
  // Test UPDATE
  const updateSuccess = await User.updateById(1, userData);
  console.log('Update success:', updateSuccess); // Should be boolean
};
```

### 2. Test Error Handling

```javascript
// Verify errors are still thrown properly
try {
  await User.findById('invalid-id');
} catch (error) {
  console.log('Error caught correctly:', error.message);
}
```

### 3. Transaction Testing

```javascript
// Test transaction rollback
try {
  await executeTransaction([
    { query: 'INSERT INTO users (email) VALUES (?)', params: ['test@test.com'] },
    { query: 'INSERT INTO invalid_table (id) VALUES (?)', params: [1] } // This will fail
  ]);
} catch (error) {
  // Verify first INSERT was rolled back
  const user = await executeQuery('SELECT * FROM users WHERE email = ?', ['test@test.com']);
  console.log('User should not exist:', user.length === 0);
}
```

## Gradual Migration Strategy

### Phase 1: New Code Only
```javascript
// New models use centralized functions
const { executeQuery, executeCommand } = require('../config/database');

// Existing models keep using pool
const { pool } = require('../config/database');
```

### Phase 2: Model-by-Model Migration  
```javascript
// Migrate one model at a time, test thoroughly
// Keep both imports available during transition
const { pool, executeQuery, executeCommand } = require('../config/database');
```

### Phase 3: Full Migration
```javascript
// Remove pool from imports when all models migrated
const { executeQuery, executeCommand, executeTransaction } = require('../config/database');
```

## Common Pitfalls and Solutions

### ❌ Pitfall 1: Forgetting to Destructure executeCommand Results
```javascript
// Wrong
const result = await executeCommand('INSERT INTO users ...', params);
return result.insertId; // ❌ undefined

// Correct  
const [result] = await executeCommand('INSERT INTO users ...', params);
return result.insertId; // ✅ Works
```

### ❌ Pitfall 2: Using executeQuery for INSERT/UPDATE
```javascript
// Wrong - executeQuery doesn't return metadata
const rows = await executeQuery('INSERT INTO users ...', params);
return rows.insertId; // ❌ undefined

// Correct
const [result] = await executeCommand('INSERT INTO users ...', params);
return result.insertId; // ✅ Works
```

### ❌ Pitfall 3: Not Using Transactions for Related Operations
```javascript
// Wrong - can fail partially
await executeCommand('INSERT INTO users ...', userData);
await executeCommand('INSERT INTO profiles ...', profileData); // Could fail

// Correct - atomic operation
await executeTransaction([
  { query: 'INSERT INTO users ...', params: userData },
  { query: 'INSERT INTO profiles (user_id, ...) VALUES (LAST_INSERT_ID(), ...)', params: profileData }
]);
```

### ❌ Pitfall 4: Duplicating Error Logging
```javascript
// Wrong - double logging
try {
  const rows = await executeQuery(query, params);
  return rows;
} catch (error) {
  console.error('Query failed:', error); // ❌ executeQuery already logs this
  throw error;
}

// Correct - let centralized function handle logging
try {
  const rows = await executeQuery(query, params);
  return rows;
} catch (error) {
  // Handle business logic only
  throw new Error('Failed to fetch users');
}
```

## Validation Checklist

After migration, verify:

- [ ] All existing tests still pass
- [ ] Return values are unchanged
- [ ] Error handling works correctly  
- [ ] No duplicate error logging
- [ ] Related operations use transactions
- [ ] Performance is maintained or improved
- [ ] No connection leaks (check pool metrics)

## Getting Help

If you encounter issues during migration:

1. **Check the return values** - Make sure your functions return the same data structure
2. **Verify error handling** - Ensure errors are caught and handled appropriately  
3. **Test transactions** - Confirm rollback works correctly for failed operations
4. **Monitor performance** - Check that migration doesn't introduce performance regressions

## Migration Timeline Recommendation

| Week | Task | Focus |
|------|------|-------|
| 1 | Migrate User model | Learn the patterns |
| 2 | Migrate 1-2 simple models | Build confidence |
| 3 | Migrate complex models | Handle edge cases |
| 4 | Add transactions where needed | Improve data integrity |
| 5 | Remove direct pool usage | Clean up code |
| 6 | Performance testing | Verify improvements |

This gradual approach ensures stability while gaining the benefits of centralized database functions.