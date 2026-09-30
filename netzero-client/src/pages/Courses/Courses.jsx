import React from 'react';
import { FloatingNavBar } from '../../components/common';
import styles from './Courses.module.scss';

const glocalCatalogUrl = 'https://engagement.chula.ac.th/glocal/#/courses';

export default function Courses() {
  return (
    <div className={styles.page}>
      <FloatingNavBar />
      <main className={styles.content}>
        <div className={styles.badge}>Glocal × Net Zero</div>
        <h1>หลักสูตร</h1>
        <p>
          สำรวจหลักสูตรและบทเรียนของโครงการ Glocal เพื่อเรียนรู้เรื่องชุมชน
          ผู้ประกอบการเพื่อสังคม และการเชื่อมตลาดท้องถิ่นกับตลาดโลก
        </p>
        <a className={styles.catalogLink} href={glocalCatalogUrl}>
          ดูหลักสูตรบน Glocal
          <span aria-hidden="true">→</span>
        </a>
      </main>
    </div>
  );
}
