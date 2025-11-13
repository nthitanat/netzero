# Registration Page Documentation

## Overview
The Registration page is a 3-step user registration flow that collects user information, administers a survey, and displays success confirmation.

## Route
- **Path:** `/registration`
- **Component:** `Registration`

## Flow Steps

### Step 1: User Registration Form
Collects essential user information:
- First Name (required)
- Last Name (required)
- Email (required)
- Password (required, minimum 6 characters)
- Confirm Password (required, must match password)
- Phone Number (optional)

**Validation:**
- Email format validation
- Password strength (minimum 6 characters)
- Password confirmation matching
- Phone number format (10 digits, optional)

### Step 2: Survey Form
- Uses **Survey ID: 1** (Chula NetZero 65-question survey)
- Dynamically loads survey questions from backend
- Supports multiple question types:
  - Text input
  - Yes/No radio buttons
  - Multiple choice
  - Checkboxes
  - Rating scale
- Progress tracking with visual progress bar
- Validates all questions are answered before submission

### Step 3: Success Confirmation
- Displays success message
- Provides navigation options:
  - "เข้าสู่ระบบ" (Go to Login) - Redirects to `/login`
  - "กลับหน้าหลัก" (Go to Home) - Redirects to `/`

## Architecture

### File Structure
```
pages/Registration/
├── Registration.jsx             # Main component
├── Registration.module.scss     # Styling
├── useRegistration.js          # State management hook
└── RegistrationHandler.js      # Business logic
```

### State Management (useRegistration.js)
```javascript
{
  currentStep: 1,                    // Current step (1, 2, or 3)
  registrationData: {                // Form data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  },
  registrationErrors: {},            // Validation errors
  isLoading: false,                  // Loading state
  successMessage: '',                // Success message for step 3
  userId: null                       // User ID from registration
}
```

### Handler Methods (RegistrationHandler.js)

#### `handleInputChange(event)`
Updates form field values and clears field-specific errors.

#### `validateRegistrationForm(data)`
Validates all registration form fields and returns error object.

#### `handleRegistrationSubmit(event)`
Handles Step 1 form submission:
1. Validates form data
2. Calls `authService.register()`
3. Stores user ID from response
4. Navigates to Step 2 on success

#### `handleSurveySuccess(response)`
Handles successful survey submission:
- Sets success message
- Navigates to Step 3

#### `handleSurveyError(error)`
Handles survey submission errors:
- Logs error
- Shows user-friendly message
- Still allows proceeding to Step 3 (registration succeeded)

## Components Used

### SurveyForm
Located in: `components/common/SurveyForm/`
- Loads survey by ID
- Renders all questions dynamically
- Manages survey state and validation
- Handles submission

### SurveyQuestion
Located in: `components/common/SurveyQuestion/`
- Renders individual question based on type
- Handles input changes
- Displays validation errors

## API Integrations

### Authentication API
**Endpoint:** `POST /api/auth/register`
```javascript
{
  email: "user@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
  phone_number: "0812345678"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    user_id: 1,
    email: "user@example.com",
    token: "jwt_token_here"
  }
}
```

### Survey API
**Endpoint:** `GET /api/surveys/1`
- Retrieves survey with all questions

**Endpoint:** `POST /api/surveys/1/submit`
```javascript
{
  answers: [
    {
      question_id: 1,
      answer_text: "User's answer"
    }
  ]
}
```

## Styling

### Design System
Uses centralized SCSS design system:
- Color palette: `primary-color-1` through `primary-color-4`
- Typography: `font-size-palette` mixins
- Consistent spacing and border radius

### Key Styles
- Progress indicator with 3 steps
- Form with responsive grid layout (2 columns on desktop, 1 on mobile)
- Clean, modern success confirmation with SVG icon
- Mobile-responsive design

### Color Scheme
- Primary: Forest Green (#4CAF50)
- Background: Light Green (#C8E6C9)
- Text: Dark Green (#1B5E20)
- Error: Red (#f44336)
- Success: Green (#4CAF50)

## Error Handling

### Registration Errors
- Email already exists (409 status)
- Validation failures
- Network errors
- Generic server errors

### Survey Errors
- Survey load failure (shows empty message)
- Submission failure (allows proceeding with warning)
- Missing required answers (validation prevents submission)

## User Experience

### Progress Indication
- Visual 3-step progress indicator at top
- Active step highlighted in green
- Completed steps maintain highlight
- Progress bar on survey form

### Loading States
- Submit button shows "กำลังสร้างบัญชี..." during registration
- Disabled state prevents double submission
- Survey form loading indicator (inherited from SurveyForm)

### Success Feedback
- Large success icon (SVG checkmark)
- Clear success message
- Action buttons for next steps

## Testing the Flow

### Manual Testing Steps
1. Navigate to `/registration`
2. Fill in registration form with valid data
3. Verify email validation
4. Verify password matching
5. Submit and verify navigation to survey
6. Answer all survey questions
7. Verify progress bar updates
8. Submit survey
9. Verify success confirmation displays
10. Test navigation buttons

### Test Data
```javascript
{
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  password: "test123",
  confirmPassword: "test123",
  phoneNumber: "0812345678"
}
```

## Future Enhancements

### Potential Improvements
1. **Step Navigation:** Add back button to return to previous steps
2. **Draft Saving:** Auto-save survey progress
3. **Email Verification:** Send confirmation email after registration
4. **Skip Survey:** Optional skip button for survey step
5. **Social Login:** Add Google/Facebook registration
6. **Password Strength Meter:** Visual password strength indicator
7. **Profile Photo:** Upload profile photo during registration
8. **Terms & Conditions:** Checkbox for terms acceptance

### Known Limitations
1. Survey cannot be skipped (required step)
2. No "Back" navigation between steps
3. Survey must be completed in one session
4. Phone number format only validates Thai numbers (10 digits)

## Troubleshooting

### Common Issues

**Issue:** Registration form validation not working
- **Solution:** Check that all required fields have values
- **Solution:** Verify password is at least 6 characters
- **Solution:** Ensure passwords match

**Issue:** Survey not loading
- **Solution:** Verify Survey ID 1 exists in database
- **Solution:** Run `npm run survey:init` on backend to create survey
- **Solution:** Check browser console for API errors

**Issue:** Submission fails at survey step
- **Solution:** Verify all questions are answered
- **Solution:** Check network tab for API errors
- **Solution:** Verify user is authenticated (has token from step 1)

**Issue:** Styling looks broken
- **Solution:** Verify SCSS imports are correct
- **Solution:** Check that main.scss contains all necessary mixins
- **Solution:** Clear browser cache and rebuild

## Related Documentation
- [Survey API Documentation](../netzero-server/docs/README.md)
- [Authentication Service](./auth/README.md)
- [Component Architecture](./README.md)
- [API Standards](./documentations/API-STANDARDS.md)
