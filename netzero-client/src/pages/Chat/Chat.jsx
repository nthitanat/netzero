import React from "react";
import styles from "./Chat.module.scss";
import useChat from "./useChat";
import ChatHandler from "./ChatHandler";
import { OrganicDecoration, FloatingNavBar, GoogleIcon } from "../../components/common";
import { ChatModal } from "../../components/chat";

export default function Chat() {
    const { stateChat, setChat } = useChat();
    const handlers = ChatHandler(stateChat, setChat);
    
    return (
        <div className={styles.Container}>
            <OrganicDecoration />
            
            <div className={styles.ContentWrapper}>
                {/* Header */}
                <div className={styles.Header}>
                    <div className={styles.HeaderContent}>
                        <div className={styles.TitleSection}>
                            <h1 className={styles.PageTitle}><GoogleIcon iconType="chat" size="medium" /> แชทแอปพลิเคชัน</h1>
                            <p className={styles.PageSubtitle}>จัดการการสนทนาเกี่ยวกับผลิตภัณฑ์ของคุณ</p>
                        </div>
                        <button
                            onClick={handlers.handleRefresh}
                            className={styles.RefreshButton}
                            disabled={stateChat.isLoading}
                        >
                            <GoogleIcon iconType="refresh" size="small" /> รีเฟรช
                        </button>
                    </div>
                </div>



                {/* Filters */}
                <div className={styles.FiltersCard}>
                    <div className={styles.FiltersContent}>
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="ค้นหาแชท..."
                            value={stateChat.searchTerm}
                            onChange={(e) => handlers.handleSearch(e.target.value)}
                            className={styles.SearchInput}
                        />
                        
                        {/* Status Filter */}
                        <div className={styles.FilterButtons}>
                            {[
                                { value: 'all', label: 'ทั้งหมด', iconType: 'filter_list' },
                                { value: 'active', label: 'กำลังใช้งาน', iconType: 'check' },
                                { value: 'closed', label: 'ปิดแล้ว', iconType: 'lock' },
                                { value: 'archived', label: 'เก็บถาวร', iconType: 'archive' }
                            ].map(filter => (
                                <button
                                    key={filter.value}
                                    onClick={() => handlers.handleFilterChange(filter.value)}
                                    className={`${styles.FilterButton} ${
                                        stateChat.filterStatus === filter.value ? styles.Active : ''
                                    }`}
                                >
                                    <GoogleIcon iconType={filter.iconType} size="small" /> {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {stateChat.error && (
                    <div className={styles.ErrorCard}>
                        <div className={styles.ErrorContent}>
                            <GoogleIcon iconType="error" size="medium" className={styles.ErrorIcon} />
                            <div className={styles.ErrorInfo}>
                                <h3 className={styles.ErrorTitle}>เกิดข้อผิดพลาด</h3>
                                <p className={styles.ErrorMessage}>{stateChat.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {stateChat.isLoading && (
                    <div className={styles.LoadingState}>
                        <div className={styles.LoadingSpinner}></div>
                        <p className={styles.LoadingText}>กำลังโหลดแชทแอปพลิเคชัน...</p>
                    </div>
                )}

                {/* Chat Applications Grid */}
                {!stateChat.isLoading && stateChat.isEmpty ? (
                    <div className={styles.EmptyState}>
                        <GoogleIcon iconType="chat_bubble" size="large" className={styles.EmptyIcon} />
                        <h3 className={styles.EmptyTitle}>
                            {stateChat.isFiltered ? 'ไม่พบแชทแอปพลิเคชันที่ตรงกับการค้นหา' : 'ยังไม่มีแชทแอปพลิเคชัน'}
                        </h3>
                        <p className={styles.EmptyDescription}>
                            {stateChat.isFiltered ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง' : 'เริ่มสร้างแชทแอปพลิเคชันแรกของคุณเพื่อสนทนาเกี่ยวกับผลิตภัณฑ์'}
                        </p>
                        {!stateChat.isFiltered && (
                            <button
                                onClick={handlers.handleCreateChat}
                                className={styles.EmptyAction}
                            >
                                <GoogleIcon iconType="add" size="small" /> สร้างแชทแรก
                            </button>
                        )}
                    </div>
                ) : (
                    !stateChat.isLoading && (
                        <div className={styles.ChatGrid}>
                            {stateChat.filteredChatApps.map((chatApp, index) => (
                                <ChatCard
                                    key={chatApp.id}
                                    chatApp={chatApp}
                                    onClick={() => handlers.handleChatClick(chatApp)}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>

            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="default"
            />

            {/* Chat Modal */}
            <ChatModal
                isOpen={stateChat.showChatModal}
                onClose={handlers.handleCloseModal}
                chatApp={stateChat.selectedChat}
                user={stateChat.user}
            />

            {/* Create Chat Modal - Placeholder */}
            {stateChat.showCreateModal && (
                <div className={styles.CreateModalOverlay}>
                    <div className={styles.CreateModalContent}>
                        <h2 className={styles.CreateModalTitle}>สร้างแชทใหม่</h2>
                        <p className={styles.CreateModalDescription}>ฟีเจอร์สร้างแชทใหม่จะพร้อมใช้งานเร็วๆ นี้</p>
                        <button
                            onClick={handlers.handleCloseCreateModal}
                            className={styles.CreateModalButton}
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Chat Card Component
const ChatCard = ({ chatApp, onClick, style }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return styles.Active;
            case 'closed': return styles.Closed;
            case 'archived': return styles.Archived;
            default: return styles.Archived;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return 'check';
            case 'closed': return 'lock';
            case 'archived': return 'archive';
            default: return 'question_answer';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'กำลังใช้งาน';
            case 'closed': return 'ปิดแล้ว';
            case 'archived': return 'เก็บถาวร';
            default: return 'ไม่ทราบสถานะ';
        }
    };

    return (
        <div 
            className={styles.ChatCard}
            onClick={onClick}
            style={style}
        >
            {/* Header */}
            <div className={styles.ChatHeader}>
                <div className={styles.ChatTitleSection}>
                    <h3 className={styles.ChatTitle}>
                        {chatApp.title}
                    </h3>
                    <p className={styles.ProductName}>
                        <GoogleIcon iconType="inventory" size="small" /> สินค้า ID: {chatApp.product_id}
                    </p>
                </div>
                <span className={`${styles.StatusBadge} ${getStatusClass(chatApp.status)}`}>
                    <GoogleIcon iconType={getStatusIcon(chatApp.status)} size="small" /> {getStatusLabel(chatApp.status)}
                </span>
            </div>

            {/* Description */}
            {chatApp.description && (
                <p className={styles.ChatDescription}>
                    {chatApp.description}
                </p>
            )}

            {/* Owner Info */}
            <div className={styles.OwnerInfo}>
                <GoogleIcon iconType="person" size="small" />
                <span>เจ้าของ ID: {chatApp.owner_id}</span>
            </div>

            {/* Footer */}
            <div className={styles.ChatFooter}>
                <div className={styles.ChatDate}>
                    <GoogleIcon iconType="calendar_today" size="small" /> {new Date(chatApp.createdAt).toLocaleDateString('th-TH')}
                </div>
                <div className={styles.ChatAction}>
                    <GoogleIcon iconType="chat" size="small" /> เข้าสู่แชท →
                </div>
            </div>
        </div>
    );
};