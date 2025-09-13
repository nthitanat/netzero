import React from "react";
import styles from "./ProductListCard.module.scss";
import useProductListCard from "./useProductListCard";
import ProductListCardHandler from "./ProductListCardHandler";

export default function ProductListCard({ 
    products = [],
    selectedProduct = null,
    onProductClick,
    onProductMapView,
    theme = "market"
}) {
    const { stateProductListCard, setProductListCard } = useProductListCard({
        selectedProduct
    });
    const handlers = ProductListCardHandler(stateProductListCard, setProductListCard, {
        onProductClick,
        onProductMapView
    });
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]}`}>
            <div className={styles.Header}>
                <h2 className={styles.Title}>รายการสินค้า</h2>
                <div className={styles.Count}>
                    {products.length} รายการ
                </div>
            </div>
            
            <div className={styles.ProductList}>
                {products.length === 0 ? (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>📍</div>
                        <p className={styles.EmptyText}>ไม่พบสินค้าในพื้นที่นี้</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className={`${styles.ProductItem} ${
                                selectedProduct?.id === product.id ? styles.Selected : ''
                            }`}
                        >
                            <div className={styles.ProductImage}>
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className={styles.Image}
                                />
                                <div className={`${styles.MarketTypeBadge} ${styles[product.marketType]}`}>
                                    {handlers.getMarketTypeEmoji(product.marketType)}
                                </div>
                            </div>
                            
                            <div className={styles.ProductInfo}>
                                <h3 className={styles.ProductName}>{product.name}</h3>
                                <p className={styles.ProductDescription}>
                                    {product.description}
                                </p>
                                <div className={styles.ProductDetails}>
                                    <span className={styles.Price}>
                                        {product.marketType === 'willing' ? 'ฟรี' : `฿${product.price}`}
                                    </span>
                                    <span className={styles.Location}>
                                        📍 {product.location}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={styles.ProductActions}>
                                <button
                                    className={styles.ViewOnMapButton}
                                    onClick={() => handlers.handleProductMapView(product)}
                                >
                                    <span className={styles.MapIcon}>🗺️</span>
                                    ดูบนแผนที่
                                </button>
                                <button
                                    className={`${styles.ActionButton} ${styles[product.marketType]}`}
                                    onClick={() => handlers.handleProductClick(product)}
                                >
                                    {handlers.getActionLabel(product.marketType)}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
