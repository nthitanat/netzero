import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getAllProducts, getAllCommunities } from '../../api/dataService';
import Loading from '../../components/common/Loading/Loading';
import SplitBanner from '../../components/common/SplitBanner/SplitBanner';
import styles from './Showroom.module.scss';

export default function Showroom() {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [communities, setCommunities] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, communitiesRes] = await Promise.all([
          getAllProducts({ available: true }),
          getAllCommunities()
        ]);
        
        setProducts(productsRes.data.products);

        // Create communities lookup map
        const communitiesMap = {};
        communitiesRes.data.communities.forEach(c => {
          communitiesMap[c.id] = c;
        });
        setCommunities(communitiesMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const content = {
    title: {
      th: 'Digital Showroom',
      en: 'Digital Showroom'
    },
    subtitle: {
      th: 'สำรวจสินค้าคุณภาพจากชุมชนทั่วประเทศไทย',
      en: 'Explore quality products from communities across Thailand'
    },
    currency: {
      th: 'บาท',
      en: 'THB'
    },
    from: {
      th: 'จาก',
      en: 'from'
    }
  };

  const pinnedProduct = products.find(p => p.isPinned);
  const pinnedCommunity = pinnedProduct ? communities[pinnedProduct.communityId] : null;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles.showroom}>
      {pinnedProduct && (
        <SplitBanner
          image={pinnedProduct.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
          imageAlt={t(pinnedProduct.name)}
          badge={pinnedCommunity ? t(pinnedCommunity.name) : pinnedProduct.category}
          title={t(pinnedProduct.name)}
          tagline={t(pinnedProduct.description)}
          meta={[
            { icon: 'inventory_2', text: pinnedProduct.unit },
          ]}
          actions={
            <Link to={`/showroom/${pinnedProduct.id}`} className={styles.bannerCta}>
              {language === 'th' ? 'ดูรายละเอียด' : 'View Product'}
            </Link>
          }
        />
      )}
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>
            {language === 'th' ? 'สินค้าชุมชน' : 'Community Products'}
          </span>
          <h1 className={styles.title}>{t(content.title)}</h1>
          <p className={styles.subtitle}>{t(content.subtitle)}</p>
        </div>

        <div className={styles.grid}>
          {products.map((product) => {
            const community = communities[product.communityId];
            return (
              <Link
                key={product.id}
                to={`/showroom/${product.id}`}
                className={styles.productCard}
              >
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                  alt={t(product.name)}
                  className={styles.productImage}
                />
                <div className={styles.productContent}>
                  <h3 className={styles.productTitle}>
                    {t(product.name)}
                  </h3>
                  <p className={styles.productDescription}>
                    {t(product.description)}
                  </p>
                  <div className={styles.productFooter}>
                    {community && (
                      <div className={styles.productCommunity}>
                        {t(content.from)} {t(community.name)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
