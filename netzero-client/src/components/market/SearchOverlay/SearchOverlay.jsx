import React from "react";
import styles from "./SearchOverlay.module.scss";
import useSearchOverlay from "./useSearchOverlay";
import SearchOverlayHandler from "./SearchOverlayHandler";
import { SearchContainer } from "../../common";

export default function SearchOverlay({ 
    searchQuery, 
    onSearchChange, 
    viewMode,
    onViewModeChange,
    placeholder = "ค้นหาสินค้า...", 
    className = "",
    theme = "market"
}) {
    const { stateSearchOverlay, setSearchOverlay } = useSearchOverlay({ searchQuery, viewMode });
    const handlers = SearchOverlayHandler(
        stateSearchOverlay, 
        setSearchOverlay, 
        onSearchChange, 
        onViewModeChange
    );
    
    return (
        <div className={`${styles.SearchOverlay} ${styles[theme]} ${className}`}>
            <div className={styles.SearchOverlayContent}>
                <div className={styles.SearchWrapper}>
                    <SearchContainer
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange}
                        placeholder={placeholder}
                    />
                </div>
                
                {/* View Mode Toggle */}
                <div className={styles.ViewToggle}>
                    <button
                        className={`${styles.ToggleButton} ${
                            viewMode === "grid" ? styles.Active : ""
                        }`}
                        onClick={() => handlers.handleViewModeChange("grid")}
                    >
                        ตาราง
                    </button>
                    <button
                        className={`${styles.ToggleButton} ${
                            viewMode === "list" ? styles.Active : ""
                        }`}
                        onClick={() => handlers.handleViewModeChange("list")}
                    >
                        รายการ
                    </button>
                </div>
            </div>
        </div>
    );
}
