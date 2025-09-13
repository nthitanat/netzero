import React from "react";
import styles from "./ImageSlideshow.module.scss";
import BaseSlideshow from "../BaseSlideshow/BaseSlideshow";

export default function ImageSlideshow({ images, alt, className = "" }) {
    if (!images || images.length === 0) {
        return null;
    }
    
    // Transform images array to items with id for BaseSlideshow
    const imageItems = images.map((image, index) => ({
        id: `image-${index}`,
        url: image,
        alt: `${alt} ${index + 1}`
    }));
    
    // Render function for individual image slides
    const renderImageSlide = (imageItem, index) => (
        <img 
            src={imageItem.url} 
            alt={imageItem.alt}
            className={styles.SlideImage}
        />
    );
    
    return (
        <BaseSlideshow
            items={imageItems}
            renderSlide={renderImageSlide}
            onSlideClick={null} // Images don't typically need click handlers
            className={`${styles.ImageSlideshowContainer} ${className}`}
            config={{
                autoPlay: images.length > 1,
                autoPlayInterval: 3000,
                infinite: false, // Don't loop images infinitely
                showControls: images.length > 1,
                showIndicators: images.length > 1,
                pauseOnHover: true
            }}
            controlsConfig={{
                showNavButtons: true,
                showIndicatorDots: true,
                navButtonStyle: "minimal",
                indicatorStyle: "default"
            }}
        />
    );
}
