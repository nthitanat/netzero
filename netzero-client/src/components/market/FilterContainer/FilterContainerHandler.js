const FilterContainerHandler = (
  stateFilterContainer, 
  setFilterContainer,
  onFilterTabChange,
  onCategoryChange,
  onRegionChange
) => {
  return {
    handleFilterTabChange: (tab) => {
      setFilterContainer("filterTab", tab);
      if (onFilterTabChange) {
        onFilterTabChange(tab);
      }
    },

    handleCategoryChange: (category) => {
      setFilterContainer("selectedCategory", category);
      if (onCategoryChange) {
        onCategoryChange(category);
      }
    },

    handleRegionChange: (region) => {
      setFilterContainer("selectedRegion", region);
      if (onRegionChange) {
        onRegionChange(region);
      }
    }
  };
};

export default FilterContainerHandler;
