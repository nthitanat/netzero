import React from "react";
import styles from "./ProductCard.module.scss";
import useProductCard from "./useProductCard";
import ProductCardHandler from "./ProductCardHandler";
import { ItemCard, GoogleIcon } from "../../common";
import { productsService } from "../../../api";

export default function ProductCard({ 
    product, 
    onProductClick,
    onReserveClick,
    actionLabel = "จองสินค้า",
    theme = "market",
    className = "" 
}) {
    const { stateProductCard, setProductCard } = useProductCard();
    const productHandlers = ProductCardHandler(stateProductCard, setProductCard, product, onProductClick, onReserveClick);
    
    // Debug: Check what handlers are available
    console.log("ProductCard handlers:", Object.keys(productHandlers || {}));
    
    const productBadges = [];
    
    // Add out of stock badge if not in stock
    if (!product.inStock) {
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

    const renderProductContent = (item, state, itemHandlers) => (
        <div className={styles.ProductContent}>
            <div className={styles.ProductHeader}>
                <h3 className={styles.ProductTitle}>{item.title}</h3>
                <div className={styles.ProductPrice}>
                    {productsService.formatPrice(item.price)}
                </div>
            </div>
            
            <p className={styles.ProductDescription}>
                {item.description}
            </p>
            
            <div className={styles.ProductDetails}>
                <div className={styles.DetailItem}>
                    <GoogleIcon iconType="location_on" size="small" className={styles.DetailIcon} />
                    <span>{item.origin}</span>
                </div>
                <div className={styles.DetailItem}>
                    <GoogleIcon iconType="inventory" size="small" className={styles.DetailIcon} />
                    <span>{item.weight}</span>
                </div>
            </div>
            
            <div className={styles.ProductActions}>
                <button
                    className={`${styles.ReserveButton} ${!item.inStock ? styles.Disabled : ''}`}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (productHandlers && productHandlers.handleReserveClick) {
                            productHandlers.handleReserveClick(event);
                        } else {
                            console.error("handleReserveClick not available in ProductCard handlers:", productHandlers);
                            alert("Reserve function not available");
                        }
                    }}
                    disabled={!item.inStock}
                >
                    {item.inStock ? (
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
    );
    
    return (
        <ItemCard
            item={product}
            onItemClick={productHandlers.handleProductClick}
            config={{
                showThumbnail: true,
                thumbnailHeight: 240,
                borderRadius: 24
            }}
            badges={productBadges}
            renderContent={renderProductContent}
            className={`${styles.Container} ${styles[`${theme}-theme`]} ${className}`}
        />
    );
}
