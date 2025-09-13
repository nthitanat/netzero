import { useState } from "react";

const useAdvertisementCarousel = (initialProps = {}) => {
  const [stateAdvertisementCarousel, setState] = useState({
    selectedAd: null,
    isLoading: false,
    ...initialProps
  });

  const setAdvertisementCarousel = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleAdvertisementCarouselField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateAdvertisementCarousel,
    setAdvertisementCarousel,
    toggleAdvertisementCarouselField,
  };
};

export default useAdvertisementCarousel;
