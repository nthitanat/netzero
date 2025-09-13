import { useState } from "react";

const useThaiHeader = (initialProps) => {
  const [stateThaiHeader, setState] = useState({
    isVisible: true,
    animationComplete: false,
  });

  const setThaiHeader = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleThaiHeaderField = (field) => {
    setThaiHeader((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateThaiHeader,
    setThaiHeader,
    toggleThaiHeaderField,
  };
};

export default useThaiHeader;
