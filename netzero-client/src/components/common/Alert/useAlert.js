import { useState, useEffect } from "react";

const useAlert = (initialProps) => {
  const [stateAlert, setState] = useState({
    isVisible: initialProps?.isVisible || false,
    type: initialProps?.type || "error",
    message: initialProps?.message || "",
    autoClose: initialProps?.autoClose || false,
    autoCloseDelay: initialProps?.autoCloseDelay || 5000,
    autoCloseTimer: null
  });

  const setAlert = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleAlertField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Auto-close functionality
  useEffect(() => {
    if (stateAlert.isVisible && stateAlert.autoClose && stateAlert.autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setAlert("isVisible", false);
      }, stateAlert.autoCloseDelay);
      
      setAlert("autoCloseTimer", timer);
      
      return () => {
        clearTimeout(timer);
        setAlert("autoCloseTimer", null);
      };
    }
  }, [stateAlert.isVisible, stateAlert.autoClose, stateAlert.autoCloseDelay]);

  // Update state when props change
  useEffect(() => {
    if (initialProps) {
      setAlert({
        isVisible: initialProps.isVisible || false,
        type: initialProps.type || "error",
        message: initialProps.message || "",
        autoClose: initialProps.autoClose || false,
        autoCloseDelay: initialProps.autoCloseDelay || 5000
      });
    }
  }, [
    initialProps?.isVisible, 
    initialProps?.type, 
    initialProps?.message, 
    initialProps?.autoClose, 
    initialProps?.autoCloseDelay
  ]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (stateAlert.autoCloseTimer) {
        clearTimeout(stateAlert.autoCloseTimer);
      }
    };
  }, []);

  return {
    stateAlert,
    setAlert,
    toggleAlertField,
  };
};

export default useAlert;