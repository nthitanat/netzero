import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LinkedListCard.module.scss';

/**
 * Generic sidebar card — a titled list of linked rows with icon + primary + secondary text.
 *
 * Props:
 *  - title      {string}
 *  - titleIcon  {string}  Material symbol icon name shown next to the title
 *  - items      {Array<{
 *                 to:        string,  React Router path
 *                 icon:      string,  Material symbol icon name
 *                 primary:   string,  Main text
 *                 secondary: string   Sub text (e.g. duration, meta)
 *               }>}
 */
const LinkedListCard = ({ title, titleIcon, items = [], palette }) => {
  const paletteVars = palette ? {
    '--pal-p1': palette.p1, '--pal-p2': palette.p2,
    '--pal-p3': palette.p3, '--pal-p4': palette.p4,
  } : {};
  return (
  <div className={styles.card} style={paletteVars}>
    <h4 className={styles.cardTitle}>
      <span className="material-symbols-outlined">{titleIcon}</span>
      {title}
    </h4>
    {items.map((item, index) => (
      <Link key={index} to={item.to} className={styles.listItem}>
        <div className={styles.itemIcon}>
          <span className="material-symbols-outlined">{item.icon}</span>
        </div>
        <div className={styles.itemText}>
          <div className={styles.itemPrimary}>{item.primary}</div>
          <div className={styles.itemSecondary}>{item.secondary}</div>
        </div>
      </Link>
    ))}
  </div>
  );
};

export default LinkedListCard;
