import React from "react";
import styles from "./EventSearchContainer.module.scss";
import useEventSearchContainer from "./useEventSearchContainer";
import EventSearchContainerHandler from "./EventSearchContainerHandler";
import { SearchContainer } from "../../common";

export default function EventSearchContainer({ 
    searchQuery = "",
    onSearchChange,
    className = ""
}) {
    const { stateEventSearchContainer, setEventSearchContainer } = useEventSearchContainer({ searchQuery });
    const handlers = EventSearchContainerHandler(stateEventSearchContainer, setEventSearchContainer, onSearchChange);
    
    return (
        <div className={`${styles.Container} ${className}`}>
            <SearchContainer
                searchQuery={stateEventSearchContainer.searchQuery}
                placeholder="ค้นหางานด้วย ID..."
                onSearchChange={handlers.handleSearchChange}
                className={styles.SearchComponent}
            />
        </div>
    );
}
