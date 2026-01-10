import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Marketplace.module.scss";
import useMarketplace from "./useMarketplace";
import MarketplaceHandler from "./MarketplaceHandler";
import { FloatingNavBar, GoogleIcon, OrganicDecoration, Alert } from "../../components/common";
import { ProductCard, ProductModal, AdvertisementCarousel, FilterContainer, ProductSearch, ReserveDialog, ExchangeDialog, ReservationSuccessModal } from "../../components/market";
import { LoginModal } from "../../components/auth";

export default function Marketplace({ type = "market" }) {
    const navigate = useNavigate();
    const { 
        state, 
        setState, 
        performSearch, 
        isSearching,
        loadMore,
        hasMore,
        isLoadingMore 
    } = useMarketplace(type);
    const handlers = MarketplaceHandler(state, setState, navigate, performSearch, type);
    
    return (
        <div className={`${styles.Container} ${styles[`${type}Theme`]}`}>
            <OrganicDecoration className={styles.BackgroundDecoration} />
            
            <Alert
                type={state.alertType}
                message={state.alertMessage}
                isVisible={state.alertVisible}
                onClose={handlers.handleAlertClose}
                autoClose={true}
                autoCloseDelay={4000}
            />
          
            <div className={styles.TopSection}>
                {/* Left Side - Filter Container */}
                <FilterContainer
                    filterTab={state.filterTab}
                    selectedCategory={state.selectedCategory}
                    selectedRegion={state.selectedRegion}
                    categories={state.categories}
                    regions={state.regions}
                    onFilterTabChange={handlers.handleFilterTabChange}
                    onCategoryChange={handlers.handleCategoryChange}
                    onRegionChange={handlers.handleRegionChange}
                    theme={type}
                />
                
                {/* Right Side - Advertisement Carousel with Overlaid Search */}
                <div className={styles.AdSection}>
                    <AdvertisementCarousel
                        advertisements={state.advertisements}
                        onAdClick={handlers.handleAdClick}
                        theme={type}
                    />
                    
                    {/* Product Search Overlaid at Center Bottom of Advertisement */}
                    <div className={styles.ProductSearchContainer}>
                        <ProductSearch
                            searchInputValue={state.searchInputValue}
                            onSearchInputChange={handlers.handleSearchInputChange}
                            onSearchSubmit={handlers.handleSearchSubmit}
                            onClearSearch={handlers.handleClearSearch}
                            isSearching={isSearching}
                            isSearchMode={state.isSearchMode}
                            searchQuery={state.searchQuery}
                            viewMode={state.viewMode}
                            onViewModeChange={handlers.handleViewModeChange}
                            placeholder={
                                type === "market" ? "ค้นหาสินค้า..." :
                                type === "willing" ? "ค้นหาสินค้าฟรี..." :
                                "ค้นหาสินค้าแลกเปลี่ยน..."
                            }
                            theme={type}
                        />
                    </div>
                </div>
            </div>
            
            <div className={styles.Content}>
                {state.isLoading || isSearching ? (
                    <div className={styles.LoadingContainer}>
                        <div className={styles.LoadingSpinner} />
                        <p>{isSearching ? 'กำลังค้นหาสินค้า...' : 'กำลังโหลดสินค้า...'}</p>
                    </div>
                ) : (
                    <div className={`${styles.ProductGrid} ${styles[state.viewMode]}`}>
                        {state.filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onProductClick={handlers.handleProductClick}
                                onReserveClick={handlers.handleReserveClick}
                                className={styles.ProductItem}
                                actionLabel={
                                    type === "market" ? "จอง" :
                                    type === "willing" ? "รับฟรี" :
                                    "แลกเปลี่ยน"
                                }
                                theme={type}
                            />
                        ))}
                    </div>
                )}
                
                {!state.isLoading && !isSearching && state.filteredProducts.length === 0 && (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>
                            {type === "barter" ? (
                                "🔄"
                            ) : (
                                <GoogleIcon 
                                    iconType={type === "willing" ? "volunteer_activism" : "store"} 
                                    size="large" 
                                />
                            )}
                        </div>
                        {state.isSearchMode ? (
                            <>
                                <h3>ไม่พบสินค้าที่ค้นหา</h3>
                                <p>
                                    {type === "market" ? "ไม่พบสินค้าที่ตรงกับ" :
                                     type === "willing" ? "ไม่พบสินค้าฟรีที่ตรงกับ" :
                                     "ไม่พบสินค้าแลกเปลี่ยนที่ตรงกับ"} "{state.searchQuery}"
                                </p>
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
                                <h3>
                                    {type === "market" ? "ไม่มีสินค้าในหมวดหมู่นี้" :
                                     type === "willing" ? "ไม่มีสินค้าฟรีในหมวดหมู่นี้" :
                                     "ไม่มีสินค้าแลกเปลี่ยนในหมวดหมู่นี้"}
                                </h3>
                                <p>ลองเลือกหมวดหมู่อื่น หรือกลับมาดูใหม่ในภายหลัง</p>
                            </>
                        )}
                    </div>
                )}

                {/* Search Results Info */}
                {state.isSearchMode && state.filteredProducts.length > 0 && (
                    <div className={styles.SearchResultsInfo}>
                        <p>🔍 ผลการค้นหา "{state.searchQuery}": พบ {state.filteredProducts.length} รายการ</p>
                        <button 
                            onClick={handlers.handleClearSearch}
                            className={styles.ClearSearchButton}
                        >
                            เคลียร์การค้นหา
                        </button>
                    </div>
                )}

                {/* Load More Button - Only show in browse mode, not search mode */}
                {!state.isSearchMode && !state.isLoading && hasMore && state.filteredProducts.length > 0 && (
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
                product={state.selectedProduct}
                isOpen={state.showModal}
                onClose={handlers.handleCloseModal}
                onReservationSuccess={handlers.handleReservationSuccess}
                showReserveDialog={false}
                onShowReserveDialog={handlers.handleReserveClick}
                onCloseReserveDialog={() => {}}
                isReserving={false}
                actionLabel={
                    type === "market" ? "จอง" :
                    type === "willing" ? "รับฟรี" :
                    "แลกเปลี่ยน"
                }
                theme={type}
            />
            
            {/* Conditional Dialog Rendering */}
            {type === "barter" ? (
                <ExchangeDialog
                    product={state.productToExchange}
                    isOpen={state.showExchangeDialog}
                    onClose={handlers.handleCloseExchangeDialog}
                    onExchangeSuccess={handlers.handleExchangeSuccess}
                    theme={type}
                />
            ) : (
                <ReserveDialog
                    product={state.productToReserve}
                    isOpen={state.showReserveDialog}
                    onClose={handlers.handleCloseReserveDialog}
                    onReservationSuccess={handlers.handleReservationSuccess}
                    onShowLogin={handlers.handleShowLoginModal}
                    theme={type}
                />
            )}
            
            {/* LoginModal only for market and willing */}
            {type !== "barter" && (
                <LoginModal
                    isOpen={state.showLoginModal}
                    onClose={handlers.handleCloseLoginModal}
                    onSuccess={handlers.handleLoginSuccess}
                />
            )}
            
            {/* ReservationSuccessModal only for market */}
            {type === "market" && (
                <ReservationSuccessModal
                    isOpen={state.showReservationSuccessModal}
                    reservationData={state.reservationData}
                    onClose={handlers.handleCloseReservationSuccessModal}
                    theme={type}
                />
            )}
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme={type}
            />
        </div>
    );
}
