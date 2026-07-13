import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './EnrollmentCard.module.scss';

const EnrollmentCard = ({ course }) => {
  const { language } = useLanguage();
  const [enrolled, setEnrolled] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  const handleEnroll = () => {
    setEnrolled(true);
    // In a real app, this would make an API call
  };

  const toggleWishlist = () => {
    setWishlisted(!wishlisted);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t(course.title),
        text: t(course.description),
        url: window.location.href,
      });
    }
  };

  const isFree = course.price?.amount === 0;
  const currentEnrollment = course.studentsEnrolled || 0;
  const maxStudents = course.maxStudents || 0;
  const spotsLeft = maxStudents - currentEnrollment;

  return (
    <div className={styles.enrollmentCard}>
      {/* Price */}
      <div className={styles.priceSection}>
        {isFree ? (
          <div className={styles.freeTag}>
            {language === 'th' ? 'ฟรี' : 'Free'}
          </div>
        ) : (
          <div className={styles.price}>
            ฿{course.price?.amount?.toLocaleString()}
            <span className={styles.currency}> {course.price?.currency}</span>
          </div>
        )}
      </div>

      {/* Enroll Button */}
      <button
        className={`${styles.enrollButton} ${enrolled ? styles.enrolled : ''}`}
        onClick={handleEnroll}
        disabled={enrolled}
      >
        <span className="material-symbols-outlined">
          {enrolled ? 'check_circle' : 'play_lesson'}
        </span>
        {enrolled
          ? (language === 'th' ? 'ลงทะเบียนแล้ว' : 'Enrolled')
          : (language === 'th' ? 'ลงทะเบียนเรียน' : 'Enroll Now')
        }
      </button>

      {/* Course Details */}
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span className="material-symbols-outlined">schedule</span>
          <span>
            {course.duration?.hours} {language === 'th' ? 'ชั่วโมง' : 'hours'} 
            ({course.duration?.sessions} {language === 'th' ? 'เซสชั่น' : 'sessions'})
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className="material-symbols-outlined">signal_cellular_alt</span>
          <span>
            {course.level === 'beginner' && (language === 'th' ? 'ระดับเริ่มต้น' : 'Beginner')}
            {course.level === 'intermediate' && (language === 'th' ? 'ระดับกลาง' : 'Intermediate')}
            {course.level === 'advanced' && (language === 'th' ? 'ระดับสูง' : 'Advanced')}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className="material-symbols-outlined">translate</span>
          <span>
            {course.language?.map(lang => lang.toUpperCase()).join(', ')}
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className="material-symbols-outlined">group</span>
          <span>
            {currentEnrollment}/{maxStudents} {language === 'th' ? 'นักเรียน' : 'students'}
            {spotsLeft > 0 && spotsLeft <= 10 && (
              <span className={styles.warning}>
                ({spotsLeft} {language === 'th' ? 'ที่ว่างเหลือ' : 'spots left'})
              </span>
            )}
          </span>
        </div>

        {course.certificate && (
          <div className={styles.detailItem}>
            <span className="material-symbols-outlined">workspace_premium</span>
            <span>{language === 'th' ? 'ได้รับใบประกาศนียบัตร' : 'Certificate Included'}</span>
          </div>
        )}

        {course.deadline && (
          <div className={styles.detailItem}>
            <span className="material-symbols-outlined">event</span>
            <span>
              {language === 'th' ? 'สิ้นสุด' : 'Deadline'}: {new Date(course.deadline).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
            </span>
          </div>
        )}
      </div>

      {/* What You'll Learn */}
      {course.learningObjectives && course.learningObjectives.length > 0 && (
        <div className={styles.objectives}>
          <h3 className={styles.objectivesTitle}>
            {language === 'th' ? 'สิ่งที่คุณจะได้เรียนรู้' : "What You'll Learn"}
          </h3>
          <ul className={styles.objectivesList}>
            {course.learningObjectives.slice(0, 5).map((objective, index) => (
              <li key={index}>
                <span className="material-symbols-outlined">check</span>
                <span>{t(objective)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.wishlistButton} onClick={toggleWishlist}>
          <span className="material-symbols-outlined">
            {wishlisted ? 'bookmark' : 'bookmark_border'}
          </span>
          {language === 'th' ? 'บันทึก' : 'Save'}
        </button>
        <button className={styles.shareButton} onClick={handleShare}>
          <span className="material-symbols-outlined">share</span>
          {language === 'th' ? 'แชร์' : 'Share'}
        </button>
      </div>
    </div>
  );
};

export default EnrollmentCard;
