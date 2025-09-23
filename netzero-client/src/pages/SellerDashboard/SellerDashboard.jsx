import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SellerDashboard.module.scss";
import useSellerDashboard from "./useSellerDashboard";
import SellerDashboardHandler from "./SellerDashboardHandler";
import { FloatingNavBar, GoogleIcon, OrganicDecoration } from "../../components/common";
import { ProductManagementPanel, ReservationManagementPanel, SellerStatsPanel } from "../../components/seller";
import { useAuth } from "../../contexts/AuthContext";

export default function SellerDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stateSellerDashboard, setSellerDashboard } = useSellerDashboard();
    const handlers = SellerDashboardHandler(stateSellerDashboard, setSellerDashboard, navigate);
    
    // Check if user has seller role
    if (!user || user.role !== 'seller') {
        return (
            <div className={styles.Container}>
                <div className={styles.UnauthorizedContainer}>
                    <GoogleIcon iconType="warning" size="large" className={styles.WarningIcon} />
                    <h2>ไม่สามารถเข้าถึงได้</h2>
                    <p>คุณต้องมีสิทธิ์เป็นผู้ขายเพื่อเข้าใช้หน้านี้</p>
                    <button 
                        className={styles.BackButton}
                        onClick={() => navigate('/')}
                    >
                        กลับสู่หน้าหลัก
                    </button>
                </div>
                <FloatingNavBar onNavigate={handlers.handleNavigate} theme="seller" />
            </div>
        );
    }
    
    return (
        <div className={styles.Container}>
            <OrganicDecoration className={styles.BackgroundDecoration} />
            
            <div className={styles.Header}>
                <h1 className={styles.Title}>แดชบอร์ดผู้ขาย</h1>
                <p className={styles.Subtitle}>จัดการสินค้าและการจองของคุณ</p>
            </div>
            
            <div className={styles.TabContainer}>
                <div className={styles.TabButtons}>
                    <button
                        className={`${styles.TabButton} ${stateSellerDashboard.activeTab === 'stats' ? styles.Active : ''}`}
                        onClick={() => handlers.handleTabChange('stats')}
                    >
                        <GoogleIcon iconType="analytics" size="small" />
                        สถิติ
                    </button>
                    <button
                        className={`${styles.TabButton} ${stateSellerDashboard.activeTab === 'products' ? styles.Active : ''}`}
                        onClick={() => handlers.handleTabChange('products')}
                    >
                        <GoogleIcon iconType="inventory" size="small" />
                        จัดการสินค้า
                    </button>
                    <button
                        className={`${styles.TabButton} ${stateSellerDashboard.activeTab === 'reservations' ? styles.Active : ''}`}
                        onClick={() => handlers.handleTabChange('reservations')}
                    >
                        <GoogleIcon iconType="shopping_cart" size="small" />
                        การจอง
                    </button>
                </div>
            </div>
            
            <div className={styles.Content}>
                {stateSellerDashboard.activeTab === 'stats' && (
                    <SellerStatsPanel
                        isLoading={stateSellerDashboard.isLoading}
                        stats={stateSellerDashboard.stats}
                        onRefresh={handlers.handleRefreshStats}
                        theme="seller"
                    />
                )}
                
                {stateSellerDashboard.activeTab === 'products' && (
                    <ProductManagementPanel
                        products={stateSellerDashboard.products}
                        isLoading={stateSellerDashboard.isLoading}
                        selectedProduct={stateSellerDashboard.selectedProduct}
                        showProductModal={stateSellerDashboard.showProductModal}
                        showDeleteConfirm={stateSellerDashboard.showDeleteConfirm}
                        onCreateProduct={handlers.handleCreateProduct}
                        onEditProduct={handlers.handleEditProduct}
                        onDeleteProduct={handlers.handleDeleteProduct}
                        onConfirmDelete={handlers.handleConfirmDelete}
                        onCancelDelete={handlers.handleCancelDelete}
                        onCloseModal={handlers.handleCloseProductModal}
                        onProductSaved={handlers.handleProductSaved}
                        onRefresh={handlers.handleRefreshProducts}
                        theme="seller"
                    />
                )}
                
                {stateSellerDashboard.activeTab === 'reservations' && (
                    <ReservationManagementPanel
                        reservations={stateSellerDashboard.reservations}
                        isLoading={stateSellerDashboard.isLoading}
                        onConfirmReservation={handlers.handleConfirmReservation}
                        onCancelReservation={handlers.handleCancelReservation}
                        onRefresh={handlers.handleRefreshReservations}
                        theme="seller"
                    />
                )}
            </div>
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="seller"
            />
        </div>
    );
}