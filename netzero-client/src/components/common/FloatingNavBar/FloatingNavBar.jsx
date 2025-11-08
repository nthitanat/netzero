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
            <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${stateFloatingNavBar.isCollapsed ? styles.MobileMenuOpen : ''} ${className}`}>
                {/* Toggle Button for Mobile */}
                <button
                    className={styles.ToggleButton}
                    onClick={handlers.handleToggleNavbar}
                    aria-label={stateFloatingNavBar.isCollapsed ? 'Hide menu' : 'Show menu'}
                >
                    <GoogleIcon 
                        iconType={stateFloatingNavBar.isCollapsed ? 'close' : 'menu'} 
                        size="medium" 
                        className={styles.ToggleIcon}
                    />
                </button>

                {/* Desktop Navigation Bar */}
                <nav className={styles.NavBar}>
                    {navItems.map((item, index) => (
                        <button
                            key={item.path}
                            className={`${styles.NavItem} ${
                                stateFloatingNavBar.activeRoute === item.path ? styles.Active : ''
                            }`}
                            onClick={() => {
                                console.log("Button clicked for:", item.path, item.label);
                                handlers.handleNavClickWithCollapse(item.path, item.label);
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
                                        <button 
                                            className={styles.UserMenuItem}
                                            onClick={handlers.handleMyOrdersClick}
                                        >
                                            <GoogleIcon iconType="shopping_cart" size="small" />
                                            My Orders
                                        </button>
                                        {(user?.role === 'seller' || user?.role === 'community_head') && (
                                            <button 
                                                className={styles.UserMenuItem}
                                                onClick={handlers.handleSellerDashboardClick}
                                            >
                                                <GoogleIcon iconType="dashboard" size="small" />
                                                Seller Dashboard
                                            </button>
                                        )}
                                        {user?.role === 'community_head' && (
                                            <button 
                                                className={styles.UserMenuItem}
                                                onClick={handlers.handleEventDashboardClick}
                                            >
                                                <GoogleIcon iconType="event" size="small" />
                                                Event Dashboard
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

                {/* Mobile Menu Overlay */}
                <div 
                    className={styles.MenuOverlay}
                    onClick={handlers.handleToggleNavbar}
                />

                {/* Mobile Menu */}
                <div className={styles.MobileMenu}>
                    <div className={styles.MobileNavItems}>
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                className={`${styles.MobileNavItem} ${
                                    stateFloatingNavBar.activeRoute === item.path ? styles.Active : ''
                                }`}
                                onClick={() => {
                                    console.log("Mobile nav clicked:", item.path, item.label);
                                    handlers.handleNavClickWithCollapse(item.path, item.label);
                                }}
                            >
                                <GoogleIcon 
                                    iconType={item.icon} 
                                    size="medium" 
                                    className={styles.MobileNavIcon}
                                />
                                <span className={styles.MobileNavLabel}>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Mobile Authentication Section */}
                    <div className={styles.MobileAuthSection}>
                        {isAuthenticated ? (
                            <>
                                <div className={styles.MobileUserInfo}>
                                    {user?.profileImage ? (
                                        <img 
                                            src={user.profileImage} 
                                            alt="Profile" 
                                            className={styles.MobileUserAvatar}
                                        />
                                    ) : (
                                        <div className={styles.MobileUserInitials}>
                                            {getUserInitials()}
                                        </div>
                                    )}
                                    <div className={styles.MobileUserDetails}>
                                        <div className={styles.MobileUserName}>{getDisplayName()}</div>
                                        <div className={styles.MobileUserEmail}>{user?.email}</div>
                                    </div>
                                </div>
                                
                                <div className={styles.MobileUserActions}>
                                    <button 
                                        className={styles.MobileUserAction}
                                        onClick={() => {
                                            handlers.handleProfileClick();
                                            handlers.handleToggleNavbar();
                                        }}
                                    >
                                        <GoogleIcon iconType="person" size="small" />
                                        Profile
                                    </button>
                                    <button 
                                        className={styles.MobileUserAction}
                                        onClick={() => {
                                            handlers.handleMyOrdersClick();
                                            handlers.handleToggleNavbar();
                                        }}
                                    >
                                        <GoogleIcon iconType="shopping_cart" size="small" />
                                        My Orders
                                    </button>
                                    {(user?.role === 'seller' || user?.role === 'community_head') && (
                                        <button 
                                            className={styles.MobileUserAction}
                                            onClick={() => {
                                                handlers.handleSellerDashboardClick();
                                                handlers.handleToggleNavbar();
                                            }}
                                        >
                                            <GoogleIcon iconType="dashboard" size="small" />
                                            Seller Dashboard
                                        </button>
                                    )}
                                    {user?.role === 'community_head' && (
                                        <button 
                                            className={styles.MobileUserAction}
                                            onClick={() => {
                                                handlers.handleEventDashboardClick();
                                                handlers.handleToggleNavbar();
                                            }}
                                        >
                                            <GoogleIcon iconType="event" size="small" />
                                            Event Dashboard
                                        </button>
                                    )}
                                    <button 
                                        className={styles.MobileUserAction}
                                        onClick={() => {
                                            handlers.handleLogoutClick();
                                            handlers.handleToggleNavbar();
                                        }}
                                    >
                                        <GoogleIcon iconType="logout" size="small" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                className={styles.MobileLoginButton}
                                onClick={() => {
                                    handlers.handleLoginClick();
                                    handlers.handleToggleNavbar();
                                }}
                            >
                                <GoogleIcon 
                                    iconType="login" 
                                    size="medium" 
                                />
                                Login
                            </button>
                        )}
                    </div>
                </div>
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
