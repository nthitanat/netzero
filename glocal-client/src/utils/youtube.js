// Helpers for deriving YouTube embed/thumbnail URLs from a watch URL

export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  return url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
};

export const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

// quality: default | mqdefault | hqdefault | sddefault | maxresdefault
export const getYouTubeThumbnail = (url, quality = 'hqdefault') => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : '';
};
