import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyOrders.module.scss";
import { FloatingNavBar, OrganicDecoration } from "../../components/common";
import { ReservationManagementPanel } from "../../components/dashboard";
import { useAuth } from "../../contexts/AuthContext";
import useMyOrders from "./useMyOrders";
import MyOrdersHandler from "./MyOrdersHandler";

export default function MyOrders() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { stateMyOrders, setMyOrders } = useMyOrders();
    const handlers = MyOrdersHandler(stateMyOrders, setMyOrders, navigate);

    // Redirect to login if not authenticated
    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Load reservations on component mount
    React.useEffect(() => {
        if (isAuthenticated) {
            handlers.handleLoadReservations();
        }
    }, [isAuthenticated]);

    // Loading state
    if (authLoading || stateMyOrders.isLoading) {
        return (
            <div className={styles.Container}>
                <div className={styles.LoadingContainer}>
                    <div className={styles.LoadingSpinner}></div>
                    <p>กำลังโหลดคำสั่งซื้อ...</p>
                </div>
                <FloatingNavBar />
            </div>
        );
    }

    // Error state
    if (stateMyOrders.error) {
        return (
            <div className={styles.Container}>
                <div className={styles.ErrorContainer}>
                    <div className={styles.ErrorIcon}>⚠️</div>
                    <h2>เกิดข้อผิดพลาด</h2>
                    <p>{stateMyOrders.error}</p>
                    <button 
                        className={styles.RetryButton}
                        onClick={handlers.handleLoadReservations}
                    >
                        ลองใหม่
                    </button>
                </div>
                <FloatingNavBar />
            </div>
        );
    }

    return (
        <div className={styles.Container}>
            <OrganicDecoration 
                variant="orders" 
                className={styles.BackgroundDecoration}
            />

            <div className={styles.ContentContainer}>
                <header className={styles.Header}>
                    <h1 className={styles.Title}>คำสั่งซื้อของฉัน</h1>
                    <button 
                        className={styles.RefreshButton}
                        onClick={handlers.handleLoadReservations}
                        title="รีเฟรชรายการ"
                    >
                        🔄
                    </button>
                </header>

                <div className={styles.TabsContainer}>
                    <button
                        className={`${styles.TabButton} ${stateMyOrders.activeTab === 'reservations' ? styles.Active : ''}`}
                        onClick={() => handlers.handleTabChange('reservations')}
                    >
                        การจองของฉัน
                    </button>
                    <button
                        className={`${styles.TabButton} ${stateMyOrders.activeTab === 'trade' ? styles.Active : ''}`}
                        onClick={() => handlers.handleTabChange('trade')}
                    >
                        การแลกเปลี่ยนของฉัน
                    </button>
                </div>

                <div className={styles.TabContent}>
                    {stateMyOrders.activeTab === 'reservations' && (
                        <ReservationManagementPanel
                            reservations={stateMyOrders.reservations}
                            isLoading={stateMyOrders.isLoading}
                            onCancelReservation={handlers.handleCancelReservation}
                            onRefresh={handlers.handleLoadReservations}
                            mode="customer"
                            theme="customer"
                            showStats={false}
                            showActions={true}
                        />
                    )}

                    {stateMyOrders.activeTab === 'trade' && (
                        <div className={styles.TradeTab}>
                            <div className={styles.ComingSoon}>
                                <div className={styles.ComingSoonIcon}>🔄</div>
                                <h3>คุณสมบัตินี้จะเปิดให้ใช้งานเร็วๆ นี้</h3>
                                <p>การแลกเปลี่ยนสินค้าจะเปิดให้ใช้งานในเร็วๆ นี้ กรุณารอติดตาม</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FloatingNavBar />
        </div>
    );
}