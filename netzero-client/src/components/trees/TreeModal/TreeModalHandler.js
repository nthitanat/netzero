import { treesService } from "../../../api";

const TreeModalHandler = (stateTreeModal, setTreeModal, options = {}) => {
  const { onClose, onLocationSelect } = options;

  // Modal control handlers
  const handleClose = () => {
    setTreeModal('isOpen', false);
    if (onClose) {
      onClose();
    }
  };

  // Single method to load all tree information at once
  const loadTreeInfo = async (treeName) => {
    try {
      setTreeModal('loading', true);
      setTreeModal('error', null);

      // Get all tree data in parallel using the service
      const [treeInfoResponse, treeImageResponse] = await Promise.all([
        treesService.getTreeInfo(treeName),
        treesService.getTreeImage(treeName)
      ]);

      return {
        ...treeInfoResponse.data,
        imageUrl: treeImageResponse.data.imageUrl
      };
    } catch (error) {
      console.error('Failed to load tree information:', error);
      setTreeModal('error', 'ไม่สามารถโหลดข้อมูลต้นไม้ได้');
      
      // Return minimal fallback data
      return {
        emoji: '🌳',
        scientificName: 'ไม่ระบุ',
        category: 'ไม้ทั่วไป',
        type: 'ไม้ทั่วไป',
        use: 'ใช้ประโยชน์ทั่วไป',
        growthPeriod: 'ไม่ระบุ',
        description: 'ข้อมูลต้นไม้ยังไม่มีในระบบ',
        imageUrl: `/api/placeholder/800/200?text=${encodeURIComponent(treeName)}+Tree`
      };
    } finally {
      setTreeModal('loading', false);
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

    // Simplified tree information loading
    loadTreeInfo,

    // Statistics handlers (these work with tree data directly)
    getAveragePerLocation: (tree) => {
      if (!tree.locations || tree.locations.length === 0) return '0';
      const average = tree.totalCount / tree.locations.length;
      return Math.round(average).toLocaleString();
    },

    getTopLocation: (tree) => {
      if (!tree.locations || tree.locations.length === 0) return null;
      return tree.locations.reduce((max, location) => 
        location.count > max.count ? location : max
      );
    },

    getLocationPercentage: (locationCount, totalCount) => {
      if (totalCount === 0) return 0;
      return Math.round((locationCount / totalCount) * 100);
    },

    // Location handlers
    handleLocationSelect: (location) => {
      setTreeModal('selectedLocation', location);
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    },

    // Error handlers
    handleImageError: (e) => {
      console.error('Tree image failed to load:', e.target.src);
      setTreeModal('showImageError', true);
      e.target.src = '/api/placeholder/800/200?text=No+Image+Available';
    },

    // Data refresh using tree service
    refreshTreeData: async (treeName) => {
      try {
        setTreeModal('loading', true);
        const response = await treesService.getTreeByName(treeName);
        setTreeModal('tree', response.data);
        setTreeModal('error', null);
      } catch (error) {
        console.error('Failed to refresh tree data:', error);
        setTreeModal('error', 'ไม่สามารถโหลดข้อมูลต้นไม้ได้');
      } finally {
        setTreeModal('loading', false);
      }
    },

    // Location search using tree service
    searchLocations: async (treeName, searchTerm) => {
      try {
        if (!searchTerm) {
          setTreeModal('filteredLocations', null);
          return;
        }

        const response = await treesService.getTreeLocations(treeName);
        const locations = response.data;
        
        const filteredLocations = locations.filter(location =>
          location.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setTreeModal('filteredLocations', filteredLocations);
      } catch (error) {
        console.error('Failed to search locations:', error);
        setTreeModal('filteredLocations', []);
      }
    },

    // Get tree statistics using tree service
    getTreeStats: async (treeName) => {
      try {
        const response = await treesService.getTreeStats(treeName);
        return response.data;
      } catch (error) {
        console.error('Failed to get tree statistics:', error);
        return null;
      }
    },

    // Export tree data using tree service
    exportTreeData: async (treeName, format = 'json') => {
      try {
        const response = await treesService.getTreeByName(treeName);
        const tree = response.data;

        const dataToExport = {
          ...tree,
          exportDate: new Date().toISOString(),
          format: format
        };

        if (format === 'json') {
          const dataStr = JSON.stringify(dataToExport, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = `${tree.name.replace(/\s+/g, '-')}-data.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Failed to export tree data:', error);
        setTreeModal('error', 'ไม่สามารถส่งออกข้อมูลได้');
      }
    }
  };
};

export default TreeModalHandler;
