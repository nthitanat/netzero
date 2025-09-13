import React from "react";
import styles from "./SearchContainer.module.scss";
import useSearchContainer from "./useSearchContainer";
import SearchContainerHandler from "./SearchContainerHandler";

export default function SearchContainer({ 
    searchQuery = "", 
    onSearchChange, 
    placeholder = "ค้นหา...", 
    className = "",
    showClearButton = true
}) {
    const { stateSearchContainer, setSearchContainer } = useSearchContainer({ searchQuery });
    const handlers = SearchContainerHandler(stateSearchContainer, setSearchContainer, onSearchChange);
    
    return (
        <div className={`${styles.SearchContainerWrapper} ${className}`}>
            <div className={styles.SearchContainer}>
                <div className={styles.SearchInputWrapper}>
                    <input
                        type="text"
                        value={stateSearchContainer.currentQuery}
                        onChange={handlers.handleSearchChange}
                        placeholder={placeholder}
                        className={styles.SearchInput}
                        onFocus={handlers.handleFocus}
                        onBlur={handlers.handleBlur}
                    />
                    <span className={styles.SearchIcon}>🔍</span>
                    
                    {showClearButton && stateSearchContainer.currentQuery && (
                        <button
                            className={styles.ClearButton}
                            onClick={handlers.handleClearSearch}
                            aria-label="ล้างการค้นหา"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
