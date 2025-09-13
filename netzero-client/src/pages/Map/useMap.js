import { useState, useEffect } from "react";
import { treesService } from "../../api";

const useMap = () => {
    const [stateMap, setState] = useState({
        mapInstance: null,
        selectedTree: null,
        selectedLocation: null,
        isTreeModalOpen: false,
        isLocationModalOpen: false,
        markers: [],
        centerToLocation: null,
        currentCoordinate: [100.5018, 13.7563], // Bangkok center as default
        isLoading: true,
        treeData: [],
        processedTreeData: []
    });

    const setMap = (field, value) => {
        if (typeof field === "object") {
            setState((prevState) => ({ ...prevState, ...field }));
        } else {
            setState((prevState) => ({ ...prevState, [field]: value }));
        }
    };

    // Initialize data
    useEffect(() => {
        const initializeData = async () => {
            try {
                setMap("isLoading", true);
                
                // Get trees data using axios services directly
                const treesResponse = await treesService.getAllTrees();
                const allTrees = treesResponse.data;
                
                // Process tree data for map display
                const processedTrees = allTrees.map(tree => ({
                    name: tree.name,
                    locations: tree.locations,
                    totalCount: tree.totalCount,
                    lastUpdated: tree.lastUpdated
                })).filter(tree => tree.totalCount > 0);
                
                setState(prevState => ({
                    ...prevState,
                    treeData: allTrees,
                    processedTreeData: processedTrees,
                    isLoading: false
                }));
            } catch (error) {
                console.error("Failed to load tree data for map:", error);
                setState(prevState => ({
                    ...prevState,
                    isLoading: false
                }));
            }
        };

        initializeData();
    }, []);

    // Additional helper methods for tree operations using axios service directly
    const refreshTreeData = async () => {
        try {
            setMap("isLoading", true);
            const treesResponse = await treesService.getAllTrees();
            const allTrees = treesResponse.data;
            
            const processedTrees = allTrees.map(tree => ({
                name: tree.name,
                locations: tree.locations,
                totalCount: tree.totalCount,
                lastUpdated: tree.lastUpdated
            })).filter(tree => tree.totalCount > 0);
            
            setMap({
                treeData: allTrees,
                processedTreeData: processedTrees,
                isLoading: false
            });
        } catch (error) {
            console.error("Failed to refresh tree data:", error);
            setMap("isLoading", false);
        }
    };

    const searchTrees = async (searchTerm) => {
        try {
            if (!searchTerm) {
                return stateMap.processedTreeData;
            }
            
            const searchResponse = await treesService.searchTrees({ query: searchTerm });
            return searchResponse.data;
        } catch (error) {
            console.error("Failed to search trees:", error);
            return [];
        }
    };

    const getTreeByName = async (treeName) => {
        try {
            const treeResponse = await treesService.getTreeByName(treeName);
            return treeResponse.data;
        } catch (error) {
            console.error(`Failed to get tree ${treeName}:`, error);
            return null;
        }
    };

    return {
        stateMap,
        setMap,
        refreshTreeData,
        searchTrees,
        getTreeByName,
    };
};

export default useMap;
