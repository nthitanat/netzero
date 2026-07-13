import React from 'react';
import styles from './InfoCard.module.scss';

/**
 * Generic sidebar info card — a titled list of icon+label+value rows.
 *
 * Props:
 *  - title  {string}
 *  - items  {Array<{ icon: string, label: string, value: string }>}
 */
const InfoCard = ({ title, items = [], palette }) => {
  const paletteVars = palette ? {
    '--pal-p1': palette.p1, '--pal-p2': palette.p2,
    '--pal-p3': palette.p3, '--pal-p4': palette.p4,
  } : {};
  return (
  <div className={styles.infoCard} style={paletteVars}>
    <h4 className={styles.infoTitle}>{title}</h4>
    {items.map((item, index) => (
      <div key={index} className={styles.infoItem}>
        <span className="material-symbols-outlined">{item.icon}</span>
        <div>
          <div className={styles.infoLabel}>{item.label}</div>
          <div className={styles.infoValue}>{item.value}</div>
        </div>
      </div>
    ))}
  </div>
  );
};
export default InfoCard;
