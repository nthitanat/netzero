import React from 'react';
import styles from './ProfileCard.module.scss';

/**
 * Generic profile / person card for a sidebar.
 *
 * Props:
 *  - image       {string}   Avatar image URL
 *  - imageAlt    {string}
 *  - name        {string}
 *  - role        {string}   Primary role label (shown in accent color)
 *  - occupation  {string}   Secondary descriptor
 *  - badge       {{ icon: string, title: string } | null}
 *                           Small circular badge overlaid on avatar
 *  - sections    {Array<{
 *                  sectionIcon:  string,
 *                  sectionTitle: string,
 *                  items: Array<{
 *                    icon:  string,
 *                    label: string,
 *                    type:  'list' | 'tags',
 *                    data:  string[]
 *                  }>
 *                }> | null}
 *                Expandable info sections shown below the header
 */
const ProfileCard = ({ image, imageAlt, name, role, occupation, badge = null, sections = null }) => (
  <div className={styles.profileCard}>
    {/* Avatar + basic info */}
    <div className={styles.profileHeader}>
      <div className={styles.profileImage}>
        <img src={image} alt={imageAlt} />
        {badge && (
          <div className={styles.profileBadge} title={badge.title}>
            <span className="material-symbols-outlined">{badge.icon}</span>
          </div>
        )}
      </div>
      <div className={styles.profileBasicInfo}>
        <h3 className={styles.profileName}>{name}</h3>
        <p className={styles.profileRole}>{role}</p>
        <p className={styles.profileOccupation}>{occupation}</p>
      </div>
    </div>

    {/* Optional info sections */}
    {sections && sections.map((section, sectionIndex) => (
      <div key={sectionIndex} className={styles.profileSection}>
        <div className={styles.sectionHeader}>
          <span className="material-symbols-outlined">{section.sectionIcon}</span>
          <h4>{section.sectionTitle}</h4>
        </div>

        {section.items.map((item, itemIndex) => (
          <div key={itemIndex} className={styles.sectionItem}>
            <div className={styles.itemIcon}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div>
              <strong>{item.label}</strong>
              {item.type === 'list' && (
                <ul>
                  {item.data.map((entry, i) => (
                    <li key={i}>{entry}</li>
                  ))}
                </ul>
              )}
              {item.type === 'tags' && (
                <div className={styles.tagList}>
                  {item.data.map((tag, i) => (
                    <span key={i} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default ProfileCard;
