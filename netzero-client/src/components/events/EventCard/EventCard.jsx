import React from "react";
import styles from "./EventCard.module.scss";
import useEventCard from "./useEventCard";
import EventCardHandler from "./EventCardHandler";
import { ItemCard, GoogleIcon } from "../../common";
import { getEventImages } from "../../../utils/imageUtils";

export default function EventCard({ event, onEventClick }) {
    const { stateEventCard, setEventCard } = useEventCard();
    const handlers = EventCardHandler(stateEventCard, setEventCard, event, onEventClick);
    
    const formatThaiDate = (dateString) => {
        const date = new Date(dateString);
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        
        return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    };
    
    // Configure badges for the event
    const badges = [];
    
    // Category badge (always present)
    if (event.category) {
        badges.push({
            text: event.category,
            icon: "event",
            position: "TopRight",
            style: {
                backgroundColor: "var(--primary-color-2)",
                color: "white"
            }
        });
    }
    
    // Recommended badge (conditional)
    if (event.isRecommended) {
        badges.push({
            text: "แนะนำ",
            icon: "star", 
            position: "TopLeft",
            style: {
                backgroundColor: "var(--secondary-color-2)",
                color: "var(--primary-color-2)"
            }
        });
    }

    // Status badge (new feature)
    if (event.status && event.status !== 'active') {
        badges.push({
            text: event.status === 'cancelled' ? 'ยกเลิก' : 
                  event.status === 'completed' ? 'เสร็จสิ้น' : 
                  event.status === 'postponed' ? 'เลื่อน' : event.status,
            position: "BottomLeft",
            style: {
                backgroundColor: event.status === 'cancelled' ? "var(--warning)" : 
                               event.status === 'completed' ? "var(--active-200)" : 
                               "var(--inactive)",
                color: "white"
            }
        });
    }

    // Availability badge (new feature)
    if (event.max_participants && event.current_participants !== undefined) {
        const spotsRemaining = event.max_participants - event.current_participants;
        const isAlmostFull = spotsRemaining <= 5 && spotsRemaining > 0;
        const isFull = spotsRemaining <= 0;
        
        if (isFull) {
            badges.push({
                text: "เต็มแล้ว",
                position: "BottomRight",
                style: {
                    backgroundColor: "var(--warning)",
                    color: "white"
                }
            });
        } else if (isAlmostFull) {
            badges.push({
                text: `เหลือ ${spotsRemaining}`,
                position: "BottomRight",
                style: {
                    backgroundColor: "var(--secondary-color-1)",
                    color: "white"
                }
            });
        }
    }
    
    // Render the event-specific content
    const renderEventContent = (event, state, itemHandlers) => (
        <div className={styles.EventContent}>
            <h3 className={styles.Title}>{event.title}</h3>
            <p className={styles.Description}>{event.description}</p>
            
            <div className={styles.EventDetails}>
                <div className={styles.DetailItem}>
                    <GoogleIcon iconType="event" size="small" />
                    <span className={styles.DetailText}>
                        {formatThaiDate(event.event_date || event.date)}
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
                    onClick={(e) => {
                        e.stopPropagation();
                        handlers.handleLearnMore();
                    }}
                >
                    ดูรายละเอียด
                    <span className={styles.ArrowIcon}>→</span>
                </button>
            </div>
        </div>
    );

    // Prepare event with API images
    const eventWithImages = {
        ...event,
        images: getEventImages(event),
        photos: getEventImages(event) // ItemCard looks for both images and photos
    };
    
    return (
        <ItemCard
            item={eventWithImages}
            onItemClick={onEventClick}
            badges={badges}
            renderContent={renderEventContent}
            config={{
                showThumbnail: true,
                thumbnailHeight: 220,
                borderRadius: 24
            }}
        />
    );
}
