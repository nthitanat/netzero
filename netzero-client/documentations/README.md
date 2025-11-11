# NetZero Client Documentation

> Comprehensive documentation for the NetZero React application.

---

## 📚 Documentation Index

### **🔒 Mandatory Standards** (Read First!)

- **[API Service Standards](./API-STANDARDS.md)** ⭐ **CRITICAL**
  - Mandatory API service patterns
  - Export/Import standards
  - localStorage usage rules
  - Authentication patterns
  - Compliance checklist

### **⚡ Quick References**

- **[Quick Reference Guide](./QUICK-REFERENCE.md)**
  - The 4 Golden Rules
  - Common imports cheat sheet
  - Method references
  - Code templates
  - Common mistakes

### **🏗️ Architecture Documentation**

- **[Authentication System](../docs/auth/README.md)**
  - AuthContext architecture
  - Auth service patterns
  - Login/logout flows
  - Token management

- **[React Patterns](../docs/auth/react-patterns.md)**
  - Component structure (4-file pattern)
  - State management patterns
  - Hook patterns
  - Handler patterns

### **🔌 API Integration**

- **[Server-Side Search](../docs/server-side-search.md)**
  - Search implementation patterns
  - API integration examples
  
- **[Product Search Migration](../docs/ProductSearch-Migration.md)**
  - Product search implementation
  - Migration guidelines

---

## 🚀 Getting Started

### For New Developers

1. **Read These First (In Order):**
   - [API-STANDARDS.md](./API-STANDARDS.md) - Learn the mandatory patterns
   - [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Get familiar with common patterns
   - [Main README](../README.md) - Understand project structure

2. **Set Up Your Environment:**
   ```bash
   cd netzero-client
   npm install
   cp .env.example .env
   npm start
   ```

3. **Review Copilot Instructions:**
   - Check [../.copilot-instructions.md](../.copilot-instructions.md)
   - This ensures AI assistance follows project standards

### For Existing Developers

**Quick Access:**
- Need API patterns? → [API-STANDARDS.md](./API-STANDARDS.md)
- Need quick lookup? → [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
- Need component patterns? → [React Patterns](../docs/auth/react-patterns.md)

---

## 🎯 The 4 Golden Rules

> **Every developer must follow these rules at all times.**

### 1️⃣ API Service Pattern
```javascript
// ✅ ALWAYS: Instance-based with singleton export
export const serviceName = new ServiceName();
export default serviceName;
```

### 2️⃣ Import via Barrel
```javascript
// ✅ ALWAYS: Import from api/index.js
import { authService, userService } from '../../api';
```

### 3️⃣ Use storageService
```javascript
// ✅ ALWAYS: Use centralized storage
storageService.getAuthToken();
storageService.saveAuthData(token, user);
```

### 4️⃣ Use AuthContext in Components
```javascript
// ✅ ALWAYS: Use context, not service directly
const { user, login, logout } = useAuth();
```

---

## 📖 Documentation Categories

### **Standards & Guidelines**
Documents that define how code MUST be written:
- [API-STANDARDS.md](./API-STANDARDS.md) - API layer patterns (mandatory)
- [../.copilot-instructions.md](../.copilot-instructions.md) - Component patterns (mandatory)

### **Quick References**
Fast lookup documents for daily development:
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Common patterns and snippets
- [../README.md](../README.md) - Project overview and setup

### **Architecture Guides**
In-depth explanations of system design:
- [../docs/auth/README.md](../docs/auth/README.md) - Authentication architecture
- [../docs/auth/react-patterns.md](../docs/auth/react-patterns.md) - Component patterns

### **Implementation Guides**
Specific feature implementation examples:
- [../docs/server-side-search.md](../docs/server-side-search.md) - Search functionality
- [../docs/ProductSearch-Migration.md](../docs/ProductSearch-Migration.md) - Product search

---

## 🔍 Finding What You Need

### "How do I...?"

| Question | Document | Section |
|----------|----------|---------|
| Create a new API service? | [API-STANDARDS.md](./API-STANDARDS.md) | Pattern 1 |
| Import an API service? | [API-STANDARDS.md](./API-STANDARDS.md) | Pattern 3 |
| Use localStorage? | [API-STANDARDS.md](./API-STANDARDS.md) | Pattern 4 |
| Handle authentication? | [API-STANDARDS.md](./API-STANDARDS.md) | Pattern 6 |
| Create a component? | [React Patterns](../docs/auth/react-patterns.md) | Component Structure |
| Get quick code snippets? | [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Templates |
| Debug auth issues? | [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Debugging Tips |
| Set up project? | [../README.md](../README.md) | Getting Started |

---

## 📝 Contributing to Documentation

### Adding New Documentation

1. **Determine Category:**
   - Standards → Add to this folder or update existing
   - Implementation Guide → Add to `../docs/`
   - Quick Reference → Update [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)

2. **Follow Format:**
   - Use clear headings
   - Include code examples
   - Add ✅ DO and ❌ DON'T examples
   - Link to related documents

3. **Update Index:**
   - Add entry to this README
   - Update main [README.md](../README.md) if applicable
   - Update [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) if relevant

### Updating Existing Documentation

- **Standards Changed?** → Update [API-STANDARDS.md](./API-STANDARDS.md)
- **New Pattern?** → Add to [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
- **Architecture Change?** → Update relevant docs in `../docs/`

---

## ⚠️ Important Notes

### Non-Negotiable Rules

The patterns in [API-STANDARDS.md](./API-STANDARDS.md) are **mandatory** and **non-negotiable**:
- All API services MUST follow the singleton pattern
- All imports MUST use barrel exports
- All localStorage access MUST use storageService
- All components MUST use AuthContext for authentication

**Violations will be caught in code review and must be corrected.**

### Why These Rules Exist

1. **Consistency** - Predictable codebase for all developers
2. **Maintainability** - Easy to refactor and update
3. **Type Safety** - Centralized patterns reduce errors
4. **Testability** - Easy to mock and test services
5. **Onboarding** - New developers learn one way to do things

---

## 🆘 Getting Help

### Documentation Issues

**Can't find what you need?**
1. Check the index above
2. Use browser search (Ctrl/Cmd + F)
3. Ask in team chat

**Documentation unclear or outdated?**
1. Create an issue
2. Suggest improvements
3. Submit a PR with updates

### Code Issues

**Code not following standards?**
1. Review [API-STANDARDS.md](./API-STANDARDS.md)
2. Check [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
3. Look at existing working examples
4. Ask team for guidance

---

## 📊 Documentation Health

| Document | Status | Last Updated |
|----------|--------|--------------|
| API-STANDARDS.md | ✅ Current | Nov 11, 2025 |
| QUICK-REFERENCE.md | ✅ Current | Nov 11, 2025 |
| README.md (main) | ✅ Current | Nov 11, 2025 |
| .copilot-instructions.md | ✅ Current | Nov 11, 2025 |
| auth/README.md | ✅ Current | Earlier |
| auth/react-patterns.md | ✅ Current | Earlier |

---

## 📞 Contact

For questions about:
- **Standards & Patterns** → Review docs first, then ask team
- **Architecture Decisions** → Discuss with tech lead
- **Documentation Updates** → Submit PR or create issue

---

**Last Updated:** November 11, 2025  
**Maintained By:** Development Team  
**Status:** ✅ Active & Current
