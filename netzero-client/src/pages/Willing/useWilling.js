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
        
        // Get products filtered by type "willing"
        const willingProductsResponse = await productsService.getProductsByType("willing");
        const willingProducts = willingProductsResponse.data;
        
        // Extract unique categories and regions from products
        const uniqueCategories = [...new Set(willingProducts.map(product => product.category))];
        const uniqueRegions = [...new Set(willingProducts.map(product => product.address || 'Unknown'))];
        
        // For advertisements, we'll use recommended products for now
        const advertisementsResponse = await productsService.getRecommendedProducts();
        const advertisements = advertisementsResponse.data.slice(0, 5); // Limit to 5 for carousel
        
        setState(prevState => ({
          ...prevState,
          products: willingProducts,
          filteredProducts: willingProducts,
          categories: uniqueCategories,
          regions: uniqueRegions,
          advertisements: advertisements,
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
        (product.address || 'Unknown').toLowerCase() === stateWilling.selectedRegion.toLowerCase()
      );
    }
    
    // Apply both category and region filters if both are set
    if (stateWilling.selectedCategory !== "all" && stateWilling.selectedRegion !== "all") {
      filtered = stateWilling.products.filter(product =>
        product.category.toLowerCase() === stateWilling.selectedCategory.toLowerCase() &&
        (product.address || 'Unknown').toLowerCase() === stateWilling.selectedRegion.toLowerCase()
      );
    }
    
    // Apply search filter
    if (stateWilling.searchQuery.trim()) {
      const query = stateWilling.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.address || '').toLowerCase().includes(query)
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
