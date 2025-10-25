import React from "react";
import styles from "./EventModal.module.scss";
import useEventModal from "./useEventModal";
import EventModalHandler from "./EventModalHandler";
import { GoogleIcon } from "../../common";

export default function EventModal({
  isOpen = false,
  mode = 'create', // 'create' or 'edit'
  event = null,
  isLoading = false,
  onClose,
  onSave,
  theme = "events"
}) {
  const { stateEventModal, setEventModal } = useEventModal({ mode, event });
  const handlers = EventModalHandler(stateEventModal, setEventModal, { onClose, onSave });

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่';

  return (
    <div className={styles.Modal}>
      <div className={styles.ModalContent}>
        <div className={styles.ModalHeader}>
          <h2 className={styles.Title}>{title}</h2>
          <button
            className={styles.CloseButton}
            onClick={handlers.handleClose}
            disabled={isLoading}
          >
            <GoogleIcon iconType="close" size="medium" />
          </button>
        </div>

        <form className={styles.Form} onSubmit={handlers.handleSubmit}>
          <div className={styles.FormGroup}>
            <label className={styles.Label}>
              ชื่อกิจกรรม *
            </label>
            <input
              type="text"
              className={styles.Input}
              value={stateEventModal.formData.title}
              onChange={(e) => handlers.handleFieldChange('title', e.target.value)}
              placeholder="ระบุชื่อกิจกรรม"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.FormGroup}>
            <label className={styles.Label}>
              รายละเอียดกิจกรรม
            </label>
            <textarea
              className={styles.TextArea}
              value={stateEventModal.formData.description}
              onChange={(e) => handlers.handleFieldChange('description', e.target.value)}
              placeholder="อธิบายรายละเอียดกิจกรรม"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className={styles.FormRow}>
            <div className={styles.FormGroup}>
              <label className={styles.Label}>
                วันที่และเวลา *
              </label>
              <input
                type="datetime-local"
                className={styles.Input}
                value={stateEventModal.formData.event_date}
                onChange={(e) => handlers.handleFieldChange('event_date', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.FormGroup}>
              <label className={styles.Label}>
                จำนวนผู้เข้าร่วมสูงสุด
              </label>
              <input
                type="number"
                className={styles.Input}
                value={stateEventModal.formData.max_participants}
                onChange={(e) => handlers.handleFieldChange('max_participants', parseInt(e.target.value) || 0)}
                placeholder="0 = ไม่จำกัด"
                min="0"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.FormGroup}>
            <label className={styles.Label}>
              สถานที่จัดงาน
            </label>
            <input
              type="text"
              className={styles.Input}
              value={stateEventModal.formData.location}
              onChange={(e) => handlers.handleFieldChange('location', e.target.value)}
              placeholder="ระบุสถานที่จัดงาน"
              disabled={isLoading}
            />
          </div>

          <div className={styles.FormRow}>
            <div className={styles.FormGroup}>
              <label className={styles.Label}>
                หมวดหมู่กิจกรรม
              </label>
              <select
                className={styles.Select}
                value={stateEventModal.formData.category}
                onChange={(e) => handlers.handleFieldChange('category', e.target.value)}
                disabled={isLoading}
              >
                <option value="">เลือกหมวดหมู่</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">สัมมนา</option>
                <option value="training">อบรม</option>
                <option value="meeting">ประชุม</option>
                <option value="social">กิจกรรมสังคม</option>
                <option value="volunteer">อาสาสมัคร</option>
                <option value="environment">สิ่งแวดล้อม</option>
                <option value="community">ชุมชน</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>

            <div className={styles.FormGroup}>
              <label className={styles.Label}>
                สถานะกิจกรรม
              </label>
              <select
                className={styles.Select}
                value={stateEventModal.formData.status}
                onChange={(e) => handlers.handleFieldChange('status', e.target.value)}
                disabled={isLoading}
              >
                <option value="active">เปิดรับสมัคร</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>

          <div className={styles.FormGroup}>
            <label className={styles.Label}>
              กำหนดปิดรับสมัคร
            </label>
            <input
              type="datetime-local"
              className={styles.Input}
              value={stateEventModal.formData.registration_deadline}
              onChange={(e) => handlers.handleFieldChange('registration_deadline', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.FormRow}>
            <div className={styles.FormGroup}>
              <label className={styles.Label}>
                ผู้จัดงาน
              </label>
              <input
                type="text"
                className={styles.Input}
                value={stateEventModal.formData.organizer}
                onChange={(e) => handlers.handleFieldChange('organizer', e.target.value)}
                placeholder="ชื่อผู้จัดงาน หรือ องค์กร"
                disabled={isLoading}
              />
            </div>

            <div className={styles.FormGroup}>
              <label className={styles.Label}>
                อีเมลติดต่อ
              </label>
              <input
                type="email"
                className={styles.Input}
                value={stateEventModal.formData.contact_email}
                onChange={(e) => handlers.handleFieldChange('contact_email', e.target.value)}
                placeholder="email@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.FormGroup}>
            <label className={styles.Label}>
              เบอร์โทรติดต่อ
            </label>
            <input
              type="tel"
              className={styles.Input}
              value={stateEventModal.formData.contact_phone}
              onChange={(e) => handlers.handleFieldChange('contact_phone', e.target.value)}
              placeholder="xxx-xxx-xxxx"
              disabled={isLoading}
            />
          </div>

          <div className={styles.FormGroup}>
            <label className={styles.CheckboxLabel}>
              <input
                type="checkbox"
                className={styles.Checkbox}
                checked={stateEventModal.formData.isRecommended}
                onChange={(e) => handlers.handleFieldChange('isRecommended', e.target.checked)}
                disabled={isLoading}
              />
              <span className={styles.CheckboxText}>
                แนะนำกิจกรรมนี้ (จะแสดงในหน้าแนะนำ)
              </span>
            </label>
          </div>

          {stateEventModal.error && (
            <div className={styles.ErrorMessage}>
              <GoogleIcon iconType="error" size="small" />
              {stateEventModal.error}
            </div>
          )}

          <div className={styles.FormActions}>
            <button
              type="button"
              className={styles.CancelButton}
              onClick={handlers.handleClose}
              disabled={isLoading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={styles.SubmitButton}
              disabled={isLoading || !handlers.isFormValid()}
            >
              {isLoading ? (
                <>
                  <GoogleIcon iconType="hourglass_empty" size="small" />
                  {isEditMode ? 'กำลังแก้ไข...' : 'กำลังสร้าง...'}
                </>
              ) : (
                <>
                  <GoogleIcon iconType={isEditMode ? "edit" : "add"} size="small" />
                  {isEditMode ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}