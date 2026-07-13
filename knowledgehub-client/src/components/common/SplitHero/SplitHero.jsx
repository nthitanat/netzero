import React, { useRef } from 'react';
import styles from './SplitHero.module.scss';

/**
 * Generic split-layout hero section.
 *
 * Props:
 *  - image      {string}    Hero image URL
 *  - imageAlt   {string}    Alt text for hero image
 *  - badge      {string}    Small label shown above the title
 *  - title      {string}    Headline — first word gets primary color, rest alternate
 *  - tagline    {string}    Sub-headline shown below title
 *  - meta       {Array<{ icon: string, text: string }>}  Icon+text chips
 *  - actions    {ReactNode} Buttons / action row rendered below meta
 */
const SplitHero = ({ image, imageAlt, badge, title, tagline, meta = [], actions, palette }) => {
  const imageContainerRef = useRef(null);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight && imageContainerRef.current) {
      imageContainerRef.current.style.setProperty(
        '--img-aspect',
        `${naturalWidth} / ${naturalHeight}`
      );
    }
  };

  const words = title ? title.split(' ') : [];
  const paletteVars = palette ? {
    '--pal-p1': palette.p1, '--pal-p2': palette.p2,
    '--pal-p3': palette.p3, '--pal-p4': palette.p4,
  } : {};

  return (
    <section className={styles.hero} style={paletteVars}>
      <div className={styles.heroSplit}>
        {/* Image Side */}
        <div className={styles.heroImageSide}>
          <div className={styles.heroImageContainer} ref={imageContainerRef}>
            <img src={image} alt={imageAlt} onLoad={handleImageLoad} />
          </div>
        </div>

        {/* Text Side */}
        <div className={styles.heroTextSide}>
          <div className={styles.heroTextContent}>
            {badge && <div className={styles.badge}>{badge}</div>}

            <h1 className={styles.heroTitle}>
              <span className={styles.titleWord1}>{words[0]}</span>
              {words.slice(1).map((word, idx) => (
                <span
                  key={idx}
                  className={idx % 2 === 0 ? styles.titleWord2 : styles.titleWord3}
                >
                  {' '}{word}
                </span>
              ))}
            </h1>

            {tagline && <p className={styles.heroTagline}>{tagline}</p>}

            {meta.length > 0 && (
              <div className={styles.heroMeta}>
                {meta.map((item, index) => (
                  <span key={index}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.text}
                  </span>
                ))}
              </div>
            )}

            {actions && <div className={styles.heroActions}>{actions}</div>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SplitHero;
