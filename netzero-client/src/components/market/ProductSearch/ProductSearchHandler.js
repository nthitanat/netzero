const ProductSearchHandler = (
  stateProductSearch, 
  setProductSearch, 
  onSearchChange, 
  onViewModeChange
) => {
  return {
    handleSearchChange: (e) => {
      const value = e.target?.value || e;
      setProductSearch("currentQuery", value);
      if (onSearchChange) {
        onSearchChange(value);
      }
    },

    handleClearSearch: () => {
      setProductSearch("currentQuery", "");
      if (onSearchChange) {
        onSearchChange("");
      }
    },

    handleViewModeChange: (viewMode) => {
      setProductSearch("viewMode", viewMode);
      if (onViewModeChange) {
        onViewModeChange(viewMode);
      }
    },

    handleFocus: () => {
      setProductSearch("isFocused", true);
    },

    handleBlur: () => {
      setProductSearch("isFocused", false);
    }
  };
};

export default ProductSearchHandler;