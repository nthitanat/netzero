import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ItemCard.module.scss';

/**
 * Generic linked item card — image thumbnail + title + subtitle.
 * Used for products, resources, or any grid of navigable items.
 *
 * Props:
 *  - to       {string}  React Router path
 *  - image    {string}  Thumbnail image URL
 *  - imageAlt {string}
 *  - title    {string}
 *  - subtitle {string}  E.g. price, category, meta
 */
const ItemCard = ({ to, image, imageAlt, title, subtitle, palette }) => {
  const paletteVars = palette ? {
    '--pal-p1': palette.p1, '--pal-p2': palette.p2,
    '--pal-p3': palette.p3, '--pal-p4': palette.p4,
  } : {};
  return (
  <Link to={to} className={styles.itemCard} style={paletteVars}>
    <div className={styles.itemImage}>
      <img src={image} alt={imageAlt} />
    </div>
    <div className={styles.itemInfo}>
      <h3 className={styles.itemTitle}>{title}</h3>
      <p className={styles.itemSubtitle}>{subtitle}</p>
    </div>
  </Link>
  );
};

export default ItemCard;
