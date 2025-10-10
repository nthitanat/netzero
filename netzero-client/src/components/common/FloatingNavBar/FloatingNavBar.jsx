import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FloatingNavBar.module.scss";
import useFloatingNavBar from "./useFloatingNavBar";
import FloatingNavBarHandler from "./FloatingNavBarHandler";
import { GoogleIcon } from "../";
import { LoginModal } from "../../auth";
import { useAuth } from "../../../contexts/AuthContext";
import { navItems, getCurrentRoute } from "../../../config/navigation";

export default function FloatingNavBar({ 
    onNavigate,
    theme = "default",
    className = "" 
}) {
    const navigate = useNavigate();
    const currentRoute = getCurrentRoute();
    const { stateFloatingNavBar, setFloatingNavBar } = useFloatingNavBar({ activeRoute: currentRoute });
    const { isAuthenticated, user, getDisplayName, getUserInitials, logout } = useAuth();
    const handlers = FloatingNavBarHandler(stateFloatingNavBar, setFloatingNavBar, onNavigate, navigate, logout);



    return (
        <>
            <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
                <nav className={styles.NavBar}>
                    {navItems.map((item, index) => (
                        <button
                            key={item.path}
                            className={`${styles.NavItem} ${
                                stateFloatingNavBar.activeRoute === item.path ? styles.Active : ''
                            }`}
                            onClick={() => {
                                console.log("Button clicked for:", item.path, item.label);
                                handlers.handleNavClick(item.path, item.label);
                            }}
                            onMouseEnter={() => handlers.handleMouseEnter(index)}
                            onMouseLeave={handlers.handleMouseLeave}
                        >
                            <div className={styles.IconContainer}>
                                <GoogleIcon 
                                    iconType={item.icon} 
                                    size="medium" 
                                    className={styles.NavIcon}
                                />
                            </div>
                            <span className={styles.NavLabel}>{item.label}</span>
                            
                            {stateFloatingNavBar.activeRoute === item.path && (
                                <div className={styles.ActiveIndicator} />
                            )}
                        </button>
                    ))}
                    
                    {/* Authentication UI */}
                    <div className={styles.AuthSection}>
                        {isAuthenticated ? (
                            <div 
                                className={styles.UserMenu}
                                onBlur={handlers.handleUserMenuBlur}
                                tabIndex={-1}
                            >
                                <button
                                    className={styles.UserButton}
                                    onClick={handlers.handleUserClick}
                                    aria-label="User menu"
                                >
                                    {user?.profileImage ? (
                                        <img 
                                            src={user.profileImage} 
                                            alt="Profile" 
                                            className={styles.UserAvatar}
                                        />
                                    ) : (
                                        <div className={styles.UserInitials}>
                                            {getUserInitials()}
                                        </div>
                                    )}
                                </button>
                                
                                {stateFloatingNavBar.showUserMenu && (
                                    <div className={styles.UserDropdown}>
                                        <div className={styles.UserInfo}>
                                            <div className={styles.UserName}>{getDisplayName()}</div>
                                            <div className={styles.UserEmail}>{user?.email}</div>
                                        </div>
                                        <div className={styles.UserMenuDivider}></div>
                                        <button 
                                            className={styles.UserMenuItem}
                                            onClick={handlers.handleProfileClick}
                                        >
                                            <GoogleIcon iconType="person" size="small" />
                                            Profile
                                        </button>
                                        {user?.role === 'seller' && (
                                            <button 
                                                className={styles.UserMenuItem}
                                                onClick={handlers.handleSellerDashboardClick}
                                            >
                                                <GoogleIcon iconType="dashboard" size="small" />
                                                Seller Dashboard
                                            </button>
                                        )}
                                        <button 
                                            className={styles.UserMenuItem}
                                            onClick={handlers.handleLogoutClick}
                                        >
                                            <GoogleIcon iconType="logout" size="small" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className={styles.LoginButton}
                                onClick={handlers.handleLoginClick}
                                aria-label="Login"
                            >
                                <GoogleIcon 
                                    iconType="login" 
                                    size="medium" 
                                    className={styles.LoginIcon}
                                />
                                <span className={styles.LoginLabel}>Login</span>
                            </button>
                        )}
                    </div>
                </nav>
            </div>

            {/* Login Modal */}
            <LoginModal
                isOpen={stateFloatingNavBar.showLoginModal}
                onClose={handlers.handleCloseLoginModal}
                onSuccess={handlers.handleLoginSuccess}
            />
        </>
    );
}
