const EventManagementPanelHandler = (stateEventManagementPanel, setEventManagementPanel, callbacks) => {
  const {
    onCreateEvent,
    onEditEvent,
    onDeleteEvent,
    onRefresh
  } = callbacks;

  const handleSearch = (searchTerm) => {
    setEventManagementPanel("searchTerm", searchTerm);
    applyFilters(searchTerm, stateEventManagementPanel.statusFilter, stateEventManagementPanel.categoryFilter);
  };

  const handleStatusFilter = (status) => {
    setEventManagementPanel("statusFilter", status);
    applyFilters(stateEventManagementPanel.searchTerm, status, stateEventManagementPanel.categoryFilter);
  };

  const handleCategoryFilter = (category) => {
    setEventManagementPanel("categoryFilter", category);
    applyFilters(stateEventManagementPanel.searchTerm, stateEventManagementPanel.statusFilter, category);
  };

  const handleSort = (sortBy, sortOrder) => {
    setEventManagementPanel({
      sortBy,
      sortOrder
    });
    
    const sortedEvents = [...stateEventManagementPanel.filteredEvents].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Handle date sorting
      if (sortBy === 'event_date' || sortBy === 'created_at') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      // Handle string sorting
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
    
    setEventManagementPanel("filteredEvents", sortedEvents);
  };

  const applyFilters = (searchTerm, statusFilter, categoryFilter) => {
    setEventManagementPanel("isFiltering", true);
    
    let filtered = [...stateEventManagementPanel.events];
    
    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term) ||
        event.category?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }
    
    // Apply current sorting
    const sortedFiltered = filtered.sort((a, b) => {
      let valueA = a[stateEventManagementPanel.sortBy];
      let valueB = b[stateEventManagementPanel.sortBy];
      
      if (stateEventManagementPanel.sortBy === 'event_date' || stateEventManagementPanel.sortBy === 'created_at') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (stateEventManagementPanel.sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
    
    setEventManagementPanel({
      filteredEvents: sortedFiltered,
      isFiltering: false
    });
  };

  const handleCreateEvent = () => {
    if (onCreateEvent) {
      onCreateEvent();
    }
  };

  const handleEditEvent = (event) => {
    if (onEditEvent) {
      onEditEvent(event);
    }
  };

  const handleDeleteEvent = (event) => {
    if (onDeleteEvent) {
      onDeleteEvent(event);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const clearFilters = () => {
    setEventManagementPanel({
      searchTerm: '',
      statusFilter: 'all',
      categoryFilter: 'all',
      filteredEvents: stateEventManagementPanel.events
    });
  };

  return {
    handleSearch,
    handleStatusFilter,
    handleCategoryFilter,
    handleSort,
    handleCreateEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleRefresh,
    clearFilters,
  };
};

export default EventManagementPanelHandler;