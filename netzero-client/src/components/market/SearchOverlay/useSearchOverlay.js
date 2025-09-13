import { useState, useEffect } from "react";

const useSearchOverlay = (initialProps = {}) => {
  const [stateSearchOverlay, setState] = useState({
    searchQuery: initialProps.searchQuery || "",
    viewMode: initialProps.viewMode || "grid",
    ...initialProps
  });

  const setSearchOverlay = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleSearchOverlayField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Sync with external prop changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      searchQuery: initialProps.searchQuery || prevState.searchQuery,
      viewMode: initialProps.viewMode || prevState.viewMode
    }));
  }, [initialProps.searchQuery, initialProps.viewMode]);

  return {
    stateSearchOverlay,
    setSearchOverlay,
    toggleSearchOverlayField,
  };
};

export default useSearchOverlay;
