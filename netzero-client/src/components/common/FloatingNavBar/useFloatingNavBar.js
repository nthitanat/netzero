import { useState } from "react";

const useFloatingNavBar = (initialProps = {}) => {
  const [stateFloatingNavBar, setState] = useState({
    activeRoute: initialProps.activeRoute || "",
    hoveredIndex: null,
    isVisible: true,
    lastScrollY: 0,
    showLoginModal: false,
    showUserMenu: false,
    ...initialProps
  });

  const setFloatingNavBar = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleFloatingNavBarField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateFloatingNavBar,
    setFloatingNavBar,
    toggleFloatingNavBarField,
  };
};

export default useFloatingNavBar;
