# Database Structure Utility

This utility automatically ensures that all database tables exist with the correct structure according to your models. Each model defines its own schema, and the utility creates missing tables and adds missing columns while preserving existing data.

## Features

- ✅ **Model-owned schemas** - Each model defines its own table structure
- ✅ **Automatic table creation** - Creates tables if they don't exist
- ✅ **Schema synchronization** - Adds missing columns to existing tables
- ✅ **Index management** - Ensures proper indexes are created
- ✅ **Foreign key constraints** - Maintains referential integrity
- ✅ **Data preservation** - Never removes existing data or columns
- ✅ **Model integration** - Each model automatically ensures its table structure

## Usage

### Automatic (Recommended)

The database structure is automatically ensured when:
1. **Server starts** - The server initializes the database structure on startup
2. **Model operations** - Each model ensures its table exists before performing operations

### Manual

You can manually run the database utility:

```bash
# Using npm script
npm run db:ensure

# Or directly with node
node scripts/ensureDatabase.js
```

## How it Works

### 1. Schema Definition

Each model defines its own table schema using a `getSchema()` method:

```javascript
class User {
  // Database schema definition
  static getSchema() {
    return {
      tableName: 'users',
      columns: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        email: 'VARCHAR(255) UNIQUE NOT NULL',
        // ... more columns
      },
      foreignKeys: [
        // ... foreign key constraints
      ],
      indexes: [
        'INDEX idx_users_email (email)',
        // ... more indexes
      ]
    };
  }
  
  // Ensure table exists
  static async ensureTable() {
    return await ensureModelTable(User.getSchema());
  }
}
```

### 2. Model Integration

Each model has `getSchema()` and `ensureTable()` methods:

```javascript
class User {
  // Define the schema
  static getSchema() {
    return { /* schema definition */ };
  }

  // Ensure table exists
  static async ensureTable() {
    return await ensureModelTable(User.getSchema());
  }

  static async create(userData) {
    // Ensure table exists
    await User.ensureTable();
    
    // ... rest of the method
  }
}
```

### 3. Table Creation Process

When a table doesn't exist:
1. Creates the table with all columns
2. Adds foreign key constraints
3. Creates indexes for performance

### 4. Schema Synchronization

When a table exists but has missing columns:
1. Compares current structure with target schema
2. Adds missing columns (never removes existing ones)
3. Adds missing indexes
4. Preserves all existing data

## Supported Tables

The utility manages the following tables:

- **users** - User accounts and profiles
- **products** - Product listings
- **product_reservations** - Product reservations/orders
- **events** - Event listings
- **chatApps** - Chat applications

## Configuration

### Table Schema Structure

Each table schema in `TABLE_SCHEMAS` should have:

```javascript
{
  tableName: 'table_name',           // The actual table name
  columns: {                        // Column definitions
    column_name: 'SQL_DEFINITION'
  },
  foreignKeys: [                    // Optional foreign key constraints
    'FOREIGN KEY (column) REFERENCES other_table(id)'
  ],
  indexes: [                        // Optional indexes
    'INDEX idx_name (column_name)'
  ]
}
```

### Environment Variables

Ensure your `.env` file has the correct database configuration:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=netzeroadmin
DB_PASSWORD=your_password
DB_NAME=netzero
```

## Safety Features

### Data Protection
- **Never removes** existing tables
- **Never removes** existing columns
- **Never modifies** existing data
- Only **adds** missing structures

### Error Handling
- Detailed error messages for troubleshooting
- Graceful handling of existing structures
- Transaction support for complex operations

### Performance
- Creates indexes for better query performance
- Uses connection pooling
- Minimal impact on existing operations

## Troubleshooting

### Common Issues

1. **Connection Failed**
   ```
   Error: Database connection failed
   ```
   - Check database server is running
   - Verify credentials in `.env`
   - Ensure network connectivity

2. **Permission Denied**
   ```
   Error: Access denied for user
   ```
   - Check user permissions
   - Ensure user can CREATE/ALTER tables
   - Verify user can CREATE indexes

3. **Database Not Found**
   ```
   Error: Unknown database 'netzero'
   ```
   - Create the database first
   - Verify database name in `.env`

### Debug Mode

For detailed logging, set environment to development:

```bash
NODE_ENV=development npm run db:ensure
```

## Integration Examples

### In Controllers

```javascript
// Controllers don't need to call ensureTable manually
// It's handled automatically by the models

const users = await User.findAll();  // Table is ensured automatically
```

### In New Models

When creating a new model:

1. Add `getSchema()` method to define table structure
2. Add `ensureTable()` method to your model
3. Call `ensureTable()` in model methods
4. Import the model in `initDatabase.js`

```javascript
class NewModel {
  static getSchema() {
    return {
      tableName: 'new_table',
      columns: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        // ... other columns
      },
      indexes: [
        // ... indexes
      ]
    };
  }

  static async ensureTable() {
    return await ensureModelTable(NewModel.getSchema());
  }

  static async create(data) {
    await NewModel.ensureTable();
    // ... implementation
  }
}
```

## Best Practices

1. **Schema Evolution** - Add new columns to schemas, don't remove old ones
2. **Indexing** - Add indexes for columns used in WHERE clauses
3. **Foreign Keys** - Define relationships for data integrity
4. **Testing** - Test schema changes in development first
5. **Backup** - Always backup production data before schema changes

## Migration vs Ensure

This utility is different from traditional database migrations:

| Migrations | Database Ensure |
|------------|-----------------|
| Version-based | Structure-based |
| Sequential | Idempotent |
| Can break if skipped | Always works |
| Manual execution | Automatic |
| Can remove structures | Only adds structures |

The "ensure" approach is safer and more suitable for development and small-scale deployments where you want the database structure to automatically match your models.