import React from "react";
import styles from "./SellerStatsPanel.module.scss";
import { GoogleIcon } from "../../common";
import { productsService } from "../../../api";

export default function SellerStatsPanel({ 
    isLoading = false,
    stats = {},
    onRefresh,
    theme = "seller",
    className = "" 
}) {
    const {
        totalProducts = 0,
        totalReservations = 0,
        pendingReservations = 0,
        confirmedReservations = 0,
        totalRevenue = 0,
        outOfStockProducts = 0
    } = stats;
    
    const statsCards = [
        {
            title: "สินค้าทั้งหมด",
            value: totalProducts,
            icon: "inventory",
            color: "blue",
            description: `สินค้าหมด ${outOfStockProducts} รายการ`
        },
        {
            title: "การจองทั้งหมด",
            value: totalReservations,
            icon: "shopping_cart",
            color: "green",
            description: `รอการยืนยัน ${pendingReservations} รายการ`
        },
        {
            title: "ยืนยันแล้ว",
            value: confirmedReservations,
            icon: "check_circle",
            color: "purple",
            description: "การจองที่ยืนยันแล้ว"
        },
        {
            title: "รายได้รวม",
            value: productsService.formatPrice(totalRevenue),
            icon: "monetization_on",
            color: "orange",
            description: "จากการจองที่ยืนยันแล้ว"
        }
    ];
    
    if (isLoading) {
        return (
            <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
                <div className={styles.LoadingContainer}>
                    <div className={styles.LoadingSpinner} />
                    <p>กำลังโหลดสถิติ...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
            <div className={styles.Header}>
                <h2 className={styles.Title}>สถิติการขาย</h2>
                <button 
                    className={styles.RefreshButton}
                    onClick={onRefresh}
                    title="รีเฟรชข้อมูล"
                >
                    <GoogleIcon iconType="refresh" size="small" />
                </button>
            </div>
            
            <div className={styles.StatsGrid}>
                {statsCards.map((card, index) => (
                    <div 
                        key={index}
                        className={`${styles.StatsCard} ${styles[`color-${card.color}`]}`}
                    >
                        <div className={styles.CardHeader}>
                            <div className={styles.CardIcon}>
                                <GoogleIcon iconType={card.icon} size="medium" />
                            </div>
                            <h3 className={styles.CardTitle}>{card.title}</h3>
                        </div>
                        
                        <div className={styles.CardValue}>
                            {typeof card.value === 'string' ? card.value : card.value.toLocaleString()}
                        </div>
                        
                        <div className={styles.CardDescription}>
                            {card.description}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className={styles.InsightsSection}>
                <h3 className={styles.InsightsTitle}>ข้อมูลเชิงลึก</h3>
                
                <div className={styles.InsightsList}>
                    {totalProducts === 0 && (
                        <div className={styles.InsightItem}>
                            <GoogleIcon iconType="info" size="small" className={styles.InsightIcon} />
                            <span>เริ่มต้นด้วยการเพิ่มสินค้าแรกของคุณ</span>
                        </div>
                    )}
                    
                    {outOfStockProducts > 0 && (
                        <div className={styles.InsightItem}>
                            <GoogleIcon iconType="warning" size="small" className={styles.InsightIcon} />
                            <span>มีสินค้าหมด {outOfStockProducts} รายการ - ควรเติมสต็อก</span>
                        </div>
                    )}
                    
                    {pendingReservations > 0 && (
                        <div className={styles.InsightItem}>
                            <GoogleIcon iconType="notifications" size="small" className={styles.InsightIcon} />
                            <span>มีการจองรอการยืนยัน {pendingReservations} รายการ</span>
                        </div>
                    )}
                    
                    {confirmedReservations > 0 && totalReservations > 0 && (
                        <div className={styles.InsightItem}>
                            <GoogleIcon iconType="trending_up" size="small" className={styles.InsightIcon} />
                            <span>
                                อัตราการยืนยัน: {((confirmedReservations / totalReservations) * 100).toFixed(1)}%
                            </span>
                        </div>
                    )}
                    
                    {totalProducts > 0 && totalReservations === 0 && (
                        <div className={styles.InsightItem}>
                            <GoogleIcon iconType="lightbulb" size="small" className={styles.InsightIcon} />
                            <span>ลองโปรโมทสินค้าของคุณให้มากขึ้น</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}