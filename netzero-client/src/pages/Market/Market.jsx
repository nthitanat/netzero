import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Market.module.scss";
import useMarket from "./useMarket";
import MarketHandler from "./MarketHandler";
import { FloatingNavBar, GoogleIcon, OrganicDecoration } from "../../components/common";
import { ProductCard, ProductModal, AdvertisementCarousel, FilterContainer, ProductSearch, ReserveDialog } from "../../components/market";
import { LoginModal } from "../../components/auth";

export default function Market() {
    const navigate = useNavigate();
    const { 
        stateMarket, 
        setMarket, 
        performSearch, 
        isSearching,
        loadMore,
        hasMore,
        isLoadingMore 
    } = useMarket();
    const handlers = MarketHandler(stateMarket, setMarket, navigate, performSearch);
    
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
                    
                    {/* Product Search Overlaid at Center Bottom of Advertisement */}
                    <div className={styles.ProductSearchContainer}>
                        <ProductSearch
                            searchInputValue={stateMarket.searchInputValue}
                            onSearchInputChange={handlers.handleSearchInputChange}
                            onSearchSubmit={handlers.handleSearchSubmit}
                            onClearSearch={handlers.handleClearSearch}
                            isSearching={isSearching}
                            isSearchMode={stateMarket.isSearchMode}
                            searchQuery={stateMarket.searchQuery}
                            viewMode={stateMarket.viewMode}
                            onViewModeChange={handlers.handleViewModeChange}
                            placeholder="ค้นหาสินค้า..."
                            theme="market"
                        />
                    </div>
                </div>
            </div>
            
            <div className={styles.Content}>
                {stateMarket.isLoading || isSearching ? (
                    <div className={styles.LoadingContainer}>
                        <div className={styles.LoadingSpinner} />
                        <p>{isSearching ? 'กำลังค้นหาสินค้า...' : 'กำลังโหลดสินค้า...'}</p>
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
                
                {!stateMarket.isLoading && !isSearching && stateMarket.filteredProducts.length === 0 && (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>
                            <GoogleIcon iconType="store" size="large" />
                        </div>
                        {stateMarket.isSearchMode ? (
                            <>
                                <h3>ไม่พบสินค้าที่ค้นหา</h3>
                                <p>ไม่พบสินค้าที่ตรงกับ "{stateMarket.searchQuery}"</p>
                                <p>ลองใช้คำค้นหาอื่น หรือเคลียร์การค้นหาเพื่อดูสินค้าทั้งหมด</p>
                                <button 
                                    onClick={handlers.handleClearSearch}
                                    className={styles.ClearSearchButton}
                                >
                                    เคลียร์การค้นหา
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>ไม่มีสินค้าในหมวดหมู่นี้</h3>
                                <p>ลองเลือกหมวดหมู่อื่น หรือกลับมาดูใหม่ในภายหลัง</p>
                            </>
                        )}
                    </div>
                )}

                {/* Search Results Info */}
                {stateMarket.isSearchMode && stateMarket.filteredProducts.length > 0 && (
                    <div className={styles.SearchResultsInfo}>
                        <p>🔍 ผลการค้นหา "{stateMarket.searchQuery}": พบ {stateMarket.filteredProducts.length} รายการ</p>
                        <button 
                            onClick={handlers.handleClearSearch}
                            className={styles.ClearSearchButton}
                        >
                            เคลียร์การค้นหา
                        </button>
                    </div>
                )}

                {/* Load More Button - Only show in browse mode, not search mode */}
                {!stateMarket.isSearchMode && !stateMarket.isLoading && hasMore && stateMarket.filteredProducts.length > 0 && (
                    <div className={styles.LoadMoreContainer}>
                        <button 
                            onClick={() => handlers.handleLoadMore(loadMore)}
                            disabled={isLoadingMore}
                            className={styles.LoadMoreButton}
                        >
                            {isLoadingMore ? 'กำลังโหลด...' : 'โหลดสินค้าเพิ่มเติม'}
                        </button>
                    </div>
                )}
            </div>
            
            <ProductModal
                product={stateMarket.selectedProduct}
                isOpen={stateMarket.showModal}
                onClose={handlers.handleCloseModal}
                //onReserve={handlers.handleProductReserve}
                onReservationSuccess={handlers.handleReservationSuccess}
                showReserveDialog={false}
                onShowReserveDialog={handlers.handleReserveClick}
                onCloseReserveDialog={() => {}}
                isReserving={false}
                theme="market"
            />
            
            <ReserveDialog
                product={stateMarket.productToReserve}
                isOpen={stateMarket.showReserveDialog}
                onClose={handlers.handleCloseReserveDialog}
                onReservationSuccess={handlers.handleReservationSuccess}
                onShowLogin={handlers.handleShowLoginModal}
                theme="market"
            />
            
            <LoginModal
                isOpen={stateMarket.showLoginModal}
                onClose={handlers.handleCloseLoginModal}
                onSuccess={handlers.handleLoginSuccess}
            />
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="market"
            />
        </div>
    );
}
