import React, { useEffect } from "react";
import styles from "./EventDetailModal.module.scss";
import useEventDetail from "../../../pages/EventDetail/useEventDetail";
import EventDetailModalHandler from "./EventDetailModalHandler";
import { ImageSlideshow } from "../../common";
import { getEventImages } from "../../../utils/imageUtils";

export default function EventDetailModal({ eventId, isOpen, onClose }) {
    const { stateEventDetail, setEventDetail } = useEventDetail(eventId);
    const handlers = EventDetailModalHandler(stateEventDetail, setEventDetail, onClose);
    
    const { event, isLoading, error } = stateEventDetail;
    
    // Handle escape key and click outside
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;
    
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    const handleClose = () => {
        handlers.handleClose();
    };
    
    if (isLoading) {
        return (
            <div className={styles.ModalBackdrop} onClick={handleBackdropClick}>
                <div className={styles.ModalContainer}>
                    <div className={styles.LoadingState}>
                        <div className={styles.LoadingSpinner}></div>
                        <p className={styles.LoadingText}>Loading event details...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (error || !event) {
        return (
            <div className={styles.ModalBackdrop} onClick={handleBackdropClick}>
                <div className={styles.ModalContainer}>
                    <div className={styles.ErrorState}>
                        <div className={styles.ErrorIcon}>🌱</div>
                        <h2 className={styles.ErrorTitle}>Event Not Found</h2>
                        <p className={styles.ErrorMessage}>The event you're looking for doesn't exist or has been removed.</p>
                        <button 
                            className={styles.CloseButton}
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={styles.ModalBackdrop} onClick={handleBackdropClick}>
            <div className={styles.ModalContainer}>
                <div className={styles.ModalHeader}>
                    <button 
                        className={styles.CloseButton}
                        onClick={handleClose}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>
                
                <div className={styles.ModalContent}>
                    <div className={styles.HeroSection}>
                        <div className={styles.HeroImage}>
                            <ImageSlideshow 
                                images={getEventImages(event)}
                                alt={event.title}
                                className={styles.EventImageSlideshow}
                            />
                            <div className={styles.ImageOverlay}>
                                <div className={styles.CategoryBadge}>
                                    {event.category}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.ContentContainer}>
                        <div className={styles.EventHeader}>
                            <h1 className={styles.EventTitle}>{event.title}</h1>
                            
                            <div className={styles.EventMeta}>
                                <div className={styles.MetaItem}>
                                    <span className={styles.MetaIcon}>📅</span>
                                    <div className={styles.MetaContent}>
                                        <span className={styles.MetaLabel}>Date</span>
                                        <span className={styles.MetaValue}>
                                            {new Date(event.event_date || event.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className={styles.MetaItem}>
                                    <span className={styles.MetaIcon}>📍</span>
                                    <div className={styles.MetaContent}>
                                        <span className={styles.MetaLabel}>Location</span>
                                        <span className={styles.MetaValue}>{event.location}</span>
                                    </div>
                                </div>

                                {event.organizer && (
                                    <div className={styles.MetaItem}>
                                        <span className={styles.MetaIcon}>👥</span>
                                        <div className={styles.MetaContent}>
                                            <span className={styles.MetaLabel}>Organizer</span>
                                            <span className={styles.MetaValue}>{event.organizer}</span>
                                        </div>
                                    </div>
                                )}

                                {event.max_participants && (
                                    <div className={styles.MetaItem}>
                                        <span className={styles.MetaIcon}>👨‍👩‍👧‍👦</span>
                                        <div className={styles.MetaContent}>
                                            <span className={styles.MetaLabel}>Participants</span>
                                            <span className={styles.MetaValue}>
                                                {event.current_participants || 0} / {event.max_participants}
                                                {event.max_participants - (event.current_participants || 0) > 0 
                                                    ? ` (${event.max_participants - (event.current_participants || 0)} spots remaining)` 
                                                    : ' (Full)'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {event.registration_deadline && (
                                    <div className={styles.MetaItem}>
                                        <span className={styles.MetaIcon}>⏰</span>
                                        <div className={styles.MetaContent}>
                                            <span className={styles.MetaLabel}>Registration Deadline</span>
                                            <span className={styles.MetaValue}>
                                                {new Date(event.registration_deadline).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className={styles.EventContent}>
                            <section className={styles.DescriptionSection}>
                                <h2 className={styles.SectionTitle}>About This Event</h2>
                                <p className={styles.EventDescription}>{event.description}</p>
                                
                               
                            </section>
                            
                            <section className={styles.DetailsSection}>
                                <h2 className={styles.SectionTitle}>Event Details</h2>
                                
                                <div className={styles.DetailGrid}>
                                    <div className={styles.DetailCard}>
                                        <div className={styles.DetailIcon}>🎯</div>
                                        <div className={styles.DetailContent}>
                                            <h4 className={styles.DetailTitle}>Category</h4>
                                            <p className={styles.DetailText}>{event.category}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.DetailCard}>
                                        <div className={styles.DetailIcon}>📊</div>
                                        <div className={styles.DetailContent}>
                                            <h4 className={styles.DetailTitle}>Status</h4>
                                            <p className={styles.DetailText}>
                                                {event.status === 'active' ? 'Active' :
                                                 event.status === 'cancelled' ? 'Cancelled' :
                                                 event.status === 'completed' ? 'Completed' :
                                                 event.status === 'postponed' ? 'Postponed' :
                                                 'Active'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {event.contact_email && (
                                        <div className={styles.DetailCard}>
                                            <div className={styles.DetailIcon}>📧</div>
                                            <div className={styles.DetailContent}>
                                                <h4 className={styles.DetailTitle}>Contact Email</h4>
                                                <p className={styles.DetailText}>
                                                    <a href={`mailto:${event.contact_email}`}>
                                                        {event.contact_email}
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {event.contact_phone && (
                                        <div className={styles.DetailCard}>
                                            <div className={styles.DetailIcon}>📞</div>
                                            <div className={styles.DetailContent}>
                                                <h4 className={styles.DetailTitle}>Contact Phone</h4>
                                                <p className={styles.DetailText}>
                                                    <a href={`tel:${event.contact_phone}`}>
                                                        {event.contact_phone}
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.DetailCard}>
                                        <div className={styles.DetailIcon}>💚</div>
                                        <div className={styles.DetailContent}>
                                            <h4 className={styles.DetailTitle}>Impact</h4>
                                            <p className={styles.DetailText}>High Environmental Impact</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        
                        <div className={styles.ActionSection}>
                            <div className={styles.ActionButtons}>
                                <button 
                                    className={`${styles.RegisterButton} ${
                                        (event.status !== 'active' || 
                                         (event.max_participants && event.current_participants >= event.max_participants) ||
                                         (event.registration_deadline && new Date() > new Date(event.registration_deadline)) ||
                                         stateEventDetail.isRegistering) ? styles.Disabled : ''
                                    }`}
                                    onClick={handlers.handleRegister}
                                    disabled={
                                        event.status !== 'active' || 
                                        (event.max_participants && event.current_participants >= event.max_participants) ||
                                        (event.registration_deadline && new Date() > new Date(event.registration_deadline)) ||
                                        stateEventDetail.isRegistering
                                    }
                                >
                                    {stateEventDetail.isRegistering ? 'Registering...' : 
                                     stateEventDetail.isRegistered ? 'Registered!' :
                                     event.status !== 'active' ? 'Event Not Available' :
                                     (event.max_participants && event.current_participants >= event.max_participants) ? 'Event Full' :
                                     (event.registration_deadline && new Date() > new Date(event.registration_deadline)) ? 'Registration Closed' :
                                     'Register Now'}
                                    <span className={styles.ButtonIcon}>
                                        {stateEventDetail.isRegistering ? '⏳' : 
                                         stateEventDetail.isRegistered ? '✅' : '🎫'}
                                    </span>
                                </button>
                                
                                <button 
                                    className={styles.ShareButton}
                                    onClick={handlers.handleShare}
                                >
                                    Share Event
                                    <span className={styles.ButtonIcon}>📤</span>
                                </button>
                                
                                <button 
                                    className={styles.SaveButton}
                                    onClick={handlers.handleSave}
                                >
                                    {stateEventDetail.isSaved ? 'Saved!' : 'Save Event'}
                                    <span className={styles.ButtonIcon}>
                                        {stateEventDetail.isSaved ? '💚' : '🤍'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
