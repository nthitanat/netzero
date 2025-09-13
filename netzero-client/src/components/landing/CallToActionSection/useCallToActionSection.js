import { useState } from "react";

const useCallToActionSection = () => {
  const [stateCallToActionSection, setState] = useState({
    email: '',
    isSubmitting: false,
    isSubscribed: false,
    showSuccessMessage: false
  });

  const setCallToActionSection = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleCallToActionSectionField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateCallToActionSection,
    setCallToActionSection,
    toggleCallToActionSectionField,
  };
};

export default useCallToActionSection;
