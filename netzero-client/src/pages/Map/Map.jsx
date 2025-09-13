import React from "react";
import styles from "./Map.module.scss";
import useMap from "./useMap";
import MapHandler from "./MapHandler";
import { OrganicDecoration, FloatingNavBar, GoogleIcon } from "../../components/common";
import { TreeModal, LocationModal } from "../../components/trees";
import { MapCard, TreeListCard } from "../../components/map";

export default function Map() {
    const { stateMap, setMap, refreshTreeData, searchTrees, getTreeByName } = useMap();
    const handlers = MapHandler(stateMap, setMap, { refreshTreeData, searchTrees, getTreeByName });
    
    return (
        <div className={styles.Container}>
            <OrganicDecoration 
                variant="floating"
                count={6}
                className={styles.BackgroundDecoration}
                theme="map"
            />
            
            
            <div className={styles.MainContent}>
                {/* Left Sidebar - Tree List */}
                <div className={styles.SidebarContainer}>
                    <div className={styles.TabContainer}>
                        <button
                            className={`${styles.TabButton} ${styles.Active}`}
                        >
                            <span className={styles.TabIcon}>
                                <GoogleIcon iconType="forest" size="medium" />
                            </span>
                            ต้นไม้
                        </button>
                    </div>
                    
                    <div className={styles.TabContent}>
                        <TreeListCard
                            trees={stateMap.processedTreeData}
                            selectedTree={stateMap.selectedTree}
                            onTreeClick={handlers.handleTreeClick}
                            onLocationMapView={handlers.handleCenterMapToLocation}
                            theme="map"
                        />
                    </div>
                </div>

                {/* Right Side - Map */}
                <div className={styles.MapContainer}>
                    <MapCard
                        trees={stateMap.processedTreeData}
                        activeTab="trees"
                        onTreeSelect={handlers.handleTreeClick}
                        onLocationSelect={handlers.handleLocationClick}
                        onMapReady={handlers.handleMapReady}
                        centerToLocation={stateMap.centerToLocation}
                        loading={stateMap.isLoading}
                        theme="map"
                    />
                </div>
            </div>
            
            {/* Location Modal */}
            {stateMap.selectedLocation && (
                <LocationModal
                    location={stateMap.selectedLocation}
                    isOpen={stateMap.isLocationModalOpen}
                    onClose={handlers.handleCloseLocationModal}
                    onTreeSelect={handlers.handleTreeClick}
                    theme="map"
                />
            )}
            
            {/* Tree Modal */}
            {stateMap.selectedTree && (
                <TreeModal
                    tree={stateMap.selectedTree}
                    isOpen={stateMap.isTreeModalOpen}
                    onClose={handlers.handleCloseTreeModal}
                    onLocationSelect={handlers.handleCenterMapToLocation}
                    theme="map"
                />
            )}
            
            <FloatingNavBar
                onNavigate={handlers.handleNavigate}
                theme="map"
            />
        </div>
    );
}
