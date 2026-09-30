import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getAllArticles } from '../../api/dataService';
import Loading from '../../components/common/Loading/Loading';
import styles from './KnowledgeHub.module.scss';

export default function KnowledgeHub() {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllArticles();
        setArticles(response.data.articles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const content = {
    title: { th: 'คลังความรู้', en: 'Knowledge Hub' },
    subtitle: { th: 'บทความและข้อมูลเชิงลึกเกี่ยวกับตลาดสากล', en: 'Articles and insights about global markets' },
    readTime: { th: 'นาที', en: 'min read' }
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.KnowledgeHub}>
      <div className={styles.Container}>
        <div className={styles.Header}>
          <h1 className={styles.Title}>{t(content.title)}</h1>
          <p className={styles.Subtitle}>{t(content.subtitle)}</p>
        </div>
        <div className={styles.Grid}>
          {articles.map((article) => (
            <div key={article.id} className={styles.Card}>
              <img src={article.thumbnail || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'} 
                   alt={t(article.title)} className={styles.CardImage} />
              <div className={styles.CardContent}>
                <h3 className={styles.CardTitle}>{t(article.title)}</h3>
                <p className={styles.CardExcerpt}>{t(article.excerpt)}</p>
                <div className={styles.CardMeta}>
                  <span>{t(article.author.name)}</span>
                  <span>•</span>
                  <span>{article.readTime} {t(content.readTime)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
