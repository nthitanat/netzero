import React, { useEffect } from "react";
import styles from "./ReservationSuccessModal.module.scss";
import useReservationSuccessModal from "./useReservationSuccessModal";
import ReservationSuccessModalHandler from "./ReservationSuccessModalHandler";
import { GoogleIcon } from "../../common";

export default function ReservationSuccessModal({ 
    isOpen = false,
    reservationData = null,
    onClose,
    theme = "market",
    className = "" 
}) {
    const { stateReservationSuccessModal, setReservationSuccessModal } = useReservationSuccessModal({ isOpen, reservationData });
    const handlers = ReservationSuccessModalHandler(stateReservationSuccessModal, setReservationSuccessModal, onClose);
    
    // Add keyboard event listener for Escape key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && isOpen) {
                handlers.handleKeyDown(event);
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset"; // Restore scrolling
        };
    }, [isOpen, handlers]);
    
    if (!isOpen || !reservationData) {
        return null;
    }

    const { transaction, updatedProduct, reservedQuantity, successMessage } = reservationData;
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
            <div className={styles.Overlay} onClick={handlers.handleOverlayClick} />
            
            <div className={styles.Modal}>
                <div className={styles.ModalContent}>
                    {/* Success Icon Header */}
                    <div className={styles.SuccessHeader}>
                        <div className={styles.SuccessIconContainer}>
                            <GoogleIcon 
                                iconType="check_circle" 
                                size="large" 
                                className={styles.SuccessIcon}
                            />
                        </div>
                        <h2 className={styles.SuccessTitle}>จองสินค้าเรียบร้อยแล้ว!</h2>
                        <p className={styles.SuccessMessage}>
                            {successMessage || `จองสินค้า "${updatedProduct?.title}" จำนวน ${reservedQuantity} ชิ้น เรียบร้อยแล้ว!`}
                        </p>
                    </div>

                    {/* Reservation Details */}
                    <div className={styles.ReservationDetails}>
                        <h3 className={styles.DetailsTitle}>รายละเอียดการจอง</h3>
                        
                        <div className={styles.DetailsList}>
                            {/* Reservation ID */}
                            <div className={styles.DetailItem}>
                                <div className={styles.DetailLabel}>
                                    <GoogleIcon iconType="confirmation_number" size="small" />
                                    <span>รหัสการจอง</span>
                                </div>
                                <div className={styles.DetailValue}>
                                    #{transaction?.id || 'N/A'}
                                </div>
                            </div>

                            {/* User ID */}
                            <div className={styles.DetailItem}>
                                <div className={styles.DetailLabel}>
                                    <GoogleIcon iconType="person" size="small" />
                                    <span>รหัสผู้ใช้</span>
                                </div>
                                <div className={styles.DetailValue}>
                                    {transaction?.user_id || 'N/A'}
                                </div>
                            </div>

                            {/* Product Name */}
                            <div className={styles.DetailItem}>
                                <div className={styles.DetailLabel}>
                                    <GoogleIcon iconType="inventory_2" size="small" />
                                    <span>สินค้า</span>
                                </div>
                                <div className={styles.DetailValue}>
                                    {updatedProduct?.title || transaction?.product_name || 'N/A'}
                                </div>
                            </div>

                            {/* Product ID */}
                            <div className={styles.DetailItem}>
                                <div className={styles.DetailLabel}>
                                    <GoogleIcon iconType="tag" size="small" />
                                    <span>รหัสสินค้า</span>
                                </div>
                                <div className={styles.DetailValue}>
                                    {transaction?.product_id || 'N/A'}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className={styles.DetailItem}>
                                <div className={styles.DetailLabel}>
                                    <GoogleIcon iconType="numbers" size="small" />
                                    <span>จำนวน</span>
                                </div>
                                <div className={styles.DetailValue}>
                                    {reservedQuantity || transaction?.quantity || 'N/A'} ชิ้น
                                </div>
                            </div>

                            {/* Unit Price */}
                            <div className={styles.DetailItem}>
                                <div className={styles.DetailLabel}>
                                    <GoogleIcon iconType="price_change" size="small" />
                                    <span>ราคาต่อหน่วย</span>
                                </div>
                                <div className={styles.DetailValue}>
                                    {transaction?.unitPrice ? `฿${transaction.unitPrice.toLocaleString()}` : 'N/A'}
                                </div>
                            </div>

                            {/* Total Price */}
                            <div className={`${styles.DetailItem} ${styles.TotalPrice}`}>
                                <div className={styles.DetailLabel}>
                                    <GoogleIcon iconType="payments" size="small" />
                                    <span>ราคารวม</span>
                                </div>
                                <div className={styles.DetailValue}>
                                    ฿{transaction?.totalPrice?.toLocaleString() || 'N/A'}
                                </div>
                            </div>

                            {/* Delivery Option */}
                            <div className={styles.DetailItem}>
                                <div className={styles.DetailLabel}>
                                    <GoogleIcon 
                                        iconType={transaction?.option_of_delivery === 'pickup' ? 'store' : 'local_shipping'} 
                                        size="small" 
                                    />
                                    <span>วิธีรับสินค้า</span>
                                </div>
                                <div className={styles.DetailValue}>
                                    {transaction?.option_of_delivery === 'pickup' ? 'รับที่ร้าน' : 'จัดส่งถึงที่อยู่'}
                                </div>
                            </div>

                            {/* Shipping Address (if delivery) */}
                            {transaction?.shipping_address && (
                                <div className={styles.DetailItem}>
                                    <div className={styles.DetailLabel}>
                                        <GoogleIcon iconType="location_on" size="small" />
                                        <span>ที่อยู่จัดส่ง</span>
                                    </div>
                                    <div className={styles.DetailValue}>
                                        {transaction.shipping_address}
                                    </div>
                                </div>
                            )}

                            {/* Pickup Date (if pickup) */}
                            {transaction?.pickup_date && (
                                <div className={styles.DetailItem}>
                                    <div className={styles.DetailLabel}>
                                        <GoogleIcon iconType="event" size="small" />
                                        <span>วันที่รับสินค้า</span>
                                    </div>
                                    <div className={styles.DetailValue}>
                                        {new Date(transaction.pickup_date).toLocaleDateString('th-TH')}
                                    </div>
                                </div>
                            )}

                            {/* User Note (if provided) */}
                            {transaction?.user_note && (
                                <div className={styles.DetailItem}>
                                    <div className={styles.DetailLabel}>
                                        <GoogleIcon iconType="note" size="small" />
                                        <span>หมายเหตุ</span>
                                    </div>
                                    <div className={styles.DetailValue}>
                                        {transaction.user_note}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Next Steps Info */}
                    <div className={styles.NextStepsSection}>
                        <div className={styles.NextStepsHeader}>
                            <GoogleIcon iconType="info" size="small" className={styles.InfoIcon} />
                            <h4>ขั้นตอนต่อไป</h4>
                        </div>
                        <div className={styles.NextStepsList}>
                            <div className={styles.NextStep}>
                                <GoogleIcon iconType="phone" size="small" />
                                <span>เราจะติดต่อกลับเพื่อยืนยันการจองในเร็วๆ นี้</span>
                            </div>
                            <div className={styles.NextStep}>
                                <GoogleIcon iconType="payment" size="small" />
                                <span>เตรียมเงินสำหรับชำระเมื่อรับสินค้า</span>
                            </div>
                            {transaction?.option_of_delivery === 'pickup' ? (
                                <div className={styles.NextStep}>
                                    <GoogleIcon iconType="store" size="small" />
                                    <span>มารับสินค้าที่ร้านในวันที่กำหนด</span>
                                </div>
                            ) : (
                                <div className={styles.NextStep}>
                                    <GoogleIcon iconType="local_shipping" size="small" />
                                    <span>รอรับสินค้าที่ที่อยู่ที่ระบุไว้</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className={styles.ActionSection}>
                        <button
                            className={styles.CloseButton}
                            onClick={handlers.handleClose}
                        >
                            <GoogleIcon iconType="done" size="medium" />
                            เรียบร้อย
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}