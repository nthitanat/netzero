import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthFlow } from '../../../contexts/AuthFlowContext';
import { getCommunityBySlug } from '../../../api/dataService';
import Loading from '../Loading/Loading';
import Timeline from '../Timeline/Timeline';
import MediaGallery from '../MediaGallery/MediaGallery';
import FollowButton from '../FollowButton/FollowButton';
import SplitHero from '../SplitHero/SplitHero';
import TabNav from '../TabNav/TabNav';
import ProfileCard from '../ProfileCard/ProfileCard';
import InfoCard from '../InfoCard/InfoCard';
import LinkedListCard from '../LinkedListCard/LinkedListCard';
import ItemCard from '../ItemCard/ItemCard';
import styles from './CommunityDetailView.module.scss';

const CommunityDetailView = ({ slug }) => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { openRegister } = useAuthFlow();
  const [community, setCommunity] = useState(null);
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('story');
  const [isFollowing, setIsFollowing] = useState(false);

  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setActiveTab('story');
        const response = await getCommunityBySlug(slug);
        setCommunity(response.data.community);
        setProducts(response.data.products);
        setCourses(response.data.courses);
      } catch (error) {
        console.error('Error fetching community:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return <Loading />;
  }

  if (!community) {
    return (
      <div className={styles.notFound}>
        <h1>{language === 'th' ? 'ไม่พบชุมชน' : 'Community Not Found'}</h1>
      </div>
    );
  }

  const tabs = [
    { key: 'story', icon: 'auto_stories', label: language === 'th' ? 'เรื่องราว' : 'Story' },
    { key: 'journey', icon: 'timeline', label: language === 'th' ? 'เส้นทาง' : 'Journey' },
    { key: 'media', icon: 'photo_library', label: language === 'th' ? 'สื่อ' : 'Media' },
    ...(products.length > 0
      ? [{ key: 'products', icon: 'shopping_bag', label: language === 'th' ? 'ผลิตภัณฑ์' : 'Products' }]
      : []),
  ];

  const quickInfoItems = [
    { icon: 'location_on', label: language === 'th' ? 'สถานที่' : 'Location', value: community.province },
    { icon: 'category', label: language === 'th' ? 'ประเภท' : 'Category', value: community.category },
    {
      icon: 'public',
      label: language === 'th' ? 'ตลาด' : 'Markets',
      value: community.targetMarkets?.join(', ').toUpperCase(),
    },
  ];

  const profileSections = (community.leader.cuAlumni && community.leader.cuRelationship)
    ? [{
        sectionIcon: 'handshake',
        sectionTitle: language === 'th' ? 'ความร่วมมือกับจุฬาฯ' : 'CU Collaboration',
        items: [
          community.leader.cuRelationship.researchProjects && {
            icon: 'science',
            label: language === 'th' ? 'โครงการวิจัย' : 'Research Projects',
            type: 'list',
            data: community.leader.cuRelationship.researchProjects.map(p => t(p)),
          },
          community.leader.cuRelationship.collaborations && {
            icon: 'groups',
            label: language === 'th' ? 'ความร่วมมือ' : 'Collaborations',
            type: 'tags',
            data: community.leader.cuRelationship.collaborations.map(c => t(c)),
          },
        ].filter(Boolean),
      }]
    : null;

  return (
    <div className={styles.communityDetail}>
      {/* Hero */}
      <SplitHero
        image={community.image}
        imageAlt={t(community.name)}
        badge={community.type === 'group'
          ? (language === 'th' ? 'กลุ่ม' : 'Group')
          : (language === 'th' ? 'รายบุคคล' : 'Individual')}
        title={t(community.name)}
        tagline={t(community.tagline)}
        meta={[
          { icon: 'location_on', text: community.province },
          { icon: 'category', text: community.category },
        ]}
        actions={
          <>
            <FollowButton
              isFollowing={isFollowing}
              onClick={() => setIsFollowing(!isFollowing)}
            />
            {community.link && (
              <a
                href={community.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
              >
                <span className="material-symbols-outlined">open_in_new</span>
                {language === 'th' ? 'เรียนรู้เพิ่มเติม' : 'Learn More'}
              </a>
            )}
            {community.needRegister === 1 && (
              <button
                className={styles.registerButton}
                onClick={() => openRegister()}
              >
                <span className="material-symbols-outlined">how_to_reg</span>
                {language === 'th' ? 'ลงทะเบียน' : 'Register'}
              </button>
            )}
            <button className={styles.shareButton}>
              <span className="material-symbols-outlined">share</span>
              {language === 'th' ? 'แชร์' : 'Share'}
            </button>
          </>
        }
      />

      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Main content */}
          <div className={styles.mainContent}>
            <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <div className={styles.tabContent}>
              {activeTab === 'story' && (
                <div className={styles.storyTab}>
                  <h2 className={styles.contentTitle}>
                    {language === 'th' ? 'เรื่องราวของเรา' : 'Our Story'}
                  </h2>
                  <div className={styles.storyGrid}>
                    <div className={styles.storyMain}>
                      <p className={styles.storyLead}>{t(community.story)}</p>
                      {community.storyDetails && (
                        <div className={styles.storyDetails}>
                          {t(community.storyDetails).split('\n\n').map((paragraph, index) => (
                            paragraph.trim() && <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'journey' && community.timeline && community.timeline.length > 0 && (
                <div className={styles.journeyTab}>
                  <h2 className={styles.contentTitle}>
                    {language === 'th' ? 'เส้นทางความสำเร็จ' : 'Our Journey'}
                  </h2>
                  <Timeline items={community.timeline} />
                </div>
              )}

              {activeTab === 'media' && (
                <div className={styles.mediaTab}>
                  <h2 className={styles.contentTitle}>
                    {language === 'th' ? 'ภาพและวิดีโอ' : 'Photos & Videos'}
                  </h2>
                  {((community.images && community.images.length > 0) || (community.videos && community.videos.length > 0)) ? (
                    <MediaGallery images={community.images} videos={community.videos} />
                  ) : (
                    <p className={styles.noContent}>
                      {language === 'th' ? 'ยังไม่มีสื่อในขณะนี้' : 'No media available yet'}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'products' && products.length > 0 && (
                <div className={styles.productsTab}>
                  <h2 className={styles.contentTitle}>
                    {language === 'th' ? 'ผลิตภัณฑ์' : 'Products'}
                  </h2>
                  <div className={styles.productsGrid}>
                    {products.map((product) => (
                      <ItemCard
                        key={product.id}
                        to={`/showroom/${product.slug}`}
                        image={product.image}
                        imageAlt={t(product.name)}
                        title={t(product.name)}
                        subtitle={`${product.price} THB`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.stickyWrapper}>
              <ProfileCard
                image={community.leader.image}
                imageAlt={t(community.leader.name)}
                name={t(community.leader.name)}
                role={t(community.leader.role)}
                occupation={t(community.leader.occupation)}
                badge={community.leader.cuAlumni ? { icon: 'school', title: 'CU Alumni' } : null}
                sections={profileSections}
              />

              <InfoCard
                title={language === 'th' ? 'ข้อมูลด่วน' : 'Quick Info'}
                items={quickInfoItems}
              />

              {courses.length > 0 && (
                <LinkedListCard
                  title={language === 'th' ? 'หลักสูตรที่เกี่ยวข้อง' : 'Related Courses'}
                  titleIcon="school"
                  items={courses.map((course) => ({
                    to: `/courses/${course.slug}`,
                    icon: 'play_circle',
                    primary: t(course.name),
                    secondary: `${course.duration} • ${course.level}`,
                  }))}
                />
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Follow Button */}
      <FollowButton communityId={community.id} communityName={community.name} />
    </div>
  );
};

export default CommunityDetailView;
