const AdvertisementCarouselHandler = (stateAdvertisementCarousel, setAdvertisementCarousel) => {
  return {
    handleAdClick: (ad) => {
      setAdvertisementCarousel("selectedAd", ad);
      
      // Navigate to the link if provided
      if (ad.link) {
        window.location.href = ad.link;
      }
    },

    handleAdView: (ad) => {
      // Track ad view for analytics (placeholder)
      console.log("Advertisement viewed:", ad);
    }
  };
};

export default AdvertisementCarouselHandler;
