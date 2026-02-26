import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SellerDashboard.module.scss";
import useSellerDashboard from "./useSellerDashboard";
import SellerDashboardHandler from "./SellerDashboardHandler";
import { FloatingNavBar, GoogleIcon, OrganicDecoration } from "../../components/common";
import { ProductManagementPanel, ReservationManagementPanel, AddProductToEventDialog, ProductSurveyForm, ProductSurveyResult, ProductModal } from "../../components/dashboard";
import { useAuth } from "../../contexts/AuthContext";

export default function SellerDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stateSellerDashboard, setSellerDashboard } = useSellerDashboard();
    const handlers = SellerDashboardHandler(stateSellerDashboard, setSellerDashboard, navigate);
    
    // Check if user has seller, community_head, or admin role
    if (!user || (user.role !== 'seller' && user.role !== 'community_head' && user.role !== 'admin')) {
        return (
            <div className={styles.Container}>
                <div className={styles.UnauthorizedContainer}>
                    <GoogleIcon iconType="warning" size="large" className={styles.WarningIcon} />
                    <h2>ไม่สามารถเข้าถึงได้</h2>
                    <p>คุณต้องมีสิทธิ์เป็นผู้ขาย ผู้นำชุมชน หรือผู้ดูแลระบบ เพื่อเข้าใช้หน้านี้</p>
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
                {stateSellerDashboard.activeTab === 'products' && (
                    <ProductManagementPanel
                        products={stateSellerDashboard.products}
                        isLoading={stateSellerDashboard.isLoading}
                        selectedProduct={stateSellerDashboard.productToDelete}
                        showDeleteConfirm={stateSellerDashboard.showDeleteConfirm}
                        onCreateProduct={handlers.handleCreateProduct}
                        onEditProduct={handlers.handleEditProduct}
                        onDeleteProduct={handlers.handleDeleteProduct}
                        onConfirmDelete={handlers.handleConfirmDelete}
                        onCancelDelete={handlers.handleCancelDelete}
                        onRefresh={handlers.handleRefreshProducts}
                        onAddToEvent={handlers.handleAddProductToEvent}
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
            
            {/* Product Modal */}
            <ProductModal
                isOpen={stateSellerDashboard.showProductModal}
                mode={stateSellerDashboard.productModalMode}
                product={stateSellerDashboard.selectedProduct}
                onClose={handlers.handleCloseProductModal}
                onSave={handlers.handleProductSaved}
                isLoading={stateSellerDashboard.isSubmittingProduct}
                showSurveyForm={stateSellerDashboard.showSurveyForm}
                showSurveyResult={stateSellerDashboard.showSurveyResult}
                surveyResult={stateSellerDashboard.surveyResult}
                pendingProductId={stateSellerDashboard.pendingProductId}
                onSurveyComplete={handlers.handleSurveyComplete}
                onSurveyResultConfirm={handlers.handleSurveyResultConfirm}
                onCloseSurveyForm={handlers.handleCloseSurveyForm}
                onCloseSurveyResult={handlers.handleCloseSurveyResult}
                onRetakeSurvey={handlers.handleRetakeSurvey}
            />
            
            {/* Add Product to Event Dialog */}
            <AddProductToEventDialog
                isOpen={stateSellerDashboard.showAddToEventDialog}
                product={stateSellerDashboard.productForEvent}
                onClose={handlers.handleCloseAddToEventDialog}
                onSuccess={handlers.handleAddToEventSuccess}
            />
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="seller"
            />
        </div>
    );
}