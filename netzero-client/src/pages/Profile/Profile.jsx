import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Profile.module.scss';
import { FloatingNavBar, OrganicDecoration } from '../../components/common';
import { UserModal } from '../../components/auth';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleDisplayName, isProfileComplete } from '../../utils/userFormatting';

export default function Profile() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { 
        user: currentUser, 
        isAuthenticated, 
        isLoading: authLoading,
        getDisplayName,
        getUserInitials,
        refreshUser
    } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // Determine if viewing own profile or another user's profile
    const isOwnProfile = !userId || (currentUser && currentUser.id === parseInt(userId));

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authLoading && !isAuthenticated) {
            navigate('/');
            return;
        }

        // For own profile, refresh user data if needed
        if (isAuthenticated && isOwnProfile && !userId) {
            loadProfileData();
        }

        // Viewing another user's profile is not supported in this implementation
        // You would need to add a getUserById method to AuthContext or use a separate API
        if (userId && !isOwnProfile) {
            setError('Viewing other user profiles is not supported yet.');
        }
    }, [isAuthenticated, authLoading, userId, isOwnProfile, navigate]);

    const loadProfileData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await refreshUser();
        } catch (error) {
            console.error('Profile load error:', error);
            setError(error.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditProfile = () => {
        setShowUpdateModal(true);
    };

    const handleModalClose = () => {
        setShowUpdateModal(false);
    };

    const handleModalSuccess = (message) => {
        if (message) {
            console.log('Success:', message);
            // You could add a toast notification here if needed
        }
        // Reload profile data to reflect changes
        loadProfileData();
        setShowUpdateModal(false);
    };

    const handleProfileUpdate = async (updatedData) => {
        // Reload profile data after update
        await loadProfileData();
        setShowUpdateModal(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Use currentUser from context instead of profileData
    const profileData = currentUser;

    // Loading state
    if (authLoading || isLoading) {
        return (
            <div className={styles.profilePage}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading profile...</p>
                </div>
                <FloatingNavBar />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.profilePage}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2>Profile Error</h2>
                    <p>{error}</p>
                    <button 
                        className={styles.retryButton}
                        onClick={loadProfileData}
                    >
                        Try Again
                    </button>
                </div>
                <FloatingNavBar />
            </div>
        );
    }

    return (
        <div className={styles.profilePage}>
            <OrganicDecoration 
                variant="profile" 
                className={styles.backgroundDecoration}
            />

            <div className={styles.profileContainer}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                        {profileData?.profileImage ? (
                            <img 
                                src={profileData.profileImage} 
                                alt="Profile" 
                                className={styles.avatarImage}
                            />
                        ) : (
                            <div className={styles.avatarInitials}>
                                {getUserInitials()}
                            </div>
                        )}
                    </div>

                    <div className={styles.profileInfo}>
                        <h1 className={styles.profileName}>
                            {getDisplayName()}
                        </h1>
                        <p className={styles.profileEmail}>
                            {profileData?.email}
                        </p>
                        <p className={styles.profileRole}>
                            <span className={`${styles.roleBadge} ${styles[profileData?.role]}`}>
                                {getRoleDisplayName(profileData?.role)}
                            </span>
                        </p>
                    </div>

                    {isOwnProfile && (
                        <div className={styles.profileActions}>
                            <button 
                                className={styles.editButton}
                                onClick={handleEditProfile}
                            >
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {!isProfileComplete(profileData) && isOwnProfile && (
                    <div className={styles.profileIncomplete}>
                        <div className={styles.incompleteIcon}>ℹ️</div>
                        <div className={styles.incompleteContent}>
                            <h3>Complete Your Profile</h3>
                            <p>Add more information to help others connect with you.</p>
                        </div>
                    </div>
                )}

                <div className={styles.profileDetails}>
                    <div className={styles.detailsSection}>
                        <h2 className={styles.sectionTitle}>Personal Information</h2>
                        
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <label>First Name</label>
                                <span>{profileData?.firstName || 'Not provided'}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <label>Last Name</label>
                                <span>{profileData?.lastName || 'Not provided'}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <label>Email</label>
                                <span>{profileData?.email}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <label>Phone Number</label>
                                <span>{profileData?.phoneNumber || 'Not provided'}</span>
                            </div>

                            <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                                <label>Address</label>
                                <span>{profileData?.address || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.detailsSection}>
                        <h2 className={styles.sectionTitle}>Account Information</h2>
                        
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <label>Member Since</label>
                                <span>{formatDate(profileData?.createdAt)}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <label>Last Login</label>
                                <span>{formatDate(profileData?.lastLogin)}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <label>Account Status</label>
                                <span className={styles.statusActive}>
                                    {profileData?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className={styles.detailItem}>
                                <label>Email Verified</label>
                                <span className={profileData?.emailVerified ? styles.verified : styles.unverified}>
                                    {profileData?.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FloatingNavBar />

            {/* User Update/Delete Modal */}
            <UserModal
                isOpen={showUpdateModal}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                userData={profileData}
            />
        </div>
    );
}