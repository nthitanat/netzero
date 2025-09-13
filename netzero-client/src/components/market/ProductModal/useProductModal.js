import { useState, useEffect } from "react";

const useProductModal = (initialProps = {}) => {
  const [stateProductModal, setState] = useState({
    isOpen: initialProps.isOpen || false,
    isReserving: false,
    showReserveDialog: false,
    ...initialProps
  });

  const setProductModal = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleProductModalField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Update isOpen state when prop changes
  useEffect(() => {
    setState((prevState) => ({ ...prevState, isOpen: initialProps.isOpen }));
  }, [initialProps.isOpen]);

  return {
    stateProductModal,
    setProductModal,
    toggleProductModalField,
  };
};

export default useProductModal;
