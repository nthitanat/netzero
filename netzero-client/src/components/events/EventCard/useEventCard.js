import { useState } from "react";

const useEventCard = (initialProps) => {
  const [stateEventCard, setState] = useState({
    isHovered: false,
    isLoading: false,
  });

  const setEventCard = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventCardField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateEventCard,
    setEventCard,
    toggleEventCardField,
  };
};

export default useEventCard;
