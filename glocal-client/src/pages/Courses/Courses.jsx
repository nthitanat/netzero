import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getAllCourses } from '../../api/dataService';
import Loading from '../../components/common/Loading/Loading';
import CollapsibleCatalog from '../../components/common/CollapsibleCatalog/CollapsibleCatalog';
import { getYouTubeThumbnail } from '../../utils/youtube';
import { publicAssetUrl } from '../../utils/publicAssetUrl';
import styles from './Courses.module.scss';

export default function Courses() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const sliderRef = useRef(null);

  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllCourses();
        const list = response.data.courses;
        setCourses(list);
        const featured = list.find(c => c.featured) || list[0];
        if (featured) setActiveCourseId(featured.id);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const activeCourse = courses.find(c => c.id === activeCourseId);

  const levelLabel = (level) => {
    const map = { beginner: { th: 'เริ่มต้น', en: 'Beginner' }, intermediate: { th: 'ปานกลาง', en: 'Intermediate' }, advanced: { th: 'ขั้นสูง', en: 'Advanced' } };
    return t(map[level] || { th: level, en: level });
  };

  const thumbnailFor = (course, fallback) => {
    if (course.format === 'mini') {
      return getYouTubeThumbnail(course.video?.url) || fallback;
    }
    return course.thumbnail ? publicAssetUrl(course.thumbnail) : fallback;
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.Courses}>
      {/* ── Catalog ── */}
      <div className={styles.CatalogSection}>
        <div className={styles.Branding}>
          <img
            src={publicAssetUrl('images/branding/asem-lifelong-learning.png')}
            alt="ASEM Asia-Europe Meeting Lifelong Learning"
            className={styles.BrandLogo}
          />
        </div>
        <CollapsibleCatalog
          title={language === 'th' ? 'คอร์สทั้งหมด' : 'All Courses'}
          titleIcon="school"
        >
          <div className={styles.SliderWrapper}>
            <button
              className={`${styles.ArrowBtn} ${styles.ArrowLeft}`}
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className={styles.Slider} ref={sliderRef}>
              {courses.map((course) => (
                <button
                  key={course.id}
                  className={`${styles.CatalogCard} ${activeCourseId === course.id ? styles.active : ''}`}
                  onClick={() => setActiveCourseId(course.id)}
                >
                  <div className={styles.CardImageWrap}>
                    <img
                      src={thumbnailFor(course, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400')}
                      alt={t(course.title)}
                      className={styles.CardImage}
                    />
                    {activeCourseId === course.id && (
                      <div className={styles.ActiveBadge}>
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.CardInfo}>
                    <p className={styles.CardName}>
                      {course.format === 'mini' && (
                        <span className={styles.MiniTag}>{language === 'th' ? 'มินิ' : 'Mini'}</span>
                      )}
                      {t(course.title)}
                    </p>
                    <div className={styles.CardMeta}>
                      <span className={styles.CardDuration}>
                        <span className="material-symbols-outlined">schedule</span>
                        {course.format === 'mini'
                          ? (course.video?.duration || '—')
                          : course.duration?.minutes
                            ? `${course.duration.minutes} ${language === 'th' ? 'นาที' : 'min'}`
                            : `${course.duration?.hours || '—'} ${language === 'th' ? 'ชม.' : 'hrs'}`}
                      </span>
                      <span className={styles.CardLevel}>{levelLabel(course.level)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              className={`${styles.ArrowBtn} ${styles.ArrowRight}`}
              onClick={() => scroll(1)}
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </CollapsibleCatalog>
      </div>

      {/* ── Featured Course ── */}
      {activeCourse && (
        <div className={styles.FeaturedSection}>
          <div className={styles.FeaturedInner}>
            {/* Hero */}
            <div className={styles.FeaturedHero}>
              <img
                src={thumbnailFor(activeCourse, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800')}
                alt={t(activeCourse.title)}
                className={styles.FeaturedImage}
              />
              <div className={styles.FeaturedOverlay}>
                <span className={styles.FeaturedTag}>
                  <span className="material-symbols-outlined">
                    {activeCourse.format === 'mini' ? 'play_circle' : 'local_library'}
                  </span>
                  {activeCourse.format === 'mini'
                    ? (language === 'th' ? 'บทเรียนสั้น' : 'Mini Lesson')
                    : (language === 'th' ? 'คอร์สแนะนำ' : 'Featured Course')}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className={styles.FeaturedBody}>
              <h2 className={styles.FeaturedTitle}>{t(activeCourse.title)}</h2>
              <p className={styles.FeaturedDesc}>{t(activeCourse.description)}</p>

              {/* Stats row */}
              <div className={styles.StatsRow}>
                <div className={styles.StatItem}>
                  <span className="material-symbols-outlined">schedule</span>
                  {activeCourse.format === 'mini'
                    ? <span>{activeCourse.video?.duration}</span>
                    : <span>{activeCourse.duration?.minutes
                      ? `${activeCourse.duration.minutes} ${language === 'th' ? 'นาที' : 'minutes'}`
                      : `${activeCourse.duration?.hours} ${language === 'th' ? 'ชั่วโมง' : 'hours'}`}</span>}
                </div>
                {activeCourse.format !== 'mini' && activeCourse.studentsEnrolled != null && (
                  <div className={styles.StatItem}>
                    <span className="material-symbols-outlined">group</span>
                    <span>{activeCourse.studentsEnrolled?.toLocaleString()} {language === 'th' ? 'ผู้เรียน' : 'students'}</span>
                  </div>
                )}
                <div className={styles.StatItem}>
                  <span className="material-symbols-outlined">signal_cellular_alt</span>
                  <span>{levelLabel(activeCourse.level)}</span>
                </div>
                {activeCourse.rating && (
                  <div className={styles.StatItem}>
                    <span className="material-symbols-outlined">star</span>
                    <span>{typeof activeCourse.rating === 'number' ? activeCourse.rating.toFixed(1) : activeCourse.rating.average} / 5</span>
                  </div>
                )}
              </div>

              {/* Objectives */}
              {activeCourse.learningObjectives?.length > 0 && (
                <div className={styles.ObjectivesBlock}>
                  <h3 className={styles.ObjectivesTitle}>
                    <span className="material-symbols-outlined">checklist</span>
                    {language === 'th' ? 'สิ่งที่คุณจะได้เรียนรู้' : 'What you will learn'}
                  </h3>
                  <ul className={styles.ObjectivesList}>
                    {activeCourse.learningObjectives.slice(0, 4).map((obj, i) => (
                      <li key={i} className={styles.ObjectiveItem}>
                        <span className="material-symbols-outlined">check_circle</span>
                        {t(obj)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className={styles.FeaturedFooter}>
                <div className={styles.PriceTag}>
                  {activeCourse.price?.amount === 0
                    ? <span className={styles.PriceFree}>{language === 'th' ? 'ฟรี' : 'Free'}</span>
                    : <span className={styles.PriceAmount}>{activeCourse.price?.amount} {activeCourse.price?.currency}</span>
                  }
                </div>
                <Link to={`/courses/${activeCourse.id}`} className={styles.CtaButton}>
                  <span className="material-symbols-outlined">play_circle</span>
                  {activeCourse.format === 'mini'
                    ? (language === 'th' ? 'ดูวิดีโอ' : 'Watch Video')
                    : (language === 'th' ? 'ดูรายละเอียด' : 'View Course')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
