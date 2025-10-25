import React, { useEffect } from "react";
import styles from "./ReserveDialog.module.scss";
import useReserveDialog from "./useReserveDialog";
import ReserveDialogHandler from "./ReserveDialogHandler";
import { GoogleIcon } from "../../common";
import { productsService } from "../../../api";
import { useAuth } from "../../../contexts/AuthContext";

export default function ReserveDialog({ 
    product, 
    isOpen = false,
    onClose,
    onReservationSuccess,
    onShowLogin,
    theme = "market",
    className = "" 
}) {
    const { isAuthenticated } = useAuth();
    const { stateReserveDialog, setReserveDialog, validateShippingAddress, validateUserNote, validatePickupDate } = useReserveDialog({ isOpen, product });
    const handlers = ReserveDialogHandler(stateReserveDialog, setReserveDialog, product, onClose, onReservationSuccess, onShowLogin, isAuthenticated, validateShippingAddress, validateUserNote, validatePickupDate);
    
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
    
    if (!product || !isOpen) {
        return null;
    }
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
            <div className={styles.Overlay} onClick={handlers.handleOverlayClick} />
            
            <div className={styles.Dialog}>
                <button 
                    className={styles.CloseButton}
                    onClick={handlers.handleClose}
                >
                    <GoogleIcon iconType="close" size="medium" />
                </button>
                
                <div className={styles.DialogContent}>
                    <div className={styles.Header}>
                        <h2 className={styles.Title}>จองสินค้า</h2>
                        <p className={styles.ProductName}>{product.title}</p>
                    </div>
                    
                    <div className={styles.ProductInfo}>
                        <img 
                            src={productsService.getProductThumbnailUrl(product.id)} 
                            alt={product.title}
                            className={styles.ProductImage}
                        />
                        
                        <div className={styles.ProductDetails}>
                            <div className={styles.PriceDisplay}>
                                {productsService.formatPrice(product.price)}
                            </div>
                            
                            <div className={styles.StockInfo}>
                                <GoogleIcon iconType="inventory" size="small" className={styles.StockIcon} />
                                <span>คงเหลือ: {product.stock_quantity} ชิ้น</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.QuantitySection}>
                        <label className={styles.QuantityLabel}>จำนวนที่ต้องการจอง</label>
                        
                        <div className={styles.QuantityControls}>
                            <button
                                className={`${styles.QuantityButton} ${stateReserveDialog.selectedQuantity <= 1 ? styles.Disabled : ''}`}
                                onClick={handlers.handleDecreaseQuantity}
                                disabled={stateReserveDialog.selectedQuantity <= 1}
                            >
                                <GoogleIcon iconType="remove" size="small" />
                            </button>
                            
                            <input
                                type="number"
                                value={stateReserveDialog.selectedQuantity}
                                onChange={handlers.handleQuantityInputChange}
                                min="1"
                                max={stateReserveDialog.availableQuantity}
                                className={styles.QuantityInput}
                            />
                            
                            <button
                                className={`${styles.QuantityButton} ${stateReserveDialog.selectedQuantity >= stateReserveDialog.availableQuantity ? styles.Disabled : ''}`}
                                onClick={handlers.handleIncreaseQuantity}
                                disabled={stateReserveDialog.selectedQuantity >= stateReserveDialog.availableQuantity}
                            >
                                <GoogleIcon iconType="add" size="small" />
                            </button>
                        </div>
                        
                        {stateReserveDialog.quantityError && (
                            <div className={styles.ErrorMessage}>
                                <GoogleIcon iconType="warning" size="small" />
                                {stateReserveDialog.quantityError}
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.DeliverySection}>
                        <label className={styles.DeliveryLabel}>วิธีการรับสินค้า</label>
                        
                        <div className={styles.DeliveryOptions}>
                            <label className={styles.DeliveryOption}>
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value="delivery"
                                    checked={stateReserveDialog.optionOfDelivery === 'delivery'}
                                    onChange={handlers.handleDeliveryOptionChange}
                                    className={styles.DeliveryRadio}
                                />
                                <div className={styles.DeliveryOptionContent}>
                                    <GoogleIcon iconType="local_shipping" size="small" />
                                    <span>จัดส่งถึงที่อยู่</span>
                                </div>
                            </label>
                            
                            <label className={styles.DeliveryOption}>
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value="pickup"
                                    checked={stateReserveDialog.optionOfDelivery === 'pickup'}
                                    onChange={handlers.handleDeliveryOptionChange}
                                    className={styles.DeliveryRadio}
                                />
                                <div className={styles.DeliveryOptionContent}>
                                    <GoogleIcon iconType="store" size="small" />
                                    <span>รับที่ร้าน</span>
                                </div>
                            </label>
                            
                            <label className={styles.DeliveryOption}>
                                <input
                                    type="radio"
                                    name="deliveryOption"
                                    value="event"
                                    checked={stateReserveDialog.optionOfDelivery === 'event'}
                                    onChange={handlers.handleDeliveryOptionChange}
                                    className={styles.DeliveryRadio}
                                />
                                <div className={styles.DeliveryOptionContent}>
                                    <GoogleIcon iconType="event" size="small" />
                                    <span>รับที่กิจกรรม</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {stateReserveDialog.optionOfDelivery === 'event' && (
                        <div className={styles.EventSection}>
                            <label className={styles.EventLabel}>เลือกกิจกรรม</label>
                            
                            {stateReserveDialog.isLoadingEvents ? (
                                <div className={styles.LoadingContainer}>
                                    <div className={styles.LoadingSpinner} />
                                    <span>กำลังโหลดรายการกิจกรรม...</span>
                                </div>
                            ) : stateReserveDialog.availableEvents.length === 0 ? (
                                <div className={styles.NoEventsMessage}>
                                    <GoogleIcon iconType="info" size="small" className={styles.InfoIcon} />
                                    <span>ไม่มีกิจกรรมที่เกี่ยวข้องกับสินค้านี้</span>
                                </div>
                            ) : (
                                <>
                                    <select
                                        value={stateReserveDialog.selectedEvent?.event_id || ''}
                                        onChange={handlers.handleEventSelection}
                                        className={`${styles.EventSelect} ${stateReserveDialog.selectedEventError ? styles.Error : ''}`}
                                    >
                                        <option value="">-- กรุณาเลือกกิจกรรม --</option>
                                        {stateReserveDialog.availableEvents.map(eventProduct => (
                                            <option key={eventProduct.event_id} value={eventProduct.event_id}>
                                                {eventProduct.event_title} (คงเหลือ: {eventProduct.stock_quantity} ชิ้น | ราคา: ฿{eventProduct.event_price.toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {stateReserveDialog.selectedEvent && (
                                        <div className={styles.EventInfo}>
                                            <GoogleIcon iconType="info" size="small" className={styles.InfoIcon} />
                                            <div className={styles.EventDetails}>
                                                <p><strong>กิจกรรม:</strong> {stateReserveDialog.selectedEvent.event_title}</p>
                                                <p><strong>สถานที่:</strong> {stateReserveDialog.selectedEvent.event_location || 'ไม่ระบุ'}</p>
                                                <p><strong>วันที่:</strong> {new Date(stateReserveDialog.selectedEvent.event_date).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}</p>
                                                <p><strong>ราคาพิเศษ:</strong> ฿{stateReserveDialog.selectedEvent.event_price.toLocaleString()}</p>
                                                <p><strong>คงเหลือ:</strong> {stateReserveDialog.selectedEvent.stock_quantity} ชิ้น</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {stateReserveDialog.selectedEventError && (
                                <div className={styles.ErrorMessage}>
                                    <GoogleIcon iconType="warning" size="small" />
                                    {stateReserveDialog.selectedEventError}
                                </div>
                            )}
                        </div>
                    )}

                    {stateReserveDialog.optionOfDelivery === 'delivery' && (
                        <div className={styles.ShippingSection}>
                            <label className={styles.ShippingLabel}>ที่อยู่จัดส่ง</label>
                            
                            <textarea
                                value={stateReserveDialog.shippingAddress}
                                onChange={handlers.handleShippingAddressChange}
                                placeholder="กรุณาระบุที่อยู่สำหรับจัดส่งสินค้า เช่น บ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                                className={`${styles.ShippingInput} ${stateReserveDialog.shippingAddressError ? styles.Error : ''}`}
                                rows={3}
                                maxLength={500}
                            />
                            
                            {stateReserveDialog.shippingAddressError && (
                                <div className={styles.ErrorMessage}>
                                    <GoogleIcon iconType="warning" size="small" />
                                    {stateReserveDialog.shippingAddressError}
                                </div>
                            )}
                            
                            <div className={styles.ShippingNote}>
                                <GoogleIcon iconType="info" size="small" className={styles.InfoIcon} />
                                <span>กรุณาระบุที่อยู่ให้ครบถ้วนและชัดเจนเพื่อให้การจัดส่งเป็นไปอย่างถูกต้อง</span>
                            </div>
                        </div>
                    )}

                    {stateReserveDialog.optionOfDelivery === 'pickup' && (
                        <div className={styles.PickupSection}>
                            <label className={styles.PickupLabel}>วันที่ต้องการรับสินค้า</label>
                            
                            <input
                                type="date"
                                value={stateReserveDialog.pickupDate}
                                onChange={handlers.handlePickupDateChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`${styles.PickupDateInput} ${stateReserveDialog.pickupDateError ? styles.Error : ''}`}
                            />
                            
                            {stateReserveDialog.pickupDateError && (
                                <div className={styles.ErrorMessage}>
                                    <GoogleIcon iconType="warning" size="small" />
                                    {stateReserveDialog.pickupDateError}
                                </div>
                            )}
                            
                            <div className={styles.PickupNote}>
                                <GoogleIcon iconType="info" size="small" className={styles.InfoIcon} />
                                <span>กรุณาเลือกวันที่ต้องการมารับสินค้าที่ร้าน</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.UserNoteSection}>
                        <label className={styles.UserNoteLabel}>หมายเหตุเพิ่มเติม (ไม่บังคับ)</label>
                        
                        <textarea
                            value={stateReserveDialog.userNote}
                            onChange={handlers.handleUserNoteChange}
                            placeholder="ข้อมูลเพิ่มเติมหรือคำขอพิเศษ เช่น ช่วงเวลาที่สะดวกติดต่อ หรือข้อกำหนดพิเศษ"
                            className={`${styles.UserNoteInput} ${stateReserveDialog.userNoteError ? styles.Error : ''}`}
                            rows={2}
                            maxLength={1000}
                        />
                        
                        {stateReserveDialog.userNoteError && (
                            <div className={styles.ErrorMessage}>
                                <GoogleIcon iconType="warning" size="small" />
                                {stateReserveDialog.userNoteError}
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.TotalSection}>
                        <div className={styles.TotalDisplay}>
                            <span className={styles.TotalLabel}>ยอดรวม:</span>
                            <span className={styles.TotalAmount}>
                                {productsService.formatPrice(
                                    (stateReserveDialog.optionOfDelivery === 'event' && stateReserveDialog.eventPrice
                                        ? stateReserveDialog.eventPrice
                                        : product.price
                                    ) * stateReserveDialog.selectedQuantity
                                )}
                            </span>
                        </div>
                        {stateReserveDialog.optionOfDelivery === 'event' && stateReserveDialog.eventPrice && (
                            <div className={styles.PriceNote}>
                                <GoogleIcon iconType="info" size="small" className={styles.InfoIcon} />
                                <span>ราคาพิเศษสำหรับกิจกรรม (ราคาปกติ: {productsService.formatPrice(product.price)})</span>
                            </div>
                        )}
                    </div>
                    
                    {stateReserveDialog.reservationError && (
                        <div className={styles.ErrorMessage}>
                            <GoogleIcon iconType="error" size="small" />
                            <span>{stateReserveDialog.reservationError}</span>
                        </div>
                    )}
                    
                    <div className={styles.ActionSection}>
                        <button
                            className={styles.CancelButton}
                            onClick={handlers.handleClose}
                            disabled={stateReserveDialog.isReserving}
                        >
                            ยกเลิก
                        </button>
                        
                        <button
                            className={`${styles.ReserveButton} ${
                                stateReserveDialog.selectedQuantity <= 0 || 
                                stateReserveDialog.selectedQuantity > stateReserveDialog.availableQuantity ||
                                (stateReserveDialog.optionOfDelivery === 'delivery' && !stateReserveDialog.shippingAddress.trim()) ||
                                (stateReserveDialog.optionOfDelivery === 'pickup' && !stateReserveDialog.pickupDate.trim()) ||
                                (stateReserveDialog.optionOfDelivery === 'event' && !stateReserveDialog.selectedEvent)
                                ? styles.Disabled : ''
                            }`}
                            onClick={handlers.handleConfirmReservation}
                            disabled={
                                stateReserveDialog.isReserving || 
                                stateReserveDialog.selectedQuantity <= 0 || 
                                stateReserveDialog.selectedQuantity > stateReserveDialog.availableQuantity ||
                                (stateReserveDialog.optionOfDelivery === 'delivery' && !stateReserveDialog.shippingAddress.trim()) ||
                                (stateReserveDialog.optionOfDelivery === 'pickup' && !stateReserveDialog.pickupDate.trim()) ||
                                (stateReserveDialog.optionOfDelivery === 'event' && !stateReserveDialog.selectedEvent)
                            }
                        >
                            
                            {stateReserveDialog.isReserving ? (
                                <>
                                    <div className={styles.LoadingSpinner} />
                                    กำลังจอง...
                                </>
                            ) : (
                                <>
                                    <GoogleIcon iconType="shopping_cart" size="medium" />
                                    ยืนยันการจอง
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
