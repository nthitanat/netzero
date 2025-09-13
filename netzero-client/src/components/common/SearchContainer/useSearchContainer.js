import { useState, useEffect } from "react";

const useSearchContainer = (initialProps = {}) => {
  const [stateSearchContainer, setState] = useState({
    currentQuery: initialProps.searchQuery || "",
    isFocused: false,
    ...initialProps
  });

  const setSearchContainer = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleSearchContainerField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Sync with external search query changes
  useEffect(() => {
    if (initialProps.searchQuery !== stateSearchContainer.currentQuery) {
      setState(prevState => ({
        ...prevState,
        currentQuery: initialProps.searchQuery || ""
      }));
    }
  }, [initialProps.searchQuery]);

  return {
    stateSearchContainer,
    setSearchContainer,
    toggleSearchContainerField,
  };
};

export default useSearchContainer;
