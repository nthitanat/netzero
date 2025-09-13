import React from "react";
import styles from "./EventFilterContainer.module.scss";
import useEventFilterContainer from "./useEventFilterContainer";
import EventFilterContainerHandler from "./EventFilterContainerHandler";

export default function EventFilterContainer({ 
    selectedCategory = 'all',
    onCategoryFilter,
    className = ""
}) {
    const { stateEventFilterContainer, setEventFilterContainer } = useEventFilterContainer({ 
        selectedCategory 
    });
    const handlers = EventFilterContainerHandler(stateEventFilterContainer, setEventFilterContainer, onCategoryFilter);
    
    const eventCategories = [
        { value: 'all', label: 'งานทั้งหมด' },
        { value: 'เทศกาล', label: 'เทศกาล' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'ตลาดนัด', label: 'ตลาดนัด' },
        { value: 'งานแสดง', label: 'งานแสดง' }
    ];
    
    return (
        <div className={`${styles.Container} ${className}`}>
            <div className={styles.CategoryFilters}>
                {eventCategories.map((category) => (
                    <button 
                        key={category.value}
                        className={`${styles.FilterButton} ${stateEventFilterContainer.selectedCategory === category.value ? styles.Active : ''}`}
                        onClick={() => handlers.handleCategoryFilter(category.value)}
                    >
                        {category.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
