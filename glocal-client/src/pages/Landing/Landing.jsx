import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import FeaturedHero from '../../components/common/FeaturedHero/FeaturedHero';
import styles from './Landing.module.scss';

export default function Landing() {
  const { t } = useLanguage();


  const content = {
    hero: {
      title: {
        th: 'Chulalongkorn\'s Knowledge and Innovation Hub for Glocal Marketing',
        en: 'Chulalongkorn\'s Knowledge and Innovation Hub for Glocal Marketing'
      },
      subtitle: {
        th: 'แพลตฟอร์มรวมความรู้เกี่ยวกับสินค้าชุมชน เพื่อเล่าเรื่อง community ออกแบบ prototype ร่วมกัน และ Localize สินค้าไทยให้เหมาะกับตลาดสากล',
        en: 'A platform for community product knowledge to tell stories, co-design prototypes, and localize Thai products for global markets'
      },
      exploreCommunities: {
        th: 'สำรวจชุมชน',
        en: 'Explore Communities'
      },
      viewShowroom: {
        th: 'ชมโชว์รูม',
        en: 'View Showroom'
      }
    },
    cta: {
      title: {
        th: 'พร้อมที่จะเริ่มต้นแล้วหรือยัง?',
        en: 'Ready to Get Started?'
      },
      text: {
        th: 'เข้าร่วมกับเราเพื่อนำสินค้าชุมชนไทยสู่ตลาดสากล',
        en: 'Join us to bring Thai community products to global markets'
      },
      joinNow: {
        th: 'เข้าร่วมตอนนี้',
        en: 'Join Now'
      },
      learnMore: {
        th: 'เรียนรู้เพิ่มเติม',
        en: 'Learn More'
      }
    }
  };

  return (
    <div className={styles.Landing}>
      {/* Hero */}
      <FeaturedHero
        image="images/landing/landing.jpg"
        imageAlt="Community products"
        badge="KnowledgeHub CU"
        title={t(content.hero.title)}
        tagline={t(content.hero.subtitle)}
        meta={[]}
        actions={
          <>
            <Link to="/communities" className="Button">{t(content.hero.exploreCommunities)}</Link>
            <Link to="/showroom" className="ButtonOutlined">{t(content.hero.viewShowroom)}</Link>
          </>
        }
      />

      {/* CTA Section */}
      <section className={styles.CTA}>
        <div className={styles.CTAContainer}>
          <h2 className={styles.CTATitle}>
            {t(content.cta.title)}
          </h2>
          <p className={styles.CTAText}>
            {t(content.cta.text)}
          </p>
          <div className={styles.CTAActions}>
            <Link to="/communities" className="Button">
              {t(content.cta.learnMore)}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
