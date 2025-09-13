import React from "react";
import styles from "./FeatureSection.module.scss";
import useFeatureSection from "./useFeatureSection";
import FeatureSectionHandler from "./FeatureSectionHandler";

export default function FeatureSection() {
  const { stateFeatureSection, setFeatureSection } = useFeatureSection();
  const handlers = FeatureSectionHandler(stateFeatureSection, setFeatureSection);

  return (
    <section className={styles.Container} id="features-section">
      <div className={styles.ContentWrapper}>
        <div className={styles.Header}>
          <h2 className={styles.SectionTitle}>
            ฟีเจอร์หลักของ <span className={styles.TitleAccent}>NetZero</span>
          </h2>
          <p className={styles.SectionSubtitle}>
            แพลตฟอร์มครบครันสำหรับการใช้ชีวิตอย่างยั่งยืนและเป็นมิตรกับสิ่งแวดล้อม
          </p>
        </div>

        <div className={styles.FeaturesGrid}>
          {stateFeatureSection.features.map((feature, index) => (
            <div 
              key={feature.id}
              className={styles.FeatureCard}
              onClick={() => handlers.handleFeatureClick(feature.id)}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.FeatureIcon}>
                <span className={styles.IconEmoji}>{feature.icon}</span>
                <div className={styles.IconGlow}></div>
              </div>
              
              <div className={styles.FeatureContent}>
                <h3 className={styles.FeatureTitle}>{feature.title}</h3>
                <p className={styles.FeatureDescription}>{feature.description}</p>
                
                <div className={styles.FeatureDetails}>
                  <ul className={styles.FeatureList}>
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className={styles.FeatureListItem}>
                        <span className={styles.CheckIcon}>✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={styles.FeatureButton}>
                  เรียนรู้เพิ่มเติม
                  <span className={styles.ArrowIcon}>→</span>
                </button>
              </div>

              <div className={styles.FeatureBackground}></div>
            </div>
          ))}
        </div>

        <div className={styles.CTASection}>
          <div className={styles.CTACard}>
            <h3 className={styles.CTATitle}>พร้อมเริ่มต้นแล้วหรือยัง?</h3>
            <p className={styles.CTADescription}>
              เข้าร่วมชุมชน NetZero และเป็นส่วนหนึ่งของการเปลี่ยนแปลงโลกให้ยั่งยืน
            </p>
            <button 
              className={styles.CTAButton}
              onClick={handlers.handleStartJourney}
            >
              เริ่มต้นการเดินทาง
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
