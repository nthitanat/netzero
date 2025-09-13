import React from "react";
import styles from "./MapCard.module.scss";
import useMapCard from "./useMapCard";
import MapCardHandler from "./MapCardHandler";

export default function MapCard({ 
    trees = [],
    activeTab = "trees",
    onTreeSelect,
    onLocationSelect,
    onMapReady,
    centerToLocation,
    loading = false,
    theme = "tree"
}) {
    const { stateMapCard, setMapCard, mapContainer, addTreeMarkers } = useMapCard({
        trees,
        activeTab,
        onTreeSelect,
        onLocationSelect,
        onMapReady,
        centerToLocation
    });
    const handlers = MapCardHandler(stateMapCard, setMapCard, addTreeMarkers);
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]}`}>
            <div className={styles.Header}>
                <h2 className={styles.Title}>
                    แผนที่ต้นไม้
                </h2>
            </div>
            
            <div className={styles.MapContainer}>
                <div className={styles.MapWrapper}>
                    <div 
                        ref={mapContainer} 
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
                
                {stateMapCard.isLoading && (
                    <div className={styles.LoadingOverlay}>
                        <div className={styles.LoadingText}>กำลังโหลดแผนที่...</div>
                    </div>
                )}
            </div>
            
            <div className={styles.MapInfo}>
                <div className={styles.ProductCount}>
                    {`${trees.length} ชนิดต้นไม้`}
                </div>
            </div>
        </div>
    );
}
