import { useState } from "react";

const useProductCard = (initialProps = {}) => {
  const [stateProductCard, setState] = useState({
    isHovered: false,
    isLoading: false,
    ...initialProps
  });

  const setProductCard = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleProductCardField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateProductCard,
    setProductCard,
    toggleProductCardField,
  };
};

export default useProductCard;
