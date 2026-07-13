import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './Footer.module.scss';

export default function Footer() {
  const { language } = useLanguage();

  const content = {
    about: {
      th: 'แพลตฟอร์มรวมความรู้เกี่ยวกับสินค้าชุมชน เพื่อเล่าเรื่อง community ออกแบบ prototype ร่วมกัน และ Localize สินค้าไทยให้เหมาะกับตลาดสากล',
      en: 'A platform for community product knowledge to tell stories, co-design prototypes, and localize Thai products for global markets'
    },
    quickLinks: {
      th: 'ลิงก์ด่วน',
      en: 'Quick Links'
    },
    contact: {
      th: 'ติดต่อเรา',
      en: 'Contact Us'
    },
    copyright: {
      th: '© 2026 จุฬาลงกรณ์มหาวิทยาลัย สงวนลิขสิทธิ์',
      en: '© 2026 Chulalongkorn University. All rights reserved.'
    }
  };

  const quickLinks = [
    { path: '/about', label: { th: 'เกี่ยวกับเรา', en: 'About Us' } },
    { path: '/communities', label: { th: 'ชุมชน', en: 'Communities' } },
    { path: '/showroom', label: { th: 'โชว์รูม', en: 'Showroom' } },
    { path: '/courses', label: { th: 'คอร์สเรียน', en: 'Courses' } },
    { path: '/knowledge-hub', label: { th: 'คลังความรู้', en: 'Knowledge Hub' } },
    { path: '/co-design', label: { th: 'Co-Design', en: 'Co-Design' } }
  ];

  return (
    <footer className={styles.Footer}>
      <div className={styles.Container}>
        <div className={styles.Grid}>
          {/* About Section */}
          <div className={styles.Section}>
            <h3 className={styles.SectionTitle}>Knowledge Hub</h3>
            <p className={styles.SectionText}>
              {content.about[language]}
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.Section}>
            <h3 className={styles.SectionTitle}>
              {content.quickLinks[language]}
            </h3>
            <div className={styles.Links}>
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={styles.Link}
                >
                  {link.label[language]}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className={styles.Section}>
            <h3 className={styles.SectionTitle}>
              {content.contact[language]}
            </h3>
            <div className={styles.Contact}>
              <div className={styles.ContactItem}>
                <span className="material-symbols-outlined">location_on</span>
                <span>
                  {language === 'th' 
                    ? 'จุฬาลงกรณ์มหาวิทยาลัย กรุงเทพฯ'
                    : 'Chulalongkorn University, Bangkok'}
                </span>
              </div>
              <div className={styles.ContactItem}>
                <span className="material-symbols-outlined">mail</span>
                <span>info@knowledgehub.cu.ac.th</span>
              </div>
              <div className={styles.ContactItem}>
                <span className="material-symbols-outlined">phone</span>
                <span>+66-2-218-xxxx</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.Divider} />

        {/* Bottom */}
        <div className={styles.Bottom}>
          <p className={styles.Copyright}>
            {content.copyright[language]}
          </p>

          <div className={styles.Social}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.SocialLink}
              aria-label="Facebook"
            >
              <span className="material-symbols-outlined sm">facebook</span>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.SocialLink}
              aria-label="Twitter"
            >
              <span className="material-symbols-outlined sm">mail</span>
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.SocialLink}
              aria-label="Instagram"
            >
              <span className="material-symbols-outlined sm">photo_camera</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
