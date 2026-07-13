import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getCourseById } from '../../api/dataService';
import Loading from '../../components/common/Loading/Loading';
import CurriculumAccordion from '../../components/course/CurriculumAccordion/CurriculumAccordion';
import EnrollmentCard from '../../components/course/EnrollmentCard/EnrollmentCard';
import styles from './CourseDetail.module.scss';

const CourseDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await getCourseById(id);
        setCourse(response.data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div className={styles.notFound}>
        <h1>{language === 'th' ? 'ไม่พบหลักสูตร' : 'Course Not Found'}</h1>
      </div>
    );
  }

  return (
    <div className={styles.courseDetail}>
      {/* Course Header */}
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <span>{language === 'th' ? 'หลักสูตร' : 'Courses'}</span>
            <span className="material-symbols-outlined">chevron_right</span>
            <span>{t(course.title)}</span>
          </div>
          <h1 className={styles.courseTitle}>{t(course.title)}</h1>
          <p className={styles.courseDescription}>{t(course.description)}</p>
          
          <div className={styles.instructorRow}>
            <img 
              src={course.instructor.avatar} 
              alt={t(course.instructor.name)}
              className={styles.instructorAvatar}
            />
            <div className={styles.instructorInfo}>
              <p className={styles.instructorLabel}>
                {language === 'th' ? 'สอนโดย' : 'Instructor'}
              </p>
              <p className={styles.instructorName}>{t(course.instructor.name)}</p>
            </div>
          </div>

          <div className={styles.courseMeta}>
            <span className={styles.rating}>
              <span className="material-symbols-outlined">star</span>
              {course.rating} ({course.studentsEnrolled} {language === 'th' ? 'นักเรียน' : 'students'})
            </span>
            <span>
              <span className="material-symbols-outlined">translate</span>
              {course.language?.map(lang => lang.toUpperCase()).join(', ')}
            </span>
            {course.certificate && (
              <span>
                <span className="material-symbols-outlined">workspace_premium</span>
                {language === 'th' ? 'มีประกาศนียบัตร' : 'Certificate'}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'about' ? styles.active : ''}`}
                onClick={() => setActiveTab('about')}
              >
                {language === 'th' ? 'เกี่ยวกับหลักสูตร' : 'About'}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'curriculum' ? styles.active : ''}`}
                onClick={() => setActiveTab('curriculum')}
              >
                {language === 'th' ? 'เนื้อหาหลักสูตร' : 'Curriculum'}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'instructor' ? styles.active : ''}`}
                onClick={() => setActiveTab('instructor')}
              >
                {language === 'th' ? 'ผู้สอน' : 'Instructor'}
              </button>
            </div>

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className={styles.tabContent}>
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    {language === 'th' ? 'เกี่ยวกับหลักสูตรนี้' : 'About This Course'}
                  </h2>
                  {course.fullDescription && (
                    <div className={styles.fullDescription}>
                      {t(course.fullDescription).split('\n').map((paragraph, index) => (
                        paragraph.trim() && <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </section>

                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      {language === 'th' ? 'สิ่งที่คุณจะได้เรียนรู้' : "What You'll Learn"}
                    </h2>
                    <ul className={styles.objectivesList}>
                      {course.learningObjectives.map((objective, index) => (
                        <li key={index}>
                          <span className="material-symbols-outlined">check_circle</span>
                          <span>{t(objective)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {course.prerequisites && (
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      {language === 'th' ? 'ข้อกำหนดเบื้องต้น' : 'Prerequisites'}
                    </h2>
                    <p className={styles.prerequisites}>{t(course.prerequisites)}</p>
                  </section>
                )}

                {course.requirements && (
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                      {language === 'th' ? 'ข้อกำหนด' : 'Requirements'}
                    </h2>
                    <p className={styles.requirements}>{t(course.requirements)}</p>
                  </section>
                )}
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div className={styles.tabContent}>
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    {language === 'th' ? 'เนื้อหาหลักสูตร' : 'Course Content'}
                  </h2>
                  {course.curriculum && (
                    <CurriculumAccordion curriculum={course.curriculum} enrolled={false} />
                  )}
                </section>
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === 'instructor' && (
              <div className={styles.tabContent}>
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    {language === 'th' ? 'เกี่ยวกับผู้สอน' : 'About the Instructor'}
                  </h2>
                  <div className={styles.instructorProfile}>
                    <img 
                      src={course.instructor.avatar} 
                      alt={t(course.instructor.name)}
                      className={styles.instructorImage}
                    />
                    <div className={styles.instructorDetails}>
                      <h3 className={styles.instructorFullName}>{t(course.instructor.name)}</h3>
                      <p className={styles.instructorTitle}>{t(course.instructor.title)}</p>
                      {course.instructor.affiliation && (
                        <p className={styles.instructorAffiliation}>{course.instructor.affiliation}</p>
                      )}
                      
                      {course.instructor.bio && (
                        <p className={styles.instructorBio}>{t(course.instructor.bio)}</p>
                      )}

                      <div className={styles.instructorStats}>
                        {course.instructor.rating && (
                          <div className={styles.stat}>
                            <span className="material-symbols-outlined">star</span>
                            <span>{course.instructor.rating} {language === 'th' ? 'คะแนน' : 'Rating'}</span>
                          </div>
                        )}
                        {course.instructor.studentsCount && (
                          <div className={styles.stat}>
                            <span className="material-symbols-outlined">group</span>
                            <span>{course.instructor.studentsCount.toLocaleString()} {language === 'th' ? 'นักเรียน' : 'Students'}</span>
                          </div>
                        )}
                        {course.instructor.coursesCount && (
                          <div className={styles.stat}>
                            <span className="material-symbols-outlined">school</span>
                            <span>{course.instructor.coursesCount} {language === 'th' ? 'หลักสูตร' : 'Courses'}</span>
                          </div>
                        )}
                      </div>

                      {course.instructor.socialLinks && (
                        <div className={styles.socialLinks}>
                          {Object.entries(course.instructor.socialLinks).map(([platform, url]) => (
                            <a 
                              key={platform} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.socialLink}
                            >
                              {platform}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Right Column - Enrollment Card */}
          <div className={styles.rightColumn}>
            <EnrollmentCard course={course} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
