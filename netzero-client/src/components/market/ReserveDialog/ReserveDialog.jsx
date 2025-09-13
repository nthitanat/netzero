import React, { useEffect } from "react";
import styles from "./ReserveDialog.module.scss";
import useReserveDialog from "./useReserveDialog";
import ReserveDialogHandler from "./ReserveDialogHandler";
import { GoogleIcon } from "../../common";
import { productsService } from "../../../api";

export default function ReserveDialog({ 
    product, 
    isOpen = false,
    onClose,
    onReservationSuccess,
    theme = "market",
    className = "" 
}) {
    const { stateReserveDialog, setReserveDialog } = useReserveDialog({ isOpen, product });
    const handlers = ReserveDialogHandler(stateReserveDialog, setReserveDialog, product, onClose, onReservationSuccess);
    
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
                            src={product.images?.[0] || product.thumbnail} 
                            alt={product.title}
                            className={styles.ProductImage}
                        />
                        
                        <div className={styles.ProductDetails}>
                            <div className={styles.PriceDisplay}>
                                {productsService.formatPrice(product.price)}
                            </div>
                            
                            <div className={styles.StockInfo}>
                                <GoogleIcon iconType="inventory" size="small" className={styles.StockIcon} />
                                <span>คงเหลือ: {stateReserveDialog.availableQuantity} ชิ้น</span>
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
                    
                    <div className={styles.TotalSection}>
                        <div className={styles.TotalDisplay}>
                            <span className={styles.TotalLabel}>ยอดรวม:</span>
                            <span className={styles.TotalAmount}>
                                {productsService.formatPrice(product.price * stateReserveDialog.selectedQuantity)}
                            </span>
                        </div>
                    </div>
                    
                    {stateReserveDialog.reservationError && (
                        <div className={styles.ErrorAlert}>
                            <GoogleIcon iconType="error" size="medium" />
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
                            className={`${styles.ReserveButton} ${stateReserveDialog.selectedQuantity <= 0 || stateReserveDialog.selectedQuantity > stateReserveDialog.availableQuantity ? styles.Disabled : ''}`}
                            onClick={handlers.handleConfirmReservation}
                            disabled={stateReserveDialog.isReserving || stateReserveDialog.selectedQuantity <= 0 || stateReserveDialog.selectedQuantity > stateReserveDialog.availableQuantity}
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
