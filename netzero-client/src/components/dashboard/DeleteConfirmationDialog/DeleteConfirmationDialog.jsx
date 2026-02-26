import React from "react";
import styles from "./DeleteConfirmationDialog.module.scss";
import { GoogleIcon } from "../../common";

export default function DeleteConfirmationDialog({
  isOpen = false,
  title = "ยืนยันการลบ",
  message = "คุณต้องการลบรายการนี้หรือไม่?",
  itemName = "",
  warningText = "การดำเนินการนี้ไม่สามารถย้อนกลับได้",
  confirmText = "ลบ",
  cancelText = "ยกเลิก",
  isLoading = false,
  onConfirm,
  onCancel,
  theme = "default"
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel?.();
    }
  };

  return (
    <div className={styles.Container} onClick={handleOverlayClick}>
      <div className={styles.Overlay} />
      <div className={`${styles.Dialog} ${styles[`${theme}-theme`]}`}>
        <div className={styles.Header}>
          <div className={styles.IconWrapper}>
            <GoogleIcon iconType="warning" size="medium" className={styles.WarningIcon} />
          </div>
          <h3 className={styles.Title}>{title}</h3>
        </div>
        
        <div className={styles.Content}>
          <p className={styles.Message}>{message}</p>
          {itemName && (
            <p className={styles.ItemName}>"{itemName}"</p>
          )}
          {warningText && (
            <p className={styles.WarningText}>
              <GoogleIcon iconType="info" size="small" />
              {warningText}
            </p>
          )}
        </div>
        
        <div className={styles.Actions}>
          <button 
            className={styles.CancelButton}
            onClick={onCancel}
            disabled={isLoading}
            type="button"
          >
            {cancelText}
          </button>
          <button 
            className={styles.ConfirmButton}
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <div className={styles.LoadingSpinner} />
                กำลังดำเนินการ...
              </>
            ) : (
              <>
                <GoogleIcon iconType="delete" size="small" />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
