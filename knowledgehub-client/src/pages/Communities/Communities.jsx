import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getAllCommunities } from '../../api/dataService';
import Loading from '../../components/common/Loading/Loading';
import CollapsibleCatalog from '../../components/common/CollapsibleCatalog/CollapsibleCatalog';
import CommunityDetailView from '../../components/common/CommunityDetailView/CommunityDetailView';
import styles from './Communities.module.scss';

export default function Communities() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [activeSlug, setActiveSlug] = useState(null);
  const sliderRef = useRef(null);

  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllCommunities();
        const list = response.data.communities;
        setCommunities(list);
        const featured = list.find(c => c.featured) || list[0];
        if (featured) setActiveSlug(featured.slug);
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.Communities}>
      <div className={styles.CatalogSection}>
        <CollapsibleCatalog
          title={language === 'th' ? 'ชุมชนทั้งหมด' : 'All Communities'}
          titleIcon="travel_explore"
        >
          <div className={styles.SliderWrapper}>
            <button
              className={`${styles.ArrowBtn} ${styles.ArrowLeft}`}
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className={styles.Slider} ref={sliderRef}>
              {communities.map((community) => (
                <button
                  key={community.id}
                  className={`${styles.CatalogCard} ${activeSlug === community.slug ? styles.active : ''}`}
                  onClick={() => setActiveSlug(community.slug)}
                >
                  <div className={styles.CardImageWrap}>
                    <img
                      src={community.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400'}
                      alt={t(community.name)}
                      className={styles.CardImage}
                    />
                    {activeSlug === community.slug && (
                      <div className={styles.ActiveBadge}>
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.CardInfo}>
                    <p className={styles.CardName}>{t(community.name)}</p>
                    <div className={styles.CardMeta}>
                      <span className={styles.CardProvince}>
                        <span className="material-symbols-outlined">location_on</span>
                        {community.province}
                      </span>
                      <span className={styles.CardCategory}>{community.category}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              className={`${styles.ArrowBtn} ${styles.ArrowRight}`}
              onClick={() => scroll(1)}
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </CollapsibleCatalog>
      </div>

      {activeSlug && (
        <div className={styles.DetailSection}>
          <CommunityDetailView slug={activeSlug} />
        </div>
      )}
    </div>
  );
}
