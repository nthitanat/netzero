import React from "react";
import styles from "./ProductCard.module.scss";
import ProductCardHandler from "./ProductCardHandler";
import { GoogleIcon, ImageSlideshow } from "../../common";
import { productsService } from "../../../api";

export default function ProductCard({ 
    product, 
    onProductClick,
    onReserveClick,
    actionLabel = "จองสินค้า",
    theme = "market",
    className = "" 
}) {
    // Create handlers using ProductCardHandler without state
    const productHandlers = ProductCardHandler(product, onProductClick, onReserveClick);
    
    // Create a product object with proper image URLs
    const productWithImages = {
        ...product,
        thumbnail: productsService.getProductThumbnailUrl(product.id),
        images: [productsService.getProductThumbnailUrl(product.id)],
        inStock: product.stock_quantity > 0 // Convert stock_quantity to inStock boolean
    };
    
    const productBadges = [];
    
    // Add out of stock badge if not in stock
    if (!productWithImages.inStock) {
        productBadges.push({
            text: "หมด",
            position: "TopRight",
            style: { backgroundColor: "rgba(255, 149, 0, 0.9)", color: "white" }
        });
    }
    
    // Add category badge
    productBadges.push({
        text: product.category,
        position: "TopLeft",
        className: `${styles.CategoryBadge} ${styles[theme]}`
    });

    return (
        <div 
            className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}
            onClick={productHandlers.handleProductClick}
        >
            {/* Thumbnail section with slideshow and badges */}
            <div className={styles.ThumbnailContainer}>
                <ImageSlideshow 
                    images={productWithImages.images}
                    alt={productWithImages.title}
                    className={styles.ProductSlideshow}
                />
                
                {productBadges.map((badge, index) => (
                    <div 
                        key={index}
                        className={`${styles.Badge} ${styles[`Badge${badge.position}`]} ${badge.className || ''}`}
                        style={badge.style}
                    >
                        {badge.icon && (
                            <GoogleIcon iconType={badge.icon} size="small" />
                        )}
                        {badge.text}
                    </div>
                ))}
            </div>
            
            {/* Product content section */}
            <div className={styles.ContentContainer}>
                <div className={styles.ProductContent}>
                    <div className={styles.ProductHeader}>
                        <h3 className={styles.ProductTitle}>{productWithImages.title}</h3>
                        <div className={styles.ProductPrice}>
                            {productsService.formatPrice(productWithImages.price)}
                        </div>
                    </div>
                    
                    <p className={styles.ProductDescription}>
                        {productWithImages.description}
                    </p>
                    
                    <div className={styles.ProductDetails}>
                        <div className={styles.DetailItem}>
                            <GoogleIcon iconType="location_on" size="small" className={styles.DetailIcon} />
                            <span>{productWithImages.address || 'ไม่ระบุ'}</span>
                        </div>
                        <div className={styles.DetailItem}>
                            <GoogleIcon iconType="inventory" size="small" className={styles.DetailIcon} />
                            <span>คงเหลือ: {productWithImages.stock_quantity || 0}</span>
                        </div>
                    </div>
                    
                    <div className={styles.ProductActions}>
                        <button
                            className={`${styles.ReserveButton} ${!productWithImages.inStock ? styles.Disabled : ''}`}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                productHandlers.handleReserveClick(event);
                            }}
                            disabled={!productWithImages.inStock}
                        >
                            {productWithImages.inStock ? (
                                <>
                                    <GoogleIcon iconType="shopping_cart" size="small" />
                                    {actionLabel}
                                </>
                            ) : (
                                <>
                                    <GoogleIcon iconType="warning" size="small" />
                                    สินค้าหมด
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
