import { ApiResponse, API_STATUS } from './types.js';
import treeData from '../data/treeData.json';

/**
 * Trees Service
 * Handles all tree-related operations using local JSON data
 */
class TreesService {
  constructor() {
    this.treeData = treeData;
  }

  /**
   * Transform tree data from JSON format to API format
   */
  transformTreeData() {
    return Object.entries(this.treeData).map(([treeName, treeInfo]) => {
      const locations = Object.entries(treeInfo.locations || {}).map(([locationName, locationData]) => ({
        name: locationName,
        count: locationData.count,
        coordinates: locationData.coordinates
      }));
      
      const totalCount = locations.reduce((sum, location) => sum + location.count, 0);
      
      return {
        name: treeName,
        locations: locations.sort((a, b) => b.count - a.count),
        totalCount,
        info: treeInfo.info || {},
        lastUpdated: new Date().toISOString()
      };
    }).filter(tree => tree.totalCount > 0).sort((a, b) => b.totalCount - a.totalCount);
  }

  /**
   * Get all trees data
   * @returns {Promise<ApiResponse>} Trees data with locations and counts
   */
  async getAllTrees() {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      const transformedData = this.transformTreeData();
      return new ApiResponse(transformedData, API_STATUS.SUCCESS);
    } catch (error) {
      console.error('Failed to fetch trees data:', error);
      throw error;
    }
  }

  /**
   * Get specific tree data by name
   * @param {string} treeName - Name of the tree
   * @returns {Promise<ApiResponse>} Tree data with locations and counts
   */
  async getTreeByName(treeName) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      const transformedData = this.transformTreeData();
      const tree = transformedData.find(t => t.name === treeName);
      
      if (!tree) {
        throw new Error(`Tree ${treeName} not found`);
      }
      
      return new ApiResponse(tree, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to fetch tree data for ${treeName}:`, error);
      throw error;
    }
  }

  /**
   * Get tree statistics
   * @param {string} treeName - Optional tree name for specific stats
   * @returns {Promise<ApiResponse>} Tree statistics data
   */
  async getTreeStats(treeName = null) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      if (treeName) {
        const tree = await this.getTreeByName(treeName);
        const treeData = tree.data;
        
        return new ApiResponse({
          totalCount: treeData.totalCount,
          locationCount: treeData.locations.length,
          averagePerLocation: Math.round(treeData.totalCount / treeData.locations.length),
          topLocation: treeData.locations[0],
          lastUpdated: treeData.lastUpdated
        }, API_STATUS.SUCCESS);
      }
      
      // Global statistics
      const allTrees = this.transformTreeData();
      const totalTrees = allTrees.reduce((sum, tree) => sum + tree.totalCount, 0);
      const totalLocations = new Set(
        allTrees.flatMap(tree => tree.locations.map(loc => loc.name))
      ).size;
      
      return new ApiResponse({
        totalTreeCount: totalTrees,
        treeSpeciesCount: allTrees.length,
        totalLocationCount: totalLocations,
        averageTreesPerSpecies: Math.round(totalTrees / allTrees.length),
        topTreeSpecies: allTrees[0],
        lastUpdated: new Date().toISOString()
      }, API_STATUS.SUCCESS);
    } catch (error) {
      console.error('Failed to fetch tree statistics:', error);
      throw error;
    }
  }

  /**
   * Get tree locations
   * @param {string} treeName - Name of the tree
   * @returns {Promise<ApiResponse>} Tree locations data
   */
  async getTreeLocations(treeName) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      const tree = await this.getTreeByName(treeName);
      return new ApiResponse(tree.data.locations, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to fetch locations for ${treeName}:`, error);
      throw error;
    }
  }

  /**
   * Get tree information (scientific name, type, description, etc.)
   * @param {string} treeName - Name of the tree
   * @returns {Promise<ApiResponse>} Tree information data
   */
  async getTreeInfo(treeName) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const treeInfo = this.treeData[treeName];
      if (!treeInfo || !treeInfo.info) {
        throw new Error(`Tree info for ${treeName} not found`);
      }
      
      return new ApiResponse(treeInfo.info, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to fetch tree info for ${treeName}:`, error);
      throw error;
    }
  }

  /**
   * Search trees by criteria
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.query - Search query
   * @returns {Promise<ApiResponse>} Search results
   */
  async searchTrees(searchParams = {}) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const allTrees = this.transformTreeData();
      const { query } = searchParams;
      
      if (!query) {
        return new ApiResponse(allTrees, API_STATUS.SUCCESS);
      }
      
      const searchTermLower = query.toLowerCase();
      const filteredTrees = allTrees.filter(tree => {
        // Search in tree name
        if (tree.name.toLowerCase().includes(searchTermLower)) {
          return true;
        }
        
        // Search in location names
        return tree.locations.some(location => 
          location.name.toLowerCase().includes(searchTermLower)
        );
      });
      
      return new ApiResponse(filteredTrees, API_STATUS.SUCCESS);
    } catch (error) {
      console.error('Failed to search trees:', error);
      throw error;
    }
  }

  /**
   * Get tree image URL
   * @param {string} treeName - Name of the tree
   * @returns {Promise<ApiResponse>} Tree image URL
   */
  async getTreeImage(treeName) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      
      const treeInfo = this.treeData[treeName];
      let imageUrl = `/api/placeholder/800/200?text=${encodeURIComponent(treeName)}+Tree`;
      
      if (treeInfo && treeInfo.info && treeInfo.info.imageUrl) {
        imageUrl = treeInfo.info.imageUrl;
      }
      
      return new ApiResponse({
        imageUrl,
        altText: `${treeName} tree image`,
        credits: 'Tree image'
      }, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to fetch tree image for ${treeName}:`, error);
      throw error;
    }
  }

  /**
   * Update tree data (for future API compatibility)
   * @param {string} treeName - Name of the tree
   * @param {Object} treeData - Updated tree data
   * @returns {Promise<ApiResponse>} Updated tree data
   */
  async updateTree(treeName, treeData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      console.log(`Update tree ${treeName} - Feature not implemented in JSON mode`);
      return new ApiResponse({ message: 'Update not supported in JSON mode' }, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to update tree ${treeName}:`, error);
      throw error;
    }
  }

  /**
   * Add new tree data (for future API compatibility)
   * @param {Object} treeData - New tree data
   * @returns {Promise<ApiResponse>} Created tree data
   */
  async createTree(treeData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      console.log('Create tree - Feature not implemented in JSON mode');
      return new ApiResponse({ message: 'Create not supported in JSON mode' }, API_STATUS.SUCCESS);
    } catch (error) {
      console.error('Failed to create tree:', error);
      throw error;
    }
  }

  /**
   * Delete tree data (for future API compatibility)
   * @param {string} treeName - Name of the tree to delete
   * @returns {Promise<ApiResponse>} Deletion confirmation
   */
  async deleteTree(treeName) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      console.log(`Delete tree ${treeName} - Feature not implemented in JSON mode`);
      return new ApiResponse({ message: 'Delete not supported in JSON mode' }, API_STATUS.SUCCESS);
    } catch (error) {
      console.error(`Failed to delete tree ${treeName}:`, error);
      throw error;
    }
  }
}

// Create and export service instance
export const treesService = new TreesService();
export { TreesService };

// Individual function exports for convenience
export const {
  getAllTrees,
  getTreeByName,
  getTreeStats,
  getTreeLocations,
  getTreeInfo,
  searchTrees,
  getTreeImage,
  updateTree,
  createTree,
  deleteTree
} = treesService;
