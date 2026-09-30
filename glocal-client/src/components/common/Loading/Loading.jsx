import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './Loading.module.scss';

export default function Loading({ text }) {
  const { language } = useLanguage();
  
  const defaultText = {
    th: 'กำลังโหลด...',
    en: 'Loading...'
  };

  return (
    <div className={styles.Loading}>
      <div className={styles.Spinner} />
      <p className={styles.Text}>
        {text || defaultText[language]}
      </p>
    </div>
  );
}
