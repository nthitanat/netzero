import React from "react";
import styles from "./BaseSlideshow.module.scss";
import useBaseSlideshow from "./useBaseSlideshow";
import BaseSlideshowHandler from "./BaseSlideshowHandler";

export default function BaseSlideshow({ 
    items,
    renderSlide,
    onSlideClick,
    config = {},
    className = "",
    controlsConfig = {}
}) {
    const {
        autoPlay = true,
        autoPlayInterval = 3000,
        infinite = true,
        showControls = true,
        showIndicators = true,
        pauseOnHover = true
    } = config;

    const {
        showNavButtons = true,
        showIndicatorDots = true,
        navButtonStyle = "default",
        indicatorStyle = "default"
    } = controlsConfig;
    
    const { stateBaseSlideshow, setBaseSlideshow } = useBaseSlideshow(items, {
        autoPlay,
        autoPlayInterval,
        infinite
    });
    
    const handlers = BaseSlideshowHandler(
        stateBaseSlideshow, 
        setBaseSlideshow, 
        items, 
        onSlideClick,
        { infinite }
    );
    
    if (!items || items.length === 0) {
        return null;
    }
    
    if (items.length === 1) {
        return (
            <div className={`${styles.Container} ${styles.SingleSlide} ${className}`}>
                {renderSlide(items[0], 0)}
            </div>
        );
    }
    
    return (
        <div 
            className={`${styles.Container} ${className}`}
            onMouseEnter={pauseOnHover ? handlers.handleMouseEnter : undefined}
            onMouseLeave={pauseOnHover ? handlers.handleMouseLeave : undefined}
        >
            <div className={styles.SlideshowWrapper}>
                <div 
                    className={styles.SlideshowTrack}
                    style={{
                        transform: `translateX(-${stateBaseSlideshow.currentIndex * 100}%)`,
                        transition: stateBaseSlideshow.isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                    }}
                >
                    {items.map((item, index) => (
                        <div 
                            key={item.id || item.key || index}
                            className={styles.SlideContainer}
                            onClick={() => handlers.handleSlideClick(item, index)}
                        >
                            {renderSlide(item, index)}
                        </div>
                    ))}
                </div>
                
                {showControls && showNavButtons && items.length > 1 && (
                    <div className={styles.NavigationControls}>
                        <button 
                            className={`${styles.NavButton} ${styles.PrevButton} ${styles[navButtonStyle]}`}
                            onClick={handlers.handlePrevSlide}
                            disabled={!infinite && stateBaseSlideshow.currentIndex === 0}
                            aria-label="Previous slide"
                        >
                            ‹
                        </button>
                        
                        <button 
                            className={`${styles.NavButton} ${styles.NextButton} ${styles[navButtonStyle]}`}
                            onClick={handlers.handleNextSlide}
                            disabled={!infinite && stateBaseSlideshow.currentIndex === items.length - 1}
                            aria-label="Next slide"
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
            
            {showIndicators && showIndicatorDots && items.length > 1 && (
                <div className={`${styles.Indicators} ${styles[indicatorStyle]}`}>
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.Indicator} ${
                                index === stateBaseSlideshow.currentIndex ? styles.Active : ''
                            }`}
                            onClick={() => handlers.handleIndicatorClick(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
