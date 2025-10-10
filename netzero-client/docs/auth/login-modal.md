# LoginModal Component Guide

## 🎯 Overview

The `LoginModal` component provides a comprehensive user interface for authentication (login/register) that integrates directly with the AuthContext system. It follows the NetZero project's 4-file component architecture pattern.

## 🏗️ Component Architecture

### File Structure
```
LoginModal/
├── LoginModal.jsx          # React component (presentation only)
├── LoginModal.module.scss  # Scoped SCSS styles
├── useLoginModal.js        # Custom hook for state management (not shown in current implementation)
└── LoginModalHandler.js    # Business logic and event handlers
```

### Current Implementation
The current implementation combines some patterns, with the main component managing local state and the handler managing business logic.

## 🔄 Connection Flow

### Direct Connection to AuthContext
```javascript
import { useAuth } from "../../../contexts/AuthContext";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
    const { login, register, isLoading, error, clearError } = useAuth(); // ← Direct connection
    
    // Pass AuthContext functions to handler
    const handlers = LoginModalHandler({
        login,        // ← AuthContext.login function
        register,     // ← AuthContext.register function
        clearError    // ← AuthContext.clearError function
    });
}
```

### Complete Flow Visualization
```
User clicks "Sign In" button
          ↓
LoginModalHandler.handleSubmit() called
          ↓
await login(credentials) // ← This is AuthContext.login()
          ↓
AuthContext.login() executes:
  - dispatch({ type: 'SET_LOADING', payload: true })
  - await AuthService.login(credentials)
  - dispatch({ type: 'SET_USER', payload: user })
          ↓
AuthContext state updates
          ↓
LoginModal re-renders with new auth state
          ↓
All other components using useAuth() also re-render
```

## 📝 Component State Management

### Local State
```javascript
const [isRegisterMode, setIsRegisterMode] = useState(false);
const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    confirmPassword: ''
});
const [formErrors, setFormErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

### AuthContext State Integration
```javascript
const { login, register, isLoading, error, clearError } = useAuth();

// The component automatically reflects AuthContext state:
// - isLoading: Shows/hides loading spinners
// - error: Displays error messages
// - Authentication success: Automatically closes modal
```

## 🎨 UI Features

### Dual Mode Operation
- **Login Mode**: Email and password fields
- **Register Mode**: Extended form with additional user information

### Form Fields

#### Login Fields
- Email (required, validated)
- Password (required)

#### Additional Register Fields
- Confirm Password (required, must match)
- First Name (required, 2+ characters, letters only)
- Last Name (required, 2+ characters, letters only)
- Phone Number (optional, format validated)
- Address (optional, max 500 characters)

### Dynamic UI Elements
```javascript
{error && (
    <div className={styles.errorMessage}>
        {error}
    </div>
)}

<button
    type="submit"
    className={styles.submitButton}
    disabled={isSubmitting || isLoading}
>
    {isSubmitting || isLoading ? (
        <span className={styles.loadingSpinner}>
            {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
        </span>
    ) : (
        isRegisterMode ? 'Create Account' : 'Sign In'
    )}
</button>
```

## 🔧 Handler Functions

### Form Validation
```javascript
const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
        errors.email = 'Email is required';
    } else if (!AuthService.validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (isRegisterMode) {
        const passwordValidation = AuthService.validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.errors[0];
        }
    }

    // Register mode additional validations...
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
};
```

### Input Change Handling
```javascript
const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    }

    // Clear general error from AuthContext
    if (clearError) {
        clearError();
    }
};
```

### Form Submission
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    setIsSubmitting(true);
    clearError();

    try {
        let result;

        if (isRegisterMode) {
            // Register user
            const userData = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber || undefined,
                address: formData.address || undefined
            };

            result = await register(userData); // ← Direct AuthContext call
        } else {
            // Login user
            const credentials = {
                email: formData.email,
                password: formData.password
            };

            result = await login(credentials); // ← Direct AuthContext call
        }

        if (result.success) {
            // Success callback
            if (onSuccess) {
                onSuccess(result.user);
            }
            
            // Close modal
            onClose();
            
            // Reset form
            resetForm();
        }
    } catch (error) {
        console.error('Auth error:', error);
    } finally {
        setIsSubmitting(false);
    }
};
```

## 🎭 Modal Behavior

### Accessibility Features
- **Escape Key**: Closes modal
- **Click Outside**: Closes modal
- **Focus Management**: Prevents body scroll when open
- **ARIA Labels**: Proper labeling for screen readers

### Lifecycle Management
```javascript
// Handle escape key and click outside
useEffect(() => {
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    
    if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
    };
}, [isOpen, onClose]);
```

### State Reset
```javascript
// Clear form and errors when modal is closed or mode changes
useEffect(() => {
    if (!isOpen) {
        resetForm();
        clearError();
    }
}, [isOpen]);

useEffect(() => {
    resetForm();
    clearError();
}, [isRegisterMode]);
```

## 🔄 Mode Switching

### Toggle Between Login/Register
```javascript
const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    resetForm();
    clearError();
};

// UI Toggle Button
<div className={styles.toggleMode}>
    <p>
        {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
        <button
            type="button"
            className={styles.toggleButton}
            onClick={handlers.toggleMode}
            disabled={isSubmitting || isLoading}
        >
            {isRegisterMode ? 'Sign In' : 'Create Account'}
        </button>
    </p>
</div>
```

## ⚠️ Error Handling

### Multi-Level Error System
1. **Field Errors**: Individual input validation errors
2. **AuthContext Errors**: Server/network errors from authentication
3. **Form Errors**: Overall form validation errors

### Error Display
```javascript
// AuthContext errors (global)
{error && (
    <div className={styles.errorMessage}>
        {error}
    </div>
)}

// Field-specific errors
{formErrors.email && (
    <span className={styles.fieldError}>{formErrors.email}</span>
)}
```

### Error Clearing Strategy
- Clear field errors when user starts typing
- Clear AuthContext errors on input change
- Reset all errors when switching modes
- Clear errors when modal closes

## 🎯 Integration Points

### Parent Component Integration
```javascript
// Usage in parent component
<LoginModal 
    isOpen={showLoginModal}
    onClose={() => setShowLoginModal(false)}
    onSuccess={(user) => {
        console.log('User authenticated:', user);
        // Handle post-authentication logic
    }}
/>
```

### AuthContext Integration
- **Direct Function Calls**: `login()`, `register()`, `clearError()`
- **State Consumption**: `isLoading`, `error`
- **Automatic Updates**: Component re-renders on auth state changes

### AuthService Integration (Indirect)
```javascript
// Validation uses AuthService utilities
if (!AuthService.validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
}

const passwordValidation = AuthService.validatePassword(formData.password);
if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
}
```

## 🚀 Key Features

### User Experience
- **Seamless Mode Switching**: Between login and register
- **Real-time Validation**: Immediate feedback on input errors
- **Loading States**: Visual feedback during authentication
- **Error Recovery**: Clear error states when user corrects input

### Developer Experience
- **Direct AuthContext Integration**: No complex state management
- **Comprehensive Validation**: Both client-side and server-side
- **Flexible Callbacks**: Success and close handlers
- **Error Isolation**: Errors don't affect other components

### Security
- **Input Sanitization**: Proper validation before submission
- **Error Handling**: Graceful handling of authentication failures
- **State Cleanup**: Proper cleanup on modal close

## 📱 Responsive Design

The component uses SCSS modules for responsive styling:
- **Mobile-First**: Optimized for mobile devices
- **Flexible Layout**: Adapts to different screen sizes
- **Touch-Friendly**: Appropriate button sizes and spacing

This LoginModal provides a complete, user-friendly authentication interface that seamlessly integrates with the NetZero authentication system while maintaining excellent user experience and developer ergonomics.