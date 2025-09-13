const BaseSlideshowHandler = (stateBaseSlideshow, setBaseSlideshow, items, onSlideClick, options = {}) => {
  const { infinite = true, pauseOnInteraction = true, resumeDelay = 2000 } = options;

  const handlePause = () => {
    if (pauseOnInteraction) {
      setBaseSlideshow("isPaused", true);
      
      // Resume auto-play after delay
      setTimeout(() => {
        setBaseSlideshow("isPaused", false);
      }, resumeDelay);
    }
  };

  return {
    handleNextSlide: () => {
      if (!items || items.length === 0) return;
      
      setBaseSlideshow("isTransitioning", true);
      
      const nextIndex = infinite 
        ? (stateBaseSlideshow.currentIndex + 1) % items.length
        : Math.min(stateBaseSlideshow.currentIndex + 1, items.length - 1);
      
      setBaseSlideshow("currentIndex", nextIndex);
      handlePause();
    },
    
    handlePrevSlide: () => {
      if (!items || items.length === 0) return;
      
      setBaseSlideshow("isTransitioning", true);
      
      const prevIndex = infinite 
        ? (stateBaseSlideshow.currentIndex - 1 + items.length) % items.length
        : Math.max(stateBaseSlideshow.currentIndex - 1, 0);
      
      setBaseSlideshow("currentIndex", prevIndex);
      handlePause();
    },
    
    handleIndicatorClick: (index) => {
      if (!items || items.length === 0 || index < 0 || index >= items.length) return;
      
      setBaseSlideshow("isTransitioning", true);
      setBaseSlideshow("currentIndex", index);
      
      // Pause for slightly longer on manual indicator click
      if (pauseOnInteraction) {
        setBaseSlideshow("isPaused", true);
        setTimeout(() => {
          setBaseSlideshow("isPaused", false);
        }, resumeDelay + 1000);
      }
    },
    
    handleSlideClick: (item, index) => {
      if (onSlideClick) {
        onSlideClick(item, index);
      }
    },
    
    handleMouseEnter: () => {
      setBaseSlideshow("isPaused", true);
    },
    
    handleMouseLeave: () => {
      setBaseSlideshow("isPaused", false);
    },
    
    handleAutoPlayToggle: () => {
      setBaseSlideshow("isAutoPlaying", !stateBaseSlideshow.isAutoPlaying);
    },
    
    goToSlide: (index) => {
      if (!items || items.length === 0 || index < 0 || index >= items.length) return;
      
      setBaseSlideshow("isTransitioning", true);
      setBaseSlideshow("currentIndex", index);
    },
    
    pause: () => {
      setBaseSlideshow("isPaused", true);
    },
    
    resume: () => {
      setBaseSlideshow("isPaused", false);
    },
    
    reset: () => {
      setBaseSlideshow({
        currentIndex: 0,
        isPaused: false,
        isTransitioning: true
      });
    }
  };
};

export default BaseSlideshowHandler;
