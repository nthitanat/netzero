import { useState } from "react";

const useTreeListCard = (initialProps) => {
  const [stateTreeListCard, setState] = useState({
    selectedTree: initialProps?.selectedTree || null,
    expandedTrees: [],
    isLoading: false,
    ...initialProps
  });

  const setTreeListCard = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleTreeListCardField = (field) => {
    setTreeListCard((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateTreeListCard,
    setTreeListCard,
    toggleTreeListCardField,
  };
};

export default useTreeListCard;
