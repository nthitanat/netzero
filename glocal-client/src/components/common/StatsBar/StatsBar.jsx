import React from 'react';
import styles from './StatsBar.module.scss';

/**
 * Generic horizontal stats bar — a row of icon+value+label cards.
 *
 * Props:
 *  - stats  {Array<{ icon: string, value: string, label: string }>}
 */
const StatsBar = ({ stats = [], palette }) => {
  const paletteVars = palette ? {
    '--pal-p1': palette.p1, '--pal-p2': palette.p2,
    '--pal-p3': palette.p3, '--pal-p4': palette.p4,
  } : {};
  return (
  <section className={styles.statsContainer} style={paletteVars}>
    <div className={styles.statsWrapper}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <span className="material-symbols-outlined">{stat.icon}</span>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
  );
};
export default StatsBar;
