import { useNavigate } from 'react-router-dom';

const MapHandler = (stateMap, setMap, { refreshTreeData, searchTrees, getTreeByName } = {}) => {
    const navigate = useNavigate();

    const handleTreeClick = (tree) => {
        console.log("Tree clicked from list:", tree);
        setMap({
            selectedTree: tree,
            isTreeModalOpen: true,
            // Close location modal if open
            selectedLocation: null,
            isLocationModalOpen: false
        });
    };

    const handleLocationClick = (location) => {
        console.log("🗺️ MapHandler: Location clicked from map:", location);
        console.log("📊 Location details:", {
            name: location.name,
            coordinates: location.coordinates,
            treesCount: location.trees?.length,
            totalCount: location.totalCount
        });
        
        setMap({
            selectedLocation: location,
            isLocationModalOpen: true,
            // Close tree modal if open
            selectedTree: null,
            isTreeModalOpen: false
        });
        
        console.log("✅ State updated for LocationModal");
    };

    const handleTreeRefresh = async () => {
        if (refreshTreeData) {
            console.log("Refreshing tree data...");
            await refreshTreeData();
        }
    };

    const handleTreeSearch = async (searchTerm) => {
        if (searchTrees) {
            console.log("Searching trees:", searchTerm);
            try {
                const results = await searchTrees(searchTerm);
                return results;
            } catch (error) {
                console.error("Failed to search trees:", error);
                return [];
            }
        }
        return [];
    };

    const handleGetTreeDetails = async (treeName) => {
        if (getTreeByName) {
            console.log("Getting tree details for:", treeName);
            try {
                const treeDetails = await getTreeByName(treeName);
                return treeDetails;
            } catch (error) {
                console.error("Failed to get tree details:", error);
                return null;
            }
        }
        return null;
    };

    const handleCloseTreeModal = () => {
        setMap({
            selectedTree: null,
            isTreeModalOpen: false
        });
    };

    const handleCloseLocationModal = () => {
        setMap({
            selectedLocation: null,
            isLocationModalOpen: false
        });
    };

    const handleCenterMapToLocation = (location) => {
        console.log("Center map to location:", location);
        setMap("centerToLocation", location);
        
        // Clear the center command after animation completes
        setTimeout(() => {
            setMap("centerToLocation", null);
        }, 2000);
    };

    const handleMapReady = (mapInstance) => {
        setMap({
            mapInstance,
            isLoading: false
        });
    };

    const handleNavigate = (path, label) => {
        // Navigate to the specified route using React Router
        navigate(path);
    };

    return {
        handleTreeClick,
        handleLocationClick,
        handleTreeRefresh,
        handleTreeSearch,
        handleGetTreeDetails,
        handleCloseTreeModal,
        handleCloseLocationModal,
        handleCenterMapToLocation,
        handleMapReady,
        handleNavigate
    };
};

export default MapHandler;
