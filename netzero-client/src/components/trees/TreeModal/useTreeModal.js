import { useState } from "react";

const useTreeModal = (initialProps) => {
  const [stateTreeModal, setState] = useState({
    isOpen: initialProps?.isOpen || false,
    tree: initialProps?.tree || null,
    selectedLocation: null,
    showImageError: false,
    loading: false,
    error: null,
    filteredLocations: null,
    ...initialProps
  });

  const setTreeModal = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleTreeModalField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateTreeModal,
    setTreeModal,
    toggleTreeModalField,
  };
};

export default useTreeModal;
