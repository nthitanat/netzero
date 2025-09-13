import React from "react";
import styles from "./TreeListCard.module.scss";
import useTreeListCard from "./useTreeListCard";
import TreeListCardHandler from "./TreeListCardHandler";

export default function TreeListCard({ 
    trees = [],
    selectedTree = null,
    onTreeClick,
    onLocationMapView,
    theme = "tree"
}) {
    const { stateTreeListCard, setTreeListCard } = useTreeListCard({
        selectedTree
    });
    const handlers = TreeListCardHandler(stateTreeListCard, setTreeListCard, {
        onTreeClick,
        onLocationMapView
    });
    
    return (
        <div className={`${styles.Container} ${styles[`${theme}-theme`]}`}>
            <div className={styles.Header}>
                <h2 className={styles.Title}>รายการต้นไม้</h2>
                <div className={styles.Count}>
                    {trees.length} ประเภท
                </div>
            </div>
            
            <div className={styles.TreeList}>
                {trees.length === 0 ? (
                    <div className={styles.EmptyState}>
                        <div className={styles.EmptyIcon}>🌳</div>
                        <p className={styles.EmptyText}>ไม่พบข้อมูลต้นไม้ในพื้นที่นี้</p>
                    </div>
                ) : (
                    trees.map((tree) => (
                        <div
                            key={tree.name}
                            className={`${styles.TreeItem} ${
                                selectedTree?.name === tree.name ? styles.Selected : ''
                            }`}
                        >
                            <div className={styles.TreeIcon}>
                                <span className={styles.Icon}>🌳</span>
                                <div className={styles.TreeTypeBadge}>
                                    {handlers.getTreeTypeEmoji(tree.name)}
                                </div>
                            </div>
                            
                            <div className={styles.TreeInfo}>
                                <h3 className={styles.TreeName}>{tree.name}</h3>
                                <p className={styles.TreeStats}>
                                    จำนวน: {tree.totalCount} ต้น • {tree.locations.length} พื้นที่
                                </p>
                                
                                <div className={styles.LocationsList}>
                                    {tree.locations.slice(0, 3).map((location, index) => (
                                        <div key={index} className={styles.LocationItem}>
                                            <span className={styles.LocationName}>
                                                📍 {location.name}
                                            </span>
                                            <span className={styles.LocationCount}>
                                                {location.count} ต้น
                                            </span>
                                            <button
                                                className={styles.ViewLocationButton}
                                                onClick={() => handlers.handleLocationMapView(location)}
                                            >
                                                ดูบนแผนที่
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {tree.locations.length > 3 && (
                                        <div className={styles.MoreLocations}>
                                            และอีก {tree.locations.length - 3} พื้นที่
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.TreeActions}>
                                <button
                                    className={styles.ViewAllButton}
                                    onClick={() => handlers.handleTreeClick(tree)}
                                >
                                    ดูรายละเอียด
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
