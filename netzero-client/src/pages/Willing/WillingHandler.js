const WillingHandler = (stateWilling, setWilling, navigate) => {
  
  return {
    handleCategoryChange: (category) => {
      setWilling("selectedCategory", category);
    },

    handleRegionChange: (region) => {
      setWilling("selectedRegion", region);
    },

    handleFilterTabChange: (tab) => {
      setWilling("filterTab", tab);
      // Reset filters when switching tabs
      if (tab === "category") {
        setWilling("selectedRegion", "all");
      } else {
        setWilling("selectedCategory", "all");
      }
    },

    handleViewModeChange: (viewMode) => {
      setWilling("viewMode", viewMode);
    },

    handleProductClick: (product) => {
      setWilling({
        selectedProduct: product,
        showModal: true
      });
    },

    handleReserveClick: (product) => {
      if (!product.inStock) {
        alert("สินค้านี้หมดแล้ว ไม่สามารถรับได้");
        return;
      }
      
      // Show success message for free items
      alert(`ขอรับสินค้า "${product.title}" เรียบร้อยแล้ว!\nเราจะติดต่อกลับในเร็วๆ นี้`);
      
      // Log reservation (in real app, this would be an API call)
      console.log("Free product requested:", product);
    },

    handleProductReserve: async (product) => {
      // Simulate API call for free product request
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (product.inStock) {
            console.log("Free product requested successfully:", product);
            alert(`ขอรับสินค้า "${product.title}" เรียบร้อยแล้ว!\nเราจะติดต่อกลับในเร็วๆ นี้`);
            resolve(product);
          } else {
            reject(new Error("Product out of stock"));
          }
        }, 1000);
      });
    },

    handleCloseModal: () => {
      setWilling({
        selectedProduct: null,
        showModal: false
      });
    },

    handleSearchChange: (query) => {
      setWilling("searchQuery", query);
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
      setWilling({
        isLoading: true,
        selectedCategory: "all",
        selectedRegion: "all",
        searchQuery: "",
        filterTab: "category"
      });
      
      // Simulate data refresh
      setTimeout(() => {
        setWilling("isLoading", false);
      }, 800);
    }
  };
};

export default WillingHandler;
