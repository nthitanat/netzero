import { locationTreesService } from "../../../api";

const LocationModalHandler = (stateLocationModal, setLocationModal, options = {}) => {
  const { onClose, onTreeSelect } = options;

  // Modal control handlers
  const handleClose = () => {
    setLocationModal('isOpen', false);
    if (onClose) {
      onClose();
    }
  };

  // Get all trees in a specific location using the new efficient service
  const getTreesByLocation = async (locationName) => {
    console.log('🔍 [LocationModalHandler] getTreesByLocation called for:', locationName);
    
    try {
      setLocationModal('loading', true);
      setLocationModal('error', null);

      console.log('📡 [LocationModalHandler] Calling locationTreesService.getTreesByLocation...');
      const response = await locationTreesService.getTreesByLocation(locationName);
      console.log('📋 [LocationModalHandler] Service response:', response);
      
      const trees = response.data || [];
      console.log('🌳 [LocationModalHandler] Trees found:', trees.length);
      console.log('📊 [LocationModalHandler] Tree details:', trees.map(t => ({ 
        name: t.name, 
        count: t.count, 
        status: t.status 
      })));

      return trees;
    } catch (error) {
      console.error('❌ [LocationModalHandler] Failed to load trees by location:', error);
      setLocationModal('error', 'ไม่สามารถโหลดข้อมูลต้นไม้ได้');
      return [];
    } finally {
      setLocationModal('loading', false);
      console.log('🏁 [LocationModalHandler] getTreesByLocation completed');
    }
  };

  return {
    // Modal control handlers
    handleOverlayClick: (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },

    handleModalClick: (e) => {
      e.stopPropagation();
    },

    handleClose,

    // Location tree data handlers
    getTreesByLocation,

    // Tree selection handler
    handleTreeSelect: (tree) => {
      setLocationModal('selectedTree', tree);
      if (onTreeSelect) {
        // Convert the tree data to the format expected by TreeModal
        const treeForModal = {
          name: tree.name,
          emoji: tree.emoji,
          scientificName: tree.scientificName,
          category: tree.category,
          type: tree.type,
          use: tree.use,
          growthPeriod: tree.growthPeriod,
          description: tree.description,
          imageUrl: tree.imageUrl,
          locations: [{
            name: tree.locationData?.name || 'Unknown Location',
            count: tree.count,
            coordinates: tree.locationData?.coordinates || { lat: 0, lng: 0 }
          }]
        };
        onTreeSelect(treeForModal);
      }
    },

    // Statistics handlers
    getTreePercentage: (treeCount, totalCount) => {
      if (totalCount === 0) return 0;
      return Math.round((treeCount / totalCount) * 100);
    },

    // Location data refresh using tree service
    refreshLocationData: async (locationName) => {
      try {
        setLocationModal('loading', true);
        const trees = await getTreesByLocation(locationName);
        setLocationModal('trees', trees);
        setLocationModal('error', null);
      } catch (error) {
        console.error('Failed to refresh location data:', error);
        setLocationModal('error', 'ไม่สามารถโหลดข้อมูลพื้นที่ได้');
      } finally {
        setLocationModal('loading', false);
      }
    },

    // Export location data using tree service
    exportLocationData: async (locationName, format = 'json') => {
      try {
        const trees = await getTreesByLocation(locationName);

        const dataToExport = {
          locationName,
          totalTrees: trees.length,
          totalCount: trees.reduce((total, tree) => total + tree.count, 0),
          trees: trees,
          exportDate: new Date().toISOString(),
          format: format
        };

        if (format === 'json') {
          const dataStr = JSON.stringify(dataToExport, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `${locationName.replace(/\s+/g, '-')}-trees-data.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Failed to export location data:', error);
        setLocationModal('error', 'ไม่สามารถส่งออกข้อมูลได้');
      }
    }
  };
};

export default LocationModalHandler;
