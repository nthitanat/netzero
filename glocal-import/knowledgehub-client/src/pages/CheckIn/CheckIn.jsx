import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../../components/common/Loading/Loading';
import useCheckIn from './useCheckIn';
import CheckInHandler from './CheckInHandler';
import styles from './CheckIn.module.scss';

const COMMUNITY_SLUG = 'chula-glocalized-market-community';
const COVER_IMAGE = `images/landing/glocal.png`;

const content = {
  heroBadge: {
    th: 'ศูนย์กลางความรู้ตลาดท้องถิ่นโลก',
    en: 'Chula-Glocalized Market Community',
  },
  heroTitle: {
    th: 'Chula-Glocalized Market',
    en: 'Chula-Glocalized Market',
  },
  heroSubtitle: {
    th: 'เชื่อมภูมิปัญญาท้องถิ่นสู่เวทีโลก ผ่านความรู้ เครือข่าย และนวัตกรรม โดยจุฬาลงกรณ์มหาวิทยาลัย',
    en: 'Connecting local wisdom to the global stage through knowledge, networks, and innovation, by Chulalongkorn University',
  },
  metaDate: { th: '3–4 สิงหาคม 2569', en: '3–4 August 2026' },
  metaOrganizer: { th: 'จุฬาลงกรณ์มหาวิทยาลัย', en: 'Chulalongkorn University' },
  metaType: { th: 'อบรมเชิงปฏิบัติการ', en: 'Workshop' },
  formTitle: { th: 'เช็คอิน', en: 'Check-In' },
  subtitle: {
    th: 'กรอกอีเมลที่ใช้ลงทะเบียน เพื่อเช็คอินเข้าร่วมงาน',
    en: 'Enter the email you registered with to check in for the Chula-Glocalized Market.',
  },
  emailLabel: { th: 'อีเมล', en: 'Email' },
  emailPlaceholder: { th: 'name@example.com', en: 'name@example.com' },
  submitBtn: { th: 'ตรวจสอบ', en: 'Verify' },
  loadingText: { th: 'กำลังตรวจสอบ...', en: 'Verifying...' },
  completedTitle: { th: 'เช็คอินสำเร็จ!', en: 'You\u2019re Checked In!' },
  completedText: {
    th: 'คุณได้ทำแบบสอบถามสำหรับ Chula-Glocalized Market เรียบร้อยแล้ว ขอบคุณที่เป็นส่วนหนึ่งของ Chula-Glocalized Market Community',
    en: 'You have already completed the survey for the Chula-Glocalized Market. Thank you for being part of the Chula-Glocalized Market Community!',
  },
  notCompletedTitle: { th: 'ยังไม่ได้ทำแบบสอบถาม', en: 'Survey Not Completed Yet' },
  notCompletedText: {
    th: 'กรุณากดปุ่มด้านล่างเพื่อทำแบบสอบถามให้เสร็จสิ้นก่อนเข้าร่วม Chula-Glocalized Market',
    en: 'Please click the button below to complete the survey before joining the Chula-Glocalized Market.',
  },
  redirectBtn: { th: 'ไปทำแบบสอบถาม', en: 'Go to Survey' },
  tryAgainBtn: { th: 'ตรวจสอบอีเมลอื่น', en: 'Check Another Email' },
  viewCommunityBtn: { th: 'ไปที่หน้าชุมชน', en: 'Go to Community Page' },
  learnMore: {
    th: 'ดูรายละเอียดชุมชนตลาดท้องถิ่นโลกเพิ่มเติม',
    en: 'Learn more about the Glocalized Market Community',
  },
  errors: {
    invalidEmail: {
      th: 'กรุณากรอกอีเมลให้ถูกต้อง',
      en: 'Please enter a valid email address',
    },
    genericError: {
      th: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      en: 'Something went wrong. Please try again.',
    },
  },
};

export default function CheckIn() {
  const { t } = useLanguage();
  const { stateCheckIn, setCheckIn } = useCheckIn();
  const handlers = CheckInHandler(stateCheckIn, setCheckIn);

  const errorMessage = stateCheckIn.error
    ? t(content.errors[stateCheckIn.error] || content.errors.genericError)
    : null;

  const metaChips = [
    { icon: 'event', text: t(content.metaDate) },
    { icon: 'school', text: t(content.metaOrganizer) },
    { icon: 'groups', text: t(content.metaType) },
  ];

  return (
    <div className={styles.CheckIn}>

      {/* ── Community Hero Banner ── */}
      <section className={styles.Hero}>
        <img
          src={COVER_IMAGE}
          alt={t(content.heroBadge)}
          className={styles.HeroImage}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className={styles.HeroOverlay} aria-hidden="true" />
        <div className={styles.HeroContent}>
          <span className={styles.HeroBadge}>
            <span className="material-symbols-outlined">auto_awesome</span>
            {t(content.heroBadge)}
          </span>
          <h1 className={styles.HeroTitle}>{t(content.heroTitle)}</h1>
          <p className={styles.HeroSubtitle}>{t(content.heroSubtitle)}</p>
        
        </div>
      </section>

      {/* ── Check-In Card ── */}
      <div className={styles.Container}>
        <div className={styles.Card}>

          {/* ── Idle / Error: email form ── */}
          {(stateCheckIn.status === 'idle' || stateCheckIn.status === 'error') && (
            <>
              <span className={`material-symbols-outlined ${styles.HeaderIcon}`}>
                how_to_reg
              </span>
              <h2 className={styles.Title}>{t(content.formTitle)}</h2>
              <p className={styles.Subtitle}>{t(content.subtitle)}</p>

              <form className={styles.Form} onSubmit={handlers.handleVerify}>
                <label className={styles.Label} htmlFor="checkin-email">
                  {t(content.emailLabel)}
                </label>
                <input
                  id="checkin-email"
                  className={styles.Input}
                  type="email"
                  value={stateCheckIn.email}
                  onChange={(e) => handlers.handleEmailChange(e.target.value)}
                  placeholder={t(content.emailPlaceholder)}
                  autoComplete="email"
                  required
                />
                {errorMessage && <p className={styles.ErrorText}>{errorMessage}</p>}
                <button type="submit" className={styles.SubmitBtn}>
                  <span className="material-symbols-outlined">search</span>
                  {t(content.submitBtn)}
                </button>
              </form>
            </>
          )}

          {/* ── Loading ── */}
          {stateCheckIn.status === 'loading' && (
            <Loading text={t(content.loadingText)} />
          )}

          {/* ── Completed ── */}
          {stateCheckIn.status === 'completed' && (
            <div className={styles.Result}>
              <span className={`material-symbols-outlined ${styles.ResultIconSuccess}`}>
                check_circle
              </span>
              <h2 className={styles.ResultTitle}>{t(content.completedTitle)}</h2>
              <p className={styles.ResultText}>{t(content.completedText)}</p>
              <Link to={`/communities/${COMMUNITY_SLUG}`} className={styles.SubmitBtn}>
                <span className="material-symbols-outlined">arrow_forward</span>
                {t(content.viewCommunityBtn)}
              </Link>
            </div>
          )}

          {/* ── Not Completed ── */}
          {stateCheckIn.status === 'not_completed' && (
            <div className={styles.Result}>
              <span className={`material-symbols-outlined ${styles.ResultIconWarning}`}>
                assignment_late
              </span>
              <h2 className={styles.ResultTitle}>{t(content.notCompletedTitle)}</h2>
              <p className={styles.ResultText}>{t(content.notCompletedText)}</p>
              <button type="button" className={styles.SubmitBtn} onClick={handlers.handleRedirect}>
                <span className="material-symbols-outlined">open_in_new</span>
                {t(content.redirectBtn)}
              </button>
              <button type="button" className={styles.OutlinedBtn} onClick={handlers.handleTryAgain}>
                {t(content.tryAgainBtn)}
              </button>
            </div>
          )}

        </div>

        <Link to={`/communities/${COMMUNITY_SLUG}`} className={styles.LearnMoreLink}>
          <span className="material-symbols-outlined">arrow_forward</span>
          {t(content.learnMore)}
        </Link>
      </div>
    </div>
  );
}
