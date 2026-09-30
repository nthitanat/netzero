import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './FollowButton.module.scss';

const FollowButton = ({ communityId, communityName }) => {
  const { language } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [followCount, setFollowCount] = useState(0);

  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  useEffect(() => {
    // Check if user is following this community
    const followedCommunities = JSON.parse(localStorage.getItem('followedCommunities') || '[]');
    setIsFollowing(followedCommunities.includes(communityId));

    // Get follow count (simulated)
    const followCounts = JSON.parse(localStorage.getItem('communityFollowCounts') || '{}');
    setFollowCount(followCounts[communityId] || Math.floor(Math.random() * 200) + 50);
  }, [communityId]);

  const handleToggleFollow = () => {
    const followedCommunities = JSON.parse(localStorage.getItem('followedCommunities') || '[]');
    const followCounts = JSON.parse(localStorage.getItem('communityFollowCounts') || '{}');

    if (isFollowing) {
      // Unfollow
      const updatedFollowed = followedCommunities.filter(id => id !== communityId);
      localStorage.setItem('followedCommunities', JSON.stringify(updatedFollowed));
      
      followCounts[communityId] = (followCounts[communityId] || 0) - 1;
      localStorage.setItem('communityFollowCounts', JSON.stringify(followCounts));
      
      setIsFollowing(false);
      setFollowCount(followCounts[communityId]);
      showToastMessage(language === 'th' ? 'เลิกติดตามแล้ว' : 'Unfollowed');
    } else {
      // Follow
      followedCommunities.push(communityId);
      localStorage.setItem('followedCommunities', JSON.stringify(followedCommunities));
      
      followCounts[communityId] = (followCounts[communityId] || 0) + 1;
      localStorage.setItem('communityFollowCounts', JSON.stringify(followCounts));
      
      setIsFollowing(true);
      setFollowCount(followCounts[communityId]);
      showToastMessage(
        language === 'th' 
          ? `กำลังติดตาม ${t(communityName)}` 
          : `Following ${t(communityName)}`
      );
    }
  };

  const showToastMessage = (message) => {
    setShowToast(message);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      <button
        className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
        onClick={handleToggleFollow}
        aria-label={isFollowing 
          ? (language === 'th' ? 'เลิกติดตาม' : 'Unfollow')
          : (language === 'th' ? 'ติดตาม' : 'Follow')
        }
      >
        <span className="material-symbols-outlined">
          {isFollowing ? 'bookmark' : 'bookmark_border'}
        </span>
        {followCount > 0 && (
          <span className={styles.badge}>{followCount}</span>
        )}
      </button>

      {showToast && (
        <div className={styles.toast}>
          <span className="material-symbols-outlined">
            {isFollowing ? 'check_circle' : 'info'}
          </span>
          <span>{showToast}</span>
        </div>
      )}
    </>
  );
};

export default FollowButton;
