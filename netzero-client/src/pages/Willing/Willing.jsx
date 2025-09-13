import React from "react";
import styles from "./Willing.module.scss";
import useWilling from "./useWilling";
import WillingHandler from "./WillingHandler";
import { OrganicDecoration, FloatingNavBar, GoogleIcon } from "../../components/common";
import { ProductCard, ProductModal, AdvertisementCarousel, FilterContainer, SearchOverlay } from "../../components/market";

export default function Willing() {
    const { stateWilling, setWilling } = useWilling();
    const handlers = WillingHandler(stateWilling, setWilling);
    
    return (
        <div className={styles.Container}>
            <OrganicDecoration className={styles.BackgroundDecoration} />
            
            
            <div className={styles.TopSection}>
                {/* Left Side - Filter Container */}
                <FilterContainer
                    filterTab={stateWilling.filterTab}
                    selectedCategory={stateWilling.selectedCategory}
                    selectedRegion={stateWilling.selectedRegion}
                    categories={stateWilling.categories}
                    regions={stateWilling.regions}
                    onFilterTabChange={handlers.handleFilterTabChange}
                    onCategoryChange={handlers.handleCategoryChange}
                    onRegionChange={handlers.handleRegionChange}
                    theme="willing"
                />
                
                {/* Right Side - Advertisement Carousel with Overlaid Search */}
                <div className={styles.AdSection}>
                    <AdvertisementCarousel
                        advertisements={stateWilling.advertisements}
                        onAdClick={handlers.handleAdClick}
                        theme="willing"
                    />
                    
                    {/* Search Bar Overlaid at Center Bottom of Advertisement */}
                    <div className={styles.SearchOverlayContainer}>
                        <SearchOverlay
                            searchQuery={stateWilling.searchQuery}
                            onSearchChange={handlers.handleSearchChange}
                            viewMode={stateWilling.viewMode}
                            onViewModeChange={handlers.handleViewModeChange}
                            placeholder="ค้นหาสินค้าฟรี..."
                            theme="willing"
                        />
                    </div>
                </div>
            </div>
            
            <div className={styles.Content}>
                {stateWilling.isLoading ? (
                    <div className={styles.LoadingContainer}>
                        <div className={styles.LoadingSpinner} />
                        <p>กำลังโหลดสินค้า...</p>
                    </div>
                ) : (
                    <div className={`${styles.ProductGrid} ${styles[stateWilling.viewMode]}`}>
                        {stateWilling.filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onProductClick={handlers.handleProductClick}
                                onReserveClick={handlers.handleReserveClick}
                                className={styles.ProductItem}
                                actionLabel="รับฟรี"
                                theme="willing"
                            />
                        ))}
                    </div>
                )}
                
                {!stateWilling.isLoading && stateWilling.filteredProducts.length === 0 && (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>
                            <GoogleIcon iconType="volunteer_activism" size="large" />
                        </div>
                        <h3>ไม่มีสินค้าฟรีในหมวดหมู่นี้</h3>
                        <p>ลองเลือกหมวดหมู่อื่น หรือกลับมาดูใหม่ในภายหลัง</p>
                    </div>
                )}
            </div>
            
            <ProductModal
                product={stateWilling.selectedProduct}
                isOpen={stateWilling.showModal}
                onClose={handlers.handleCloseModal}
                onReserve={handlers.handleProductReserve}
                actionLabel="รับฟรี"
                theme="willing"
            />
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="willing"
            />
        </div>
    );
}
