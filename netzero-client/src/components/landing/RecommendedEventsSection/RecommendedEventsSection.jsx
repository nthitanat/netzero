import React from "react";
import styles from "./RecommendedEventsSection.module.scss";
import useRecommendedEventsSection from "./useRecommendedEventsSection";
import RecommendedEventsSectionHandler from "./RecommendedEventsSectionHandler";
import { RecommendedCarousel } from "../../events";

export default function RecommendedEventsSection({ events, onEventClick }) {
  const { stateRecommendedEventsSection, setRecommendedEventsSection } = useRecommendedEventsSection({ events });
  const handlers = RecommendedEventsSectionHandler(stateRecommendedEventsSection, setRecommendedEventsSection);

  // Filter recommended events
  const recommendedEvents = events?.filter(event => event.isRecommended) || [];

  if (!recommendedEvents || recommendedEvents.length === 0) {
    return null;
  }

  return (
    <section className={styles.Container} id="recommended-events-section">
      <div className={styles.ContentWrapper}>
        <div className={styles.Header}>
          <h2 className={styles.SectionTitle}>
            กิจกรรมและเหตุการณ์<span className={styles.TitleAccent}>แนะนำ</span>
          </h2>
          <p className={styles.SectionSubtitle}>
            ร่วมเป็นส่วนหนึ่งของกิจกรรมสร้างสรรค์เพื่อสิ่งแวดล้อมและชุมชนอย่างยั่งยืน
          </p>
        </div>

        <div className={styles.CarouselContainer}>
          <RecommendedCarousel 
            events={recommendedEvents}
            onEventClick={(eventId) => handlers.handleEventClick(eventId, onEventClick)}
          />
        </div>

        <div className={styles.CTASection}>
          <div className={styles.CTACard}>
            <div className={styles.CTAContent}>
              <h3 className={styles.CTATitle}>สนใจเข้าร่วมกิจกรรมเพิ่มเติม?</h3>
              <p className={styles.CTADescription}>
                ค้นหากิจกรรมและเหตุการณ์ที่น่าสนใจในพื้นที่ของคุณ
              </p>
              <button 
                className={styles.CTAButton}
                onClick={() => handlers.handleViewAllEvents()}
              >
                ดูกิจกรรมทั้งหมด
                <span className={styles.ArrowIcon}>→</span>
              </button>
            </div>
            <div className={styles.CTAVisual}>
              <div className={styles.EventStats}>
                <div className={styles.StatItem}>
                  <div className={styles.StatNumber}>{recommendedEvents.length}</div>
                  <div className={styles.StatLabel}>กิจกรรมแนะนำ</div>
                </div>
                <div className={styles.StatItem}>
                  <div className={styles.StatNumber}>50+</div>
                  <div className={styles.StatLabel}>กิจกรรมทั้งหมด</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
