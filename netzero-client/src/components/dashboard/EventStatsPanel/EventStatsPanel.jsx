import React from "react";
import styles from "./EventStatsPanel.module.scss";
import useEventStatsPanel from "./useEventStatsPanel";
import EventStatsPanelHandler from "./EventStatsPanelHandler";
import { GoogleIcon } from "../../common";

export default function EventStatsPanel({
  isLoading = false,
  stats = null,
  onRefresh,
  theme = "events"
}) {
  const { stateEventStatsPanel, setEventStatsPanel } = useEventStatsPanel({ stats });
  const handlers = EventStatsPanelHandler(stateEventStatsPanel, setEventStatsPanel, { onRefresh });

  if (isLoading) {
    return (
      <div className={styles.Container}>
        <div className={styles.LoadingContainer}>
          <GoogleIcon iconType="hourglass_empty" size="large" className={styles.LoadingIcon} />
          <p>กำลังโหลดสถิติ...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.Container}>
        <div className={styles.EmptyState}>
          <GoogleIcon iconType="analytics" size="large" className={styles.EmptyIcon} />
          <h4>ไม่มีข้อมูลสถิติ</h4>
          <p>ยังไม่มีกิจกรรมในระบบ</p>
          <button className={styles.RefreshButton} onClick={onRefresh}>
            <GoogleIcon iconType="refresh" size="small" />
            รีเฟรช
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "กิจกรรมทั้งหมด",
      value: stats.totalEvents || 0,
      icon: "event",
      color: "primary",
      description: "จำนวนกิจกรรมทั้งหมดที่สร้าง"
    },
    {
      title: "กิจกรรมที่เปิดรับสมัคร",
      value: stats.activeEvents || 0,
      icon: "event_available",
      color: "success",
      description: "กิจกรรมที่กำลังเปิดรับสมัคร"
    },
    {
      title: "กิจกรรมที่กำลังจะมา",
      value: stats.upcomingEvents || 0,
      icon: "schedule",
      color: "info",
      description: "กิจกรรมที่จะจัดในอนาคต"
    },
    {
      title: "กิจกรรมที่เสร็จสิ้น",
      value: stats.completedEvents || 0,
      icon: "event_seat",
      color: "completed",
      description: "กิจกรรมที่จัดเสร็จสิ้นแล้ว"
    },
    {
      title: "กิจกรรมที่ยกเลิก",
      value: stats.cancelledEvents || 0,
      icon: "event_busy",
      color: "warning",
      description: "กิจกรรมที่ถูกยกเลิก"
    },
    {
      title: "ผู้เข้าร่วมทั้งหมด",
      value: stats.totalParticipants || 0,
      icon: "group",
      color: "participants",
      description: "จำนวนผู้เข้าร่วมในกิจกรรมทั้งหมด"
    },
    {
      title: "ค่าเฉลี่ยผู้เข้าร่วม",
      value: stats.averageParticipants || 0,
      icon: "person_add",
      color: "average",
      description: "ค่าเฉลี่ยผู้เข้าร่วมต่อกิจกรรม"
    }
  ];

  return (
    <div className={styles.Container}>
      <div className={styles.Header}>
        <div className={styles.HeaderLeft}>
          <h3 className={styles.Title}>สถิติกิจกรรม</h3>
          <p className={styles.Subtitle}>ภาพรวมกิจกรรมของคุณ</p>
        </div>
        <button className={styles.RefreshButton} onClick={onRefresh} disabled={isLoading}>
          <GoogleIcon iconType="refresh" size="small" />
          อัพเดท
        </button>
      </div>

      <div className={styles.StatsGrid}>
        {statCards.map((card, index) => (
          <div key={index} className={`${styles.StatCard} ${styles[card.color]}`}>
            <div className={styles.StatIcon}>
              <GoogleIcon iconType={card.icon} size="medium" />
            </div>
            <div className={styles.StatContent}>
              <div className={styles.StatValue}>
                {card.value.toLocaleString('th-TH')}
              </div>
              <div className={styles.StatTitle}>
                {card.title}
              </div>
              <div className={styles.StatDescription}>
                {card.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.totalEvents > 0 && (
        <div className={styles.SummarySection}>
          <h4 className={styles.SummaryTitle}>สรุปผลการดำเนินงาน</h4>
          <div className={styles.SummaryCards}>
            <div className={styles.SummaryCard}>
              <div className={styles.SummaryIcon}>
                <GoogleIcon iconType="trending_up" size="medium" />
              </div>
              <div className={styles.SummaryContent}>
                <div className={styles.SummaryLabel}>อัตราความสำเร็จ</div>
                <div className={styles.SummaryValue}>
                  {stats.totalEvents > 0 
                    ? Math.round((stats.completedEvents / stats.totalEvents) * 100)
                    : 0}%
                </div>
                <div className={styles.SummaryNote}>
                  จากกิจกรรมที่จัดทั้งหมด
                </div>
              </div>
            </div>

            <div className={styles.SummaryCard}>
              <div className={styles.SummaryIcon}>
                <GoogleIcon iconType="people" size="medium" />
              </div>
              <div className={styles.SummaryContent}>
                <div className={styles.SummaryLabel}>อัตราการเข้าร่วม</div>
                <div className={styles.SummaryValue}>
                  {stats.totalParticipants > 0 ? 'ดี' : 'ปานกลาง'}
                </div>
                <div className={styles.SummaryNote}>
                  {stats.totalParticipants} คนเข้าร่วม
                </div>
              </div>
            </div>

            <div className={styles.SummaryCard}>
              <div className={styles.SummaryIcon}>
                <GoogleIcon iconType="event_note" size="medium" />
              </div>
              <div className={styles.SummaryContent}>
                <div className={styles.SummaryLabel}>กิจกรรมที่กำลังดำเนินการ</div>
                <div className={styles.SummaryValue}>
                  {stats.activeEvents + stats.upcomingEvents}
                </div>
                <div className={styles.SummaryNote}>
                  กิจกรรมที่กำลังดำเนินการ
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}