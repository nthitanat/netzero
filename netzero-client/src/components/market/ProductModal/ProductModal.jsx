import React, { useEffect } from "react";
import styles from "./ProductModal.module.scss";
import useProductModal from "./useProductModal";
import ProductModalHandler from "./ProductModalHandler";
import { ImageSlideshow, GoogleIcon } from "../../common";
import { ReserveDialog } from "../";
import { productsService } from "../../../api";

export default function ProductModal({ 
    product, 
    isOpen = false,
    onClose,
    onReserve,
    onReservationSuccess,
    actionLabel = "จองสินค้า",
    theme = "market",
    className = "" 
}) {
    const { stateProductModal, setProductModal } = useProductModal({ isOpen });
    const handlers = ProductModalHandler(stateProductModal, setProductModal, product, onClose, onReserve, onReservationSuccess);
    
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
            
            <div className={styles.Modal}>
                <button 
                    className={styles.CloseButton}
                    onClick={handlers.handleClose}
                >
                    <GoogleIcon iconType="close" size="medium" />
                </button>
                
                <div className={styles.ModalContent}>
                    <div className={styles.ImageSection}>
                        <ImageSlideshow 
                            images={product.images}
                            alt={product.title}
                            className={styles.ProductSlideshow}
                        />
                        
                        <div className={styles.BadgeContainer}>
                            <div className={`${styles.CategoryBadge}`}>
                                {product.category}
                            </div>
                            {!product.inStock && (
                                <div className={`${styles.StatusBadge} ${styles.OutOfStock}`}>
                                    หมด
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className={styles.InfoSection}>
                        <div className={styles.ProductHeader}>
                            <h2 className={styles.ProductTitle}>{product.title}</h2>
                            <div className={styles.ProductPrice}>
                                {productsService.formatPrice(product.price)}
                            </div>
                        </div>
                        
                        <p className={styles.ProductDescription}>
                            {product.description}
                        </p>
                        
                        <div className={styles.ProductSpecs}>
                            <h3 className={styles.SpecsTitle}>รายละเอียดสินค้า</h3>
                            
                            <div className={styles.SpecsList}>
                                <div className={styles.SpecItem}>
                                    <GoogleIcon iconType="location_on" size="small" className={styles.SpecIcon} />
                                    <span className={styles.SpecLabel}>แหล่งผลิต:</span>
                                    <span className={styles.SpecValue}>{product.origin}</span>
                                </div>
                                
                                <div className={styles.SpecItem}>
                                    <GoogleIcon iconType="inventory" size="small" className={styles.SpecIcon} />
                                    <span className={styles.SpecLabel}>น้ำหนัก:</span>
                                    <span className={styles.SpecValue}>{product.weight}</span>
                                </div>
                                
                                <div className={styles.SpecItem}>
                                    <GoogleIcon iconType="star" size="small" className={styles.SpecIcon} />
                                    <span className={styles.SpecLabel}>หมวดหมู่:</span>
                                    <span className={styles.SpecValue}>{product.category}</span>
                                </div>
                                
                                <div className={styles.SpecItem}>
                                    <GoogleIcon 
                                        iconType={product.inStock ? "check_circle" : "warning"} 
                                        size="small" 
                                        className={styles.SpecIcon} 
                                    />
                                    <span className={styles.SpecLabel}>สถานะ:</span>
                                    <span className={`${styles.SpecValue} ${product.inStock ? styles.InStock : styles.OutOfStock}`}>
                                        {product.inStock ? "มีสินค้า" : "สินค้าหมด"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.ActionSection}>
                            <button
                                className={`${styles.ReserveButton} ${!product.inStock ? styles.Disabled : ''}`}
                                onClick={handlers.handleReserve}
                                disabled={!product.inStock || stateProductModal.isReserving}
                            >
                                {stateProductModal.isReserving ? (
                                    <>
                                        <div className={styles.LoadingSpinner} />
                                        กำลังจอง...
                                    </>
                                ) : product.inStock ? (
                                    <>
                                        <GoogleIcon iconType="shopping_cart" size="medium" />
                                        {actionLabel}
                                    </>
                                ) : (
                                    <>
                                        <GoogleIcon iconType="warning" size="medium" />
                                        สินค้าหมด
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Reserve Dialog */}
            <ReserveDialog
                product={product}
                isOpen={stateProductModal.showReserveDialog}
                onClose={handlers.handleCloseReserveDialog}
                onReservationSuccess={handlers.handleReservationSuccess}
                theme={theme}
            />
        </div>
    );
}
