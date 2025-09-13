import { useState } from "react";

const useItemCard = (initialProps) => {
  const [stateItemCard, setState] = useState({
    isHovered: false,
    isLoading: false,
    isSelected: false,
    ...initialProps
  });

  const setItemCard = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleItemCardField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateItemCard,
    setItemCard,
    toggleItemCardField,
  };
};

export default useItemCard;
