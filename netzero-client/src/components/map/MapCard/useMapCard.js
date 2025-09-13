import { useState, useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { locationTreesService } from "../../../api";

const useMapCard = (initialProps = {}) => {
  const {
    trees = [],
    activeTab = "trees",
    onTreeSelect,
    onLocationSelect,
    onMapReady,
    centerToLocation,
    loading = false
  } = initialProps;

  const [stateMapCard, setState] = useState({
    isLoading: true,
    mapInstance: null,
    markers: [],
    allTrees: trees,
    activeTab: activeTab,
    ...initialProps
  });

  const mapContainer = useRef(null);

  const setMapCard = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleMapCardField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Helper functions for map management
  const addTreeMarkers = useCallback((map, trees) => {
    console.log('🌳 addTreeMarkers called - creating location-based markers');
    
    // Remove existing markers
    if (stateMapCard.markers) {
      stateMapCard.markers.forEach(marker => marker.remove());
    }
    
    // Create a map of unique locations with their tree data
    const locationMap = new Map();
    
    trees.forEach(tree => {
      tree.locations.forEach(location => {
        const locationKey = `${location.name}-${location.coordinates.lat}-${location.coordinates.lng}`;
        
        if (!locationMap.has(locationKey)) {
          locationMap.set(locationKey, {
            name: location.name,
            coordinates: location.coordinates,
            trees: []
          });
        }
        
        // Add tree data to this location
        locationMap.get(locationKey).trees.push({
          name: tree.name,
          count: location.count,
          totalCount: tree.totalCount
        });
      });
    });
    
    console.log('📍 Unique locations found:', locationMap.size);
    console.log('📍 Locations:', Array.from(locationMap.keys()));
    
    const newMarkers = [];
    
    // Create one marker per unique location
    locationMap.forEach((locationData, locationKey) => {
      const { name, coordinates, trees: locationTrees } = locationData;
      
      if (coordinates && coordinates.lat && coordinates.lng) {
        const el = document.createElement('div');
        el.innerHTML = '📍';
        el.style.fontSize = '24px';
        el.style.cursor = 'pointer';
        el.style.userSelect = 'none';
        el.style.textAlign = 'center';
        el.style.lineHeight = '1';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        el.dataset.locationName = name;
        el.dataset.locationKey = locationKey;
        
        // Store location data directly in dataset
        el.dataset.locationJson = JSON.stringify({
          name,
          coordinates,
          trees: locationTrees,
          totalTrees: locationTrees.length,
          totalCount: locationTrees.reduce((sum, tree) => sum + tree.count, 0)
        });
        
        // Add click handler for location
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const locationName = e.currentTarget.dataset.locationName;
          
          console.log('� Location marker clicked:', locationName);
          console.log('🌳 Trees in location:', locationTrees.length);
          
          try {
            const locationData = JSON.parse(e.currentTarget.dataset.locationJson);
            console.log('✅ Opening LocationModal for:', locationData.name);
            
            if (onLocationSelect) {
              onLocationSelect(locationData);
            }
          } catch (error) {
            console.error('❌ Failed to parse location data:', error);
          }
        });
        
        // Create popup content for location
        const totalCount = locationTrees.reduce((sum, tree) => sum + tree.count, 0);
        const popup = new maplibregl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: false
        })
          .setHTML(`
            <div style="font-family: Arial, sans-serif; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #206246; font-size: 16px;">📍 ${name}</h3>
              <div style="margin-bottom: 8px;">
                <strong>🌳 ชนิดต้นไม้:</strong> ${locationTrees.length} ชนิด
              </div>
              <div style="margin-bottom: 8px;">
                <strong>📊 จำนวนรวม:</strong> ${totalCount.toLocaleString()} ต้น
              </div>
              <div style="font-size: 12px; color: #666;">
                <strong>🗺️ พิกัด:</strong> ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}
              </div>
              <div style="margin-top: 8px; padding: 8px; background: #f0f8f0; border-radius: 4px; font-size: 11px;">
                <strong>ต้นไม้ในพื้นที่:</strong><br/>
                ${locationTrees.slice(0, 3).map(tree => `• ${tree.name} (${tree.count.toLocaleString()} ต้น)`).join('<br/>')}
                ${locationTrees.length > 3 ? `<br/>และอีก ${locationTrees.length - 3} ชนิด...` : ''}
              </div>
            </div>
          `);
        
        const marker = new maplibregl.Marker({ 
          element: el,
          anchor: 'center',
          offset: [0, 0]
        })
          .setLngLat([coordinates.lng, coordinates.lat])
          .setPopup(popup)
          .addTo(map);
        
        newMarkers.push(marker);
      }
    });
    
    console.log('📍 Created location markers:', newMarkers.length);
    setMapCard("markers", newMarkers);
  }, [stateMapCard.markers, setMapCard, onLocationSelect]);

  // Initialize map useEffect
  useEffect(() => {
    console.log("Map initialization useEffect called", { 
      hasContainer: !!mapContainer.current, 
      hasMapInstance: !!stateMapCard.mapInstance 
    });
    
    if (mapContainer.current && !stateMapCard.mapInstance) {
      console.log("Initializing MapCard map...");
      
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
              'satellite-tiles': {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                attribution: '© Esri, Maxar, Earthstar Geographics, and the GIS User Community'
              }
          },
          layers: [
            {
              id: 'satellite-tiles',
              type: 'raster',
              source: 'satellite-tiles',
              minzoom: 0,
              maxzoom: 18
            }
          ]
        },
        center: [100.7756, 18.7823], // Nan Province center for trees
        zoom: 9,
        maxZoom: 18,
        minZoom: 5
      });

      map.on('load', () => {
        console.log("MapCard loaded successfully!");
        
        // Store map instance and call initial setup
        setMapCard({
          mapInstance: map,
          allTrees: trees,
          isLoading: false
        });
        
        // Setup global function for popup button clicks
        window.onTreeSelectFromPopup = (tree) => {
          console.log('Tree modal opened from popup for:', tree.name);
          if (onTreeSelect) {
            onTreeSelect(tree);
          }
        };
        
        // Initialize with tree data
        addTreeMarkers(map, trees);
        
        if (onMapReady) {
          onMapReady(map);
        }
      });

      map.on('error', (e) => {
        console.error("Map error:", e);
      });

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    // Cleanup
    return () => {
      if (stateMapCard.mapInstance) {
        stateMapCard.mapInstance.remove();
      }
    };
  }, []);

  // Update trees when they change
  useEffect(() => {
    if (stateMapCard.mapInstance && trees) {
      addTreeMarkers(stateMapCard.mapInstance, trees);
      setMapCard("allTrees", trees);
    }
  }, [stateMapCard.mapInstance, trees]);

  // Handle center to location (for trees) - use ref to track previous value
  const previousCenterToLocation = useRef(null);
  
  useEffect(() => {
    if (centerToLocation && stateMapCard.mapInstance && previousCenterToLocation.current !== centerToLocation) {
      previousCenterToLocation.current = centerToLocation;
      const map = stateMapCard.mapInstance;
      
      if (centerToLocation.coordinates && centerToLocation.coordinates.lat && centerToLocation.coordinates.lng) {
        console.log("Centering map to location:", centerToLocation.name, centerToLocation.coordinates);
        
        // Center the map on the location with smooth animation
        map.flyTo({
          center: [centerToLocation.coordinates.lng, centerToLocation.coordinates.lat],
          zoom: 15,
          duration: 1500,
          essential: true
        });
        
        // Find and highlight the specific marker temporarily (without opening popup)
        setTimeout(() => {
          const locationElement = document.querySelector(`[data-location-name="${centerToLocation.name}"]`);
          if (locationElement) {
            locationElement.style.transform = 'scale(1.5)';
            locationElement.style.transition = 'transform 0.3s ease';
            locationElement.style.zIndex = '1000';
            
            // Only visual highlight, no popup opening
            setTimeout(() => {
              locationElement.style.transform = 'scale(1)';
              locationElement.style.zIndex = '';
            }, 3000);
          }
        }, 1600);
      }
    }
  }, [centerToLocation, stateMapCard.mapInstance]);

  return {
    stateMapCard,
    setMapCard,
    toggleMapCardField,
    mapContainer,
    addTreeMarkers,
  };
};

export default useMapCard;
