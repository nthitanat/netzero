import { useState, useEffect } from "react";

const useEventFilterContainer = (initialProps = {}) => {
  const [stateEventFilterContainer, setState] = useState({
    selectedCategory: initialProps.selectedCategory || 'all',
    ...initialProps
  });

  const setEventFilterContainer = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventFilterContainerField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Sync with external prop changes
  useEffect(() => {
    if (initialProps.selectedCategory !== stateEventFilterContainer.selectedCategory) {
      setState(prevState => ({
        ...prevState,
        selectedCategory: initialProps.selectedCategory || 'all'
      }));
    }
  }, [initialProps.selectedCategory]);

  return {
    stateEventFilterContainer,
    setEventFilterContainer,
    toggleEventFilterContainerField,
  };
};

export default useEventFilterContainer;
