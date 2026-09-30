import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import SplitBanner from '../../components/common/SplitBanner/SplitBanner';
import InfoCard from '../../components/common/InfoCard/InfoCard';
import LinkedListCard from '../../components/common/LinkedListCard/LinkedListCard';
import styles from './About.module.scss';

export default function About() {
  const { language, t } = useLanguage();

  const content = {
    title: {
      th: 'เกี่ยวกับเรา',
      en: 'About Us'
    },
    tagline: {
      th: 'แพลตฟอร์มเชื่อมชุมชนไทยกับตลาด GCC และอาหรับ ผ่านความร่วมมือของจุฬาลงกรณ์มหาวิทยาลัย',
      en: 'Connecting Thai communities to GCC and Arab markets through Chulalongkorn University partnerships'
    },
    vision: {
      title: {
        th: 'วิสัยทัศน์',
        en: 'Our Vision'
      },
      text: {
        th: 'Knowledge and Innovation Hub for Glocal Marketing เป็นแพลตฟอร์มที่รวมความรู้เกี่ยวกับสินค้าชุมชน เพื่อเล่าเรื่องของชุมชนและผู้ขาย ออกแบบ prototype ร่วมกันระหว่างชุมชนกับนิสิต ศิษย์เก่า และผู้เชี่ยวชาญจากจุฬาลงกรณ์มหาวิทยาลัย และ Localize สินค้าไทยให้เหมาะกับตลาดปลายทาง โดยเฉพาะตลาด GCC และตลาดอาหรับ',
        en: 'Knowledge and Innovation Hub for Glocal Marketing is a platform that gathers knowledge about community products to tell the stories of communities and sellers, co-design prototypes among communities, students, alumni, and experts from Chulalongkorn University, and localize Thai products to suit target markets, especially the GCC and Arab markets.'
      }
    },
    objectives: {
      title: {
        th: 'วัตถุประสงค์',
        en: 'Objectives'
      },
      items: [
        {
          th: 'เล่าเรื่อง community และผู้ขายให้ตลาดเห็นคุณค่า',
          en: 'Tell community and seller stories to showcase value to markets'
        },
        {
          th: 'ออกแบบ prototype ร่วมกันระหว่าง community กับนิสิต ศิษย์เก่า และผู้เชี่ยวชาญจุฬาฯ',
          en: 'Co-design prototypes between communities and CU students, alumni, and experts'
        },
        {
          th: 'Localize สินค้าไทยให้เหมาะกับตลาดปลายทาง (โดยเฉพาะ GCC/อาหรับ)',
          en: 'Localize Thai products for target markets (especially GCC/Arab)'
        },
        {
          th: 'เพิ่มมูลค่าด้วย mini-course ของแต่ละ community',
          en: 'Add value through mini-courses from each community'
        },
        {
          th: 'รองรับ 2 ภาษา TH ↔ EN (เผื่อ AR ในเฟสถัดไป)',
          en: 'Support bilingual TH ↔ EN (with AR in future phases)'
        }
      ]
    },
    partnership: {
      title: {
        th: 'ความร่วมมือกับจุฬาฯ',
        en: 'Partnership with Chulalongkorn University'
      },
      text: {
        th: 'โครงการนี้ได้รับการสนับสนุนจากจุฬาลงกรณ์มหาวิทยาลัย ภายใต้แนวคิด University Social Responsibility (USR) โดยมีการบูรณาการความรู้จากหลายคณะ เช่น พาณิชยศาสตร์ ศิลปกรรมศาสตร์ วิทยาศาสตร์ และศิลปศาสตร์ เพื่อสร้างความเข้มแข็งให้กับชุมชนและผู้ประกอบการไทย',
        en: 'This project is supported by Chulalongkorn University under the University Social Responsibility (USR) concept, integrating knowledge from multiple faculties such as Commerce, Fine and Applied Arts, Science, and Arts to strengthen Thai communities and entrepreneurs.'
      },
      details: [
        { icon: 'school',              label: { th: 'มหาวิทยาลัย',     en: 'University'     }, value: 'Chulalongkorn University' },
        { icon: 'volunteer_activism',  label: { th: 'แนวคิด',           en: 'Concept'        }, value: 'University Social Responsibility (USR)' },
        { icon: 'menu_book',           label: { th: 'คณะที่ร่วม',       en: 'Faculties'      }, value: { th: 'พาณิชย์ฯ, ศิลปกรรม, วิทยาศาสตร์, ศิลปศาสตร์', en: 'Commerce, Fine Arts, Science, Arts' } },
        { icon: 'public',              label: { th: 'ตลาดเป้าหมาย',     en: 'Target Market'  }, value: { th: 'GCC และตลาดอาหรับ', en: 'GCC & Arab Markets' } },
      ]
    },
    explore: {
      title: { th: 'สำรวจเพิ่มเติม', en: 'Explore More' },
      items: [
        { to: '/communities', icon: 'location_on', primary: { th: 'ชุมชน',       en: 'Communities' }, secondary: { th: 'ค้นหาชุมชนและสินค้า',  en: 'Discover communities and products' } },
        { to: '/courses',     icon: 'school',      primary: { th: 'คอร์สเรียน', en: 'Courses'      }, secondary: { th: 'เรียนรู้ทักษะใหม่',      en: 'Learn new skills' } },
        { to: '/showroom',    icon: 'storefront',  primary: { th: 'โชว์รูม',    en: 'Showroom'     }, secondary: { th: 'ดูสินค้าทั้งหมด',        en: 'View all products' } },
      ]
    }
  };

  return (
    <div className={styles.About}>
      {/* Banner */}
      <SplitBanner
        image="https://images.unsplash.com/photo-1562774053-701939374585?w=800"
        imageAlt="Chulalongkorn University campus"
        badge="จุฬาลงกรณ์มหาวิทยาลัย · CU"
        title={t(content.title)}
        tagline={t(content.tagline)}
        meta={[
          { icon: 'school', text: 'Chulalongkorn University' },
          { icon: 'public', text: 'Glocal Marketing' },
        ]}
      />

      <div className={styles.Container}>
        <div className={styles.Content}>

          {/* Vision */}
          <div className={styles.Section}>
            <h2 className={styles.SectionTitle}>{t(content.vision.title)}</h2>
            <p className={styles.Text}>{t(content.vision.text)}</p>
          </div>

          {/* Objectives */}
          <div className={styles.Section}>
            <h2 className={styles.SectionTitle}>{t(content.objectives.title)}</h2>
            <ul className={styles.List}>
              {content.objectives.items.map((item, index) => (
                <li key={index} className={styles.ListItem}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Partnership — InfoCard */}
          <InfoCard
            title={t(content.partnership.title)}
            items={content.partnership.details.map(d => ({
              icon: d.icon,
              label: t(d.label),
              value: typeof d.value === 'string' ? d.value : t(d.value),
            }))}
          />

          {/* Explore More — LinkedListCard */}
          <LinkedListCard
            title={t(content.explore.title)}
            titleIcon="explore"
            items={content.explore.items.map(item => ({
              to: item.to,
              icon: item.icon,
              primary: t(item.primary),
              secondary: t(item.secondary),
            }))}
          />

        </div>
      </div>
    </div>
  );
}
