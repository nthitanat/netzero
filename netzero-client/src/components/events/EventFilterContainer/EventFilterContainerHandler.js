const EventFilterContainerHandler = (stateEventFilterContainer, setEventFilterContainer, onCategoryFilter) => {
  return {
    handleCategoryFilter: (categoryValue) => {
      setEventFilterContainer("selectedCategory", categoryValue);
      
      // Call the external category filter handler
      if (onCategoryFilter) {
        onCategoryFilter(categoryValue);
      }
    },

    handleResetFilter: () => {
      setEventFilterContainer("selectedCategory", 'all');
      
      // Call the external category filter handler with 'all'
      if (onCategoryFilter) {
        onCategoryFilter('all');
      }
    }
  };
};

export default EventFilterContainerHandler;
