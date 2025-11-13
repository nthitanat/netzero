import { useState } from 'react';

/**
 * Custom hook for managing Registration page state
 * Handles multi-step form state and navigation
 */
const useRegistration = () => {
  // Step management (1: Registration, 2: Survey, 3: Success)
  const [currentStep, setCurrentStep] = useState(1);

  // Registration form data
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  // Form validation errors
  const [registrationErrors, setRegistrationErrors] = useState({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Success message for final step
  const [successMessage, setSuccessMessage] = useState('');

  // User ID from successful registration (needed for survey submission)
  const [userId, setUserId] = useState(null);

  /**
   * Update registration form data
   */
  const updateRegistrationData = (field, value) => {
    setRegistrationData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user types
    if (registrationErrors[field]) {
      setRegistrationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  /**
   * Set registration validation errors
   */
  const updateRegistrationErrors = (errors) => {
    setRegistrationErrors(errors);
  };

  /**
   * Navigate to specific step
   */
  const goToStep = (step) => {
    setCurrentStep(step);
  };

  /**
   * Update loading state
   */
  const updateLoadingState = (loading) => {
    setIsLoading(loading);
  };

  /**
   * Set success message
   */
  const updateSuccessMessage = (message) => {
    setSuccessMessage(message);
  };

  /**
   * Set user ID after successful registration
   */
  const updateUserId = (id) => {
    setUserId(id);
  };

  /**
   * Reset all state (useful for starting over)
   */
  const resetState = () => {
    setCurrentStep(1);
    setRegistrationData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    });
    setRegistrationErrors({});
    setIsLoading(false);
    setSuccessMessage('');
    setUserId(null);
  };

  return {
    // State
    currentStep,
    registrationData,
    registrationErrors,
    isLoading,
    successMessage,
    userId,

    // Actions
    updateRegistrationData,
    updateRegistrationErrors,
    goToStep,
    updateLoadingState,
    updateSuccessMessage,
    updateUserId,
    resetState,
  };
};

export default useRegistration;
