import { useState, useEffect } from "react";
import { productsService } from "../../api";

const useBarterTrade = (initialProps = {}) => {
  const [stateBarterTrade, setState] = useState({
    products: [],
    filteredProducts: [],
    categories: [],
    regions: [],
    selectedCategory: "all",
    selectedRegion: "all", 
    selectedProduct: null,
    showModal: false,
    isLoading: true,
    viewMode: "grid", // grid or list
    searchQuery: "",
    filterTab: "category", // category or region
    advertisements: [],
    marketType: "barther-trade",
    ...initialProps
  });

  const setBarterTrade = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleBarterTradeField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setBarterTrade("isLoading", true);
        
        // Get products filtered by marketType "barther-trade"
        const barterProductsResponse = await productsService.getProductsByMarketType("barther-trade");
        const barterProducts = barterProductsResponse.data;
        
        // Get categories and regions
        const categoriesResponse = await productsService.getProductCategories();
        const regionsResponse = await productsService.getProductRegions();
        
        // Get advertisements
        const advertisementsResponse = await productsService.getAdvertisements();
        
        setState(prevState => ({
          ...prevState,
          products: barterProducts,
          filteredProducts: barterProducts,
          categories: categoriesResponse.data,
          regions: regionsResponse.data,
          advertisements: advertisementsResponse.data,
          isLoading: false
        }));
      } catch (error) {
        console.error("Failed to load barter trade products:", error);
        setState(prevState => ({
          ...prevState,
          isLoading: false
        }));
      }
    };

    initializeData();
  }, []);

  // Filter products when category, region, or search query changes
  useEffect(() => {
    let filtered = stateBarterTrade.products;
    
    // Apply category filter
    if (stateBarterTrade.selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === stateBarterTrade.selectedCategory.toLowerCase()
      );
    }
    
    // Apply region filter
    if (stateBarterTrade.selectedRegion !== "all") {
      filtered = filtered.filter(product =>
        product.region.toLowerCase() === stateBarterTrade.selectedRegion.toLowerCase()
      );
    }
    
    // Apply both category and region filters if both are set
    if (stateBarterTrade.selectedCategory !== "all" && stateBarterTrade.selectedRegion !== "all") {
      filtered = stateBarterTrade.products.filter(product =>
        product.category.toLowerCase() === stateBarterTrade.selectedCategory.toLowerCase() &&
        product.region.toLowerCase() === stateBarterTrade.selectedRegion.toLowerCase()
      );
    }
    
    // Apply search filter
    if (stateBarterTrade.searchQuery.trim()) {
      const query = stateBarterTrade.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.region.toLowerCase().includes(query) ||
        product.origin.toLowerCase().includes(query)
      );
    }
    
    setBarterTrade("filteredProducts", filtered);
  }, [stateBarterTrade.selectedCategory, stateBarterTrade.selectedRegion, stateBarterTrade.searchQuery, stateBarterTrade.products]);

  return {
    stateBarterTrade,
    setBarterTrade,
    toggleBarterTradeField,
  };
};

export default useBarterTrade;
