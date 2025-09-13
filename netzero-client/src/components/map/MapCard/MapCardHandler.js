const MapCardHandler = (stateMapCard, setMapCard, addTreeMarkers) => {

  return {
    
    centerMapToLocation: (location) => {
      if (stateMapCard.mapInstance && location.coordinates) {
        const map = stateMapCard.mapInstance;
        
        // Center the map on the location with smooth animation
        map.flyTo({
          center: [location.coordinates.lng, location.coordinates.lat],
          zoom: 15,
          duration: 1500,
          essential: true
        });
        
        // Highlight the specific marker temporarily
        setTimeout(() => {
          const locationElement = document.querySelector(`[data-location-name="${location.name}"]`);
          if (locationElement) {
            locationElement.style.transform = 'scale(1.3)';
            locationElement.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
              locationElement.style.transform = 'scale(1)';
            }, 2000);
          }
        }, 1600);
      }
    },

    getCurrentTheme: () => {
      return 'tree-theme';
    },

    resetMap: () => {
      if (stateMapCard.mapInstance) {
        const map = stateMapCard.mapInstance;
        
        // Reset to initial view for tree map (Nan Province)
        map.flyTo({
          center: [100.7756, 18.7823], // Nan Province center
          zoom: 9,
          duration: 1000
        });
      }
    }
  };
};

export default MapCardHandler;
