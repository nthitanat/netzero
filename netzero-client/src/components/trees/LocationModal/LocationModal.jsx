import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./LocationModal.module.scss";
import useLocationModal from "./useLocationModal";
import LocationModalHandler from "./LocationModalHandler";
import { locationTreesService } from "../../../api";

export default function LocationModal({
    location,
    isOpen = false,
    onClose,
    onTreeSelect,
    theme = "tree"
}) {
    const { stateLocationModal, setLocationModal } = useLocationModal({
        location,
        isOpen
    });
    
    // Memoize handlers to prevent infinite re-renders
    const handlers = useMemo(() => LocationModalHandler(stateLocationModal, setLocationModal, {
        onClose,
        onTreeSelect
    }), [stateLocationModal, setLocationModal, onClose, onTreeSelect]);

    // State for location trees data
    const [locationTrees, setLocationTrees] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load location trees when modal opens
    const loadLocationTrees = useCallback(async (locationName) => {
        console.log('🏗️ LocationModal: loadLocationTrees called for:', locationName);
        try {
            setLoading(true);
            console.log('⏳ Setting loading to true');
            
            // Call service directly to avoid infinite loop
            const response = await locationTreesService.getTreesByLocation(locationName);
            const trees = response.data || [];
            
            console.log('📊 LocationModal: Received trees:', trees.length, trees);
            setLocationTrees(trees);
        } catch (error) {
            console.error('❌ LocationModal: Failed to load location trees:', error);
            setLocationTrees([]);
        } finally {
            setLoading(false);
            console.log('✅ Setting loading to false');
        }
    }, []); // No dependencies to prevent infinite loop

    useEffect(() => {
        console.log('🎯 LocationModal useEffect:', { isOpen, location });
        if (isOpen && location) {
            // Handle both string and object inputs
            const locationName = typeof location === 'string' ? location : location.name;
            console.log('🚀 Calling loadLocationTrees for:', locationName);
            loadLocationTrees(locationName);
        }
    }, [isOpen, location, loadLocationTrees]);

    // Helper to get location name from string or object
    const getLocationName = () => {
        return typeof location === 'string' ? location : location?.name || '';
    };

    // Helper to get coordinates from location object or service data
    const getLocationCoordinates = () => {
        if (typeof location === 'object' && location.coordinates) {
            return location.coordinates;
        }
        // If we have trees with location data, use the first one
        if (locationTrees.length > 0 && locationTrees[0].locationData) {
            return locationTrees[0].locationData.coordinates;
        }
        return null;
    };

    console.log('🎨 LocationModal render:', { 
        isOpen, 
        locationName: getLocationName(), 
        treesCount: locationTrees.length, 
        loading 
    });

    if (!isOpen || !location) return null;

    const locationName = getLocationName();
    const coordinates = getLocationCoordinates();

    return (
        <div className={styles.Overlay} onClick={handlers.handleOverlayClick}>
            <div className={`${styles.Modal} ${styles[`${theme}-theme`]}`} onClick={handlers.handleModalClick}>
                {/* Header */}
                <div className={styles.Header}>
                    <div className={styles.LocationTitle}>
                        <span className={styles.LocationIcon}>📍</span>
                        <h2 className={styles.LocationName}>{locationName}</h2>
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
                    {/* Location Info Section */}
                    <div className={styles.LocationInfoSection}>
                        <div className={styles.InfoCard}>
                            <div className={styles.CoordinateInfo}>
                                <div className={styles.InfoItem}>
                                    <span className={styles.InfoLabel}>🗺️ พิกัด:</span>
                                    <span className={styles.InfoValue}>
                                        {coordinates ? `${coordinates.lat?.toFixed(4)}, ${coordinates.lng?.toFixed(4)}` : 'ไม่มีข้อมูล'}
                                    </span>
                                </div>
                                <div className={styles.InfoItem}>
                                    <span className={styles.InfoLabel}>🌳 ชนิดต้นไม้:</span>
                                    <span className={styles.InfoValue}>{locationTrees.length} ชนิด</span>
                                </div>
                                <div className={styles.InfoItem}>
                                    <span className={styles.InfoLabel}>📊 จำนวนรวม:</span>
                                    <span className={styles.InfoValue}>
                                        {locationTrees.reduce((total, tree) => total + (tree.count || 0), 0).toLocaleString()} ต้น
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trees List Section */}
                    <div className={styles.TreesSection}>
                        <h3 className={styles.SectionTitle}>ต้นไม้ในพื้นที่</h3>
                        
                        {loading ? (
                            <div className={styles.LoadingState}>
                                <div className={styles.LoadingSpinner}></div>
                                <p>กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : locationTrees.length > 0 ? (
                            <div className={styles.TreesList}>
                                {locationTrees
                                    .sort((a, b) => (b.count || 0) - (a.count || 0))
                                    .map((tree, index) => (
                                    <div 
                                        key={`${tree.name}-${index}`} 
                                        className={styles.TreeCard}
                                        onClick={() => handlers.handleTreeSelect(tree)}
                                    >
                                        <div className={styles.TreeHeader}>
                                            <div className={styles.TreeInfo}>
                                                <span className={styles.TreeEmoji}>{tree.emoji || '🌳'}</span>
                                                <div className={styles.TreeDetails}>
                                                    <span className={styles.TreeName}>{tree.name}</span>
                                                    <span className={styles.TreeCategory}>{tree.category || 'ไม่ระบุ'}</span>
                                                </div>
                                            </div>
                                            <span className={styles.TreeRank}>#{index + 1}</span>
                                        </div>
                                        
                                        <div className={styles.TreeStats}>
                                            <div className={styles.TreeCount}>
                                                <span className={styles.CountValue}>{(tree.count || 0).toLocaleString()}</span>
                                                <span className={styles.CountLabel}>ต้น</span>
                                            </div>
                                            <div className={styles.TreePercentage}>
                                                {handlers.getTreePercentage(
                                                    tree.count || 0, 
                                                    locationTrees.reduce((total, t) => total + (t.count || 0), 0)
                                                )}%
                                            </div>
                                        </div>
                                        
                                        <div className={styles.TreeBar}>
                                            <div 
                                                className={styles.TreeProgress}
                                                style={{
                                                    width: `${handlers.getTreePercentage(
                                                        tree.count || 0, 
                                                        locationTrees.reduce((total, t) => total + (t.count || 0), 0)
                                                    )}%`
                                                }}
                                            />
                                        </div>
                                        
                                        <div className={styles.TreeType}>
                                            <span className={styles.TypeLabel}>ประเภท:</span>
                                            <span className={styles.TypeValue}>{tree.type || 'ไม่ระบุ'}</span>
                                        </div>
                                        
                                        <button className={styles.ViewDetailsButton}>
                                            ดูรายละเอียดต้นไม้
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.EmptyState}>
                                <span className={styles.EmptyIcon}>🌱</span>
                                <p>ไม่พบข้อมูลต้นไม้ในพื้นที่นี้</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
