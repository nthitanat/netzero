import React from "react";
import styles from "./StatsSection.module.scss";
import useStatsSection from "./useStatsSection";
import StatsSectionHandler from "./StatsSectionHandler";

export default function StatsSection({ stats, onStatsLoad }) {
  const { stateStatsSection, setStatsSection } = useStatsSection({ stats, onStatsLoad });
  const handlers = StatsSectionHandler(stateStatsSection, setStatsSection);

  return (
    <section className={styles.Container} id="stats-section">
      <div className={styles.ContentWrapper}>
        <div className={styles.Header}>
          <h2 className={styles.SectionTitle}>
            ผลลัพธ์ที่<span className={styles.TitleAccent}>เป็นรูปธรรม</span>
          </h2>
          <p className={styles.SectionSubtitle}>
            ร่วมกันสร้างการเปลี่ยนแปลงที่มีความหมายเพื่อโลกที่ยั่งยืน
          </p>
        </div>

        <div className={styles.StatsGrid}>
          <div className={styles.StatCard}>
            <div className={styles.StatIcon}>🌍</div>
            <div className={styles.StatNumber}>
              {stateStatsSection.animatedStats.carbonReduced.toLocaleString()}
            </div>
            <div className={styles.StatUnit}>กิโลกรัม</div>
            <div className={styles.StatLabel}>คาร์บอนที่ลดได้</div>
            <div className={styles.StatDescription}>
              เทียบเท่าการขับรถ 200,000 กิโลเมตร
            </div>
          </div>

          <div className={styles.StatCard}>
            <div className={styles.StatIcon}>🎋</div>
            <div className={styles.StatNumber}>
              {stateStatsSection.animatedStats.treesPlanted.toLocaleString()}
            </div>
            <div className={styles.StatUnit}>ต้น</div>
            <div className={styles.StatLabel}>ไผ่ที่ปลูกแล้ว</div>
            <div className={styles.StatDescription}>
              ป่าไผ่เจริญเติบโตเร็ว 3 เท่าของไม้ปกติ
            </div>
          </div>

          <div className={styles.StatCard}>
            <div className={styles.StatIcon}>👥</div>
            <div className={styles.StatNumber}>
              {stateStatsSection.animatedStats.communityMembers.toLocaleString()}
            </div>
            <div className={styles.StatUnit}>คน</div>
            <div className={styles.StatLabel}>สมาชิกชุมชน</div>
            <div className={styles.StatDescription}>
              ผู้ใช้งานใน 77 จังหวัดทั่วประเทศ
            </div>
          </div>

          <div className={styles.StatCard}>
            <div className={styles.StatIcon}>✅</div>
            <div className={styles.StatNumber}>
              {stateStatsSection.animatedStats.projectsCompleted.toLocaleString()}
            </div>
            <div className={styles.StatUnit}>โครงการ</div>
            <div className={styles.StatLabel}>โครงการที่สำเร็จ</div>
            <div className={styles.StatDescription}>
              โครงการอนุรักษ์และพัฒนาชุมชน
            </div>
          </div>
        </div>

        <div className={styles.ImpactSection}>
          <div className={styles.ImpactCard}>
            <h3 className={styles.ImpactTitle}>ผลกระทบเชิงบวกต่อสิ่งแวดล้อม</h3>
            <div className={styles.ImpactGrid}>
              <div className={styles.ImpactItem}>
                <div className={styles.ImpactIcon}>💧</div>
                <div className={styles.ImpactText}>
                  <strong>10 ล้านลิตร</strong>
                  <br />น้ำที่ประหยัดได้
                </div>
              </div>
              <div className={styles.ImpactItem}>
                <div className={styles.ImpactIcon}>♻️</div>
                <div className={styles.ImpactText}>
                  <strong>5,000 กิโลกรัม</strong>
                  <br />ขยะที่นำกลับมาใช้
                </div>
              </div>
              <div className={styles.ImpactItem}>
                <div className={styles.ImpactIcon}>⚡</div>
                <div className={styles.ImpactText}>
                  <strong>100,000 กิโลวัตต์</strong>
                  <br />พลังงานสะอาดที่ผลิต
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.ProgressSection}>
          <h3 className={styles.ProgressTitle}>เป้าหมาย 2025</h3>
          <div className={styles.ProgressBars}>
            <div className={styles.ProgressItem}>
              <div className={styles.ProgressLabel}>
                <span>คาร์บอนที่ลดได้</span>
                <span>50,000 / 100,000 กิโลกรัม</span>
              </div>
              <div className={styles.ProgressBar}>
                <div 
                  className={styles.ProgressFill} 
                  style={{ width: '50%' }}
                ></div>
              </div>
            </div>
            
            <div className={styles.ProgressItem}>
              <div className={styles.ProgressLabel}>
                <span>สมาชิกชุมชน</span>
                <span>10,000 / 50,000 คน</span>
              </div>
              <div className={styles.ProgressBar}>
                <div 
                  className={styles.ProgressFill} 
                  style={{ width: '20%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
