# NetZero Server Documentation

This folder contains the NetZero backend architecture guide and supporting API/database documentation.

## 📚 Documentation Files

### 🧭 [GENERAL_ARCHITECTURE.md](./GENERAL_ARCHITECTURE.md)

**NetZero backend target architecture and migration guide**

- Defines the route → middleware → controller → service → model boundaries, plus the role of pure utilities and external adapters
- Distinguishes the target design from the current implementation and preserves the existing `/api/v1` client contract during migration
- Covers the function-based resource coding pattern, transactions, field mapping, errors, uploads, integrations, and a migration checklist

### 📖 [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)
**Complete technical documentation for the centralized database architecture**

- **Architecture Overview**: Visual diagrams and layer explanations
- **Function Specifications**: Detailed API documentation for `executeQuery`, `executeCommand`, `executeTransaction`
- **Usage Examples**: Real-world code examples and patterns
- **Best Practices**: Guidelines for choosing the right function and error handling
- **Transaction Management**: ACID properties and automatic behaviors
- **Performance Considerations**: Connection pooling and optimization strategies
- **Future Roadmap**: Planned enhancements and extension points

**Target Audience**: Developers implementing database operations, architects reviewing the system

### 🚀 [DATABASE_ARCHITECTURE_MIGRATION_GUIDE.md](./DATABASE_ARCHITECTURE_MIGRATION_GUIDE.md)
**Step-by-step guide for migrating from direct `pool.execute()` to centralized functions**

- **Quick Migration Checklist**: Essential steps for migration
- **Pattern-by-Pattern Examples**: Before/after code comparisons
- **Common Pitfalls**: Frequent mistakes and how to avoid them
- **Testing Strategies**: How to verify migrations work correctly
- **Gradual Migration Timeline**: Phased approach for safe migration
- **Validation Checklist**: Ensure nothing breaks during migration

**Target Audience**: Developers migrating existing code, new team members learning the patterns


## 🎯 Quick Start

### For New Developers
1. Start with **[GENERAL_ARCHITECTURE.md](./GENERAL_ARCHITECTURE.md)** for layer responsibilities and migration status
2. Read **[DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)** for database helper details
3. Reference **[DATABASE_ARCHITECTURE_MIGRATION_GUIDE.md](./DATABASE_ARCHITECTURE_MIGRATION_GUIDE.md)** when changing database code

### For Existing Code Migration
1. Review **[GENERAL_ARCHITECTURE.md](./GENERAL_ARCHITECTURE.md)** for layer boundaries and current migration status
2. Use **[DATABASE_ARCHITECTURE_MIGRATION_GUIDE.md](./DATABASE_ARCHITECTURE_MIGRATION_GUIDE.md)** for database-helper changes
3. Verify endpoint contracts and transaction behavior as each resource moves between layers

### For Architectural Review
1. Review **[GENERAL_ARCHITECTURE.md](./GENERAL_ARCHITECTURE.md)** for the target and current gaps
2. Review **[DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)** for database helper details
3. Compare the target with the current routes, controllers, services, and models

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                Application Layer                    │
├─────────────────────────────────────────────────────┤
│                 Model Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │executeQuery │ │executeCommand│ │executeTransaction│
│  │   (SELECT)  │ │(INSERT/UPDATE│ │  (Multiple  │   │
│  │             │ │   /DELETE)  │ │ Operations) │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│              Database Config Layer                  │
│            (Centralized Functions)                  │
├─────────────────────────────────────────────────────┤
│                MySQL Pool                           │
│            (Connection Management)                  │
└─────────────────────────────────────────────────────┘
```

## 🔧 Function Quick Reference

| Function | Use Case | Returns | Example |
|----------|----------|---------|---------|
| `executeQuery` | SELECT operations | Data rows only | `const users = await executeQuery('SELECT * FROM users')` |
| `executeCommand` | INSERT/UPDATE/DELETE | Full result with metadata | `const [result] = await executeCommand('INSERT ...'); return result.insertId` |
| `executeTransaction` | Multiple related operations | Array of results | `await executeTransaction([{query: '...', params: []}])` |

## ✅ Benefits Summary

### 🎯 **Type Safety & Clarity**
- Function names clearly indicate operation type
- Appropriate return values for each operation
- Self-documenting code patterns

### 🛡️ **Error Handling & Reliability** 
- Centralized error logging with consistent messages
- Automatic transaction rollback on failures
- Guaranteed connection cleanup prevents leaks

### 🔄 **Data Integrity**
- ACID compliance for complex operations
- Atomic success/failure for related operations
- Automatic rollback prevents partial data corruption

### 📈 **Performance & Scalability**
- Efficient connection pooling and reuse
- Transaction batching reduces database round-trips
- Foundation for future caching and optimization

### 🔧 **Developer Experience**
- Clear patterns reduce learning curve
- Comprehensive documentation and examples
- Gradual migration path preserves existing code

## 🚦 Migration Status

| Model | Status | Notes |
|-------|--------|-------|
| **User** | ✅ **Migrated** | Complete migration with all centralized functions |
| **Product** | ✅ **Helper-based** | Uses `executeQuery` and `executeCommand` |
| **ProductReservation** | 🔄 **Direct pool** | Uses `pool.execute()` and owns a transaction in the model |
| **Event** | ✅ **Helper-based** | Uses `executeQuery` and `executeCommand` |

## 📞 Support & Questions

For questions about:
- **Implementation**: Reference [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) examples
- **Migration**: Follow [DATABASE_ARCHITECTURE_MIGRATION_GUIDE.md](./DATABASE_ARCHITECTURE_MIGRATION_GUIDE.md) for database-helper changes
- **Architecture Decisions**: Review [GENERAL_ARCHITECTURE.md](./GENERAL_ARCHITECTURE.md) for layer responsibilities and migration priorities

## 📋 Maintenance Notes

### Regular Tasks
- [ ] Monitor connection pool utilization
- [ ] Review error logs for database issues  
- [ ] Update documentation when adding new patterns
- [ ] Migrate additional models when convenient

### Future Enhancements
- [ ] Add query caching layer
- [ ] Implement performance monitoring
- [ ] Add connection analytics dashboard
- [ ] Consider read replica support

---

**Last Updated**: October 10, 2025  
**Next Review**: When migrating additional models or adding new database features
