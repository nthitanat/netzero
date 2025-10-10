# React Patterns: useReducer, Dispatch & Actions

## 🎯 Understanding useReducer Pattern

The `useReducer` pattern is a more powerful version of `useState` for managing complex state. Instead of directly setting state, you dispatch actions that describe what happened, and a reducer function decides how to update the state.

## 🧩 The Three Core Concepts

### 1. Action Types - What Can Happen

Action types are constants that describe events in your application:

```javascript
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',    // "Show/hide loading spinner"
  SET_USER: 'SET_USER',          // "User logged in successfully"
  SET_ERROR: 'SET_ERROR',        // "Something went wrong"
  LOGOUT: 'LOGOUT'               // "User logged out"
};
```

Think of these as **"events"** or **"commands"** that can happen in your app.

### 2. Actions - Messages with Data

An **action** is an object that describes what happened and includes any necessary data:

```javascript
// Simple action (no data needed)
{ type: 'LOGOUT' }

// Action with data (payload)
{ type: 'SET_USER', payload: { name: 'John', email: 'john@example.com' } }
{ type: 'SET_ERROR', payload: 'Invalid password' }
{ type: 'SET_LOADING', payload: true }
```

### 3. Reducer - The State Update Logic

The reducer is a **pure function** that takes the current state and an action, then returns the new state:

```javascript
const authReducer = (currentState, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...currentState,           // Keep all existing state
        isLoading: action.payload, // Update just the loading field
        error: null                // Clear any errors
      };

    case 'SET_USER':
      return {
        ...currentState,
        user: action.payload,           // Set the user data
        isAuthenticated: true,          // Mark as authenticated
        isLoading: false,              // Stop loading
        error: null                    // Clear errors
      };

    case 'LOGOUT':
      return {
        ...currentState,
        user: null,            // Clear user data
        isAuthenticated: false, // Mark as not authenticated
        isLoading: false,
        error: null
      };

    default:
      return currentState;     // No changes for unknown actions
  }
};
```

### 4. Dispatch - How to Trigger Changes

`dispatch` is a function that sends actions to the reducer:

```javascript
const [state, dispatch] = useReducer(authReducer, initialState);

// To show loading spinner
dispatch({ type: 'SET_LOADING', payload: true });

// To set user after successful login
dispatch({ 
  type: 'SET_USER', 
  payload: { name: 'John', email: 'john@example.com' }
});

// To logout (no data needed)
dispatch({ type: 'LOGOUT' });
```

## 📋 Real Example: Login Process

Let's trace through what happens when a user logs in:

```javascript
const login = async (credentials) => {
  // 1. Start loading
  dispatch({ type: 'SET_LOADING', payload: true });
  
  try {
    // 2. Make API call
    const response = await AuthService.login(credentials);
    
    if (response.success) {
      // 3. Success: Set user data
      dispatch({ type: 'SET_USER', payload: response.data.user });
    } else {
      // 4. API returned error
      dispatch({ type: 'SET_ERROR', payload: response.message });
    }
  } catch (error) {
    // 5. Network/other error
    dispatch({ type: 'SET_ERROR', payload: 'Login failed' });
  }
};
```

**Step by step state changes:**

1. **Initial state:**
   ```javascript
   { user: null, isAuthenticated: false, isLoading: false, error: null }
   ```

2. **After `SET_LOADING`:**
   ```javascript
   { user: null, isAuthenticated: false, isLoading: true, error: null }
   ```

3. **After successful `SET_USER`:**
   ```javascript
   { 
     user: { name: 'John', email: 'john@example.com' }, 
     isAuthenticated: true, 
     isLoading: false, 
     error: null 
   }
   ```

## 🆚 useState vs useReducer Comparison

### **useState** approach (simple but gets messy):
```javascript
const [user, setUser] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// Login becomes messy with multiple state setters:
const login = async (creds) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await api.login(creds);
    setUser(response.user);
    setIsLoading(false);
  } catch (err) {
    setError(err.message);
    setIsLoading(false);
  }
};
```

### **useReducer** approach (organized and predictable):
```javascript
const [state, dispatch] = useReducer(authReducer, initialState);

// Login is cleaner with single dispatch calls:
const login = async (creds) => {
  dispatch({ type: 'SET_LOADING', payload: true });
  try {
    const response = await api.login(creds);
    dispatch({ type: 'SET_USER', payload: response.user });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', payload: err.message });
  }
};
```

## 🎭 Mental Model: Bank Account System

Think of it like a **bank account system:**

- **Action Types** = Types of transactions (deposit, withdraw, transfer)
- **Actions** = Specific transaction details (deposit $100, withdraw $50)
- **Reducer** = Bank rules (how each transaction affects your balance)
- **Dispatch** = Submitting a transaction to the bank
- **State** = Your current account balance

Every time you dispatch an action, the reducer applies the bank's rules to calculate your new balance, just like how the auth reducer applies authentication rules to calculate the new auth state.

## ✅ Key Benefits

1. **Predictable State Updates:** All state changes go through the reducer
2. **Centralized Logic:** All state update rules are in one place
3. **Easier Testing:** You can test the reducer function independently
4. **Better Organization:** Clear separation between "what happened" (actions) and "how to update" (reducer)
5. **Debugging:** Easy to log all actions and see exactly what's changing

## 🚫 When NOT to Use useReducer

- Simple state that rarely changes
- Only one or two related state variables
- State updates don't have complex logic
- Component-level state that doesn't need to be shared

## ✅ When to Use useReducer

- Complex state with multiple sub-values
- State transitions that depend on previous state
- State logic that needs to be shared or tested
- Multiple ways to update the same state
- **Authentication systems** (like ours!)

This pattern makes complex state management much more organized and predictable than trying to coordinate multiple `useState` calls!