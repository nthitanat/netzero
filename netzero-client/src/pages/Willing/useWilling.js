import { useState, useEffect, useCallback } from "react";
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
    productToReserve: null,
    showReserveDialog: false,
    showLoginModal: false,
    isLoading: true,
    viewMode: "grid", // grid or list
    searchQuery: "",
    filterTab: "category", // category or region
    advertisements: [],
    marketType: "willing",
    // New hybrid filtering states
    totalProducts: 0,
    currentPage: 1,
    hasMore: true,
    isLoadingMore: false,
    pageSize: 20,
    // Server-side search states
    searchInputValue: "", // Input field value
    isSearchMode: false, // Whether showing search results
    isSearching: false, // Search loading state
    searchResults: [], // Search results from server
    ...initialProps
  });

  // Server-side search function
  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      // Empty search, return to normal products view
      setWilling({
        isSearchMode: false,
        searchResults: [],
        filteredProducts: stateWilling.products
      });
      return;
    }

    try {
      setWilling("isSearching", true);
      
      // Build search options with current filters
      const searchOptions = {
        type: "willing"
      };
      
      if (stateWilling.selectedCategory !== "all") {
        searchOptions.category = stateWilling.selectedCategory;
      }
      
      if (stateWilling.selectedRegion !== "all") {
        searchOptions.region = stateWilling.selectedRegion;
      }

      const response = await productsService.searchProducts(searchTerm, searchOptions);
      const searchResults = response.data;

      setState(prevState => ({
        ...prevState,
        isSearchMode: true,
        searchResults: searchResults,
        filteredProducts: searchResults,
        isSearching: false
      }));

      console.log(`✅ Found ${searchResults.length} willing products for "${searchTerm}"`);

    } catch (error) {
      console.error("Search failed:", error);
      setState(prevState => ({
        ...prevState,
        isSearching: false,
        isSearchMode: false
      }));
    }
  }, [stateWilling.selectedCategory, stateWilling.selectedRegion, stateWilling.products]);

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

  // Fetch products with server-side filtering for category/region
  const fetchProducts = useCallback(async (filters = {}, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setWilling("isLoading", true);
      } else {
        setWilling("isLoadingMore", true);
      }

      // Build filter options for API
      const options = {
        type: "willing",
        limit: stateWilling.pageSize,
        offset: isLoadMore ? stateWilling.products.length : 0,
        ...filters
      };

      // Remove 'all' values as they mean no filter
      if (options.category === "all") delete options.category;
      if (options.region === "all") delete options.region;

      const response = await productsService.getProducts(options);
      const newProducts = response.data;

      setState(prevState => ({
        ...prevState,
        products: isLoadMore 
          ? [...prevState.products, ...newProducts]
          : newProducts,
        filteredProducts: isLoadMore 
          ? [...prevState.products, ...newProducts]
          : newProducts,
        totalProducts: response.total || newProducts.length,
        hasMore: newProducts.length === stateWilling.pageSize,
        isLoading: false,
        isLoadingMore: false,
        currentPage: isLoadMore ? prevState.currentPage + 1 : 1
      }));

    } catch (error) {
      console.error("Failed to load willing products:", error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        isLoadingMore: false
      }));
    }
  }, [stateWilling.pageSize, stateWilling.products.length]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(() => {
    if (!stateWilling.isLoadingMore && stateWilling.hasMore) {
      const filters = {};
      if (stateWilling.selectedCategory !== "all") {
        filters.category = stateWilling.selectedCategory;
      }
      if (stateWilling.selectedRegion !== "all") {
        filters.region = stateWilling.selectedRegion;
      }
      
      fetchProducts(filters, true);
    }
  }, [stateWilling.isLoadingMore, stateWilling.hasMore, stateWilling.selectedCategory, stateWilling.selectedRegion, fetchProducts]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch initial products with pagination
        await fetchProducts();

        // Get categories and regions from a larger sample for filter options
        const metaResponse = await productsService.getProducts({ 
          type: "willing", 
          limit: 1000 // Get more products to extract comprehensive filter options
        });
        const allProducts = metaResponse.data;
        
        const uniqueCategories = [...new Set(allProducts.map(product => product.category))];
        const uniqueRegions = [...new Set(allProducts.map(product => product.address || 'Unknown'))];
        
        // Get advertisements
        const advertisementsResponse = await productsService.getRecommendedProducts();
        const advertisements = advertisementsResponse.data.slice(0, 5);
        
        setState(prevState => ({
          ...prevState,
          categories: uniqueCategories,
          regions: uniqueRegions,
          advertisements: advertisements
        }));

      } catch (error) {
        console.error("Failed to initialize willing data:", error);
        setState(prevState => ({
          ...prevState,
          isLoading: false
        }));
      }
    };

    initializeData();
  }, [fetchProducts]);

  // Server-side filtering: Refetch when category or region changes
  useEffect(() => {
    const filters = {};
    
    if (stateWilling.selectedCategory !== "all") {
      filters.category = stateWilling.selectedCategory;
    }
    
    if (stateWilling.selectedRegion !== "all") {
      filters.region = stateWilling.selectedRegion;
    }

    // Reset pagination and refetch with new filters
    fetchProducts(filters, false);
    
  }, [stateWilling.selectedCategory, stateWilling.selectedRegion, fetchProducts]);

  // Update filteredProducts when products change (for non-search mode)
  useEffect(() => {
    if (!stateWilling.isSearchMode) {
      setWilling("filteredProducts", stateWilling.products);
    }
  }, [stateWilling.products, stateWilling.isSearchMode]);

  // Clear search when filters change
  useEffect(() => {
    if (stateWilling.isSearchMode && stateWilling.searchQuery.trim()) {
      // Re-run the search with new filters if in search mode
      performSearch(stateWilling.searchQuery);
    }
  }, [stateWilling.selectedCategory, stateWilling.selectedRegion]);

  return {
    stateWilling,
    setWilling,
    toggleWillingField,
    // Hybrid filtering functions
    loadMore,
    // Server-side search function
    performSearch,
    // Loading states
    isLoading: stateWilling.isLoading,
    isLoadingMore: stateWilling.isLoadingMore,
    hasMore: stateWilling.hasMore,
    isSearching: stateWilling.isSearching
  };
};

export default useWilling;
