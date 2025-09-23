const BarterTradeHandler = (stateBarterTrade, setBarterTrade, navigate) => {
  
  return {
    handleCategoryChange: (category) => {
      setBarterTrade("selectedCategory", category);
    },

    handleRegionChange: (region) => {
      setBarterTrade("selectedRegion", region);
    },

    handleFilterTabChange: (tab) => {
      setBarterTrade("filterTab", tab);
      // Reset filters when switching tabs
      if (tab === "category") {
        setBarterTrade("selectedRegion", "all");
      } else {
        setBarterTrade("selectedCategory", "all");
      }
    },

    handleViewModeChange: (viewMode) => {
      setBarterTrade("viewMode", viewMode);
    },

    handleProductClick: (product) => {
      setBarterTrade({
        selectedProduct: product,
        showModal: true
      });
    },

    handleReserveClick: (product) => {
      // Check if product is in stock - use stock_quantity from database or inStock field for legacy data
      const isInStock = product?.stock_quantity > 0 || product?.inStock;
      console.log("Exchange click - isInStock:", isInStock, "product:", product);
      if (!isInStock) {
        alert("สินค้านี้หมดแล้ว ไม่สามารถแลกเปลี่ยนได้");
        return;
      }
      
      // Use the ExchangeDialog for barter trade
      setBarterTrade({
        productToExchange: product,
        showExchangeDialog: true
      });
    },

    handleCloseExchangeDialog: () => {
      setBarterTrade({
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
      
      // Show success message for exchange
      alert(`ส่งคำขอแลกเปลี่ยนสินค้า "${product.title}" เรียบร้อยแล้ว!\n` +
            `เราจะติดต่อกลับเพื่อหารือรายละเอียดการแลกเปลี่ยนในเร็วๆ นี้`);
      
      // Close the exchange dialog
      setBarterTrade({
        productToExchange: null,
        showExchangeDialog: false
      });
    },

    handleProductReserve: async (product) => {
      // Simulate API call for barter trade request
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (product.inStock) {
            console.log("Barter trade requested successfully:", product);
            alert(`ขอแลกเปลี่ยนสินค้า "${product.title}" เรียบร้อยแล้ว!\nเราจะติดต่อกลับในเร็วๆ นี้`);
            resolve(product);
          } else {
            reject(new Error("Product out of stock"));
          }
        }, 1000);
      });
    },

    handleCloseModal: () => {
      setBarterTrade({
        selectedProduct: null,
        showModal: false
      });
    },

    handleSearchChange: (query) => {
      setBarterTrade("searchQuery", query);
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
      setBarterTrade({
        isLoading: true,
        selectedCategory: "all",
        selectedRegion: "all",
        searchQuery: "",
        filterTab: "category"
      });
      
      // Simulate data refresh
      setTimeout(() => {
        setBarterTrade("isLoading", false);
      }, 800);
    }
  };
};

export default BarterTradeHandler;
