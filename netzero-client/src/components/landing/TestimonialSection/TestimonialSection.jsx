import React from "react";
import styles from "./TestimonialSection.module.scss";
import useTestimonialSection from "./useTestimonialSection";
import TestimonialSectionHandler from "./TestimonialSectionHandler";

export default function TestimonialSection({ 
  testimonials = [], 
  currentTestimonial = 0, 
  onTestimonialChange 
}) {
  const { stateTestimonialSection, setTestimonialSection } = useTestimonialSection({
    testimonials,
    currentTestimonial,
    onTestimonialChange
  });
  const handlers = TestimonialSectionHandler(stateTestimonialSection, setTestimonialSection);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Ensure currentTestimonial is within bounds
  const safeCurrentTestimonial = currentTestimonial >= 0 && currentTestimonial < testimonials.length ? currentTestimonial : 0;
  const currentTestimonialData = testimonials[safeCurrentTestimonial];
  
  if (!currentTestimonialData) {
    return null;
  }

  return (
    <section className={styles.Container} id="testimonials-section">
      <div className={styles.ContentWrapper}>
        <div className={styles.Header}>
          <h2 className={styles.SectionTitle}>
            เสียงจาก<span className={styles.TitleAccent}>ชุมชน</span>
          </h2>
          <p className={styles.SectionSubtitle}>
            ฟังประสบการณ์และเรื่องราวของสมาชิกชุมชน NetZero
          </p>
        </div>

        <div className={styles.TestimonialContainer}>
          <div className={styles.TestimonialCard}>
            <div className={styles.QuoteIcon}>❝</div>
            
            <div className={styles.TestimonialContent}>
              <p className={styles.TestimonialText}>
                {currentTestimonialData.content}
              </p>
              
              <div className={styles.Rating}>
                {[...Array(currentTestimonialData.rating)].map((_, index) => (
                  <span key={index} className={styles.Star}>⭐</span>
                ))}
              </div>
            </div>
            
            <div className={styles.AuthorSection}>
              <div className={styles.AuthorAvatar}>
                <div className={styles.AvatarPlaceholder}>
                  {currentTestimonialData.name.charAt(0)}
                </div>
              </div>
              
              <div className={styles.AuthorInfo}>
                <h4 className={styles.AuthorName}>
                  {currentTestimonialData.name}
                </h4>
                <p className={styles.AuthorRole}>
                  {currentTestimonialData.role}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.Navigation}>
            <button 
              className={styles.NavButton}
              onClick={() => handlers.handlePreviousTestimonial(safeCurrentTestimonial, testimonials, onTestimonialChange)}
              disabled={safeCurrentTestimonial === 0}
            >
              ←
            </button>
            
            <div className={styles.Indicators}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.Indicator} ${
                    index === safeCurrentTestimonial ? styles.Active : ''
                  }`}
                  onClick={() => handlers.handleTestimonialChange(index, onTestimonialChange)}
                />
              ))}
            </div>
            
            <button 
              className={styles.NavButton}
              onClick={() => handlers.handleNextTestimonial(safeCurrentTestimonial, testimonials, onTestimonialChange)}
              disabled={safeCurrentTestimonial === testimonials.length - 1}
            >
              →
            </button>
          </div>
        </div>

        <div className={styles.TestimonialGrid}>
          <h3 className={styles.GridTitle}>เรื่องราวความสำเร็จ</h3>
          
          <div className={styles.SuccessCards}>
            <div className={styles.SuccessCard}>
              <div className={styles.SuccessIcon}>🌾</div>
              <h4 className={styles.SuccessTitle}>เกษตรกรออร์แกนิค</h4>
              <p className={styles.SuccessText}>
                รายได้เพิ่มขึ้น 300% จากการขายผลผลิตผ่าน NetZero
              </p>
              <div className={styles.SuccessStats}>
                <span>+120 ลูกค้า</span>
                <span>รายได้ต่อเดือน 45,000 บาท</span>
              </div>
            </div>

            <div className={styles.SuccessCard}>
              <div className={styles.SuccessIcon}>🏪</div>
              <h4 className={styles.SuccessTitle}>ร้านค้าชุมชน</h4>
              <p className={styles.SuccessText}>
                ลดต้นทุนสินค้า 40% ด้วยระบบแลกเปลี่ยน
              </p>
              <div className={styles.SuccessStats}>
                <span>-40% ต้นทุน</span>
                <span>+80 พาร์ทเนอร์</span>
              </div>
            </div>

            <div className={styles.SuccessCard}>
              <div className={styles.SuccessIcon}>🎋</div>
              <h4 className={styles.SuccessTitle}>โครงการป่าไผ่</h4>
              <p className={styles.SuccessText}>
                ลดคาร์บอน 50 ตัน/ปี จากการปลูกป่าไผ่ 500 ต้น
              </p>
              <div className={styles.SuccessStats}>
                <span>-50 ตันคาร์บอน/ปี</span>
                <span>500 ต้นไผ่</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
