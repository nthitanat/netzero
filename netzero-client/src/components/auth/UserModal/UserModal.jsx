import React, { useEffect, useState } from "react";
import styles from "./UserModal.module.scss";
import UserModalHandler from "./UserModalHandler";
import { useAuth } from "../../../contexts/AuthContext";

export default function UserModal({ isOpen, onClose, onSuccess, userData }) {
    const { updateProfile, updatePassword, deleteAccount, isLoading, error, clearError } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        profileImage: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handlers = UserModalHandler({
        formData,
        setFormData,
        passwordData,
        setPasswordData,
        formErrors,
        setFormErrors,
        isSubmitting,
        setIsSubmitting,
        showDeleteConfirm,
        setShowDeleteConfirm,
        activeTab,
        setActiveTab,
        updateProfile,
        updatePassword,
        deleteAccount,
        onClose,
        onSuccess,
        clearError
    });

    // Initialize form data when modal opens or userData changes
    useEffect(() => {
        if (isOpen && userData) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phoneNumber: userData.phoneNumber || '',
                address: userData.address || '',
                profileImage: userData.profileImage || ''
            });
        }
    }, [isOpen, userData]);

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

    // Clear errors when modal is closed or tab changes
    useEffect(() => {
        if (!isOpen) {
            handlers.resetForms();
            clearError();
        }
    }, [isOpen]);

    useEffect(() => {
        clearError();
        setFormErrors({});
    }, [activeTab]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handlers.handleOverlayClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Account Settings</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className={styles.tabNavigation}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
                        onClick={() => handlers.switchTab('profile')}
                    >
                        Edit Profile
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'password' ? styles.active : ''}`}
                        onClick={() => handlers.switchTab('password')}
                    >
                        Change Password
                    </button>
                    <button
                        className={`${styles.tabButton} ${styles.dangerTab} ${activeTab === 'delete' ? styles.active : ''}`}
                        onClick={() => handlers.switchTab('delete')}
                    >
                        Delete Account
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handlers.handleProfileSubmit} className={styles.authForm}>
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

                            <div className={styles.formGroup}>
                                <label htmlFor="profileImage" className={styles.formLabel}>
                                    Profile Image URL
                                </label>
                                <input
                                    type="url"
                                    id="profileImage"
                                    name="profileImage"
                                    value={formData.profileImage}
                                    onChange={handlers.handleInputChange}
                                    className={`${styles.formInput} ${formErrors.profileImage ? styles.inputError : ''}`}
                                    placeholder="https://example.com/your-image.jpg"
                                    disabled={isSubmitting || isLoading}
                                />
                                {formErrors.profileImage && (
                                    <span className={styles.fieldError}>{formErrors.profileImage}</span>
                                )}
                            </div>

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

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting || isLoading ? (
                                    <span className={styles.loadingSpinner}>Updating Profile...</span>
                                ) : (
                                    'Update Profile'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlers.handlePasswordSubmit} className={styles.authForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="currentPassword" className={styles.formLabel}>
                                    Current Password *
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlers.handlePasswordChange}
                                    className={`${styles.formInput} ${formErrors.currentPassword ? styles.inputError : ''}`}
                                    placeholder="Enter your current password"
                                    required
                                    disabled={isSubmitting || isLoading}
                                />
                                {formErrors.currentPassword && (
                                    <span className={styles.fieldError}>{formErrors.currentPassword}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="newPassword" className={styles.formLabel}>
                                    New Password *
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlers.handlePasswordChange}
                                    className={`${styles.formInput} ${formErrors.newPassword ? styles.inputError : ''}`}
                                    placeholder="Enter new password"
                                    required
                                    disabled={isSubmitting || isLoading}
                                />
                                {formErrors.newPassword && (
                                    <span className={styles.fieldError}>{formErrors.newPassword}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword" className={styles.formLabel}>
                                    Confirm New Password *
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlers.handlePasswordChange}
                                    className={`${styles.formInput} ${formErrors.confirmPassword ? styles.inputError : ''}`}
                                    placeholder="Confirm new password"
                                    required
                                    disabled={isSubmitting || isLoading}
                                />
                                {formErrors.confirmPassword && (
                                    <span className={styles.fieldError}>{formErrors.confirmPassword}</span>
                                )}
                            </div>

                            <div className={styles.passwordHints}>
                                <p>Password requirements:</p>
                                <ul>
                                    <li>At least 6 characters long</li>
                                    <li>Contains uppercase and lowercase letters</li>
                                    <li>Contains at least one number</li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting || isLoading ? (
                                    <span className={styles.loadingSpinner}>Updating Password...</span>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Delete Tab */}
                    {activeTab === 'delete' && (
                        <div className={styles.deleteSection}>
                            {!showDeleteConfirm ? (
                                <>
                                    <div className={styles.warningBox}>
                                        <div className={styles.warningIcon}>⚠️</div>
                                        <div className={styles.warningContent}>
                                            <h3>Delete Account</h3>
                                            <p>
                                                This action cannot be undone. This will permanently delete your 
                                                account and remove all your data from our servers.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        className={styles.deleteButton}
                                        onClick={handlers.showDeleteConfirmation}
                                        disabled={isSubmitting || isLoading}
                                    >
                                        Delete My Account
                                    </button>
                                </>
                            ) : (
                                <div className={styles.deleteConfirmation}>
                                    <h3>Are you absolutely sure?</h3>
                                    <p>
                                        Please type your email address to confirm account deletion:
                                    </p>
                                    <input
                                        type="email"
                                        className={styles.confirmationInput}
                                        placeholder={userData?.email}
                                        onChange={handlers.handleDeleteConfirmation}
                                        disabled={isSubmitting || isLoading}
                                    />
                                    
                                    <div className={styles.deleteActions}>
                                        <button
                                            className={styles.cancelButton}
                                            onClick={handlers.cancelDelete}
                                            disabled={isSubmitting || isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className={styles.confirmDeleteButton}
                                            onClick={handlers.confirmDelete}
                                            disabled={isSubmitting || isLoading}
                                        >
                                            {isSubmitting || isLoading ? (
                                                <span className={styles.loadingSpinner}>Deleting...</span>
                                            ) : (
                                                'Delete Account'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}