import React from "react";
import styles from "./EventDetail.module.scss";
import useEventDetail from "./useEventDetail";
import EventDetailHandler from "./EventDetailHandler";
import { ImageSlideshow, FloatingNavBar } from "../../components/common";
import { getEventImages } from "../../utils/imageUtils";

export default function EventDetail({ eventId }) {
    const { stateEventDetail, setEventDetail } = useEventDetail(eventId);
    const handlers = EventDetailHandler(stateEventDetail, setEventDetail);
    
    const { event, isLoading, error } = stateEventDetail;
    
    if (isLoading) {
        return (
            <div className={styles.Container}>
                <div className={styles.LoadingState}>
                    <div className={styles.LoadingSpinner}></div>
                    <p className={styles.LoadingText}>Loading event details...</p>
                </div>
            </div>
        );
    }
    
    if (error || !event) {
        return (
            <div className={styles.Container}>
                <div className={styles.ErrorState}>
                    <div className={styles.ErrorIcon}>🌱</div>
                    <h2 className={styles.ErrorTitle}>Event Not Found</h2>
                    <p className={styles.ErrorMessage}>The event you're looking for doesn't exist or has been removed.</p>
                    <button 
                        className={styles.BackButton}
                        onClick={handlers.handleBackToEvents}
                    >
                        ← Back to Events
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className={styles.Container}>
            <div className={styles.BackgroundElements}>
                <div className={styles.OrganicShape1}></div>
                <div className={styles.OrganicShape2}></div>
            </div>
            
            <header className={styles.Header}>
                <button 
                    className={styles.BackButton}
                    onClick={handlers.handleBackToEvents}
                >
                    ← Back to Events
                </button>
                
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
            </header>
            
            <main className={styles.MainContent}>
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
                            
                            <div className={styles.AdditionalInfo}>
                                <h3 className={styles.SubsectionTitle}>What to Expect</h3>
                                <ul className={styles.ExpectationsList}>
                                    <li>Interactive sessions with industry experts</li>
                                    <li>Networking opportunities with like-minded individuals</li>
                                    <li>Hands-on workshops and practical demonstrations</li>
                                    <li>Latest insights on sustainable practices</li>
                                    <li>Complimentary refreshments and materials</li>
                                </ul>
                            </div>
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
                                
                                {event.registration_deadline && (
                                    <div className={styles.DetailCard}>
                                        <div className={styles.DetailIcon}>⏰</div>
                                        <div className={styles.DetailContent}>
                                            <h4 className={styles.DetailTitle}>Registration Deadline</h4>
                                            <p className={styles.DetailText}>
                                                {new Date(event.registration_deadline).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}

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
            </main>
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="default"
            />
        </div>
    );
}
