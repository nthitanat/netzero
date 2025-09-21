import React, { useEffect, useState } from "react";
import styles from "./LoginModal.module.scss";
import LoginModalHandler from "./LoginModalHandler";
import { useAuth } from "../../../contexts/AuthContext";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
    const { login, register, isLoading, error, clearError } = useAuth();
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

    const handlers = LoginModalHandler({
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
    });

    // Handle escape key and click outside
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Clear form and errors when modal is closed or mode changes
    useEffect(() => {
        if (!isOpen) {
            handlers.resetForm();
            clearError();
        }
    }, [isOpen, clearError]);

    useEffect(() => {
        handlers.resetForm();
        clearError();
    }, [isRegisterMode, clearError]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handlers.handleOverlayClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {isRegisterMode ? 'Create Account' : 'Sign In'}
                    </h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlers.handleSubmit} className={styles.authForm}>
                        {/* Email Field */}
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handlers.handleInputChange}
                                className={`${styles.formInput} ${formErrors.email ? styles.inputError : ''}`}
                                placeholder="Enter your email"
                                required
                                disabled={isSubmitting || isLoading}
                            />
                            {formErrors.email && (
                                <span className={styles.fieldError}>{formErrors.email}</span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.formLabel}>
                                Password *
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handlers.handleInputChange}
                                className={`${styles.formInput} ${formErrors.password ? styles.inputError : ''}`}
                                placeholder="Enter your password"
                                required
                                disabled={isSubmitting || isLoading}
                            />
                            {formErrors.password && (
                                <span className={styles.fieldError}>{formErrors.password}</span>
                            )}
                        </div>

                        {/* Register Mode Additional Fields */}
                        {isRegisterMode && (
                            <>
                                {/* Confirm Password */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword" className={styles.formLabel}>
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handlers.handleInputChange}
                                        className={`${styles.formInput} ${formErrors.confirmPassword ? styles.inputError : ''}`}
                                        placeholder="Confirm your password"
                                        required
                                        disabled={isSubmitting || isLoading}
                                    />
                                    {formErrors.confirmPassword && (
                                        <span className={styles.fieldError}>{formErrors.confirmPassword}</span>
                                    )}
                                </div>

                                {/* Name Fields */}
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="firstName" className={styles.formLabel}>
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handlers.handleInputChange}
                                            className={`${styles.formInput} ${formErrors.firstName ? styles.inputError : ''}`}
                                            placeholder="First name"
                                            required
                                            disabled={isSubmitting || isLoading}
                                        />
                                        {formErrors.firstName && (
                                            <span className={styles.fieldError}>{formErrors.firstName}</span>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="lastName" className={styles.formLabel}>
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handlers.handleInputChange}
                                            className={`${styles.formInput} ${formErrors.lastName ? styles.inputError : ''}`}
                                            placeholder="Last name"
                                            required
                                            disabled={isSubmitting || isLoading}
                                        />
                                        {formErrors.lastName && (
                                            <span className={styles.fieldError}>{formErrors.lastName}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="phoneNumber" className={styles.formLabel}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handlers.handleInputChange}
                                        className={`${styles.formInput} ${formErrors.phoneNumber ? styles.inputError : ''}`}
                                        placeholder="Your phone number"
                                        disabled={isSubmitting || isLoading}
                                    />
                                    {formErrors.phoneNumber && (
                                        <span className={styles.fieldError}>{formErrors.phoneNumber}</span>
                                    )}
                                </div>

                                {/* Address */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="address" className={styles.formLabel}>
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handlers.handleInputChange}
                                        className={`${styles.formInput} ${styles.textareaInput} ${formErrors.address ? styles.inputError : ''}`}
                                        placeholder="Your address"
                                        rows="3"
                                        disabled={isSubmitting || isLoading}
                                    />
                                    {formErrors.address && (
                                        <span className={styles.fieldError}>{formErrors.address}</span>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
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
                    </form>

                    {/* Toggle Mode */}
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
                </div>
            </div>
        </div>
    );
}