import { useState, useEffect } from "react";
import { productsService } from "../../api";

const useMarket = (initialProps = {}) => {
  const [stateMarket, setState] = useState({
    products: [],
    filteredProducts: [],
    categories: [],
    regions: [],
    selectedCategory: "all",
    selectedRegion: "all", 
    selectedProduct: null,
    showModal: false,
    showReserveDialog: false,
    showLoginModal: false,
    productToReserve: null,
    isLoading: true,
    viewMode: "grid", // grid or list
    searchQuery: "",
    filterTab: "category", // category or region
    advertisements: [],
    marketType: "market",
    ...initialProps
  });

  const setMarket = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleMarketField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setMarket("isLoading", true);
        
        // Get products filtered by type "market"
        const marketProductsResponse = await productsService.getProductsByType("market");
        const marketProducts = marketProductsResponse.data;
        
        // Extract unique categories and regions from products
        const uniqueCategories = [...new Set(marketProducts.map(product => product.category))];
        const uniqueRegions = [...new Set(marketProducts.map(product => product.address || 'Unknown'))];
        
        // For advertisements, we'll use recommended products for now
        // You may want to create a separate advertisements endpoint later
        const advertisementsResponse = await productsService.getRecommendedProducts();
        const advertisements = advertisementsResponse.data.slice(0, 5); // Limit to 5 for carousel
        
        setState(prevState => ({
          ...prevState,
          products: marketProducts,
          filteredProducts: marketProducts,
          categories: uniqueCategories,
          regions: uniqueRegions,
          advertisements: advertisements,
          isLoading: false
        }));
      } catch (error) {
        console.error("Failed to load products:", error);
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
    let filtered = stateMarket.products;
    
    // Apply category filter
    if (stateMarket.selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === stateMarket.selectedCategory.toLowerCase()
      );
    }
    
    // Apply region filter
    if (stateMarket.selectedRegion !== "all") {
      filtered = filtered.filter(product =>
        (product.address || 'Unknown').toLowerCase() === stateMarket.selectedRegion.toLowerCase()
      );
    }
    
    // Apply both category and region filters if both are set
    if (stateMarket.selectedCategory !== "all" && stateMarket.selectedRegion !== "all") {
      filtered = stateMarket.products.filter(product =>
        product.category.toLowerCase() === stateMarket.selectedCategory.toLowerCase() &&
        (product.address || 'Unknown').toLowerCase() === stateMarket.selectedRegion.toLowerCase()
      );
    }
    
    // Apply search filter
    if (stateMarket.searchQuery.trim()) {
      const query = stateMarket.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.address || '').toLowerCase().includes(query)
      );
    }
    
    setMarket("filteredProducts", filtered);
  }, [stateMarket.selectedCategory, stateMarket.selectedRegion, stateMarket.searchQuery, stateMarket.products]);

  return {
    stateMarket,
    setMarket,
    toggleMarketField,
  };
};

export default useMarket;
