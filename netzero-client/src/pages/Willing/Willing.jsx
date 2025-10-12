import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Willing.module.scss";
import useWilling from "./useWilling";
import WillingHandler from "./WillingHandler";
import { OrganicDecoration, FloatingNavBar, GoogleIcon } from "../../components/common";
import { ProductCard, ProductModal, AdvertisementCarousel, FilterContainer, ProductSearch, ReserveDialog } from "../../components/market";
import { LoginModal } from "../../components/auth";

export default function Willing() {
    const navigate = useNavigate();
    const { 
        stateWilling, 
        setWilling, 
        performSearch, 
        isSearching,
        loadMore,
        hasMore,
        isLoadingMore 
    } = useWilling();
    const handlers = WillingHandler(stateWilling, setWilling, navigate, performSearch);
    
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
                    
                    {/* Product Search Overlaid at Center Bottom of Advertisement */}
                    <div className={styles.ProductSearchContainer}>
                        <ProductSearch
                            searchInputValue={stateWilling.searchInputValue}
                            onSearchInputChange={handlers.handleSearchInputChange}
                            onSearchSubmit={handlers.handleSearchSubmit}
                            onClearSearch={handlers.handleClearSearch}
                            isSearching={isSearching}
                            isSearchMode={stateWilling.isSearchMode}
                            searchQuery={stateWilling.searchQuery}
                            viewMode={stateWilling.viewMode}
                            onViewModeChange={handlers.handleViewModeChange}
                            placeholder="ค้นหาสินค้าฟรี..."
                            theme="willing"
                        />
                    </div>
                </div>
            </div>
            
            <div className={styles.Content}>
                {stateWilling.isLoading || isSearching ? (
                    <div className={styles.LoadingContainer}>
                        <div className={styles.LoadingSpinner} />
                        <p>{isSearching ? 'กำลังค้นหาสินค้า...' : 'กำลังโหลดสินค้า...'}</p>
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
                
                {!stateWilling.isLoading && !isSearching && stateWilling.filteredProducts.length === 0 && (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>
                            <GoogleIcon iconType="volunteer_activism" size="large" />
                        </div>
                        {stateWilling.isSearchMode ? (
                            <>
                                <h3>ไม่พบสินค้าที่ค้นหา</h3>
                                <p>ไม่พบสินค้าฟรีที่ตรงกับ "{stateWilling.searchQuery}"</p>
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
                                <h3>ไม่มีสินค้าฟรีในหมวดหมู่นี้</h3>
                                <p>ลองเลือกหมวดหมู่อื่น หรือกลับมาดูใหม่ในภายหลัง</p>
                            </>
                        )}
                    </div>
                )}

                {/* Search Results Info */}
                {stateWilling.isSearchMode && stateWilling.filteredProducts.length > 0 && (
                    <div className={styles.SearchResultsInfo}>
                        <p>🔍 ผลการค้นหา "{stateWilling.searchQuery}": พบ {stateWilling.filteredProducts.length} รายการ</p>
                        <button 
                            onClick={handlers.handleClearSearch}
                            className={styles.ClearSearchButton}
                        >
                            เคลียร์การค้นหา
                        </button>
                    </div>
                )}

                {/* Load More Button - Only show in browse mode, not search mode */}
                {!stateWilling.isSearchMode && !stateWilling.isLoading && hasMore && stateWilling.filteredProducts.length > 0 && (
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
                product={stateWilling.selectedProduct}
                isOpen={stateWilling.showModal}
                onClose={handlers.handleCloseModal}
                //onReserve={handlers.handleProductReserve}
                onReservationSuccess={handlers.handleReservationSuccess}
                showReserveDialog={false}
                onShowReserveDialog={handlers.handleReserveClick}
                onCloseReserveDialog={() => {}}
                isReserving={false}
                actionLabel="รับฟรี"
                theme="willing"
            />
            
            <ReserveDialog
                product={stateWilling.productToReserve}
                isOpen={stateWilling.showReserveDialog}
                onClose={handlers.handleCloseReserveDialog}
                onReservationSuccess={handlers.handleReservationSuccess}
                onShowLogin={handlers.handleShowLoginModal}
                theme="willing"
            />
            
            <LoginModal
                isOpen={stateWilling.showLoginModal}
                onClose={handlers.handleCloseLoginModal}
                onSuccess={handlers.handleLoginSuccess}
            />
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="willing"
            />
        </div>
    );
}
