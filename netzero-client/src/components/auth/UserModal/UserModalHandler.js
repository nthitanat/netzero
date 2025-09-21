export default function UserModalHandler({
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
}) {
    // Validation functions
    const validateProfileForm = () => {
        const errors = {};

        if (!formData.firstName?.trim()) {
            errors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }

        if (!formData.lastName?.trim()) {
            errors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }

        if (formData.phoneNumber && formData.phoneNumber.trim()) {
            const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
            if (!phoneRegex.test(formData.phoneNumber.trim())) {
                errors.phoneNumber = 'Please enter a valid phone number';
            }
        }

        if (formData.profileImage && formData.profileImage.trim()) {
            try {
                new URL(formData.profileImage);
            } catch {
                errors.profileImage = 'Please enter a valid image URL';
            }
        }

        if (formData.address && formData.address.trim().length > 500) {
            errors.address = 'Address must be less than 500 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
            errors.newPassword = 'Password must contain uppercase, lowercase, and number';
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (passwordData.currentPassword && passwordData.newPassword && 
            passwordData.currentPassword === passwordData.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
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
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
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
    };

    // Tab navigation
    const switchTab = (tab) => {
        setActiveTab(tab);
        setFormErrors({});
        clearError();
        setShowDeleteConfirm(false);
    };

    // Profile form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateProfileForm()) {
            return;
        }

        setIsSubmitting(true);
        clearError();

        try {
            // Prepare data for update, only include changed fields
            const updateData = {};
            
            if (formData.firstName?.trim()) updateData.firstName = formData.firstName.trim();
            if (formData.lastName?.trim()) updateData.lastName = formData.lastName.trim();
            if (formData.phoneNumber?.trim()) updateData.phoneNumber = formData.phoneNumber.trim();
            if (formData.address?.trim()) updateData.address = formData.address.trim();
            if (formData.profileImage?.trim()) updateData.profileImage = formData.profileImage.trim();

            await updateProfile(updateData);
            onSuccess?.('Profile updated successfully!');
            onClose();
        } catch (error) {
            console.error('Profile update error:', error);
            // Error will be displayed through the auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    // Password form submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePasswordForm()) {
            return;
        }

        setIsSubmitting(true);
        clearError();

        try {
            await updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            onSuccess?.('Password updated successfully!');
            onClose();
        } catch (error) {
            console.error('Password update error:', error);
            // Error will be displayed through the auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete account handlers
    const showDeleteConfirmation = () => {
        setShowDeleteConfirm(true);
        setFormErrors({});
        clearError();
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setFormErrors({});
        clearError();
    };

    let deleteEmailInput = '';
    const handleDeleteConfirmation = (e) => {
        deleteEmailInput = e.target.value;
    };

    const confirmDelete = async () => {
        if (!deleteEmailInput) {
            setFormErrors({ deleteConfirmation: 'Please enter your email address' });
            return;
        }

        setIsSubmitting(true);
        clearError();

        try {
            await deleteAccount(deleteEmailInput);
            onSuccess?.('Account deleted successfully');
            onClose();
        } catch (error) {
            console.error('Account deletion error:', error);
            // Error will be displayed through the auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    // Modal overlay click handler
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Reset forms when modal closes
    const resetForms = () => {
        setFormData({
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            profileImage: ''
        });
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setFormErrors({});
        setShowDeleteConfirm(false);
        setActiveTab('profile');
    };

    return {
        handleInputChange,
        handlePasswordChange,
        handleProfileSubmit,
        handlePasswordSubmit,
        switchTab,
        showDeleteConfirmation,
        cancelDelete,
        handleDeleteConfirmation,
        confirmDelete,
        handleOverlayClick,
        resetForms,
        validateProfileForm,
        validatePasswordForm
    };
}