import React, { useState, useRef } from 'react';
import styles from './CollapsibleCatalog.module.scss';

/**
 * CollapsibleCatalog
 *
 * Props:
 *   title      — header label (string or node)
 *   titleIcon  — material symbol name shown before the title
 *   defaultOpen — whether the panel starts expanded (default: true)
 *   children   — content rendered inside the collapsible body
 */
const CollapsibleCatalog = ({ title, titleIcon, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bodyRef = useRef(null);

  return (
    <div className={`${styles.CollapsibleCatalog} ${isOpen ? styles.open : styles.closed}`}>
      <button
        className={styles.Header}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <div className={styles.HeaderLeft}>
          {titleIcon && (
            <span className={`material-symbols-outlined ${styles.TitleIcon}`}>
              {titleIcon}
            </span>
          )}
          <span className={styles.Title}>{title}</span>
        </div>

        <div className={styles.HeaderRight}>
          <span className={styles.CollapseHint}>
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          <span className={`material-symbols-outlined ${styles.Chevron}`}>
            {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          </span>
        </div>
      </button>

      <div
        ref={bodyRef}
        className={styles.Body}
        style={{ maxHeight: isOpen ? bodyRef.current?.scrollHeight + 'px' || '1000px' : '0px' }}
      >
        <div className={styles.BodyInner}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleCatalog;
