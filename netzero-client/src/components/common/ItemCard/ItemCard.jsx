import React from "react";
import styles from "./ItemCard.module.scss";
import useItemCard from "./useItemCard";
import ItemCardHandler from "./ItemCardHandler";
import { ImageSlideshow, GoogleIcon } from "../";

export default function ItemCard({ 
    item, 
    onItemClick,
    config = {},
    badges = [],
    renderContent,
    className = ""
}) {
    const { stateItemCard, setItemCard } = useItemCard();
    const handlers = ItemCardHandler(stateItemCard, setItemCard, item, onItemClick);
    
    const {
        showThumbnail = true,
        thumbnailHeight = 220,
        borderRadius = 24
    } = config;
    
    return (
        <div 
            className={`${styles.Container} ${className}`}
            onClick={handlers.handleCardClick}
            onMouseEnter={handlers.handleMouseEnter}
            onMouseLeave={handlers.handleMouseLeave}
            style={{ 
                borderRadius: `${borderRadius}px`,
                '--thumbnail-height': `${thumbnailHeight}px`
            }}
        >
            {showThumbnail && (
                <div className={styles.ThumbnailContainer}>
                    <ImageSlideshow 
                        images={item.photos || item.images || [item.thumbnail || item.image]}
                        alt={item.title || item.name}
                        className={styles.ItemSlideshow}
                    />
                    
                    {badges.map((badge, index) => (
                        <div 
                            key={index}
                            className={`${styles.Badge} ${styles[`Badge${badge.position}`]}`}
                            style={badge.style}
                        >
                            {badge.icon && (
                                <GoogleIcon iconType={badge.icon} size="small" />
                            )}
                            {badge.text}
                        </div>
                    ))}
                </div>
            )}
            
            <div className={styles.ContentContainer}>
                {renderContent ? renderContent(item, stateItemCard, handlers) : (
                    <div className={styles.DefaultContent}>
                        <h3 className={styles.DefaultTitle}>
                            {item.title || item.name || 'Untitled'}
                        </h3>
                        {(item.description || item.summary) && (
                            <p className={styles.DefaultDescription}>
                                {item.description || item.summary}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
