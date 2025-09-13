const SearchContainerHandler = (stateSearchContainer, setSearchContainer, onSearchChange) => {
  return {
    handleSearchChange: (event) => {
      const query = event.target.value;
      setSearchContainer("currentQuery", query);
      
      // Call the external search change handler
      if (onSearchChange) {
        onSearchChange(query);
      }
    },

    handleClearSearch: () => {
      setSearchContainer("currentQuery", "");
      
      // Call the external search change handler with empty query
      if (onSearchChange) {
        onSearchChange("");
      }
    },

    handleFocus: () => {
      setSearchContainer("isFocused", true);
    },

    handleBlur: () => {
      setSearchContainer("isFocused", false);
    }
  };
};

export default SearchContainerHandler;
