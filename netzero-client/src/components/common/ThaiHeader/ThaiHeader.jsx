import React from "react";
import styles from "./ThaiHeader.module.scss";
import useThaiHeader from "./useThaiHeader";
import ThaiHeaderHandler from "./ThaiHeaderHandler";

export default function ThaiHeader() {
    const { stateThaiHeader, setThaiHeader } = useThaiHeader();
    const handlers = ThaiHeaderHandler(stateThaiHeader, setThaiHeader);
    
    return (
        <header className={styles.Container}>
            <div className={styles.HeaderContent}>
                <div className={styles.TitleSection}>
                    <h1 className={styles.MainTitle}>งานผลิตภัณฑ์ออร์แกนิคไทย</h1>
                    <div className={styles.EnglishTitle}>Thai Local Organic Products Events</div>
                </div>
            </div>
            
            <div className={styles.BackgroundPattern}></div>
        </header>
    );
}
