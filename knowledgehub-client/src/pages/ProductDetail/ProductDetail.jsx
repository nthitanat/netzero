import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById } from '../../api/dataService';
import { useLanguage } from '../../context/LanguageContext';
import Loading from '../../components/common/Loading/Loading';
import styles from './ProductDetail.module.scss';

export default function ProductDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProductById(id)
      .then(({ data }) => {
        if (active) {
          setProduct(data.product);
          setCommunity(data.community);
        }
      })
      .catch(() => {
        if (active) {
          setProduct(null);
          setCommunity(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  if (loading) return <Loading />;

  if (!product) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to="/showroom" className={styles.backLink}>
            {language === 'th' ? '← กลับไปที่โชว์รูม' : '← Back to showroom'}
          </Link>
          <h1>{language === 'th' ? 'ไม่พบสินค้า' : 'Product not found'}</h1>
        </div>
      </div>
    );
  }

  const price = product.price?.amount != null
    ? `${product.price.amount.toLocaleString(language === 'th' ? 'th-TH' : 'en-US')} ${product.price.currency || 'THB'}`
    : t(product.price?.note);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/showroom" className={styles.backLink}>
          {language === 'th' ? '← กลับไปที่โชว์รูม' : '← Back to showroom'}
        </Link>
        <div className={styles.layout}>
          <div className={styles.imageWrap}>
            {product.images?.[0] && (
              <img src={product.images[0]} alt={t(product.name)} className={styles.image} />
            )}
          </div>
          <div className={styles.content}>
            <span className={styles.category}>{product.category}</span>
            <h1>{t(product.name)}</h1>
            {community && (
              <Link to={`/communities/${community.slug}`} className={styles.community}>
                {t(community.name)}
              </Link>
            )}
            <p className={styles.description}>{t(product.description)}</p>
            {price && <p className={styles.price}>{price}</p>}
            {product.unit && <p className={styles.meta}>{product.unit}</p>}
            {t(product.materials) && (
              <section className={styles.section}>
                <h2>{language === 'th' ? 'รายละเอียด' : 'Details'}</h2>
                <p>{t(product.materials)}</p>
              </section>
            )}
            {product.certifications?.length > 0 && (
              <section className={styles.section}>
                <h2>{language === 'th' ? 'การรับรอง' : 'Certifications'}</h2>
                <p>{product.certifications.join(', ')}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
