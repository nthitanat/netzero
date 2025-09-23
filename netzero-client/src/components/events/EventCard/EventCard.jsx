import React from "react";
import styles from "./EventCard.module.scss";
import EventCardHandler from "./EventCardHandler";
import { ImageSlideshow, GoogleIcon } from "../../common";
import { getEventImages } from "../../../utils/imageUtils";

export default function EventCard({ 
    event, 
    onEventClick,
    config = {},
    className = "",
    handlerFilter = null
}) {
    const {
        showThumbnail = true,
        thumbnailHeight = 220,
        borderRadius = 24
    } = config;
    
    // Get handlers from EventCardHandler
    const handlers = EventCardHandler(event, onEventClick, handlerFilter);
    
    // Get badges configuration from handler
    const badges = handlers.generateBadges();
    
    // Prepare event images
    const eventImages = getEventImages(event);
    
    return (
        <div 
            className={`${styles.Container} ${className}`}
            onClick={handlers.handleCardClick}
            style={{ 
                borderRadius: `${borderRadius}px`,
                '--thumbnail-height': `${thumbnailHeight}px`
            }}
        >
            {showThumbnail && (
                <div className={styles.ThumbnailContainer}>
                    <ImageSlideshow 
                        images={eventImages}
                        alt={event.title}
                        className={styles.EventSlideshow}
                    />
                    
                    {badges.map((badge, index) => (
                        <div 
                            key={index}
                            className={`${styles.Badge} ${styles[`Badge${badge.position}`]}`}
                            style={badge.style}
                        >
                            {badge.icon && (
                                <GoogleIcon iconType={badge.icon} size="small" />
                            )}
                            {badge.text}
                        </div>
                    ))}
                </div>
            )}
            
            <div className={styles.ContentContainer}>
                <div className={styles.EventContent}>
                    <h3 className={styles.Title}>{event.title}</h3>
                    <p className={styles.Description}>{event.description}</p>
                    
                    <div className={styles.EventDetails}>
                        <div className={styles.DetailItem}>
                            <GoogleIcon iconType="event" size="small" />
                            <span className={styles.DetailText}>
                                {handlers.formatThaiDate(event.event_date || event.date)}
                            </span>
                        </div>
                        
                        <div className={styles.DetailItem}>
                            <GoogleIcon iconType="location_on" size="small" />
                            <span className={styles.DetailText}>{event.location}</span>
                        </div>

                        {event.organizer && (
                            <div className={styles.DetailItem}>
                                <GoogleIcon iconType="group" size="small" />
                                <span className={styles.DetailText}>{event.organizer}</span>
                            </div>
                        )}

                        {event.max_participants && (
                            <div className={styles.DetailItem}>
                                <GoogleIcon iconType="people" size="small" />
                                <span className={styles.DetailText}>
                                    {event.current_participants || 0}/{event.max_participants} คน
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.ActionContainer}>
                        <button 
                            className={styles.LearnMoreButton}
                            onClick={handlers.handleLearnMore}
                        >
                            ดูรายละเอียด
                            <span className={styles.ArrowIcon}>→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
