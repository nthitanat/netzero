import React, { useEffect } from "react";
import styles from "./ExchangeDialog.module.scss";
import { GoogleIcon } from "../../common";
import { productsService } from "../../../api";

export default function ExchangeDialog({ 
    product, 
    isOpen = false,
    onClose,
    onExchangeSuccess,
    theme = "barter",
    className = "" 
}) {
    
    // Add keyboard event listener for Escape key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
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
    }, [isOpen, onClose]);
    
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleExchange = () => {
        // Dummy implementation - will be replaced with real exchange logic later
        console.log("Exchange requested for product:", product);
        
        // Simulate successful exchange
        if (onExchangeSuccess) {
            onExchangeSuccess({
                product,
                exchangeData: {
                    id: Date.now(),
                    productId: product?.id,
                    productTitle: product?.title,
                    status: "pending",
                    timestamp: new Date().toISOString()
                }
            });
        }
    };
    
    if (!product || !isOpen) {
        return null;
    }
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
            <div className={styles.Overlay} onClick={handleOverlayClick} />
            
            <div className={styles.Dialog}>
                <button 
                    className={styles.CloseButton}
                    onClick={onClose}
                >
                    <GoogleIcon iconType="close" size="medium" />
                </button>
                
                <div className={styles.DialogContent}>
                    <div className={styles.Header}>
                        <h2 className={styles.Title}>แลกเปลี่ยนสินค้า</h2>
                        <p className={styles.ProductName}>{product.title}</p>
                    </div>
                    
                    <div className={styles.ProductInfo}>
                        <img 
                            src={productsService.getProductThumbnailUrl(product.id)} 
                            alt={product.title}
                            className={styles.ProductImage}
                        />
                        
                        <div className={styles.ProductDetails}>
                            <div className={styles.ExchangeValue}>
                                <span className={styles.Label}>มูลค่าการแลกเปลี่ยน:</span>
                                <span className={styles.Value}>
                                    {productsService.formatPrice(product.price)}
                                </span>
                            </div>
                            
                            <div className={styles.StockInfo}>
                                <GoogleIcon iconType="inventory" size="small" className={styles.StockIcon} />
                                <span>คงเหลือ: {product.stock_quantity} ชิ้น</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.ExchangeSection}>
                        <div className={styles.PlaceholderContent}>
                            <div className={styles.ExchangeIcon}>
                                <GoogleIcon iconType="swap_horiz" size="large" />
                            </div>
                            <h3>ฟีเจอร์แลกเปลี่ยนจะเปิดใช้งานเร็วๆ นี้</h3>
                            <p>ขณะนี้ระบบแลกเปลี่ยนสินค้ายังอยู่ในขั้นตอนการพัฒนา</p>
                            <p className={styles.SubText}>
                                คุณจะสามารถนำสินค้าของคุณมาแลกเปลี่ยนกับสินค้าอื่นๆ ได้ในเร็วๆ นี้
                            </p>
                        </div>
                    </div>
                    
                    <div className={styles.ActionSection}>
                        <button
                            className={styles.CancelButton}
                            onClick={onClose}
                        >
                            ปิด
                        </button>
                        
                        <button
                            className={styles.ExchangeButton}
                            onClick={handleExchange}
                        >
                            <GoogleIcon iconType="swap_horiz" size="medium" />
                            ทดสอบการแลกเปลี่ยน
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}