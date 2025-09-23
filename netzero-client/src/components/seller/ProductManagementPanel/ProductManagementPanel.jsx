import React from "react";
import styles from "./ProductManagementPanel.module.scss";
import { GoogleIcon } from "../../common";
import { productsService } from "../../../api";

export default function ProductManagementPanel({ 
    products = [],
    isLoading = false,
    selectedProduct = null,
    showProductModal = false,
    showDeleteConfirm = false,
    onCreateProduct,
    onEditProduct,
    onDeleteProduct,
    onConfirmDelete,
    onCancelDelete,
    onCloseModal,
    onProductSaved,
    onRefresh,
    theme = "seller",
    className = "" 
}) {
    
    if (isLoading) {
        return (
            <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
                <div className={styles.LoadingContainer}>
                    <div className={styles.LoadingSpinner} />
                    <p>กำลังโหลดสินค้า...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}>
            <div className={styles.Header}>
                <h2 className={styles.Title}>จัดการสินค้า</h2>
                <div className={styles.HeaderActions}>
                    <button 
                        className={styles.RefreshButton}
                        onClick={onRefresh}
                        title="รีเฟรชรายการสินค้า"
                    >
                        <GoogleIcon iconType="refresh" size="small" />
                    </button>
                    <button 
                        className={styles.CreateButton}
                        onClick={onCreateProduct}
                    >
                        <GoogleIcon iconType="add" size="small" />
                        เพิ่มสินค้าใหม่
                    </button>
                </div>
            </div>
            
            {products.length === 0 ? (
                <div className={styles.EmptyState}>
                    <div className={styles.EmptyIcon}>
                        <GoogleIcon iconType="inventory" size="large" />
                    </div>
                    <h3>ยังไม่มีสินค้า</h3>
                    <p>เริ่มต้นด้วยการเพิ่มสินค้าแรกของคุณ</p>
                    <button 
                        className={styles.CreateFirstButton}
                        onClick={onCreateProduct}
                    >
                        <GoogleIcon iconType="add" size="small" />
                        เพิ่มสินค้าแรก
                    </button>
                </div>
            ) : (
                <div className={styles.ProductsGrid}>
                    {products.map((product) => (
                        <div key={product.id} className={styles.ProductCard}>
                            <div className={styles.ProductImage}>
                                <img 
                                    src={productsService.getProductThumbnailUrl(product.id)}
                                    alt={product.title}
                                    onError={(e) => {
                                        e.target.src = '/assets/images/placeholder-product.jpg';
                                    }}
                                />
                                <div className={styles.ProductBadges}>
                                    <span className={`${styles.TypeBadge} ${styles[product.type]}`}>
                                        {product.type}
                                    </span>
                                    {product.stock_quantity === 0 && (
                                        <span className={styles.OutOfStockBadge}>
                                            หมด
                                        </span>
                                    )}
                                    {product.isRecommend && (
                                        <span className={styles.RecommendBadge}>
                                            แนะนำ
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.ProductInfo}>
                                <h3 className={styles.ProductTitle}>{product.title}</h3>
                                <p className={styles.ProductDescription}>
                                    {product.description.length > 100 
                                        ? `${product.description.substring(0, 100)}...`
                                        : product.description
                                    }
                                </p>
                                
                                <div className={styles.ProductMeta}>
                                    <div className={styles.MetaItem}>
                                        <GoogleIcon iconType="monetization_on" size="small" />
                                        <span>{productsService.formatPrice(product.price)}</span>
                                    </div>
                                    <div className={styles.MetaItem}>
                                        <GoogleIcon iconType="inventory" size="small" />
                                        <span>คงเหลือ: {product.stock_quantity}</span>
                                    </div>
                                    <div className={styles.MetaItem}>
                                        <GoogleIcon iconType="category" size="small" />
                                        <span>{product.category}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.ProductActions}>
                                <button 
                                    className={styles.EditButton}
                                    onClick={() => onEditProduct(product)}
                                    title="แก้ไขสินค้า"
                                >
                                    <GoogleIcon iconType="edit" size="small" />
                                </button>
                                <button 
                                    className={styles.DeleteButton}
                                    onClick={() => onDeleteProduct(product)}
                                    title="ลบสินค้า"
                                >
                                    <GoogleIcon iconType="delete" size="small" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className={styles.ModalOverlay}>
                    <div className={styles.DeleteModal}>
                        <div className={styles.DeleteModalHeader}>
                            <GoogleIcon iconType="warning" size="medium" className={styles.WarningIcon} />
                            <h3>ยืนยันการลบสินค้า</h3>
                        </div>
                        
                        <div className={styles.DeleteModalContent}>
                            <p>คุณต้องการลบสินค้านี้หรือไม่?</p>
                            <p className={styles.ProductName}>"{selectedProduct?.title}"</p>
                            <p className={styles.WarningText}>
                                การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </p>
                        </div>
                        
                        <div className={styles.DeleteModalActions}>
                            <button 
                                className={styles.CancelButton}
                                onClick={onCancelDelete}
                            >
                                ยกเลิก
                            </button>
                            <button 
                                className={styles.ConfirmDeleteButton}
                                onClick={onConfirmDelete}
                            >
                                <GoogleIcon iconType="delete" size="small" />
                                ลบสินค้า
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Product Modal would be implemented separately */}
            {/* This would be a complex form component for creating/editing products */}
        </div>
    );
}