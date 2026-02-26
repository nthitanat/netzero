import React from "react";
import styles from "./ProductManagementPanel.module.scss";
import { GoogleIcon } from "../../common";
import { productsService } from "../../../api";
import DeleteConfirmationDialog from "../DeleteConfirmationDialog/DeleteConfirmationDialog";

export default function ProductManagementPanel({ 
    products = [],
    isLoading = false,
    selectedProduct = null,
    showDeleteConfirm = false,
    onCreateProduct,
    onEditProduct,
    onDeleteProduct,
    onConfirmDelete,
    onCancelDelete,
    onRefresh,
    onAddToEvent,
    className = "" 
}) {
    // Pure presentation component - all state managed by parent
    
    if (isLoading) {
        return (
            <div className={`${styles.Container} ${className}`}>
                <div className={styles.LoadingContainer}>
                    <div className={styles.LoadingSpinner} />
                    <p>กำลังโหลดสินค้า...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`${styles.Container} ${className}`}>
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
                <div className={styles.ProductsList}>
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
                                
                                <div className={styles.ProductMeta}>
                                    <div className={styles.MetaItem}>
                                        <GoogleIcon iconType="monetization_on" size="small" />
                                        <span>{productsService.formatPrice(product.price)}</span>
                                    </div>
                                    <div className={styles.MetaItem}>
                                        <GoogleIcon iconType="inventory" size="small" />
                                        <span>คงเหลือทั้งหมด: {product.stock_quantity}</span>
                                    </div>
                                    <div className={styles.MetaItem}>
                                        <GoogleIcon iconType="inventory_2" size="small" />
                                        <span>ยังไม่จัดสรร: {product.unassigned_stock_quantity || 0}</span>
                                    </div>
                                    <div className={styles.MetaItem}>
                                        <GoogleIcon iconType="category" size="small" />
                                        <span>{product.category}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.ProductActions}>
                                <button 
                                    className={styles.AddToEventButton}
                                    onClick={() => onAddToEvent(product)}
                                    title="เพิ่มสินค้าไปยังอีเวนท์"
                                    disabled={!product.unassigned_stock_quantity || product.unassigned_stock_quantity === 0}
                                >
                                    <GoogleIcon iconType="event" size="small" />
                                </button>
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
            
            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={showDeleteConfirm}
                title="ยืนยันการลบสินค้า"
                message="คุณต้องการลบสินค้านี้หรือไม่?"
                itemName={selectedProduct?.title}
                warningText="การดำเนินการนี้ไม่สามารถย้อนกลับได้"
                confirmText="ลบสินค้า"
                cancelText="ยกเลิก"
                isLoading={false}
                onConfirm={onConfirmDelete}
                onCancel={onCancelDelete}
            />
        </div>
    );
}