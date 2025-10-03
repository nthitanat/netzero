import React from "react";
import styles from "./ReservationManagementPanel.module.scss";
import { GoogleIcon } from "../../common";
import { productsService } from "../../../api";

export default function ReservationManagementPanel({ 
    reservations = [],
    isLoading = false,
    onConfirmReservation,
    onCancelReservation,
    onRefresh,
    theme = "seller",
    className = "" 
}) {
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { label: 'รอการยืนยัน', color: 'orange', icon: 'schedule' };
            case 'confirmed':
                return { label: 'ยืนยันแล้ว', color: 'green', icon: 'check_circle' };
            case 'cancelled':
                return { label: 'ยกเลิกแล้ว', color: 'red', icon: 'cancel' };
            default:
                return { label: status, color: 'gray', icon: 'help' };
        }
    };
    
    if (isLoading) {
        return (
            <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
                <div className={styles.LoadingContainer}>
                    <div className={styles.LoadingSpinner} />
                    <p>กำลังโหลดการจอง...</p>
                </div>
            </div>
        );
    }
    
    const pendingReservations = reservations.filter(r => r.status === 'pending');
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled');
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
            <div className={styles.Header}>
                <h2 className={styles.Title}>จัดการการจอง</h2>
                <button 
                    className={styles.RefreshButton}
                    onClick={onRefresh}
                    title="รีเฟรชรายการการจอง"
                >
                    <GoogleIcon iconType="refresh" size="small" />
                </button>
            </div>
            
            {reservations.length === 0 ? (
                <div className={styles.EmptyState}>
                    <div className={styles.EmptyIcon}>
                        <GoogleIcon iconType="shopping_cart" size="large" />
                    </div>
                    <h3>ยังไม่มีการจอง</h3>
                    <p>เมื่อมีลูกค้าจองสินค้าของคุณ รายการจะแสดงที่นี่</p>
                </div>
            ) : (
                <div className={styles.Content}>
                    <div className={styles.StatsBar}>
                        <div className={styles.StatItem}>
                            <span className={styles.StatLabel}>รอยืนยัน:</span>
                            <span className={`${styles.StatValue} ${styles.pending}`}>
                                {pendingReservations.length}
                            </span>
                        </div>
                        <div className={styles.StatItem}>
                            <span className={styles.StatLabel}>ยืนยันแล้ว:</span>
                            <span className={`${styles.StatValue} ${styles.confirmed}`}>
                                {confirmedReservations.length}
                            </span>
                        </div>
                        <div className={styles.StatItem}>
                            <span className={styles.StatLabel}>ยกเลิก:</span>
                            <span className={`${styles.StatValue} ${styles.cancelled}`}>
                                {cancelledReservations.length}
                            </span>
                        </div>
                    </div>
                    
                    <div className={styles.ReservationsList}>
                        {reservations.map((reservation) => {
                            const statusInfo = getStatusInfo(reservation.status);
                            const productPrice = reservation.product_price || 0;
                            const quantity = reservation.quantity || 0;
                            const totalPrice = productPrice * quantity;
                            
                            return (
                                <div key={reservation.reservation_id} className={styles.ReservationCard}>
                                    <div className={styles.ReservationHeader}>
                                        <div className={styles.ReservationInfo}>
                                            <h3 className={styles.ProductTitle}>
                                                {reservation.product_title}
                                            </h3>
                                            <div className={styles.CustomerInfo}>
                                                <GoogleIcon iconType="person" size="small" />
                                                <span>{reservation.user_name || `ลูกค้า #${reservation.user_id}`}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={`${styles.StatusBadge} ${styles[statusInfo.color]}`}>
                                            <GoogleIcon iconType={statusInfo.icon} size="small" />
                                            {statusInfo.label}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.ReservationDetails}>
                                        <div className={styles.DetailRow}>
                                            <div className={styles.DetailItem}>
                                                <GoogleIcon iconType="shopping_cart" size="small" />
                                                <span>จำนวน: {reservation.quantity} ชิ้น</span>
                                            </div>
                                            <div className={styles.DetailItem}>
                                                <GoogleIcon iconType="monetization_on" size="small" />
                                                <span>ราคาต่อชิ้น: {productsService.formatPrice(productPrice)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.DetailRow}>
                                            <div className={styles.DetailItem}>
                                                <GoogleIcon iconType="event" size="small" />
                                                <span>วันที่จอง: {formatDate(reservation.created_at)}</span>
                                            </div>
                                            <div className={styles.TotalPrice}>
                                                <span>ยอดรวม: {productsService.formatPrice(totalPrice)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.DetailRow}>
                                            <div className={styles.DetailItem}>
                                                <GoogleIcon iconType={reservation.option_of_delivery === 'pickup' ? 'store' : 'local_shipping'} size="small" />
                                                <span>{reservation.option_of_delivery === 'pickup' ? 'รับที่ร้าน' : 'จัดส่งถึงที่อยู่'}</span>
                                            </div>
                                            {reservation.option_of_delivery === 'pickup' && reservation.pickup_date && (
                                                <div className={styles.DetailItem}>
                                                    <GoogleIcon iconType="schedule" size="small" />
                                                    <span>วันที่รับ: {formatDate(reservation.pickup_date)}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {reservation.option_of_delivery === 'delivery' && reservation.shipping_address && (
                                            <div className={styles.ShippingAddress}>
                                                <GoogleIcon iconType="location_on" size="small" />
                                                <div className={styles.AddressContent}>
                                                    <span className={styles.AddressLabel}>ที่อยู่จัดส่ง:</span>
                                                    <span className={styles.AddressText}>{reservation.shipping_address}</span>
                                                </div>
                                            </div>
                                        )}

                                        {reservation.user_note && (
                                            <div className={styles.UserNote}>
                                                <GoogleIcon iconType="person" size="small" />
                                                <div className={styles.NoteContent}>
                                                    <span className={styles.NoteLabel}>หมายเหตุจากลูกค้า:</span>
                                                    <span className={styles.NoteText}>{reservation.user_note}</span>
                                                </div>
                                            </div>
                                        )}

                                        {reservation.seller_note && (
                                            <div className={styles.SellerNote}>
                                                <GoogleIcon iconType="store" size="small" />
                                                <div className={styles.NoteContent}>
                                                    <span className={styles.NoteLabel}>หมายเหตุจากผู้ขาย:</span>
                                                    <span className={styles.NoteText}>{reservation.seller_note}</span>
                                                </div>
                                            </div>
                                        )}

                                        {reservation.note && (
                                            <div className={styles.Note}>
                                                <GoogleIcon iconType="sticky_note_2" size="small" />
                                                <span>{reservation.note}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {reservation.status === 'pending' && (
                                        <div className={styles.ReservationActions}>
                                            <button 
                                                className={styles.CancelButton}
                                                onClick={() => onCancelReservation(reservation)}
                                                title="ยกเลิกการจอง"
                                            >
                                                <GoogleIcon iconType="cancel" size="small" />
                                                ยกเลิก
                                            </button>
                                            <button 
                                                className={styles.ConfirmButton}
                                                onClick={() => onConfirmReservation(reservation)}
                                                title="ยืนยันการจอง"
                                            >
                                                <GoogleIcon iconType="check_circle" size="small" />
                                                ยืนยัน
                                            </button>
                                        </div>
                                    )}
                                    
                                    {reservation.status === 'confirmed' && reservation.confirmed_at && (
                                        <div className={styles.ConfirmedInfo}>
                                            <GoogleIcon iconType="info" size="small" />
                                            <span>ยืนยันเมื่อ: {formatDate(reservation.confirmed_at)}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}