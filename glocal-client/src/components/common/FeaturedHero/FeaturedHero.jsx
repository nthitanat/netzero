import React from 'react';
import styles from './FeaturedHero.module.scss';

/**
 * FeaturedHero — Immersive full-bleed image hero.
 *
 * Same prop API as SplitHero, but with a 60/40 image-heavy layout,
 * CU palette, glass badge floating over the image, and richer
 * organic decorations.
 *
 * Props:
 *  - image      {string}    Hero image URL
 *  - imageAlt   {string}    Alt text for hero image
 *  - badge      {string}    Small label — floats on the image (glass style)
 *  - title      {string}    Headline — first word CU pink, rest alternate
 *  - tagline    {string}    Sub-headline shown below title
 *  - meta       {Array<{ icon: string, text: string }>}  Icon+text chips
 *  - actions    {ReactNode} Buttons / action row rendered below meta
 *  - palette    {object}    Optional { p1, p2, p3, p4 } to override CSS vars
 */
const FeaturedHero = ({ image, imageAlt, badge, title, tagline, meta = [], actions, palette }) => {
  const words = title ? title.split(' ') : [];
  const paletteVars = palette ? {
    '--pal-p1': palette.p1, '--pal-p2': palette.p2,
    '--pal-p3': palette.p3, '--pal-p4': palette.p4,
  } : {};

  return (
    <section className={styles.hero} style={paletteVars}>
      {/* Floating decorative accents */}
      <div className={styles.accentRing1} aria-hidden="true" />
      <div className={styles.accentRing2} aria-hidden="true" />
      <div className={styles.accentDot1} aria-hidden="true" />
      <div className={styles.accentDot2} aria-hidden="true" />
      <div className={styles.accentDot3} aria-hidden="true" />

      <div className={styles.heroLayout}>

        {/* ── Image Side (60%) ── */}
        <div className={styles.heroImageSide}>
          <img src={image} alt={imageAlt} className={styles.heroImage} />
          <div className={styles.imageGradientOverlay} aria-hidden="true" />

          {/* Glass badge floats in the bottom-left of the image */}
          {badge && (
            <div className={styles.glassBadge}>
              <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
              {badge}
            </div>
          )}
        </div>

        {/* ── Text Panel (40%) ── */}
        <div className={styles.heroTextPanel}>
          <div className={styles.heroTextContent}>

            {/* Accent stripe above title */}
            <div className={styles.accentStripe} aria-hidden="true" />

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
                  <span key={index} className={styles.metaChip}>
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

export default FeaturedHero;
