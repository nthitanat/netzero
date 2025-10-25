import { useState } from "react";

const useEventManagementPanel = (initialProps) => {
  const [stateEventManagementPanel, setState] = useState({
    filteredEvents: initialProps?.events || [],
    searchTerm: '',
    sortBy: 'event_date',
    sortOrder: 'desc',
    statusFilter: 'all',
    categoryFilter: 'all',
    isFiltering: false,
    ...initialProps
  });

  const setEventManagementPanel = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventManagementPanelField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateEventManagementPanel,
    setEventManagementPanel,
    toggleEventManagementPanelField,
  };
};

export default useEventManagementPanel;