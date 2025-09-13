import React from "react";
import styles from "./BarterTrade.module.scss";
import useBarterTrade from "./useBarterTrade";
import BarterTradeHandler from "./BarterTradeHandler";
import { OrganicDecoration, FloatingNavBar } from "../../components/common";
import { ProductCard, ProductModal, AdvertisementCarousel, FilterContainer, SearchOverlay } from "../../components/market";

export default function BarterTrade() {
    const { stateBarterTrade, setBarterTrade } = useBarterTrade();
    const handlers = BarterTradeHandler(stateBarterTrade, setBarterTrade);
    
    return (
        <div className={styles.Container}>

            
            <div className={styles.TopSection}>
                {/* Left Side - Filter Container */}
                <FilterContainer
                    filterTab={stateBarterTrade.filterTab}
                    selectedCategory={stateBarterTrade.selectedCategory}
                    selectedRegion={stateBarterTrade.selectedRegion}
                    categories={stateBarterTrade.categories}
                    regions={stateBarterTrade.regions}
                    onFilterTabChange={handlers.handleFilterTabChange}
                    onCategoryChange={handlers.handleCategoryChange}
                    onRegionChange={handlers.handleRegionChange}
                    theme="barter"
                />
                
                {/* Right Side - Advertisement Carousel with Overlaid Search */}
                <div className={styles.AdSection}>
                    <AdvertisementCarousel
                        advertisements={stateBarterTrade.advertisements}
                        onAdClick={handlers.handleAdClick}
                        theme="barter"
                    />
                    
                    {/* Search Bar Overlaid at Center Bottom of Advertisement */}
                    <div className={styles.SearchOverlayContainer}>
                        <SearchOverlay
                            searchQuery={stateBarterTrade.searchQuery}
                            onSearchChange={handlers.handleSearchChange}
                            viewMode={stateBarterTrade.viewMode}
                            onViewModeChange={handlers.handleViewModeChange}
                            placeholder="ค้นหาสินค้าแลกเปลี่ยน..."
                            theme="barter"
                        />
                    </div>
                </div>
            </div>
            
            <div className={styles.Content}>
                {stateBarterTrade.isLoading ? (
                    <div className={styles.LoadingContainer}>
                        <div className={styles.LoadingSpinner} />
                        <p>กำลังโหลดสินค้า...</p>
                    </div>
                ) : (
                    <div className={`${styles.ProductGrid} ${styles[stateBarterTrade.viewMode]}`}>
                        {stateBarterTrade.filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onProductClick={handlers.handleProductClick}
                                onReserveClick={handlers.handleReserveClick}
                                className={styles.ProductItem}
                                actionLabel="แลกเปลี่ยน"
                                theme="barter"
                            />
                        ))}
                    </div>
                )}
                
                {!stateBarterTrade.isLoading && stateBarterTrade.filteredProducts.length === 0 && (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>🔄</div>
                        <h3>ไม่มีสินค้าแลกเปลี่ยนในหมวดหมู่นี้</h3>
                        <p>ลองเลือกหมวดหมู่อื่น หรือกลับมาดูใหม่ในภายหลัง</p>
                    </div>
                )}
            </div>
            
            <ProductModal
                product={stateBarterTrade.selectedProduct}
                isOpen={stateBarterTrade.showModal}
                onClose={handlers.handleCloseModal}
                onReserve={handlers.handleProductReserve}
                actionLabel="แลกเปลี่ยน"
                theme="barter"
            />
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="barter"
            />
        </div>
    );
}
