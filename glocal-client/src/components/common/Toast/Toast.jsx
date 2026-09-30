import React, { useState, useEffect, useRef } from 'react';
import styles from './Toast.module.scss';

const VARIANT_ICONS = {
  success: 'check_circle',
  error:   'error',
  warning: 'warning',
  info:    'info',
};

/**
 * Toast — MD3-style snackbar notification
 *
 * Props:
 *   isVisible  {boolean}   — mount/show the toast
 *   message    {string}    — text to display
 *   variant    {string}    — 'success' | 'error' | 'warning' | 'info'  (default: 'success')
 *   duration   {number}    — auto-dismiss after this many ms            (default: 4000)
 *   onDismiss  {function}  — called after the exit animation completes
 */
export default function Toast({
  isVisible,
  message,
  variant = 'success',
  duration = 4000,
  onDismiss,
}) {
  const [leaving, setLeaving] = useState(false);
  const dismissTimer = useRef(null);
  const leaveTimer   = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    setLeaving(false);

    // Auto-dismiss after `duration`
    dismissTimer.current = setTimeout(() => {
      triggerLeave();
    }, duration);

    return () => {
      clearTimeout(dismissTimer.current);
      clearTimeout(leaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, duration]);

  const triggerLeave = () => {
    clearTimeout(dismissTimer.current);
    setLeaving(true);
    // Wait for CSS exit animation before unmounting
    leaveTimer.current = setTimeout(() => {
      onDismiss?.();
    }, 320);
  };

  if (!isVisible) return null;

  const icon = VARIANT_ICONS[variant] ?? VARIANT_ICONS.success;

  return (
    <div
      className={`${styles.Toast} ${styles[variant]} ${leaving ? styles.leaving : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={`material-symbols-outlined ${styles.Icon}`}>{icon}</span>
      <span className={styles.Message}>{message}</span>
      <button
        className={styles.DismissBtn}
        type="button"
        onClick={triggerLeave}
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
