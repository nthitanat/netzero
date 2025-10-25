import { useState, useEffect } from "react";

const useEventDashboard = () => {
  const [stateEventDashboard, setState] = useState({
    activeTab: 'events',
    isLoading: false,
    events: [],
    stats: null,
    selectedEvent: null,
    showEventModal: false,
    showDeleteConfirm: false,
    eventModalMode: 'create', // 'create' or 'edit'
    isSubmittingEvent: false,
    error: null,
    // Pagination
    currentPage: 1,
    totalPages: 1,
    // Filters
    sortBy: 'event_date',
    sortOrder: 'desc',
    searchTerm: '',
    categoryFilter: '',
    statusFilter: 'all'
  });

  const setEventDashboard = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventDashboardField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      setState(prev => ({
        ...prev,
        selectedEvent: null,
        showEventModal: false,
        showDeleteConfirm: false,
        isSubmittingEvent: false,
        error: null
      }));
    };
  }, []);

  return {
    stateEventDashboard,
    setEventDashboard,
    toggleEventDashboardField,
  };
};

export default useEventDashboard;