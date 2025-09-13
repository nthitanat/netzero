import React from "react";
import styles from "./Events.module.scss";
import useEvents from "./useEvents";
import EventsHandler from "./EventsHandler";
import { EventCard, RecommendedCarousel, EventFilterContainer, EventSearchContainer, EventDetailModal } from "../../components/events";
import { ThaiHeader, OrganicDecoration, FloatingNavBar } from "../../components/common";

export default function Events() {
    const { stateEvents, setEvents } = useEvents();
    const handlers = EventsHandler(stateEvents, setEvents);
    
    return (
        <div className={styles.Container}>
            <OrganicDecoration />

            {stateEvents.recommendedEvents.length > 0 && (
                <div className={styles.RecommendedSection}>
                    <RecommendedCarousel 
                        events={stateEvents.recommendedEvents}
                        onEventClick={handlers.handleEventClick}
                    />
                    
                    <div className={styles.FilterSection}>
                        <div className={styles.FilterContainer}>
                            <EventSearchContainer
                                searchQuery={stateEvents.searchQuery}
                                onSearchChange={handlers.handleSearchChange}
                                className={styles.SearchComponent}
                            />
                            
                            <EventFilterContainer
                                selectedCategory={stateEvents.selectedCategory}
                                onCategoryFilter={handlers.handleCategoryFilter}
                                className={styles.FilterComponent}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {stateEvents.recommendedEvents.length === 0 && (
                <div className={styles.FilterSectionStandalone}>
                    <div className={styles.FilterContainer}>
                        <EventSearchContainer
                            searchQuery={stateEvents.searchQuery}
                            onSearchChange={handlers.handleSearchChange}
                            className={styles.SearchComponent}
                        />
                        
                        <EventFilterContainer
                            selectedCategory={stateEvents.selectedCategory}
                            onCategoryFilter={handlers.handleCategoryFilter}
                            className={styles.FilterComponent}
                        />
                    </div>
                </div>
            )}
            
            <main className={styles.MainContent}>
                <div className={styles.EventsGrid}>
                    {stateEvents.filteredEvents.map((event, index) => (
                        <div 
                            key={event.id} 
                            className={styles.EventCardWrapper}
                            style={{ 
                                animationDelay: `${index * 0.1}s` 
                            }}
                        >
                            <EventCard 
                                event={event} 
                                onEventClick={handlers.handleEventClick}
                            />
                        </div>
                    ))}
                </div>
                
                {stateEvents.filteredEvents.length === 0 && !stateEvents.isLoading && !stateEvents.error && (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyStateIcon}>📅</div>
                        <h3 className={styles.EmptyStateTitle}>ไม่พบงานในหมวดหมู่นี้</h3>
                        <p className={styles.EmptyStateMessage}>
                            ลองเปลี่ยนการกรองเพื่อค้นหางานอื่นๆ
                        </p>
                    </div>
                )}
                
                {stateEvents.error && (
                    <div className={styles.ErrorState}>
                        <div className={styles.ErrorStateIcon}>⚠️</div>
                        <h3 className={styles.ErrorStateTitle}>เกิดข้อผิดพลาด</h3>
                        <p className={styles.ErrorStateMessage}>
                            {stateEvents.error}
                        </p>
                        <button 
                            className={styles.RetryButton}
                            onClick={() => window.location.reload()}
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                )}
                
                {stateEvents.isLoading && (
                    <div className={styles.LoadingState}>
                        <div className={styles.LoadingSpinner}></div>
                        <p className={styles.LoadingText}>กำลังโหลดงานที่น่าสนใจ...</p>
                    </div>
                )}
            </main>
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="default"
            />
            
            {/* Event Detail Modal */}
            <EventDetailModal
                eventId={stateEvents.selectedEventId}
                isOpen={stateEvents.isModalOpen}
                onClose={handlers.handleCloseModal}
            />
        </div>
    );
}
