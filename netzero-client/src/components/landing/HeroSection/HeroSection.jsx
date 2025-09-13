import React from "react";
import styles from "./HeroSection.module.scss";
import useHeroSection from "./useHeroSection";
import HeroSectionHandler from "./HeroSectionHandler";

export default function HeroSection({ onGetStarted, onExploreFeatures }) {
  const { stateHeroSection, setHeroSection } = useHeroSection();
  const handlers = HeroSectionHandler(stateHeroSection, setHeroSection);

  return (
    <section className={styles.Container} id="hero-section">
      {/* Large Leaf Overlay from Right Corner */}
      <div className={styles.LargeLeafOverlay}>
        <img 
          src="/assets/images/landing/landing.png" 
          alt="Large Leaf Overlay"
          className={styles.LargeLeafImage}
        />
      </div>

      
      <div className={styles.FloatingElement1}></div>
      <div className={styles.FloatingElement2}></div>
      <div className={styles.FloatingElement3}></div>
      
      <div className={styles.ContentWrapper}>
        <div className={styles.TextContent}>
          <h1 className={styles.MainTitle}>
            <span className={styles.TitleGradient}>NetZero</span>
            <br />
            เพื่อโลกที่ยั่งยืน
          </h1>
          
          <p className={styles.Subtitle}>
            แพลตฟอร์มที่รวมตลาดสีเขียว การแลกเปลี่ยนสินค้า 
            และการติดตามป่าไผ่เพื่อลดคาร์บอนฟุตพริ้นท์
          </p>
          
          <div className={styles.ButtonGroup}>
            <button 
              className={styles.PrimaryButton}
              onClick={onGetStarted}
            >
              เริ่มต้นใช้งาน
            </button>
            
            <button 
              className={styles.SecondaryButton}
              onClick={onExploreFeatures}
            >
              สำรวจฟีเจอร์
            </button>
          </div>
          
          <div className={styles.FeatureHighlights}>
            <div className={styles.Highlight}>
              <span className={styles.HighlightIcon}>🌱</span>
              <span>ตลาดสีเขียว</span>
            </div>
            <div className={styles.Highlight}>
              <span className={styles.HighlightIcon}>🔄</span>
              <span>แลกเปลี่ยนสินค้า</span>
            </div>
            <div className={styles.Highlight}>
              <span className={styles.HighlightIcon}>🎋</span>
              <span>ติดตามป่าไผ่</span>
            </div>
          </div>
        </div>
        
        {/* <div className={styles.VisualContent}>
          <div className={styles.MainVisual}>
            <div className={styles.GlassCard}>
              <div className={styles.CardContent}>
                <div className={styles.GreenCircle}></div>
                <h3>Carbon Neutral</h3>
                <p>ลดคาร์บอน 50,000 กก.</p>
              </div>
            </div>
            
            <div className={styles.FloatingCard}>
              <div className={styles.CardIcon}>🌿</div>
              <span>25,000 ต้นไผ่</span>
            </div>
            
            <div className={styles.FloatingCard2}>
              <div className={styles.CardIcon}>♻️</div>
              <span>100% Organic</span>
            </div>
          </div>
        </div> */}
      </div>
      
      <div className={styles.ScrollIndicator} onClick={onExploreFeatures}>
        <div className={styles.ScrollArrow}></div>
        <span>เลื่อนลงเพื่อดูเพิ่มเติม</span>
      </div>
    </section>
  );
}
