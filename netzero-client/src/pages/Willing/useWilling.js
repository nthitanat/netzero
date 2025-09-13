import { useState, useEffect } from "react";
import { productsService } from "../../api";

const useWilling = (initialProps = {}) => {
  const [stateWilling, setState] = useState({
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
    marketType: "willing",
    ...initialProps
  });

  const setWilling = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleWillingField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setWilling("isLoading", true);
        
        // Get products filtered by marketType "willing"
        const willingProductsResponse = await productsService.getProductsByMarketType("willing");
        const willingProducts = willingProductsResponse.data;
        
        // Get categories and regions
        const categoriesResponse = await productsService.getProductCategories();
        const regionsResponse = await productsService.getProductRegions();
        
        // Get advertisements
        const advertisementsResponse = await productsService.getAdvertisements();
        
        setState(prevState => ({
          ...prevState,
          products: willingProducts,
          filteredProducts: willingProducts,
          categories: categoriesResponse.data,
          regions: regionsResponse.data,
          advertisements: advertisementsResponse.data,
          isLoading: false
        }));
      } catch (error) {
        console.error("Failed to load willing products:", error);
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
    let filtered = stateWilling.products;
    
    // Apply category filter
    if (stateWilling.selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === stateWilling.selectedCategory.toLowerCase()
      );
    }
    
    // Apply region filter
    if (stateWilling.selectedRegion !== "all") {
      filtered = filtered.filter(product =>
        product.region.toLowerCase() === stateWilling.selectedRegion.toLowerCase()
      );
    }
    
    // Apply both category and region filters if both are set
    if (stateWilling.selectedCategory !== "all" && stateWilling.selectedRegion !== "all") {
      filtered = stateWilling.products.filter(product =>
        product.category.toLowerCase() === stateWilling.selectedCategory.toLowerCase() &&
        product.region.toLowerCase() === stateWilling.selectedRegion.toLowerCase()
      );
    }
    
    // Apply search filter
    if (stateWilling.searchQuery.trim()) {
      const query = stateWilling.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.region.toLowerCase().includes(query) ||
        product.origin.toLowerCase().includes(query)
      );
    }
    
    setWilling("filteredProducts", filtered);
  }, [stateWilling.selectedCategory, stateWilling.selectedRegion, stateWilling.searchQuery, stateWilling.products]);

  return {
    stateWilling,
    setWilling,
    toggleWillingField,
  };
};

export default useWilling;
