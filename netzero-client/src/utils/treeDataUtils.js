import { treesService } from '../api/trees.js';
import treeDataJson from '../data/treeData.json';

/**
 * Tree Data Utilities
 * Handles data transformation and API integration for tree data
 */

/**
 * Transform tree data from JSON format to API format
 * @param {Object} rawTreeData - Raw tree data from treeData.json
 * @returns {Array} Transformed tree data array
 */
export const transformTreeDataFromJson = (rawTreeData = treeDataJson) => {
  const transformedTrees = [];

  Object.entries(rawTreeData).forEach(([treeName, treeData]) => {
    const locationArray = [];
    let totalCount = 0;

    // Transform location data
    Object.entries(treeData.locations).forEach(([locationName, locationData]) => {
      const locationInfo = {
        name: locationName,
        count: locationData.count,
        coordinates: locationData.coordinates
      };
      locationArray.push(locationInfo);
      totalCount += locationData.count;
    });

    // Create tree object
    const treeObject = {
      name: treeName,
      totalCount: totalCount,
      locations: locationArray.sort((a, b) => b.count - a.count), // Sort by count descending
      lastUpdated: new Date().toISOString(),
      info: treeData.info // Include tree info from JSON
    };

    transformedTrees.push(treeObject);
  });

  return transformedTrees.sort((a, b) => b.totalCount - a.totalCount); // Sort trees by total count
};

/**
 * Get tree data for a specific tree
 * @param {string} treeName - Name of the tree
 * @returns {Object|null} Tree data object or null if not found
 */
export const getTreeData = (treeName) => {
  const transformedData = transformTreeDataFromJson();
  return transformedData.find(tree => tree.name === treeName) || null;
};

/**
 * Get all trees data
 * @returns {Array} Array of all tree data
 */
export const getAllTreesData = () => {
  return transformTreeDataFromJson();
};

/**
 * Search trees by name or location
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered tree data
 */
export const searchTrees = (searchTerm) => {
  if (!searchTerm) return getAllTreesData();
  
  const allTrees = getAllTreesData();
  const searchTermLower = searchTerm.toLowerCase();
  
  return allTrees.filter(tree => {
    // Search in tree name
    if (tree.name.toLowerCase().includes(searchTermLower)) {
      return true;
    }
    
    // Search in location names
    return tree.locations.some(location => 
      location.name.toLowerCase().includes(searchTermLower)
    );
  });
};

/**
 * Get tree statistics
 * @param {string} treeName - Optional tree name for specific stats
 * @returns {Object} Statistics object
 */
export const getTreeStats = (treeName = null) => {
  if (treeName) {
    const tree = getTreeData(treeName);
    if (!tree) return null;
    
    return {
      totalCount: tree.totalCount,
      locationCount: tree.locations.length,
      averagePerLocation: Math.round(tree.totalCount / tree.locations.length),
      topLocation: tree.locations[0],
      lastUpdated: tree.lastUpdated
    };
  }
  
  // Global statistics
  const allTrees = getAllTreesData();
  const totalTrees = allTrees.reduce((sum, tree) => sum + tree.totalCount, 0);
  const totalLocations = new Set(
    allTrees.flatMap(tree => tree.locations.map(loc => loc.name))
  ).size;
  
  return {
    totalTreeCount: totalTrees,
    treeSpeciesCount: allTrees.length,
    totalLocationCount: totalLocations,
    averageTreesPerSpecies: Math.round(totalTrees / allTrees.length),
    topTreeSpecies: allTrees[0],
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Get locations for a specific tree
 * @param {string} treeName - Name of the tree
 * @returns {Array} Array of location objects
 */
export const getTreeLocations = (treeName) => {
  const tree = getTreeData(treeName);
  return tree ? tree.locations : [];
};

/**
 * Mock API service for development/fallback
 * This simulates API responses using the JSON data
 */
export class MockTreesApiService {
  static async getAllTrees() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: getAllTreesData(),
          status: 200,
          message: 'Success'
        });
      }, 100); // Simulate network delay
    });
  }

  static async getTreeByName(treeName) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tree = getTreeData(treeName);
        if (tree) {
          resolve({
            data: tree,
            status: 200,
            message: 'Success'
          });
        } else {
          reject({
            status: 404,
            message: 'Tree not found'
          });
        }
      }, 100);
    });
  }

  static async getTreeStats(treeName = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: getTreeStats(treeName),
          status: 200,
          message: 'Success'
        });
      }, 100);
    });
  }

  static async getTreeLocations(treeName) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: getTreeLocations(treeName),
          status: 200,
          message: 'Success'
        });
      }, 100);
    });
  }

  static async searchTrees(searchParams) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = searchTrees(searchParams.query || '');
        resolve({
          data: results,
          status: 200,
          message: 'Success'
        });
      }, 100);
    });
  }

  static async getTreeInfo(treeName) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get tree info from JSON data
        const treeData = treeDataJson[treeName];
        
        if (treeData && treeData.info) {
          resolve({
            data: treeData.info,
            status: 200,
            message: 'Success'
          });
        } else {
          // Fallback for trees not found in JSON
          const defaultConfig = {
            emoji: '🌳',
            scientificName: 'ไม่ระบุชื่อวิทยาศาสตร์',
            category: 'ไม้ทั่วไป',
            type: 'ไม้ทั่วไป',
            use: 'ใช้ประโยชน์ทั่วไป',
            growthPeriod: 'ไม่ระบุ',
            description: 'ไม้ชนิดนี้มีคุณค่าในการอนุรักษ์สิ่งแวดล้อมและสร้างประโยชน์ให้กับชุมชน',
            imageUrl: `/api/placeholder/800/200?text=${encodeURIComponent(treeName)}+Tree`
          };

          resolve({
            data: defaultConfig,
            status: 200,
            message: 'Success'
          });
        }
      }, 100);
    });
  }

  static async getTreeImage(treeName) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get tree image from JSON data
        const treeData = treeDataJson[treeName];
        
        if (treeData && treeData.info && treeData.info.imageUrl) {
          resolve({
            data: {
              imageUrl: treeData.info.imageUrl,
              altText: `${treeName} tree image`,
              credits: 'NetZero Tree Database'
            },
            status: 200,
            message: 'Success'
          });
        } else {
          // Fallback placeholder image
          resolve({
            data: {
              imageUrl: `/api/placeholder/800/200?text=${encodeURIComponent(treeName)}+Tree`,
              altText: `${treeName} tree image`,
              credits: 'Generated placeholder image'
            },
            status: 200,
            message: 'Success'
          });
        }
      }, 100);
    });
  }
}

/**
 * Environment-aware tree service
 * Uses real API in production, mock service in development
 */
export const getTreeService = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useRealAPI = process.env.REACT_APP_USE_REAL_TREE_API === 'true';
  
  if (isDevelopment && !useRealAPI) {
    console.log('Using mock tree API service for development');
    return MockTreesApiService;
  }
  
  return treesService;
};
