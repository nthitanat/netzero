import React from "react";
import styles from "./AdvertisementCarousel.module.scss";
import useAdvertisementCarousel from "./useAdvertisementCarousel";
import AdvertisementCarouselHandler from "./AdvertisementCarouselHandler";
import { BaseSlideshow } from "../../common";

export default function AdvertisementCarousel({ advertisements, onAdClick, className = "", theme = "market" }) {
    const { stateAdvertisementCarousel, setAdvertisementCarousel } = useAdvertisementCarousel();
    const handlers = AdvertisementCarouselHandler(stateAdvertisementCarousel, setAdvertisementCarousel);

    if (!advertisements || advertisements.length === 0) {
        return null;
    }

    // Transform advertisements array to work with BaseSlideshow
    const adItems = advertisements.map(ad => ({
        ...ad,
        id: ad.id || ad._id
    }));

    // Render function for individual advertisement slides
    const renderAdSlide = (ad, index) => (
        <div className={styles.AdSlide}>
            <div className={styles.AdContainer}>
                <div className={styles.AdImageContainer}>
                    <img 
                        src={ad.image} 
                        alt={ad.title}
                        className={styles.AdImage}
                    />
                  
                </div>
                
                <div className={styles.AdContent}>
                    <div className={styles.AdInfo}>
                        <h3 className={styles.AdTitle}>
                            {ad.title}
                        </h3>
                        <p className={styles.AdDescription}>
                            {ad.description}
                        </p>
                    </div>
                    
                    <button 
                        className={styles.AdButton}
                        onClick={() => handlers.handleAdClick(ad)}
                    >
                        ดูรายละเอียด
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`${styles.AdvertisementCarouselContainer} ${styles[theme]} ${className}`}>
            <BaseSlideshow
                items={adItems}
                renderSlide={renderAdSlide}
                onSlideClick={onAdClick}
                config={{
                    autoPlay: true,
                    autoPlayInterval: 5000,
                    infinite: true,
                    showControls: advertisements.length > 1,
                    showIndicators: advertisements.length > 1,
                    pauseOnHover: true
                }}
                controlsConfig={{
                    showNavButtons: true,
                    showIndicatorDots: true,
                    navButtonStyle: "minimal",
                    indicatorStyle: "default"
                }}
                className={styles.AdSlideshow}
            />
        </div>
    );
}
