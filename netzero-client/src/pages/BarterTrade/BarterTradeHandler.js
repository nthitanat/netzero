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
      if (!product.inStock) {
        alert("สินค้านี้หมดแล้ว ไม่สามารถแลกเปลี่ยนได้");
        return;
      }
      
      // Show success message for barter trade
      alert(`ขอแลกเปลี่ยนสินค้า "${product.title}" เรียบร้อยแล้ว!\nเราจะติดต่อกลับในเร็วๆ นี้`);
      
      // Log reservation (in real app, this would be an API call)
      console.log("Barter trade requested:", product);
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
