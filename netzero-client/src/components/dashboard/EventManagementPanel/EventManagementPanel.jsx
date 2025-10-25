import React from "react";
import styles from "./EventManagementPanel.module.scss";
import useEventManagementPanel from "./useEventManagementPanel";
import EventManagementPanelHandler from "./EventManagementPanelHandler";
import { GoogleIcon } from "../../common";
import { EventModal } from "../";

export default function EventManagementPanel({
  events = [],
  isLoading = false,
  selectedEvent = null,
  showEventModal = false,
  showDeleteConfirm = false,
  eventModalMode = 'create',
  isSubmittingEvent = false,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onConfirmDelete,
  onCancelDelete,
  onCloseModal,
  onEventSaved,
  onRefresh,
  theme = "events"
}) {
  const { stateEventManagementPanel, setEventManagementPanel } = useEventManagementPanel({
    events,
    isLoading
  });
  
  const handlers = EventManagementPanelHandler(
    stateEventManagementPanel,
    setEventManagementPanel,
    {
      onCreateEvent,
      onEditEvent,
      onDeleteEvent,
      onRefresh
    }
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'เปิดรับสมัคร', class: 'Active' },
      completed: { text: 'เสร็จสิ้น', class: 'Completed' },
      cancelled: { text: 'ยกเลิก', class: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'Default' };
    return (
      <span className={`${styles.StatusBadge} ${styles[config.class]}`}>
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.Container}>
        <div className={styles.LoadingContainer}>
          <GoogleIcon iconType="hourglass_empty" size="large" className={styles.LoadingIcon} />
          <p>กำลังโหลดข้อมูลกิจกรรม...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <div className={styles.Header}>
        <div className={styles.HeaderLeft}>
          <h3 className={styles.Title}>กิจกรรมของฉัน</h3>
          <p className={styles.Subtitle}>
            ทั้งหมด {events.length} กิจกรรม
          </p>
        </div>
        <div className={styles.HeaderActions}>
          <button
            className={styles.RefreshButton}
            onClick={onRefresh}
            disabled={isLoading}
          >
            <GoogleIcon iconType="refresh" size="small" />
            อัพเดท
          </button>
          <button
            className={styles.CreateButton}
            onClick={onCreateEvent}
          >
            <GoogleIcon iconType="add" size="small" />
            สร้างกิจกรรม
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className={styles.EmptyState}>
          <GoogleIcon iconType="event_busy" size="large" className={styles.EmptyIcon} />
          <h4>ยังไม่มีกิจกรรม</h4>
          <p>คลิก "สร้างกิจกรรม" เพื่อเริ่มต้นสร้างกิจกรรมแรก</p>
          <button
            className={styles.EmptyCreateButton}
            onClick={onCreateEvent}
          >
            <GoogleIcon iconType="add" size="small" />
            สร้างกิจกรรมแรก
          </button>
        </div>
      ) : (
        <div className={styles.EventsList}>
          {events.map((event) => (
            <div key={event.id} className={styles.EventCard}>
              <div className={styles.EventHeader}>
                <div className={styles.EventHeaderLeft}>
                  <h4 className={styles.EventTitle}>{event.title}</h4>
                  {getStatusBadge(event.status)}
                </div>
                <div className={styles.EventActions}>
                  <button
                    className={styles.ActionButton}
                    onClick={() => onEditEvent(event)}
                    title="แก้ไขกิจกรรม"
                  >
                    <GoogleIcon iconType="edit" size="small" />
                  </button>
                  <button
                    className={styles.ActionButton}
                    onClick={() => onDeleteEvent(event)}
                    title="ลบกิจกรรม"
                  >
                    <GoogleIcon iconType="delete" size="small" />
                  </button>
                </div>
              </div>
              
              <div className={styles.EventDetails}>
                <div className={styles.EventMeta}>
                  <div className={styles.MetaItem}>
                    <GoogleIcon iconType="schedule" size="small" />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className={styles.MetaItem}>
                    <GoogleIcon iconType="location_on" size="small" />
                    <span>{event.location || 'ไม่ระบุสถานที่'}</span>
                  </div>
                  <div className={styles.MetaItem}>
                    <GoogleIcon iconType="group" size="small" />
                    <span>
                      {event.current_participants || 0}
                      {event.max_participants ? ` / ${event.max_participants}` : ''} คน
                    </span>
                  </div>
                </div>
                
                {event.description && (
                  <p className={styles.EventDescription}>
                    {event.description.length > 150 
                      ? `${event.description.substring(0, 150)}...` 
                      : event.description}
                  </p>
                )}
                
                <div className={styles.EventFooter}>
                  <span className={styles.Category}>
                    {event.category || 'ไม่มีหมวดหมู่'}
                  </span>
                  <span className={styles.CreatedDate}>
                    สร้างเมื่อ {new Date(event.created_at).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          mode={eventModalMode}
          event={selectedEvent}
          isLoading={isSubmittingEvent}
          onClose={onCloseModal}
          onSave={onEventSaved}
          theme={theme}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.Modal}>
          <div className={styles.ModalContent}>
            <div className={styles.ModalHeader}>
              <GoogleIcon iconType="warning" size="medium" className={styles.WarningIcon} />
              <h3>ยืนยันการลบกิจกรรม</h3>
            </div>
            
            <div className={styles.ModalBody}>
              <p>คุณแน่ใจหรือไม่ที่จะลบกิจกรรม</p>
              <strong>"{selectedEvent?.title}"</strong>
              <p className={styles.WarningText}>
                การกระทำนี้ไม่สามารถยกเลิกได้ และข้อมูลกิจกรรมจะถูกลบอย่างถาวร
              </p>
            </div>
            
            <div className={styles.ModalFooter}>
              <button
                className={styles.CancelButton}
                onClick={onCancelDelete}
                disabled={isSubmittingEvent}
              >
                ยกเลิก
              </button>
              <button
                className={styles.DeleteButton}
                onClick={onConfirmDelete}
                disabled={isSubmittingEvent}
              >
                {isSubmittingEvent ? (
                  <>
                    <GoogleIcon iconType="hourglass_empty" size="small" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <GoogleIcon iconType="delete" size="small" />
                    ลบกิจกรรม
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}