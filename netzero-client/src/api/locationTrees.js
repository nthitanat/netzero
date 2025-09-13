import { ApiResponse, API_STATUS } from './types.js';
import locationTreeData from '../data/locationTreeData.json';

/**
 * Location Trees Service
 * Handles location-tree relationship operations using normalized JSON data
 */
class LocationTreesService {
  constructor() {
    this.data = locationTreeData;
  }

  /**
   * Get all locations with basic info
   * @returns {Promise<ApiResponse>} Array of location objects
   */
  async getAllLocations() {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const locations = Object.entries(this.data.locations).map(([locationId, locationData]) => ({
        id: locationId,
        ...locationData
      }));
      
      return new ApiResponse(locations, API_STATUS.SUCCESS);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      throw error;
    }
  }

  /**
   * Get all trees with basic info
   * @returns {Promise<ApiResponse>} Array of tree objects
   */
  async getAllTrees() {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const trees = Object.entries(this.data.trees).map(([treeId, treeData]) => ({
        id: treeId,
        ...treeData
      }));
      
      return new ApiResponse(trees, API_STATUS.SUCCESS);
    } catch (error) {
      console.error('Failed to fetch trees:', error);
      throw error;
    }
  }

  /**
   * Get trees in a specific location with counts and details
   * @param {string} locationId - Location ID or name
   * @returns {Promise<ApiResponse>} Array of trees in the location
   */
  async getTreesByLocation(locationId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      console.log('🔍 [LocationTreesService] getTreesByLocation called with:', locationId);
      
      // Convert location name to ID if needed
      const normalizedLocationId = this.normalizeLocationId(locationId);
      console.log('🔄 [LocationTreesService] Normalized location ID:', normalizedLocationId);
      
      // Check if location exists
      console.log('📋 [LocationTreesService] Available locations:', Object.keys(this.data.locations));
      console.log('📋 [LocationTreesService] Available locationTrees:', Object.keys(this.data.locationTrees));
      
      if (!this.data.locationTrees[normalizedLocationId]) {
        console.log('❌ [LocationTreesService] Location not found in locationTrees data:', normalizedLocationId);
        return new ApiResponse([], API_STATUS.SUCCESS);
      }
      
      const locationTreeData = this.data.locationTrees[normalizedLocationId];
      console.log('✅ [LocationTreesService] Found location tree data:', locationTreeData);
      const treesInLocation = [];
      
      for (const [treeId, relationshipData] of Object.entries(locationTreeData)) {
        console.log('🌳 [LocationTreesService] Processing tree:', treeId, relationshipData);
        const treeInfo = this.data.trees[treeId];
        if (treeInfo) {
          treesInLocation.push({
            id: treeId,
            name: treeInfo.name,
            emoji: treeInfo.emoji,
            scientificName: treeInfo.scientificName,
            category: treeInfo.category,
            type: treeInfo.type,
            use: treeInfo.use,
            growthPeriod: treeInfo.growthPeriod,
            description: treeInfo.description,
            imageUrl: treeInfo.imageUrl,
            count: relationshipData.count,
            plantedDate: relationshipData.plantedDate,
            status: relationshipData.status,
            locationData: this.data.locations[normalizedLocationId]
          });
          console.log('➕ [LocationTreesService] Added tree to results:', treeInfo.name);
        } else {
          console.log('❌ [LocationTreesService] Tree info not found for:', treeId);
        }
      }
      
      // Sort by count (highest first)
      treesInLocation.sort((a, b) => b.count - a.count);
      
      console.log('📊 [LocationTreesService] Final results:', treesInLocation.length, 'trees');
      return new ApiResponse(treesInLocation, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to fetch trees for location ${locationId}:`, error);
      throw error;
    }
  }

  /**
   * Get locations where a specific tree is planted
   * @param {string} treeId - Tree ID or name
   * @returns {Promise<ApiResponse>} Array of locations with the tree
   */
  async getLocationsByTree(treeId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const normalizedTreeId = this.normalizeTreeId(treeId);
      const locationsWithTree = [];
      
      for (const [locationId, locationTreeData] of Object.entries(this.data.locationTrees)) {
        if (locationTreeData[normalizedTreeId]) {
          const locationInfo = this.data.locations[locationId];
          if (locationInfo) {
            locationsWithTree.push({
              id: locationId,
              name: locationInfo.name,
              coordinates: locationInfo.coordinates,
              district: locationInfo.district,
              province: locationInfo.province,
              description: locationInfo.description,
              count: locationTreeData[normalizedTreeId].count,
              plantedDate: locationTreeData[normalizedTreeId].plantedDate,
              status: locationTreeData[normalizedTreeId].status
            });
          }
        }
      }
      
      // Sort by count (highest first)
      locationsWithTree.sort((a, b) => b.count - a.count);
      
      return new ApiResponse(locationsWithTree, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to fetch locations for tree ${treeId}:`, error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific location
   * @param {string} locationId - Location ID or name
   * @returns {Promise<ApiResponse>} Location details with tree summary
   */
  async getLocationDetails(locationId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const normalizedLocationId = this.normalizeLocationId(locationId);
      const locationInfo = this.data.locations[normalizedLocationId];
      
      if (!locationInfo) {
        throw new Error(`Location ${locationId} not found`);
      }
      
      const treesResponse = await this.getTreesByLocation(normalizedLocationId);
      const trees = treesResponse.data;
      
      const totalTrees = trees.reduce((sum, tree) => sum + tree.count, 0);
      const treeSpecies = trees.length;
      
      return new ApiResponse({
        id: normalizedLocationId,
        ...locationInfo,
        trees,
        statistics: {
          totalTrees,
          treeSpecies,
          averageTreesPerSpecies: treeSpecies > 0 ? Math.round(totalTrees / treeSpecies) : 0,
          mostCommonTree: trees[0] || null
        }
      }, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to fetch location details for ${locationId}:`, error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific tree
   * @param {string} treeId - Tree ID or name
   * @returns {Promise<ApiResponse>} Tree details with location summary
   */
  async getTreeDetails(treeId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const normalizedTreeId = this.normalizeTreeId(treeId);
      const treeInfo = this.data.trees[normalizedTreeId];
      
      if (!treeInfo) {
        throw new Error(`Tree ${treeId} not found`);
      }
      
      const locationsResponse = await this.getLocationsByTree(normalizedTreeId);
      const locations = locationsResponse.data;
      
      const totalCount = locations.reduce((sum, location) => sum + location.count, 0);
      const locationCount = locations.length;
      
      return new ApiResponse({
        id: normalizedTreeId,
        ...treeInfo,
        locations,
        statistics: {
          totalCount,
          locationCount,
          averagePerLocation: locationCount > 0 ? Math.round(totalCount / locationCount) : 0,
          topLocation: locations[0] || null
        }
      }, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to fetch tree details for ${treeId}:`, error);
      throw error;
    }
  }

  /**
   * Get all location markers for map display
   * @returns {Promise<ApiResponse>} Array of location markers with coordinates
   */
  async getLocationMarkers() {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const markers = Object.entries(this.data.locations).map(([locationId, locationData]) => {
        const locationTreeData = this.data.locationTrees[locationId] || {};
        const treeCount = Object.values(locationTreeData).reduce((sum, tree) => sum + tree.count, 0);
        const treeSpecies = Object.keys(locationTreeData).length;
        
        return {
          id: locationId,
          name: locationData.name,
          coordinates: locationData.coordinates,
          district: locationData.district,
          province: locationData.province,
          treeCount,
          treeSpecies,
          description: locationData.description
        };
      });
      
      // Sort by tree count (highest first)
      markers.sort((a, b) => b.treeCount - a.treeCount);
      
      return new ApiResponse(markers, API_STATUS.SUCCESS);
    } catch (error) {
      console.error('Failed to fetch location markers:', error);
      throw error;
    }
  }

  /**
   * Search locations and trees
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.query - Search query
   * @param {string} searchParams.type - Search type: 'locations', 'trees', or 'all'
   * @returns {Promise<ApiResponse>} Search results
   */
  async search(searchParams = {}) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const { query, type = 'all' } = searchParams;
      
      if (!query) {
        return new ApiResponse({ locations: [], trees: [] }, API_STATUS.SUCCESS);
      }
      
      const searchTerm = query.toLowerCase();
      const results = { locations: [], trees: [] };
      
      if (type === 'locations' || type === 'all') {
        for (const [locationId, locationData] of Object.entries(this.data.locations)) {
          if (
            locationData.name.toLowerCase().includes(searchTerm) ||
            locationData.district.toLowerCase().includes(searchTerm) ||
            locationData.province.toLowerCase().includes(searchTerm) ||
            locationData.description.toLowerCase().includes(searchTerm)
          ) {
            const locationDetails = await this.getLocationDetails(locationId);
            results.locations.push(locationDetails.data);
          }
        }
      }
      
      if (type === 'trees' || type === 'all') {
        for (const [treeId, treeData] of Object.entries(this.data.trees)) {
          if (
            treeData.name.toLowerCase().includes(searchTerm) ||
            treeData.scientificName.toLowerCase().includes(searchTerm) ||
            treeData.category.toLowerCase().includes(searchTerm) ||
            treeData.type.toLowerCase().includes(searchTerm) ||
            treeData.description.toLowerCase().includes(searchTerm)
          ) {
            const treeDetails = await this.getTreeDetails(treeId);
            results.trees.push(treeDetails.data);
          }
        }
      }
      
      return new ApiResponse(results, API_STATUS.SUCCESS);
    } catch (error) {
      console.error('Failed to search:', error);
      throw error;
    }
  }

  /**
   * Normalize location identifier to match data structure
   * @param {string} locationId - Location ID or name
   * @returns {string} Normalized location ID
   */
  normalizeLocationId(locationId) {
    console.log('🔧 [LocationTreesService] normalizeLocationId input:', locationId);
    
    // If it's already a valid ID, return it
    if (this.data.locations[locationId]) {
      console.log('✅ [LocationTreesService] Found exact ID match:', locationId);
      return locationId;
    }
    
    // Try to find by name
    for (const [id, locationData] of Object.entries(this.data.locations)) {
      if (locationData.name === locationId || locationData.name.toLowerCase() === locationId.toLowerCase()) {
        console.log('✅ [LocationTreesService] Found name match:', id, 'for', locationId);
        return id;
      }
    }
    
    // Handle special mappings for legacy location names
    const legacyMappings = {
      'Dept. of Highways, Nan': 'nam-pan',
      'Bo Kluea Subdistrict Municipality 1.5': 'nam-pan',
      'Agriculture Office, Bo Kluea': 'nam-pan',
      'Community Development, Bo Kluea': 'nam-pan',
      'National Park M.5': 'khiri',
      'Phu Kha Luang': 'khiri',
      'Phu Phayak': 'khiri'
    };
    
    if (legacyMappings[locationId]) {
      console.log('✅ [LocationTreesService] Found legacy mapping:', legacyMappings[locationId], 'for', locationId);
      return legacyMappings[locationId];
    }
    
    // Convert name to ID format
    const normalized = locationId.toLowerCase().replace(/\s+/g, '-');
    console.log('🔄 [LocationTreesService] Converted to ID format:', normalized);
    return normalized;
  }

  /**
   * Normalize tree identifier to match data structure
   * @param {string} treeId - Tree ID or name
   * @returns {string} Normalized tree ID
   */
  normalizeTreeId(treeId) {
    // If it's already a valid ID, return it
    if (this.data.trees[treeId]) {
      return treeId;
    }
    
    // Try to find by name
    for (const [id, treeData] of Object.entries(this.data.trees)) {
      if (treeData.name === treeId || treeData.name.toLowerCase() === treeId.toLowerCase()) {
        return id;
      }
    }
    
    // Convert name to ID format
    return treeId.toLowerCase().replace(/\s+/g, '-');
  }
}

// Create and export service instance
export const locationTreesService = new LocationTreesService();
export { LocationTreesService };

// Individual function exports for convenience
export const {
  getAllLocations,
  getAllTrees,
  getTreesByLocation,
  getLocationsByTree,
  getLocationDetails,
  getTreeDetails,
  getLocationMarkers,
  search
} = locationTreesService;
