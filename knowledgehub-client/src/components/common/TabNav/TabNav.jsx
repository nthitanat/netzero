import React from 'react';
import styles from './TabNav.module.scss';

/**
 * Generic tab navigation bar.
 *
 * Props:
 *  - tabs       {Array<{ key: string, icon: string, label: string }>}
 *  - activeTab  {string}  Currently active tab key
 *  - onChange   {(key: string) => void}
 */
const TabNav = ({ tabs = [], activeTab, onChange }) => (
  <div className={styles.tabNavigation}>
    {tabs.map((tab) => (
      <button
        key={tab.key}
        className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
        onClick={() => onChange(tab.key)}
      >
        <span className="material-symbols-outlined">{tab.icon}</span>
        {tab.label}
      </button>
    ))}
  </div>
);

export default TabNav;
