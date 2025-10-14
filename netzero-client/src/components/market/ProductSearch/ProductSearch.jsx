import React from "react";
import styles from "./ProductSearch.module.scss";
import useProductSearch from "./useProductSearch";
import ProductSearchHandler from "./ProductSearchHandler";
import { GoogleIcon } from "../../common";

export default function ProductSearch({ 
    // New server-side search props
    searchInputValue,
    onSearchInputChange,
    onSearchSubmit,
    onClearSearch,
    isSearching = false,
    isSearchMode = false,
    searchQuery = "",
    
    // View mode props
    viewMode,
    onViewModeChange,
    
    // UI props
    placeholder = "ค้นหาสินค้า...", 
    className = "",
    theme = "market",
    showClearButton = true,
    showViewToggle = true,
    
    // Backward compatibility props
    searchQuery: legacySearchQuery,
    onSearchChange: legacyOnSearchChange
}) {
    // Determine if we're in server-side (controlled) mode or legacy (uncontrolled) mode
    const isControlledMode = onSearchInputChange !== undefined;
    
    const { stateProductSearch, setProductSearch } = useProductSearch({ 
        searchQuery: isControlledMode ? undefined : (legacySearchQuery || ""), 
        viewMode 
    });
    
    const handlers = ProductSearchHandler(
        stateProductSearch, 
        setProductSearch, 
        isControlledMode ? null : legacyOnSearchChange, // Don't use handler in controlled mode
        onViewModeChange
    );

    // Handle Enter key press for search
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && onSearchSubmit) {
            onSearchSubmit();
        }
    };

    // Handle focus and blur states
    const handleFocus = () => {
        setProductSearch("isFocused", true);
    };

    const handleBlur = () => {
        setProductSearch("isFocused", false);
    };
    
    return (
        <div className={`${styles.ProductSearch} ${styles[theme]} ${className}`}>
            <div className={styles.ProductSearchContent}>
                <div className={styles.SearchWrapper}>
                    {/* Combined Search Input Container */}
                    <div className={`${styles.SearchInputContainer} ${
                        stateProductSearch.isFocused ? styles.Focused : ''
                    }`}>
                        <span className={styles.SearchIcon}>
                            <GoogleIcon iconType="search" size="small" />
                        </span>
                        
                        <input
                            type="text"
                            value={isControlledMode ? (searchInputValue || '') : stateProductSearch.currentQuery}
                            onChange={(e) => {
                                if (isControlledMode) {
                                    // In controlled mode, directly call parent handler
                                    onSearchInputChange(e.target.value);
                                } else {
                                    // In uncontrolled mode, use internal handler
                                    handlers.handleSearchChange(e);
                                }
                            }}
                            onKeyPress={handleKeyPress}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder={placeholder}
                            className={styles.SearchInput}
                            disabled={isSearching}
                        />

                        {/* Search Button (for server-side search) */}
                        {onSearchSubmit && (
                            <button
                                onClick={onSearchSubmit}
                                disabled={isSearching}
                                className={`${styles.SearchButton} ${isSearching ? styles.Loading : ''}`}
                                title="ค้นหา"
                            >
                                {isSearching ? (
                                    <GoogleIcon iconType="refresh" size="small" />
                                ) : (
                                    <GoogleIcon iconType="search" size="small" />
                                )}
                            </button>
                        )}
                        
                        {/* Clear Button */}
                        {showClearButton && (isControlledMode ? searchInputValue : stateProductSearch.currentQuery) && (
                            <button
                                onClick={() => {
                                    if (isControlledMode && onClearSearch) {
                                        onClearSearch();
                                    } else if (!isControlledMode) {
                                        handlers.handleClearSearch();
                                    }
                                }}
                                className={styles.ClearButton}
                                title="เคลียร์การค้นหา"
                            >
                                <GoogleIcon iconType="close" size="small" />
                            </button>
                        )}
                    </div>
                    
                    {/* Search Status */}
                    {isSearchMode && searchQuery && (
                        <div className={styles.SearchStatus}>
                            ค้นหา: "{searchQuery}"
                        </div>
                    )}
                </div>
                
                {/* View Mode Toggle */}
                {showViewToggle && viewMode && onViewModeChange && (
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
                )}
            </div>
        </div>
    );
}