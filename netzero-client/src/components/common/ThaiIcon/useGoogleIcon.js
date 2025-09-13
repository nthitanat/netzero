import { useState } from "react";

const useGoogleIcon = (initialProps) => {
  const [stateGoogleIcon, setState] = useState({
    iconType: initialProps?.iconType || "eco",
    size: initialProps?.size || "medium",
    variant: initialProps?.variant || "outlined",
    isAnimating: false,
  });

  const setGoogleIcon = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleGoogleIconField = (field) => {
    setGoogleIcon((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateGoogleIcon,
    setGoogleIcon,
    toggleGoogleIconField,
  };
};

export default useGoogleIcon;
