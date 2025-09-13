import React from "react";
import styles from "./OrganicDecoration.module.scss";
import useOrganicDecoration from "./useOrganicDecoration";
import OrganicDecorationHandler from "./OrganicDecorationHandler";

export default function OrganicDecoration({ variant = "default", count = 6, className = "", theme = "market" }) {
    const { stateOrganicDecoration, setOrganicDecoration } = useOrganicDecoration({ variant, count });
    const handlers = OrganicDecorationHandler(stateOrganicDecoration, setOrganicDecoration);
    
    return (
        <div className={`${styles.Container} ${styles[variant]} ${styles[theme]} ${className}`}>
            {Array.from({ length: Math.min(count, 12) }, (_, i) => (
                <div key={i} className={`${styles.OrganicShape} ${styles[`Shape${(i % 8) + 1}`]}`} />
            ))}
            <div className={styles.LeafPattern1} />
            <div className={styles.LeafPattern2} />
            <div className={styles.FloatingDot1} />
            <div className={styles.FloatingDot2} />
        </div>
    );
}
