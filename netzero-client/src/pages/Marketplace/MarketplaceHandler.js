const MarketplaceHandler = (state, setState, navigate, performSearch, type) => {
  
  return {
    handleCategoryChange: (category) => {
      setState("selectedCategory", category);
    },

    handleRegionChange: (region) => {
      setState("selectedRegion", region);
    },

    handleFilterTabChange: (tab) => {
      setState("filterTab", tab);
      // Reset filters when switching tabs
      if (tab === "category") {
        setState("selectedRegion", "all");
      } else {
        setState("selectedCategory", "all");
      }
    },

    handleViewModeChange: (viewMode) => {
      setState("viewMode", viewMode);
    },

    handleProductClick: (product) => {
      setState({
        selectedProduct: product,
        showModal: true
      });
    },

    handleReserveClick: (product) => {
      // Check if product is in stock - use stock_quantity from database or inStock field for legacy data
      const isInStock = product?.stock_quantity > 0 || product?.inStock;
      console.log(`${type} click - isInStock:`, isInStock, "product:", product);
      
      if (!isInStock) {
        // Show error alert with type-specific message
        setState({
          alertVisible: true,
          alertType: "error",
          alertMessage: 
            type === "market" ? "สินค้านี้หมดแล้ว ไม่สามารถจองได้" :
            type === "willing" ? "สินค้านี้หมดแล้ว ไม่สามารถรับได้" :
            "สินค้านี้หมดแล้ว ไม่สามารถแลกเปลี่ยนได้"
        });
        return;
      }
      
      // Type-specific dialog handling
      if (type === "barter") {
        // Use the ExchangeDialog for barter trade
        setState({
          productToExchange: product,
          showExchangeDialog: true
        });
      } else {
        // Use the ReserveDialog for market and willing
        setState({
          productToReserve: product,
          showReserveDialog: true
        });
      }
    },

    handleCloseExchangeDialog: () => {
      setState({
        productToExchange: null,
        showExchangeDialog: false
      });
    },

    handleExchangeSuccess: (exchangeData) => {
      // Handle successful exchange from ExchangeDialog
      const { product, exchangeData: data } = exchangeData;
      
      console.log("✅ Exchange request successful:", {
        product,
        exchangeData: data
      });
      
      // Show success alert at page level
      setState({
        productToExchange: null,
        showExchangeDialog: false,
        alertVisible: true,
        alertType: "success",
        alertMessage: `ส่งคำขอแลกเปลี่ยนสินค้า "${product.title}" เรียบร้อยแล้ว! เราจะติดต่อกลับเพื่อหารือรายละเอียดการแลกเปลี่ยนในเร็วๆ นี้`
      });
    },

    handleCloseReserveDialog: () => {
      setState({
        productToReserve: null,
        showReserveDialog: false
      });
    },

    handleShowLoginModal: () => {
      console.log('🔐 Opening login modal for reservation');
      setState("showLoginModal", true);
    },

    handleCloseLoginModal: () => {
      setState("showLoginModal", false);
    },

    handleLoginSuccess: (userData) => {
      console.log('✅ Login successful:', userData);
      setState("showLoginModal", false);
      // After successful login, you might want to reopen the reserve dialog
      // or show a success message
    },

    handleReservationSuccess: (reservationData) => {
      // Handle successful reservation from ReserveDialog
      const { transaction, updatedProduct, reservedQuantity, successMessage } = reservationData;
      
      console.log("✅ Reservation successful:", {
        transaction,
        updatedProduct,
        reservedQuantity
      });
      
      // Type-specific success handling
      if (type === "market") {
        // Market shows ReservationSuccessModal
        setState({
          productToReserve: null,
          showReserveDialog: false,
          showReservationSuccessModal: true,
          reservationData: reservationData
        });
      } else {
        // Willing shows alert only
        setState({
          productToReserve: null,
          showReserveDialog: false,
          alertVisible: true,
          alertType: "success",
          alertMessage: successMessage || `ขอรับสินค้าฟรี "${updatedProduct.productTitle || updatedProduct.title}" จำนวน ${reservedQuantity} ชิ้น เรียบร้อยแล้ว! เราจะติดต่อกลับในเร็วๆ นี้`
        });
      }
    },

    handleCloseReservationSuccessModal: () => {
      setState({
        showReservationSuccessModal: false,
        reservationData: null
      });
    },

    handleCloseModal: () => {
      setState({
        selectedProduct: null,
        showModal: false
      });
    },

    handleSearchInputChange: (value) => {
      setState("searchInputValue", value);
    },

    handleSearchSubmit: () => {
      const searchTerm = state.searchInputValue.trim();
      if (searchTerm) {
        setState("searchQuery", searchTerm);
        performSearch(searchTerm);
      }
    },

    handleClearSearch: () => {
      setState({
        searchInputValue: "",
        searchQuery: "",
        isSearchMode: false,
        searchResults: [],
        filteredProducts: state.products
      });
    },

    handleLoadMore: (loadMoreFn) => {
      loadMoreFn();
    },

    handleAdClick: (ad) => {
      console.log("Ad clicked:", ad);
      // Navigate to product detail or perform other action
    },

    handleNavigate: (path) => {
      navigate(path);
    },

    handleAlertClose: () => {
      setState("alertVisible", false);
    }
  };
};

export default MarketplaceHandler;
