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
    productToExchange: null,
    showExchangeDialog: false,
    isLoading: true,
    viewMode: "grid", // grid or list
    searchQuery: "",
    filterTab: "category", // category or region
    advertisements: [],
    marketType: "barter",
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
        
        // Get products filtered by type "barter" (note: using "barter" instead of "barther-trade")
        const barterProductsResponse = await productsService.getProductsByType("barter");
        const barterProducts = barterProductsResponse.data;
        
        // Extract unique categories and regions from products
        const uniqueCategories = [...new Set(barterProducts.map(product => product.category))];
        const uniqueRegions = [...new Set(barterProducts.map(product => product.address || 'Unknown'))];
        
        // For advertisements, we'll use recommended products for now
        const advertisementsResponse = await productsService.getRecommendedProducts();
        const advertisements = advertisementsResponse.data.slice(0, 5); // Limit to 5 for carousel
        
        setState(prevState => ({
          ...prevState,
          products: barterProducts,
          filteredProducts: barterProducts,
          categories: uniqueCategories,
          regions: uniqueRegions,
          advertisements: advertisements,
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
        (product.address || 'Unknown').toLowerCase() === stateBarterTrade.selectedRegion.toLowerCase()
      );
    }
    
    // Apply both category and region filters if both are set
    if (stateBarterTrade.selectedCategory !== "all" && stateBarterTrade.selectedRegion !== "all") {
      filtered = stateBarterTrade.products.filter(product =>
        product.category.toLowerCase() === stateBarterTrade.selectedCategory.toLowerCase() &&
        (product.address || 'Unknown').toLowerCase() === stateBarterTrade.selectedRegion.toLowerCase()
      );
    }
    
    // Apply search filter
    if (stateBarterTrade.searchQuery.trim()) {
      const query = stateBarterTrade.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.address || '').toLowerCase().includes(query)
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
