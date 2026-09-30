import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './Timeline.module.scss';

const Timeline = ({ items }) => {
  const { language } = useLanguage();
  
  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={styles.timeline}>
      {items.map((item, index) => (
        <div 
          key={index} 
          className={`${styles.timelineItem} ${index % 2 === 0 ? styles.left : styles.right}`}
        >
          <div className={styles.timelineContent}>
            <div className={styles.year}>{item.year}</div>
            <div className={styles.card}>
              {item.image && (
                <div className={styles.imageWrapper}>
                  <img src={item.image} alt={t(item.title)} />
                </div>
              )}
              <div className={styles.textContent}>
                <h3 className={styles.title}>{t(item.title)}</h3>
                <p className={styles.description}>{t(item.description)}</p>
              </div>
            </div>
          </div>
          <div className={styles.marker}>
            <span className="material-symbols-outlined">circle</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
