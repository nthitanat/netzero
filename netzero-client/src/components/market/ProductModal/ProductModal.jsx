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
    
    // Create a product object with proper image URLs and field mappings
    const productWithImages = product ? {
        ...product,
        images: [
            productsService.getProductThumbnailUrl(product.id),
            productsService.getProductCoverUrl(product.id)
        ],
        inStock: product.stock_quantity > 0 // Convert stock_quantity to inStock boolean
    } : null;
    
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
    
    if (!productWithImages || !isOpen) {
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
                            images={productWithImages.images}
                            alt={productWithImages.title}
                            className={styles.ProductSlideshow}
                        />
                        
                        <div className={styles.BadgeContainer}>
                            <div className={`${styles.CategoryBadge}`}>
                                {productWithImages.category}
                            </div>
                            {!productWithImages.inStock && (
                                <div className={`${styles.StatusBadge} ${styles.OutOfStock}`}>
                                    หมด
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className={styles.InfoSection}>
                        <div className={styles.ProductHeader}>
                            <h2 className={styles.ProductTitle}>{productWithImages.title}</h2>
                            <div className={styles.ProductPrice}>
                                {productsService.formatPrice(productWithImages.price)}
                            </div>
                        </div>
                        
                        <p className={styles.ProductDescription}>
                            {productWithImages.description}
                        </p>
                        
                        <div className={styles.ProductSpecs}>
                            <h3 className={styles.SpecsTitle}>รายละเอียดสินค้า</h3>
                            
                            <div className={styles.SpecsList}>
                                <div className={styles.SpecItem}>
                                    <GoogleIcon iconType="location_on" size="small" className={styles.SpecIcon} />
                                    <span className={styles.SpecLabel}>ที่อยู่:</span>
                                    <span className={styles.SpecValue}>{productWithImages.address || 'ไม่ระบุ'}</span>
                                </div>
                                
                                <div className={styles.SpecItem}>
                                    <GoogleIcon iconType="inventory" size="small" className={styles.SpecIcon} />
                                    <span className={styles.SpecLabel}>คงเหลือ:</span>
                                    <span className={styles.SpecValue}>{productWithImages.stock_quantity || 0} ชิ้น</span>
                                </div>
                                
                                <div className={styles.SpecItem}>
                                    <GoogleIcon iconType="star" size="small" className={styles.SpecIcon} />
                                    <span className={styles.SpecLabel}>หมวดหมู่:</span>
                                    <span className={styles.SpecValue}>{productWithImages.category}</span>
                                </div>
                                
                                <div className={styles.SpecItem}>
                                    <GoogleIcon iconType="category" size="small" className={styles.SpecIcon} />
                                    <span className={styles.SpecLabel}>ประเภท:</span>
                                    <span className={styles.SpecValue}>{productWithImages.type}</span>
                                </div>
                                
                                <div className={styles.SpecItem}>
                                    <GoogleIcon 
                                        iconType={productWithImages.inStock ? "check_circle" : "warning"} 
                                        size="small" 
                                        className={styles.SpecIcon} 
                                    />
                                    <span className={styles.SpecLabel}>สถานะ:</span>
                                    <span className={`${styles.SpecValue} ${productWithImages.inStock ? styles.InStock : styles.OutOfStock}`}>
                                        {productWithImages.inStock ? "มีสินค้า" : "สินค้าหมด"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.ActionSection}>
                            <button
                                className={`${styles.ReserveButton} ${!productWithImages.inStock ? styles.Disabled : ''}`}
                                onClick={handlers.handleReserve}
                                disabled={!productWithImages.inStock || stateProductModal.isReserving}
                            >
                                {stateProductModal.isReserving ? (
                                    <>
                                        <div className={styles.LoadingSpinner} />
                                        กำลังจอง...
                                    </>
                                ) : productWithImages.inStock ? (
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
                product={productWithImages}
                isOpen={stateProductModal.showReserveDialog}
                onClose={handlers.handleCloseReserveDialog}
                onReservationSuccess={handlers.handleReservationSuccess}
                theme={theme}
            />
        </div>
    );
}
