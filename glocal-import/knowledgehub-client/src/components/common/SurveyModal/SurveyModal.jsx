import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './SurveyModal.module.scss';

const SURVEY_URL = 'https://www.surveymonkey.com/r/GlocalCommunity';

const labels = {
  th: {
    title: 'กรอกแบบสอบถามเพื่อลงทะเบียน',
    description:
      'แบบสอบถามฉบับนี้มีวัตถุประสงค์เพื่อศึกษาความต้องการจำเป็นในการพัฒนาแพลตฟอร์มชุมชน Chula-Glocalized Community Market เพื่อสนับสนุนผู้ประกอบการชุมชน ผลิตภัณฑ์ท้องถิ่น การประกอบการเพื่อสังคม และการขยายโอกาสสู่ตลาดท้องถิ่นโลก กล่าวคือ จุฬา จะเป็นกลไกการผสมผสานระหว่างคำว่า Globalization (โลกาภิวัตน์) และ Localization (ท้องถิ่นนิยม) หมายถึง กลยุทธ์ที่แบรนด์หรือธุรกิจระดับโลก ปรับเปลี่ยนสินค้า บริการ และการตลาดของตนให้เข้ากับวัฒนธรรม ประเพณี และพฤติกรรมของผู้บริโภคในแต่ละท้องถิ่นได้อย่างกลมกลืน',
    acceptBtn: 'ยอมรับและไปต่อ',
    alreadyBtn: 'เคยกรอกแบบสอบถามแล้ว',
    surveyNote: 'กรอกแบบสอบถามให้ครบถ้วน ปุ่ม "เสร็จสิ้น" จะปรากฏเมื่อคุณส่งแบบสอบถามเรียบร้อยแล้ว',
    doneBtn: 'เสร็จสิ้น',
    closeBtn: 'ปิด',
  },
  en: {
    title: 'Complete Registration Survey',
    description:
      'This survey aims to study the needs for developing the Chula-Glocalized Community Market platform to support community entrepreneurs, local products, social enterprise, and expanding opportunities to the global-local market. Chulalongkorn University serves as a mechanism combining Globalization and Localization — a strategy in which global brands and businesses adapt their products, services, and marketing to harmoniously fit each local culture, tradition, and consumer behaviour.',
    acceptBtn: 'Accept & Continue',
    alreadyBtn: 'I already filled the survey',
    surveyNote: 'Complete the survey — the "Done" button will appear once you submit.',
    doneBtn: 'Done',
    closeBtn: 'Close',
  },
};

/**
 * SurveyModal
 *
 * Props:
 *   isOpen   {boolean}  — controls visibility
 *   onClose  {function} — called when the user dismisses the modal
 */
export default function SurveyModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const t = labels[language] ?? labels.th;

  // step: 'intro' | 'survey'
  const [step, setStep] = useState('intro');
  // true once we detect the survey has been submitted
  const [surveyDone, setSurveyDone] = useState(false);
  const iframeLoadCount = useRef(0);
  const iframeRef = useRef(null);

  // Reset state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setSurveyDone(false);
      iframeLoadCount.current = 0;
    }
  }, [isOpen]);

  // Listen for postMessage from SurveyMonkey (explicit completion signal only)
  const handleMessage = useCallback((e) => {
    if (!isOpen || step !== 'survey') return;
    const data = e.data;
    if (
      typeof data === 'object' && data !== null &&
      (data.type === 'survey-complete' || data.surveyCompleted === true)
    ) {
      setSurveyDone(true);
    }
  }, [isOpen, step]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Primary: check iframe URL for 'survey-thanks' (works if same-origin or accessible)
  // Fallback: load count threshold when URL is cross-origin and unreadable
  const handleIframeLoad = () => {
    iframeLoadCount.current += 1;

    try {
      const href = iframeRef.current?.contentWindow?.location?.href ?? '';
      if (href && href.includes('survey-thanks')) {
        setSurveyDone(true);
        return;
      }
    } catch {
      // Cross-origin — cannot read iframe URL, rely on load count below
    }

    if (iframeLoadCount.current >= 4) {
      setSurveyDone(true);
    }
  };

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.Overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="survey-modal-title"
    >
      <div className={styles.Modal}>

        {/* ── Intro Step ── */}
        {step === 'intro' && (
          <div className={styles.Intro}>
            <button
              className={styles.IntroCloseBtn}
              type="button"
              onClick={onClose}
              aria-label={t.closeBtn}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <span className={`material-symbols-outlined ${styles.IntroIcon}`}>
              assignment
            </span>
            <h2 id="survey-modal-title" className={styles.Title}>
              {t.title}
            </h2>
            <p className={styles.Description}>{t.description}</p>
            <div className={styles.Actions}>
              <button
                className={styles.AcceptBtn}
                type="button"
                onClick={() => {
                  setSurveyDone(false);
                  iframeLoadCount.current = 0;
                  setStep('survey');
                }}
              >
                <span className="material-symbols-outlined">check_circle</span>
                {t.acceptBtn}
              </button>
              <button
                className={styles.AlreadyBtn}
                type="button"
                onClick={onClose}
              >
                {t.alreadyBtn}
              </button>
            </div>
          </div>
        )}

        {/* ── Survey Step ── */}
        {step === 'survey' && (
          <div className={styles.SurveyWrapper}>
            <div className={styles.SurveyHeader}>
              <p className={styles.SurveyNote}>
                <span className={`material-symbols-outlined ${styles.NoteIcon}`}>
                  info
                </span>
                {t.surveyNote}
              </p>
              <div className={styles.SurveyActions}>
                {surveyDone && (
                  <button
                    className={styles.DoneBtn}
                    type="button"
                    onClick={onClose}
                    aria-label={t.doneBtn}
                  >
                    <span className="material-symbols-outlined">check</span>
                    {t.doneBtn}
                  </button>
                )}
                <button
                  className={styles.SurveyCloseBtn}
                  type="button"
                  onClick={onClose}
                  aria-label={t.closeBtn}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              className={styles.SurveyFrame}
              src={SURVEY_URL}
              title="Registration Survey"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          </div>
        )}

      </div>
    </div>
  );
}
