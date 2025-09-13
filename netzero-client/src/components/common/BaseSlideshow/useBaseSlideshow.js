import { useState, useEffect } from "react";

const useBaseSlideshow = (items, options = {}) => {
  const {
    autoPlay = true,
    autoPlayInterval = 3000,
    infinite = true,
    startIndex = 0
  } = options;

  const [stateBaseSlideshow, setState] = useState({
    currentIndex: startIndex,
    isAutoPlaying: autoPlay,
    isPaused: false,
    isTransitioning: true,
    itemsLength: items?.length || 0,
  });

  const setBaseSlideshow = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleBaseSlideshowField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Update items length when items change
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      itemsLength: items?.length || 0,
      currentIndex: Math.min(prevState.currentIndex, (items?.length || 1) - 1)
    }));
  }, [items]);

  // Auto-play functionality
  useEffect(() => {
    if (
      !items || 
      items.length <= 1 || 
      !stateBaseSlideshow.isAutoPlaying || 
      stateBaseSlideshow.isPaused
    ) {
      return;
    }

    const interval = setInterval(() => {
      setState(prevState => {
        const nextIndex = infinite 
          ? (prevState.currentIndex + 1) % items.length
          : Math.min(prevState.currentIndex + 1, items.length - 1);
        
        return {
          ...prevState,
          currentIndex: nextIndex,
          isTransitioning: true
        };
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [items, stateBaseSlideshow.isAutoPlaying, stateBaseSlideshow.isPaused, stateBaseSlideshow.currentIndex, autoPlayInterval, infinite]);

  return {
    stateBaseSlideshow,
    setBaseSlideshow,
    toggleBaseSlideshowField,
  };
};

export default useBaseSlideshow;
