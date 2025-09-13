import React from "react";
import styles from "./CallToActionSection.module.scss";
import useCallToActionSection from "./useCallToActionSection";
import CallToActionSectionHandler from "./CallToActionSectionHandler";

export default function CallToActionSection({ onJoinCommunity, onLearnMore }) {
  const { stateCallToActionSection, setCallToActionSection } = useCallToActionSection();
  const handlers = CallToActionSectionHandler(stateCallToActionSection, setCallToActionSection);

  return (
    <section className={styles.Container} id="cta-section">
      <div className={styles.FloatingElement1}></div>
      <div className={styles.FloatingElement2}></div>
      <div className={styles.FloatingElement3}></div>
      
      <div className={styles.ContentWrapper}>
        <div className={styles.MainCTA}>
          <div className={styles.CTAContent}>
            <h2 className={styles.CTATitle}>
              เริ่มต้นการเดินทางสู่
              <br />
              <span className={styles.TitleGradient}>อนาคตที่ยั่งยืน</span>
            </h2>
            
            <p className={styles.CTASubtitle}>
              เข้าร่วมกับ NetZero วันนี้และเป็นส่วนหนึ่งของการเปลี่ยนแปลงโลก
              ด้วยแพลตฟอร์มที่รวมทุกสิ่งที่คุณต้องการสำหรับการใช้ชีวิตอย่างยั่งยืน
            </p>
            
            <div className={styles.ButtonGroup}>
              <button 
                className={styles.PrimaryButton}
                onClick={onJoinCommunity}
              >
                เข้าร่วมชุมชน
                <span className={styles.ButtonIcon}>→</span>
              </button>
              
              <button 
                className={styles.SecondaryButton}
                onClick={onLearnMore}
              >
                เรียนรู้เพิ่มเติม
              </button>
            </div>
            
            <div className={styles.FeaturePromises}>
              <div className={styles.Promise}>
                <span className={styles.PromiseIcon}>✓</span>
                <span>ฟรี 100% ไม่มีค่าธรรมเนียมซ่อนเร้น</span>
              </div>
              <div className={styles.Promise}>
                <span className={styles.PromiseIcon}>✓</span>
                <span>ชุมชนมากกว่า 10,000 คน</span>
              </div>
              <div className={styles.Promise}>
                <span className={styles.PromiseIcon}>✓</span>
                <span>สนับสนุน 24/7</span>
              </div>
            </div>
          </div>
          
          <div className={styles.CTAVisual}>
            <div className={styles.VisualCard}>
              <div className={styles.CardIcon}>🌱</div>
              <div className={styles.CardContent}>
                <h4>เริ่มต้นวันนี้</h4>
                <p>สมัครสมาชิกง่าย ๆ ใน 1 นาที</p>
              </div>
            </div>
            
            <div className={styles.FloatingCard}>
              <div className={styles.FloatingIcon}>💚</div>
              <span>ร่วมสร้างโลกที่ดีกว่า</span>
            </div>
          </div>
        </div>

        <div className={styles.NewsletterSection}>
          <div className={styles.NewsletterCard}>
            <h3 className={styles.NewsletterTitle}>
              รับข่าวสารและเคล็ดลับ
            </h3>
            <p className={styles.NewsletterDescription}>
              สมัครรับข่าวสารและเคล็ดลับการใช้ชีวิตอย่างยั่งยืนทุกสัปดาห์
            </p>
            
            <form className={styles.NewsletterForm} onSubmit={handlers.handleNewsletterSubmit}>
              <div className={styles.InputGroup}>
                <input
                  type="email"
                  placeholder="อีเมลของคุณ"
                  className={styles.EmailInput}
                  value={stateCallToActionSection.email}
                  onChange={(e) => handlers.handleEmailChange(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className={styles.SubmitButton}
                  disabled={stateCallToActionSection.isSubmitting}
                >
                  {stateCallToActionSection.isSubmitting ? 'กำลังส่ง...' : 'สมัคร'}
                </button>
              </div>
            </form>
            
            <p className={styles.NewsletterDisclaimer}>
              เราจะไม่แบ่งปันข้อมูลส่วนตัวของคุณกับบุคคลที่สาม
            </p>
          </div>
        </div>

        <div className={styles.SocialSection}>
          <h3 className={styles.SocialTitle}>ติดตามเราได้ที่</h3>
          <div className={styles.SocialLinks}>
            <a href="#" className={styles.SocialLink} aria-label="Facebook">
              <span className={styles.SocialIcon}>📘</span>
              Facebook
            </a>
            <a href="#" className={styles.SocialLink} aria-label="Instagram">
              <span className={styles.SocialIcon}>📷</span>
              Instagram
            </a>
            <a href="#" className={styles.SocialLink} aria-label="Line">
              <span className={styles.SocialIcon}>💬</span>
              Line
            </a>
            <a href="#" className={styles.SocialLink} aria-label="YouTube">
              <span className={styles.SocialIcon}>📺</span>
              YouTube
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
