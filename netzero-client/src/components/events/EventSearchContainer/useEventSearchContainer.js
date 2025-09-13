import { useState, useEffect } from "react";

const useEventSearchContainer = (initialProps = {}) => {
  const [stateEventSearchContainer, setState] = useState({
    searchQuery: initialProps.searchQuery || "",
    ...initialProps
  });

  const setEventSearchContainer = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventSearchContainerField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Sync with external search query changes
  useEffect(() => {
    if (initialProps.searchQuery !== stateEventSearchContainer.searchQuery) {
      setState(prevState => ({
        ...prevState,
        searchQuery: initialProps.searchQuery || ""
      }));
    }
  }, [initialProps.searchQuery]);

  return {
    stateEventSearchContainer,
    setEventSearchContainer,
    toggleEventSearchContainerField,
  };
};

export default useEventSearchContainer;
