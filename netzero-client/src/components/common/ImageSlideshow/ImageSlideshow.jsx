import React from "react";
import styles from "./ImageSlideshow.module.scss";
import BaseSlideshow from "../BaseSlideshow/BaseSlideshow";
import { getImagePlaceholderUrl, handleImageError } from "../../../utils/imageUtils";

export default function ImageSlideshow({ images, alt, className = "" }) {
    const availableImages = (images || []).filter(Boolean);
    if (availableImages.length === 0) {
        return <img src={getImagePlaceholderUrl()} alt={alt} className={`${styles.SlideImage} ${className}`} />;
    }
    
    // Transform images array to items with id for BaseSlideshow
    const imageItems = availableImages.map((image, index) => ({
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
            onError={handleImageError}
        />
    );
    
    return (
        <BaseSlideshow
            items={imageItems}
            renderSlide={renderImageSlide}
            onSlideClick={null} // Images don't typically need click handlers
            className={`${styles.ImageSlideshowContainer} ${className}`}
            config={{
                autoPlay: availableImages.length > 1,
                autoPlayInterval: 3000,
                infinite: false, // Don't loop images infinitely
                showControls: availableImages.length > 1,
                showIndicators: availableImages.length > 1,
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
