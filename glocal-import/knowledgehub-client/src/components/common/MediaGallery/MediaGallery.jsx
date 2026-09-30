import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './MediaGallery.module.scss';

const MediaGallery = ({ images = [], videos = [] }) => {
  const { language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const t = (content) => {
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['en'] || '';
    }
    return content;
  };

  const openLightbox = (image) => {
    setSelectedImage(image);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (images.length === 0 && videos.length === 0) {
    return null;
  }

  return (
    <div className={styles.mediaGallery}>
      {/* Photo Gallery */}
      {images.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {language === 'th' ? 'ภาพกิจกรรม' : 'Photo Gallery'}
          </h3>
          <div className={styles.photoGrid}>
            {images.map((image, index) => (
              <div
                key={index}
                className={styles.photoItem}
                onClick={() => openLightbox(image)}
              >
                <img src={image} alt={`Gallery ${index + 1}`} />
                <div className={styles.overlay}>
                  <span className="material-symbols-outlined">zoom_in</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Gallery */}
      {videos.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {language === 'th' ? 'วิดีโอ' : 'Videos'}
          </h3>
          <div className={styles.videoGrid}>
            {videos.map((video, index) => (
              <div
                key={index}
                className={styles.videoItem}
                onClick={() => openVideoModal(video)}
              >
                <div className={styles.thumbnail}>
                  <img
                    src={video.thumbnail || '/images/placeholder-video.jpg'}
                    alt={t(video.title)}
                  />
                  <div className={styles.playButton}>
                    <span className="material-symbols-outlined">play_circle</span>
                  </div>
                </div>
                <p className={styles.videoTitle}>{t(video.title)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxOpen && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.closeButton} onClick={closeLightbox}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full size" />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoModalOpen && selectedVideo && (
        <div className={styles.videoModal} onClick={closeVideoModal}>
          <button className={styles.closeButton} onClick={closeVideoModal}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <iframe
              src={getYouTubeEmbedUrl(selectedVideo.url)}
              title={t(selectedVideo.title)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
