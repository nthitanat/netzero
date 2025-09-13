import { useState } from "react";

const useOrganicDecoration = (initialProps) => {
  const [stateOrganicDecoration, setState] = useState({
    isVisible: true,
    animationsEnabled: true,
    opacity: 1,
  });

  const setOrganicDecoration = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleOrganicDecorationField = (field) => {
    setOrganicDecoration((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateOrganicDecoration,
    setOrganicDecoration,
    toggleOrganicDecorationField,
  };
};

export default useOrganicDecoration;
