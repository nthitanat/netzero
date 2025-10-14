import React from "react";
import styles from "./Alert.module.scss";
import useAlert from "./useAlert";
import AlertHandler from "./AlertHandler";
import GoogleIcon from "../GoogleIcon/GoogleIcon";

export default function Alert({ 
    type = "error", // "error" | "success"
    message = "",
    isVisible = false,
    onClose,
    autoClose = false,
    autoCloseDelay = 5000,
    className = "" 
}) {
    const { stateAlert, setAlert } = useAlert({ 
        isVisible, 
        type, 
        message, 
        autoClose, 
        autoCloseDelay 
    });
    const handlers = AlertHandler(stateAlert, setAlert, onClose);
    
    if (!stateAlert.isVisible || !stateAlert.message) {
        return null;
    }
    
    return (
        <div className={`${styles.Container} ${styles[`${stateAlert.type}-type`]} ${className}`}>
            <div 
                className={styles.Content}
                onMouseEnter={handlers.handleMouseEnter}
                onMouseLeave={handlers.handleMouseLeave}
            >
                <div className={styles.IconContainer}>
                    <GoogleIcon 
                        iconType={stateAlert.type === "success" ? "check_circle" : "error"} 
                        size="medium" 
                        className={styles.AlertIcon}
                    />
                </div>
                
                <div className={styles.MessageContainer}>
                    <span className={styles.Message}>{stateAlert.message}</span>
                </div>
                
                <button
                    className={styles.CloseButton}
                    onClick={handlers.handleClose}
                    aria-label="ปิดการแจ้งเตือน"
                >
                    <GoogleIcon iconType="close" size="small" />
                </button>
            </div>
        </div>
    );
}