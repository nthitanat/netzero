import { useState } from 'react';
import AuthService from '../../../api/auth';
import UserService from '../../../api/users';

export default function LoginModalHandler({
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    isRegisterMode,
    setIsRegisterMode,
    isSubmitting,
    setIsSubmitting,
    login,
    register,
    onClose,
    onSuccess,
    clearError
}) {
    // Handle input changes
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

        // Clear general error
        if (clearError) {
            clearError();
        }
    };

    // Validate form data
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

        // Register mode validations
        if (isRegisterMode) {
            // Confirm password
            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }

            // First name
            if (!formData.firstName) {
                errors.firstName = 'First name is required';
            } else if (formData.firstName.length < 2) {
                errors.firstName = 'First name must be at least 2 characters';
            } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
                errors.firstName = 'First name can only contain letters and spaces';
            }

            // Last name
            if (!formData.lastName) {
                errors.lastName = 'Last name is required';
            } else if (formData.lastName.length < 2) {
                errors.lastName = 'Last name must be at least 2 characters';
            } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
                errors.lastName = 'Last name can only contain letters and spaces';
            }

            // Phone number (optional but validate if provided)
            if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
                errors.phoneNumber = 'Please enter a valid phone number';
            }

            // Address (optional but validate length if provided)
            if (formData.address && formData.address.length > 500) {
                errors.address = 'Address cannot exceed 500 characters';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
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

                result = await register(userData);
            } else {
                // Login user
                const credentials = {
                    email: formData.email,
                    password: formData.password
                };

                result = await login(credentials);
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

    // Toggle between login and register modes
    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        resetForm();
        clearError();
    };

    // Reset form data and errors
    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            confirmPassword: ''
        });
        setFormErrors({});
        setIsSubmitting(false);
    };

    // Handle overlay click (close modal)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Return handlers
    return {
        handleInputChange,
        handleSubmit,
        toggleMode,
        resetForm,
        handleOverlayClick,
        validateForm
    };
}