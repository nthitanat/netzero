import { useState } from "react";

const useProductListCard = (initialProps = {}) => {
  const [stateProductListCard, setState] = useState({
    selectedProduct: initialProps.selectedProduct || null,
    hoveredProduct: null,
    searchQuery: "",
    ...initialProps
  });

  const setProductListCard = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleProductListCardField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateProductListCard,
    setProductListCard,
    toggleProductListCardField,
  };
};

export default useProductListCard;
