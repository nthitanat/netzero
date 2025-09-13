const SearchOverlayHandler = (
  stateSearchOverlay, 
  setSearchOverlay, 
  onSearchChange, 
  onViewModeChange
) => {
  return {
    handleViewModeChange: (viewMode) => {
      setSearchOverlay("viewMode", viewMode);
      if (onViewModeChange) {
        onViewModeChange(viewMode);
      }
    }
  };
};

export default SearchOverlayHandler;
