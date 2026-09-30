import React from 'react';
import styles from './SplitBanner.module.scss';

/**
 * Compact split-layout banner section (less height than SplitHero).
 *
 * Props:
 *  - image      {string}    Banner image URL
 *  - imageAlt   {string}    Alt text for banner image
 *  - badge      {string}    Small label shown above the title
 *  - title      {string}    Headline — first word gets primary color, rest alternate
 *  - tagline    {string}    Sub-headline shown below title
 *  - meta       {Array<{ icon: string, text: string }>}  Icon+text chips
 *  - actions    {ReactNode} Buttons / action row rendered below meta
 */
const SplitBanner = ({ image, imageAlt, badge, title, tagline, meta = [], actions, palette }) => {
  const words = title ? title.split(' ') : [];
  const paletteVars = palette ? {
    '--pal-p1': palette.p1, '--pal-p2': palette.p2,
    '--pal-p3': palette.p3, '--pal-p4': palette.p4,
  } : {};

  return (
    <section className={styles.banner} style={paletteVars}>
      <div className={styles.bannerSplit}>
        {/* Image Side */}
        <div className={styles.bannerImageSide}>
          <div className={styles.bannerImageContainer}>
            <img src={image} alt={imageAlt} />
          </div>
        </div>

        {/* Text Side */}
        <div className={styles.bannerTextSide}>
          <div className={styles.bannerTextContent}>
            {badge && <div className={styles.badge}>{badge}</div>}

            <h2 className={styles.bannerTitle}>
              <span className={styles.titleWord1}>{words[0]}</span>
              {words.slice(1).map((word, idx) => (
                <span
                  key={idx}
                  className={idx % 2 === 0 ? styles.titleWord2 : styles.titleWord3}
                >
                  {' '}{word}
                </span>
              ))}
            </h2>

            {tagline && <p className={styles.bannerTagline}>{tagline}</p>}

            {meta.length > 0 && (
              <div className={styles.bannerMeta}>
                {meta.map((item, index) => (
                  <span key={index}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                    {item.text}
                  </span>
                ))}
              </div>
            )}

            {actions && <div className={styles.bannerActions}>{actions}</div>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SplitBanner;
