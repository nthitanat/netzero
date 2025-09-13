import React from "react";
import styles from "./GoogleIcon.module.scss";
import useGoogleIcon from "./useGoogleIcon";
import GoogleIconHandler from "./GoogleIconHandler";

export default function GoogleIcon({ iconType = "eco", size = "medium", className = "", variant = "outlined" }) {
    const { stateGoogleIcon, setGoogleIcon } = useGoogleIcon({ iconType, size, variant });
    const handlers = GoogleIconHandler(stateGoogleIcon, setGoogleIcon);
    
    const renderIcon = () => {
        const baseClass = variant === "outlined" ? "material-symbols-outlined" : "material-icons";
        
        switch (stateGoogleIcon.iconType) {
            // Nature & Sustainability
            case "eco":
                return <span className={baseClass}>eco</span>;
            case "nature":
                return <span className={baseClass}>nature</span>;
            case "local_florist":
                return <span className={baseClass}>local_florist</span>;
            case "park":
                return <span className={baseClass}>park</span>;
            case "forest":
                return <span className={baseClass}>forest</span>;
            case "agriculture":
                return <span className={baseClass}>agriculture</span>;
            
            // Business & Shopping
            case "shopping_cart":
                return <span className={baseClass}>shopping_cart</span>;
            case "add_shopping_cart":
                return <span className={baseClass}>add_shopping_cart</span>;
            case "store":
                return <span className={baseClass}>store</span>;
            case "inventory":
                return <span className={baseClass}>inventory</span>;
            case "local_shipping":
                return <span className={baseClass}>local_shipping</span>;
            
            // Location & Places
            case "location_on":
                return <span className={baseClass}>location_on</span>;
            case "place":
                return <span className={baseClass}>place</span>;
            case "map":
                return <span className={baseClass}>map</span>;
            case "room":
                return <span className={baseClass}>room</span>;
            
            // Events & Calendar
            case "event":
                return <span className={baseClass}>event</span>;
            case "calendar_today":
                return <span className={baseClass}>calendar_today</span>;
            case "schedule":
                return <span className={baseClass}>schedule</span>;
            case "celebration":
                return <span className={baseClass}>celebration</span>;
            
            // Rating & Quality
            case "star":
                return <span className={baseClass}>star</span>;
            case "star_outline":
                return <span className={baseClass}>star_outline</span>;
            case "grade":
                return <span className={baseClass}>grade</span>;
            case "verified":
                return <span className={baseClass}>verified</span>;
            case "quality_check":
                return <span className={baseClass}>high_quality</span>;
            
            // Actions & Navigation
            case "close":
                return <span className={baseClass}>close</span>;
            case "arrow_back":
                return <span className={baseClass}>arrow_back</span>;
            case "arrow_forward":
                return <span className={baseClass}>arrow_forward</span>;
            case "expand_more":
                return <span className={baseClass}>expand_more</span>;
            case "menu":
                return <span className={baseClass}>menu</span>;
            case "more_vert":
                return <span className={baseClass}>more_vert</span>;
            
            // Alerts & Status
            case "warning":
                return <span className={baseClass}>warning</span>;
            case "error":
                return <span className={baseClass}>error</span>;
            case "info":
                return <span className={baseClass}>info</span>;
            case "check_circle":
                return <span className={baseClass}>check_circle</span>;
            case "notification_important":
                return <span className={baseClass}>notification_important</span>;
            
            // Content & Media
            case "image":
                return <span className={baseClass}>image</span>;
            case "photo":
                return <span className={baseClass}>photo</span>;
            case "video_library":
                return <span className={baseClass}>video_library</span>;
            case "article":
                return <span className={baseClass}>article</span>;
            
            // Food & Health
            case "restaurant":
                return <span className={baseClass}>restaurant</span>;
            case "local_cafe":
                return <span className={baseClass}>local_cafe</span>;
            case "health_and_safety":
                return <span className={baseClass}>health_and_safety</span>;
            case "spa":
                return <span className={baseClass}>spa</span>;
            
            default:
                return <span className={baseClass}>eco</span>;
        }
    };
    
    return (
        <span 
            className={`${styles.Container} ${styles[stateGoogleIcon.size]} ${className}`}
            onClick={handlers.handleIconClick}
        >
            {renderIcon()}
        </span>
    );
}
