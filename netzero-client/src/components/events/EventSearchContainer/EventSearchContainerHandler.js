const EventSearchContainerHandler = (stateEventSearchContainer, setEventSearchContainer, onSearchChange) => {
  return {
    handleSearchChange: (query) => {
      setEventSearchContainer("searchQuery", query);
      
      // Call the external search change handler with event-specific logic
      if (onSearchChange) {
        onSearchChange(query);
      }
    },

    handleClearSearch: () => {
      setEventSearchContainer("searchQuery", "");
      
      // Call the external search change handler with empty query
      if (onSearchChange) {
        onSearchChange("");
      }
    }
  };
};

export default EventSearchContainerHandler;
