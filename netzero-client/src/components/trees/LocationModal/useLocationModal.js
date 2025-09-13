import { useState } from "react";

const useLocationModal = (initialProps) => {
  const [stateLocationModal, setState] = useState({
    isOpen: initialProps?.isOpen || false,
    location: initialProps?.location || null,
    selectedTree: null,
    showImageError: false,
    loading: false,
    error: null,
    trees: [],
    ...initialProps
  });

  const setLocationModal = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleLocationModalField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateLocationModal,
    setLocationModal,
    toggleLocationModalField,
  };
};

export default useLocationModal;
