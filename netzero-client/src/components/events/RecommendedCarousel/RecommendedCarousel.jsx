import React from "react";
import styles from "./RecommendedCarousel.module.scss";
import { BaseSlideshow, GoogleIcon } from "../../common";
import { getEventPrimaryImage } from "../../../utils/imageUtils";

export default function RecommendedCarousel({ events, onEventClick }) {
    if (!events || events.length === 0) {
        return null;
    }
    
    // Transform events array to work with BaseSlideshow
    const eventItems = events.map(event => ({
        ...event,
        id: event.id || event._id
    }));
    
    // Render function for individual event slides
    const renderEventSlide = (event, index) => (
        <div className={styles.CarouselSlide}>
            <div className={styles.SlideContent}>
                <div className={styles.SlideImageContainer}>
                    <img 
                        src={getEventPrimaryImage(event)} 
                        alt={event.title}
                        className={styles.SlideImage}
                    />
                </div>
                
                <div className={styles.SlideInfoCard}>
                    <div className={styles.InfoContent}>
                        <div className={styles.InfoHeader}>
                            <div className={styles.CategoryBadge}>
                                {event.category}
                            </div>
                            <div className={styles.EventId}>
                                ID: {event.id}
                            </div>
                        </div>
                        
                        <h3 className={styles.EventTitle}>{event.title}</h3>
                        
                        <div className={styles.EventDescription}>
                            {event.description}
                        </div>
                        
                        <div className={styles.EventMeta}>
                            <div className={styles.MetaRow}>
                                <div className={styles.MetaItem}>
                                    <GoogleIcon 
                                        iconType="event" 
                                        size="small" 
                                        className={styles.MetaIcon}
                                    />
                                    <span className={styles.MetaText}>
                                        {new Date(event.date).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={styles.MetaRow}>
                                <div className={styles.MetaItem}>
                                    <GoogleIcon 
                                        iconType="location_on" 
                                        size="small" 
                                        className={styles.MetaIcon}
                                    />
                                    <span className={styles.MetaText}>{event.location}</span>
                                </div>
                            </div>
                            
                            <div className={styles.MetaRow}>
                                <div className={styles.MetaItem}>
                                    <GoogleIcon 
                                        iconType="monetization_on" 
                                        size="small" 
                                        className={styles.MetaIcon}
                                    />
                                    <span className={styles.MetaText}>
                                        {event.price ? `${event.price} บาท` : 'ฟรี'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.ActionButtons}>
                            <button 
                                className={styles.ViewEventButton}
                                onClick={() => onEventClick && onEventClick(event.id)}
                            >
                                ดูรายละเอียด
                                <span className={styles.ArrowIcon}>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Handle slide click
    const handleEventSlideClick = (event, index) => {
        if (onEventClick) {
            onEventClick(event.id);
        }
    };
    
    return (
        <div className={styles.Container}>
            <BaseSlideshow
                items={eventItems}
                renderSlide={renderEventSlide}
                onSlideClick={handleEventSlideClick}
                className={styles.RecommendedCarouselContainer}
                config={{
                    autoPlay: true,
                    autoPlayInterval: 4000,
                    infinite: true,
                    showControls: true,
                    showIndicators: true,
                    pauseOnHover: true
                }}
                controlsConfig={{
                    showNavButtons: true,
                    showIndicatorDots: true,
                    navButtonStyle: "large",
                    indicatorStyle: "default"
                }}
            />
        </div>
    );
}
