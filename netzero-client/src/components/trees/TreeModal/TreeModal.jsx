import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./TreeModal.module.scss";
import useTreeModal from "./useTreeModal";
import TreeModalHandler from "./TreeModalHandler";

export default function TreeModal({
    tree,
    isOpen = false,
    onClose,
    onLocationSelect,
    theme = "tree"
}) {
    const { stateTreeModal, setTreeModal } = useTreeModal({
        tree,
        isOpen
    });
    
    // Memoize handlers to prevent infinite re-renders
    const handlers = useMemo(() => TreeModalHandler(stateTreeModal, setTreeModal, {
        onClose,
        onLocationSelect
    }), [stateTreeModal, setTreeModal, onClose, onLocationSelect]);

    // State for async data
    const [treeInfo, setTreeInfo] = useState({
        emoji: '🌳',
        image: '',
        category: '',
        scientificName: '',
        type: '',
        use: '',
        growthPeriod: '',
        description: ''
    });

    // Memoize loadTreeInfo function to avoid dependencies issues
    const loadTreeInfo = useCallback(async (treeName) => {
        try {
            const info = await handlers.loadTreeInfo(treeName);
            if (info) {
                setTreeInfo(info);
            }
        } catch (error) {
            console.error('Failed to load tree info:', error);
            // Keep default values on error
        }
    }, [handlers]);

    // Load tree information when modal opens or tree changes
    useEffect(() => {
        if (isOpen && tree) {
            loadTreeInfo(tree.name);
        }
    }, [isOpen, tree, loadTreeInfo]);

    if (!isOpen || !tree) return null;

    return (
        <div className={styles.Overlay} onClick={handlers.handleOverlayClick}>
            <div className={`${styles.Modal} ${styles[`${theme}-theme`]}`} onClick={handlers.handleModalClick}>
                {/* Header */}
                <div className={styles.Header}>
                    <div className={styles.TreeTitle}>
                        <span className={styles.TreeIcon}>{treeInfo.emoji}</span>
                        <h2 className={styles.TreeName}>{tree.name}</h2>
                    </div>
                    <button 
                        className={styles.CloseButton}
                        onClick={handlers.handleClose}
                        aria-label="ปิด"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className={styles.Content}>
                    {/* Tree Image Section */}
                    <div className={styles.TreeImageSection}>
                        <div className={styles.ImageContainer}>
                            <img 
                                src={treeInfo.imageUrl || treeInfo.image || `/api/placeholder/800/200?text=${encodeURIComponent(tree.name)}+Tree`} 
                                alt={tree.name}
                                className={styles.TreeImage}
                                onError={handlers.handleImageError}
                            />
                            <div className={styles.ImageOverlay}>
                                <span className={styles.TreeCategory}>
                                    {treeInfo.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Section */}
                    <div className={styles.Dashboard}>
                        {/* Statistics Cards */}
                        <div className={styles.StatsGrid}>
                            <div className={styles.StatCard}>
                                <div className={styles.StatIcon}>🌳</div>
                                <div className={styles.StatValue}>{tree.totalCount.toLocaleString()}</div>
                                <div className={styles.StatLabel}>ต้นทั้งหมด</div>
                            </div>
                            
                            <div className={styles.StatCard}>
                                <div className={styles.StatIcon}>📍</div>
                                <div className={styles.StatValue}>{tree.locations.length}</div>
                                <div className={styles.StatLabel}>พื้นที่ปลูก</div>
                            </div>
                            
                            <div className={styles.StatCard}>
                                <div className={styles.StatIcon}>📊</div>
                                <div className={styles.StatValue}>{handlers.getAveragePerLocation(tree)}</div>
                                <div className={styles.StatLabel}>เฉลี่ย/พื้นที่</div>
                            </div>
                            
                            <div className={styles.StatCard}>
                                <div className={styles.StatIcon}>🏆</div>
                                <div className={styles.StatValue}>{handlers.getTopLocation(tree)?.name}</div>
                                <div className={styles.StatLabel}>พื้นที่มากที่สุด</div>
                            </div>
                        </div>

                        {/* Tree Information */}
                        <div className={styles.TreeInfo}>
                            <h3 className={styles.SectionTitle}>ข้อมูลต้นไม้</h3>
                            <div className={styles.InfoGrid}>
                                <div className={styles.InfoItem}>
                                    <span className={styles.InfoLabel}>ชื่อวิทยาศาสตร์:</span>
                                    <span className={styles.InfoValue}>{treeInfo.scientificName}</span>
                                </div>
                                <div className={styles.InfoItem}>
                                    <span className={styles.InfoLabel}>ประเภท:</span>
                                    <span className={styles.InfoValue}>{treeInfo.type}</span>
                                </div>
                                <div className={styles.InfoItem}>
                                    <span className={styles.InfoLabel}>ใช้ประโยชน์:</span>
                                    <span className={styles.InfoValue}>{treeInfo.use}</span>
                                </div>
                                <div className={styles.InfoItem}>
                                    <span className={styles.InfoLabel}>ระยะเวลาเจริญเติบโต:</span>
                                    <span className={styles.InfoValue}>{treeInfo.growthPeriod}</span>
                                </div>
                            </div>
                            
                            <div className={styles.Description}>
                                <p>{treeInfo.description}</p>
                            </div>
                        </div>

                        {/* Locations List */}
                        <div className={styles.LocationsSection}>
                            <h3 className={styles.SectionTitle}>พื้นที่ปลูก</h3>
                            <div className={styles.LocationsList}>
                                {tree.locations
                                    .sort((a, b) => b.count - a.count)
                                    .map((location, index) => (
                                    <div 
                                        key={index} 
                                        className={styles.LocationCard}
                                        onClick={() => handlers.handleLocationSelect(location)}
                                    >
                                        <div className={styles.LocationHeader}>
                                            <span className={styles.LocationName}>📍 {location.name}</span>
                                            <span className={styles.LocationRank}>#{index + 1}</span>
                                        </div>
                                        <div className={styles.LocationStats}>
                                            <div className={styles.LocationCount}>
                                                <span className={styles.CountValue}>{location.count.toLocaleString()}</span>
                                                <span className={styles.CountLabel}>ต้น</span>
                                            </div>
                                            <div className={styles.LocationPercentage}>
                                                {handlers.getLocationPercentage(location.count, tree.totalCount)}%
                                            </div>
                                        </div>
                                        <div className={styles.LocationBar}>
                                            <div 
                                                className={styles.LocationProgress}
                                                style={{
                                                    width: `${handlers.getLocationPercentage(location.count, tree.totalCount)}%`
                                                }}
                                            />
                                        </div>
                                        <button className={styles.ViewOnMapButton}>
                                            ดูบนแผนที่
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
