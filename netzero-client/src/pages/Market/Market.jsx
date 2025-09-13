import React from "react";
import styles from "./Market.module.scss";
import useMarket from "./useMarket";
import MarketHandler from "./MarketHandler";
import { FloatingNavBar, GoogleIcon, OrganicDecoration } from "../../components/common";
import { ProductCard, ProductModal, AdvertisementCarousel, FilterContainer, SearchOverlay, ReserveDialog } from "../../components/market";

export default function Market() {
    const { stateMarket, setMarket } = useMarket();
    const handlers = MarketHandler(stateMarket, setMarket);
    
    return (
        <div className={styles.Container}>
            <OrganicDecoration className={styles.BackgroundDecoration} />
            
          
            <div className={styles.TopSection}>
                {/* Left Side - Filter Container */}
                <FilterContainer
                    filterTab={stateMarket.filterTab}
                    selectedCategory={stateMarket.selectedCategory}
                    selectedRegion={stateMarket.selectedRegion}
                    categories={stateMarket.categories}
                    regions={stateMarket.regions}
                    onFilterTabChange={handlers.handleFilterTabChange}
                    onCategoryChange={handlers.handleCategoryChange}
                    onRegionChange={handlers.handleRegionChange}
                    theme="market"
                />
                
                {/* Right Side - Advertisement Carousel with Overlaid Search */}
                <div className={styles.AdSection}>
                    <AdvertisementCarousel
                        advertisements={stateMarket.advertisements}
                        onAdClick={handlers.handleAdClick}
                        theme="market"
                    />
                    
                    {/* Search Bar Overlaid at Center Bottom of Advertisement */}
                    <div className={styles.SearchOverlayContainer}>
                        <SearchOverlay
                            searchQuery={stateMarket.searchQuery}
                            onSearchChange={handlers.handleSearchChange}
                            viewMode={stateMarket.viewMode}
                            onViewModeChange={handlers.handleViewModeChange}
                            placeholder="ค้นหาสินค้า..."
                            theme="market"
                        />
                    </div>
                </div>
            </div>
            
            <div className={styles.Content}>
                {stateMarket.isLoading ? (
                    <div className={styles.LoadingContainer}>
                        <div className={styles.LoadingSpinner} />
                        <p>กำลังโหลดสินค้า...</p>
                    </div>
                ) : (
                    <div className={`${styles.ProductGrid} ${styles[stateMarket.viewMode]}`}>
                        {stateMarket.filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onProductClick={handlers.handleProductClick}
                                onReserveClick={handlers.handleReserveClick}
                                className={styles.ProductItem}
                                theme="market"
                            />
                        ))}
                    </div>
                )}
                
                {!stateMarket.isLoading && stateMarket.filteredProducts.length === 0 && (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>
                            <GoogleIcon iconType="store" size="large" />
                        </div>
                        <h3>ไม่มีสินค้าในหมวดหมู่นี้</h3>
                        <p>ลองเลือกหมวดหมู่อื่น หรือกลับมาดูใหม่ในภายหลัง</p>
                    </div>
                )}
            </div>
            
            <ProductModal
                product={stateMarket.selectedProduct}
                isOpen={stateMarket.showModal}
                onClose={handlers.handleCloseModal}
                onReserve={handlers.handleProductReserve}
                onReservationSuccess={handlers.handleReservationSuccess}
                theme="market"
            />
            
            <ReserveDialog
                product={stateMarket.productToReserve}
                isOpen={stateMarket.showReserveDialog}
                onClose={handlers.handleCloseReserveDialog}
                onReservationSuccess={handlers.handleReservationSuccess}
                theme="market"
            />
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="market"
            />
        </div>
    );
}
