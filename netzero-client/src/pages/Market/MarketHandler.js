const MarketHandler = (stateMarket, setMarket, navigate, performSearch) => {
  
  return {
    handleCategoryChange: (category) => {
      setMarket("selectedCategory", category);
    },

    handleRegionChange: (region) => {
      setMarket("selectedRegion", region);
    },

    handleFilterTabChange: (tab) => {
      setMarket("filterTab", tab);
      // Reset filters when switching tabs
      if (tab === "category") {
        setMarket("selectedRegion", "all");
      } else {
        setMarket("selectedCategory", "all");
      }
    },

    handleViewModeChange: (viewMode) => {
      setMarket("viewMode", viewMode);
    },

    handleProductClick: (product) => {
      setMarket({
        selectedProduct: product,
        showModal: true
      });
    },

    handleReserveClick: (product) => {
      // Check if product is in stock - use stock_quantity from database or inStock field for legacy data
      const isInStock = product?.stock_quantity > 0 || product?.inStock;
      console.log("Reserve click - isInStock:", isInStock, "product:", product);
      if (!isInStock) {
        alert("สินค้านี้หมดแล้ว ไม่สามารถจองได้");
        return;
      }
      
      // Unified: use the main ReserveDialog for both ProductCard and ProductModal
      setMarket({
        productToReserve: product,
        showReserveDialog: true
      });
    },

    handleCloseReserveDialog: () => {
      setMarket({
        productToReserve: null,
        showReserveDialog: false
      });
    },

    handleShowLoginModal: () => {
      console.log('🔐 Opening login modal for reservation');
      setMarket("showLoginModal", true);
    },

    handleCloseLoginModal: () => {
      setMarket("showLoginModal", false);
    },

    handleLoginSuccess: (userData) => {
      console.log('✅ Login successful:', userData);
      setMarket("showLoginModal", false);
      // After successful login, you might want to reopen the reserve dialog
      // or show a success message
    },

    // handleProductReserve: async (product) => {
    //   // Simulate API call for reservation (legacy method - now handled by ReserveDialog)
    //   return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //       if (product.inStock) {
    //         console.log("Product reserved successfully:", product);
    //         alert(`จองสินค้า "${product.title}" เรียบร้อยแล้ว!\nเราจะติดต่อกลับในเร็วๆ นี้`);
    //         resolve(product);
    //       } else {
    //         reject(new Error("Product out of stock"));
    //       }
    //     }, 1000);
    //   });
    // },

    handleReservationSuccess: (reservationData) => {
      // Handle successful reservation from ReserveDialog
      const { transaction, updatedProduct, reservedQuantity } = reservationData;
      
      console.log("✅ Reservation successful:", {
        transaction,
        updatedProduct,
        reservedQuantity
      });
      
      // Show success message
      alert(`จองสินค้า "${updatedProduct.productTitle || updatedProduct.title}" จำนวน ${reservedQuantity} ชิ้น เรียบร้อยแล้ว!\n` +
            `ยอดรวม: ${transaction.totalPrice?.toLocaleString() || 'N/A'} บาท\n` +
            `เราจะติดต่อกลับในเร็วๆ นี้`);
      
      // Close the reserve dialog
      setMarket({
        productToReserve: null,
        showReserveDialog: false
      });
      
      // Here you could also:
      // - Update the products list to reflect the new quantity
      // - Add the transaction to a user's reservation history
      // - Send analytics events
      // - Update the UI state if needed
    },

    handleCloseModal: () => {
      setMarket({
        selectedProduct: null,
        showModal: false
      });
    },

    handleSearchInputChange: (value) => {
      setMarket("searchInputValue", value);
    },

    handleSearchSubmit: async () => {
      const searchTerm = stateMarket.searchInputValue.trim();
      
      if (performSearch && typeof performSearch === 'function') {
        // Set searchQuery for tracking purposes
        setMarket("searchQuery", searchTerm);
        // Perform server-side search
        await performSearch(searchTerm);
      } else {
        console.warn("performSearch function not provided to MarketHandler");
      }
    },

    handleClearSearch: () => {
      setMarket({
        searchInputValue: "",
        searchQuery: "",
        isSearchMode: false,
        searchResults: []
      });
      // Perform empty search to return to normal view
      if (performSearch && typeof performSearch === 'function') {
        performSearch("");
      }
    },

    handleAdClick: (ad) => {
      console.log("Advertisement clicked:", ad);
      // Navigate to the ad link if provided
      if (ad.link) {
        window.location.href = ad.link;
      }
    },

    handleNavigate: (path, label) => {
      // Navigate using React Router's navigate function
      navigate(path);
    },

    handleRefresh: () => {
      setMarket({
        isLoading: true,
        selectedCategory: "all",
        selectedRegion: "all",
        searchQuery: "",
        searchInputValue: "",
        isSearchMode: false,
        searchResults: [],
        filterTab: "category",
        currentPage: 1,
        hasMore: true
      });
    },

    handleLoadMore: (loadMoreFn) => {
      // Call the loadMore function from useMarket hook
      if (loadMoreFn && typeof loadMoreFn === 'function') {
        loadMoreFn();
      }
    }
  };
};

export default MarketHandler;
