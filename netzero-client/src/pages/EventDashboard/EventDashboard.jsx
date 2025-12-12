import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EventDashboard.module.scss";
import useEventDashboard from "./useEventDashboard";
import EventDashboardHandler from "./EventDashboardHandler";
import { FloatingNavBar, GoogleIcon, OrganicDecoration } from "../../components/common";
import { EventManagementPanel, EventStatsPanel } from "../../components/dashboard";
import { useAuth } from "../../contexts/AuthContext";

export default function EventDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stateEventDashboard, setEventDashboard } = useEventDashboard();
    const handlers = EventDashboardHandler(stateEventDashboard, setEventDashboard, navigate);
    
    // Check if user has community_head role or admin
    if (!user || !['community_head', 'admin'].includes(user.role)) {
        return (
            <div className={styles.Container}>
                <div className={styles.UnauthorizedContainer}>
                    <GoogleIcon iconType="warning" size="large" className={styles.WarningIcon} />
                    <h2>ไม่สามารถเข้าถึงได้</h2>
                    <p>คุณต้องมีสิทธิ์เป็นหัวหน้าชุมชนหรือผู้ดูแลระบบ เพื่อเข้าใช้หน้านี้</p>
                    <button 
                        className={styles.BackButton}
                        onClick={() => navigate('/')}
                    >
                        กลับสู่หน้าหลัก
                    </button>
                </div>
                <FloatingNavBar onNavigate={handlers.handleNavigate} theme="events" />
            </div>
        );
    }
    
    return (
        <div className={styles.Container}>
            <OrganicDecoration className={styles.BackgroundDecoration} />
            
            <div className={styles.Header}>
                <h1 className={styles.Title}>แดชบอร์ดจัดการกิจกรรม</h1>
                <p className={styles.Subtitle}>สร้างและจัดการกิจกรรมของชุมชน</p>
            </div>
            
            <div className={styles.TabContainer}>
                <div className={styles.TabButtons}>
                    <button
                        className={`${styles.TabButton} ${stateEventDashboard.activeTab === 'stats' ? styles.Active : ''}`}
                        onClick={() => handlers.handleTabChange('stats')}
                    >
                        <GoogleIcon iconType="analytics" size="small" />
                        สถิติกิจกรรม
                    </button>
                    <button
                        className={`${styles.TabButton} ${stateEventDashboard.activeTab === 'events' ? styles.Active : ''}`}
                        onClick={() => handlers.handleTabChange('events')}
                    >
                        <GoogleIcon iconType="event" size="small" />
                        จัดการกิจกรรม
                    </button>
                </div>
            </div>
            
            <div className={styles.Content}>
                {stateEventDashboard.activeTab === 'stats' && (
                    <EventStatsPanel
                        isLoading={stateEventDashboard.isLoading}
                        stats={stateEventDashboard.stats}
                        onRefresh={handlers.handleRefreshStats}
                        theme="events"
                    />
                )}
                
                {stateEventDashboard.activeTab === 'events' && (
                    <EventManagementPanel
                        events={stateEventDashboard.events}
                        isLoading={stateEventDashboard.isLoading}
                        selectedEvent={stateEventDashboard.selectedEvent}
                        showEventModal={stateEventDashboard.showEventModal}
                        showDeleteConfirm={stateEventDashboard.showDeleteConfirm}
                        eventModalMode={stateEventDashboard.eventModalMode}
                        isSubmittingEvent={stateEventDashboard.isSubmittingEvent}
                        onCreateEvent={handlers.handleCreateEvent}
                        onEditEvent={handlers.handleEditEvent}
                        onDeleteEvent={handlers.handleDeleteEvent}
                        onConfirmDelete={handlers.handleConfirmDelete}
                        onCancelDelete={handlers.handleCancelDelete}
                        onCloseModal={handlers.handleCloseEventModal}
                        onEventSaved={handlers.handleEventSaved}
                        onRefresh={handlers.handleRefreshEvents}
                        theme="events"
                    />
                )}
            </div>
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="events"
            />
        </div>
    );
}