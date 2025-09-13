import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FloatingNavBar.module.scss";
import useFloatingNavBar from "./useFloatingNavBar";
import FloatingNavBarHandler from "./FloatingNavBarHandler";
import { GoogleIcon } from "../";
import { navItems, getCurrentRoute } from "../../../config/navigation";

export default function FloatingNavBar({ 
    onNavigate,
    theme = "default",
    className = "" 
}) {
    const navigate = useNavigate();
    const currentRoute = getCurrentRoute();
    const { stateFloatingNavBar, setFloatingNavBar } = useFloatingNavBar({ activeRoute: currentRoute });
    const handlers = FloatingNavBarHandler(stateFloatingNavBar, setFloatingNavBar, onNavigate, navigate);
    
    return (
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
            </nav>
        </div>
    );
}
