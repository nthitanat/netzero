import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './CurriculumAccordion.module.scss';

const CurriculumAccordion = ({ curriculum, enrolled = false }) => {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState([]);

  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  const toggleSection = (sectionId) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return 'play_circle';
      case 'reading':
        return 'article';
      case 'quiz':
        return 'quiz';
      default:
        return 'description';
    }
  };

  if (!curriculum || curriculum.length === 0) {
    return null;
  }

  return (
    <div className={styles.curriculum}>
      {curriculum.map((section) => {
        const isExpanded = expandedSections.includes(section.sectionId);
        const lessonCount = section.lessons?.length || 0;

        return (
          <div key={section.sectionId} className={styles.section}>
            <button
              className={styles.sectionHeader}
              onClick={() => toggleSection(section.sectionId)}
              aria-expanded={isExpanded}
            >
              <div className={styles.sectionInfo}>
                <h3 className={styles.sectionTitle}>
                  {language === 'th' ? 'บทที่' : 'Section'} {section.sectionId}: {t(section.title)}
                </h3>
                <div className={styles.sectionMeta}>
                  <span className={styles.lessonCount}>
                    <span className="material-symbols-outlined">list</span>
                    {lessonCount} {language === 'th' ? 'บทเรียน' : 'lessons'}
                  </span>
                  <span className={styles.duration}>
                    <span className="material-symbols-outlined">schedule</span>
                    {section.duration}
                  </span>
                </div>
              </div>
              <span className={`material-symbols-outlined ${styles.expandIcon}`}>
                {isExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {isExpanded && section.lessons && (
              <div className={styles.lessonList}>
                {section.lessons.map((lesson) => {
                  const canAccess = enrolled || lesson.isPreview;
                  const isLocked = !canAccess;

                  return (
                    <div
                      key={lesson.lessonId}
                      className={`${styles.lesson} ${isLocked ? styles.locked : ''} ${canAccess ? styles.accessible : ''}`}
                    >
                      <div className={styles.lessonIcon}>
                        <span className="material-symbols-outlined">
                          {isLocked ? 'lock' : getLessonIcon(lesson.type)}
                        </span>
                      </div>
                      <div className={styles.lessonInfo}>
                        <h4 className={styles.lessonTitle}>{t(lesson.title)}</h4>
                        <div className={styles.lessonMeta}>
                          <span className={styles.lessonType}>
                            {lesson.type === 'video' && (language === 'th' ? 'วิดีโอ' : 'Video')}
                            {lesson.type === 'reading' && (language === 'th' ? 'อ่าน' : 'Reading')}
                            {lesson.type === 'quiz' && (language === 'th' ? 'แบบทดสอบ' : 'Quiz')}
                          </span>
                          <span className={styles.lessonDuration}>{lesson.duration}</span>
                          {lesson.isPreview && (
                            <span className={styles.previewBadge}>
                              {language === 'th' ? 'ตัวอย่าง' : 'Preview'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CurriculumAccordion;
