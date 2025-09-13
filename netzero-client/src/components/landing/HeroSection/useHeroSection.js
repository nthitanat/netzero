import { useState, useEffect } from "react";

const useHeroSection = () => {
  const [stateHeroSection, setState] = useState({
    isLoaded: false,
    animationComplete: false,
    currentAnimation: 'initial'
  });

  const setHeroSection = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleHeroSectionField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  useEffect(() => {
    // Set loaded state after mount
    const timer = setTimeout(() => {
      setHeroSection('isLoaded', true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    stateHeroSection,
    setHeroSection,
    toggleHeroSectionField,
  };
};

export default useHeroSection;
