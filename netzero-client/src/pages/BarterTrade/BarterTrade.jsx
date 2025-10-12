import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BarterTrade.module.scss";
import useBarterTrade from "./useBarterTrade";
import BarterTradeHandler from "./BarterTradeHandler";
import { OrganicDecoration, FloatingNavBar } from "../../components/common";
import { ProductCard, ProductModal, AdvertisementCarousel, FilterContainer, ProductSearch, ExchangeDialog } from "../../components/market";

export default function BarterTrade() {
    const navigate = useNavigate();
    const { 
        stateBarterTrade, 
        setBarterTrade, 
        performSearch, 
        isSearching,
        loadMore,
        hasMore,
        isLoadingMore 
    } = useBarterTrade();
    const handlers = BarterTradeHandler(stateBarterTrade, setBarterTrade, navigate, performSearch);
    
    return (
        <div className={styles.Container}>
            <OrganicDecoration className={styles.BackgroundDecoration} />

            
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
                    
                    {/* Product Search Overlaid at Center Bottom of Advertisement */}
                    <div className={styles.ProductSearchContainer}>
                        <ProductSearch
                            searchInputValue={stateBarterTrade.searchInputValue}
                            onSearchInputChange={handlers.handleSearchInputChange}
                            onSearchSubmit={handlers.handleSearchSubmit}
                            onClearSearch={handlers.handleClearSearch}
                            isSearching={isSearching}
                            isSearchMode={stateBarterTrade.isSearchMode}
                            searchQuery={stateBarterTrade.searchQuery}
                            viewMode={stateBarterTrade.viewMode}
                            onViewModeChange={handlers.handleViewModeChange}
                            placeholder="ค้นหาสินค้าแลกเปลี่ยน..."
                            theme="barter"
                        />
                    </div>
                </div>
            </div>
            
            <div className={styles.Content}>
                {stateBarterTrade.isLoading || isSearching ? (
                    <div className={styles.LoadingContainer}>
                        <div className={styles.LoadingSpinner} />
                        <p>{isSearching ? 'กำลังค้นหาสินค้า...' : 'กำลังโหลดสินค้า...'}</p>
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
                
                {!stateBarterTrade.isLoading && !isSearching && stateBarterTrade.filteredProducts.length === 0 && (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>🔄</div>
                        {stateBarterTrade.isSearchMode ? (
                            <>
                                <h3>ไม่พบสินค้าที่ค้นหา</h3>
                                <p>ไม่พบสินค้าแลกเปลี่ยนที่ตรงกับ "{stateBarterTrade.searchQuery}"</p>
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
                                <h3>ไม่มีสินค้าแลกเปลี่ยนในหมวดหมู่นี้</h3>
                                <p>ลองเลือกหมวดหมู่อื่น หรือกลับมาดูใหม่ในภายหลัง</p>
                            </>
                        )}
                    </div>
                )}

                {/* Search Results Info */}
                {stateBarterTrade.isSearchMode && stateBarterTrade.filteredProducts.length > 0 && (
                    <div className={styles.SearchResultsInfo}>
                        <p>🔍 ผลการค้นหา "{stateBarterTrade.searchQuery}": พบ {stateBarterTrade.filteredProducts.length} รายการ</p>
                        <button 
                            onClick={handlers.handleClearSearch}
                            className={styles.ClearSearchButton}
                        >
                            เคลียร์การค้นหา
                        </button>
                    </div>
                )}

                {/* Load More Button - Only show in browse mode, not search mode */}
                {!stateBarterTrade.isSearchMode && !stateBarterTrade.isLoading && hasMore && stateBarterTrade.filteredProducts.length > 0 && (
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
                product={stateBarterTrade.selectedProduct}
                isOpen={stateBarterTrade.showModal}
                onClose={handlers.handleCloseModal}
                //onReserve={handlers.handleProductReserve}
                onReservationSuccess={handlers.handleExchangeSuccess}
                showReserveDialog={false}
                onShowReserveDialog={handlers.handleReserveClick}
                onCloseReserveDialog={() => {}}
                isReserving={false}
                actionLabel="แลกเปลี่ยน"
                theme="barter"
            />
            
            <ExchangeDialog
                product={stateBarterTrade.productToExchange}
                isOpen={stateBarterTrade.showExchangeDialog}
                onClose={handlers.handleCloseExchangeDialog}
                onExchangeSuccess={handlers.handleExchangeSuccess}
                theme="barter"
            />
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="barter"
            />
        </div>
    );
}
