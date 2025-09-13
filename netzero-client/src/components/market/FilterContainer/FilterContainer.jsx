import React from "react";
import styles from "./FilterContainer.module.scss";
import useFilterContainer from "./useFilterContainer";
import FilterContainerHandler from "./FilterContainerHandler";

export default function FilterContainer({ 
    filterTab,
    selectedCategory,
    selectedRegion,
    categories,
    regions,
    onFilterTabChange,
    onCategoryChange,
    onRegionChange,
    className = "",
    theme = "market"
}) {
    const { stateFilterContainer, setFilterContainer } = useFilterContainer({
        filterTab,
        selectedCategory,
        selectedRegion
    });
    const handlers = FilterContainerHandler(
        stateFilterContainer, 
        setFilterContainer,
        onFilterTabChange,
        onCategoryChange,
        onRegionChange
    );
    
    return (
        <div className={`${styles.FilterContainer} ${styles[theme]} ${className}`}>
            <div className={styles.FilterCard}>
                {/* Tab Bar */}
                <div className={styles.TabBar}>
                    <button
                        className={`${styles.TabButton} ${
                            filterTab === "category" ? styles.Active : ""
                        }`}
                        onClick={() => handlers.handleFilterTabChange("category")}
                    >
                        หมวดหมู่
                    </button>
                    <button
                        className={`${styles.TabButton} ${
                            filterTab === "region" ? styles.Active : ""
                        }`}
                        onClick={() => handlers.handleFilterTabChange("region")}
                    >
                        ภูมิภาค
                    </button>
                </div>
                
                {/* Filter Options */}
                <div className={styles.FilterOptions}>
                    {filterTab === "category" ? (
                        <>
                            <button
                                className={`${styles.FilterButton} ${
                                    selectedCategory === "all" ? styles.Active : ""
                                }`}
                                onClick={() => handlers.handleCategoryChange("all")}
                            >
                                ทั้งหมด
                            </button>
                            
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`${styles.FilterButton} ${
                                        selectedCategory === category ? styles.Active : ""
                                    }`}
                                    onClick={() => handlers.handleCategoryChange(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </>
                    ) : (
                        <>
                            <button
                                className={`${styles.FilterButton} ${
                                    selectedRegion === "all" ? styles.Active : ""
                                }`}
                                onClick={() => handlers.handleRegionChange("all")}
                            >
                                ทุกภูมิภาค
                            </button>
                            
                            {regions.map((region) => (
                                <button
                                    key={region}
                                    className={`${styles.FilterButton} ${
                                        selectedRegion === region ? styles.Active : ""
                                    }`}
                                    onClick={() => handlers.handleRegionChange(region)}
                                >
                                    {region}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
