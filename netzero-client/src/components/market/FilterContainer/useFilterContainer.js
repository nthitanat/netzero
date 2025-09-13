import { useState, useEffect } from "react";

const useFilterContainer = (initialProps = {}) => {
  const [stateFilterContainer, setState] = useState({
    filterTab: initialProps.filterTab || "category",
    selectedCategory: initialProps.selectedCategory || "all",
    selectedRegion: initialProps.selectedRegion || "all",
    ...initialProps
  });

  const setFilterContainer = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleFilterContainerField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Sync with external prop changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      filterTab: initialProps.filterTab || prevState.filterTab,
      selectedCategory: initialProps.selectedCategory || prevState.selectedCategory,
      selectedRegion: initialProps.selectedRegion || prevState.selectedRegion
    }));
  }, [initialProps.filterTab, initialProps.selectedCategory, initialProps.selectedRegion]);

  return {
    stateFilterContainer,
    setFilterContainer,
    toggleFilterContainerField,
  };
};

export default useFilterContainer;
