import { useState, useEffect } from "react";

const useProductSearch = (initialProps = {}) => {
  const [stateProductSearch, setState] = useState({
    searchQuery: initialProps.searchQuery || "",
    viewMode: initialProps.viewMode || "grid",
    isFocused: false,
    currentQuery: initialProps.searchQuery || "",
    ...initialProps
  });

  const setProductSearch = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleProductSearchField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Sync with external prop changes (only for uncontrolled mode)
  useEffect(() => {
    if (initialProps.searchQuery !== undefined) {
      setState(prevState => ({
        ...prevState,
        searchQuery: initialProps.searchQuery,
        currentQuery: initialProps.searchQuery,
      }));
    }
    
    if (initialProps.viewMode !== undefined) {
      setState(prevState => ({
        ...prevState,
        viewMode: initialProps.viewMode
      }));
    }
  }, [initialProps.searchQuery, initialProps.viewMode]);

  return {
    stateProductSearch,
    setProductSearch,
    toggleProductSearchField,
  };
};

export default useProductSearch;