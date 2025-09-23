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
      // Check if product is in stock - use stock_quantity from database or inStock field for legacy data
      const isInStock = product?.stock_quantity > 0 || product?.inStock;
      console.log("Reserve click - isInStock:", isInStock, "product:", product);
      if (!isInStock) {
        alert("สินค้านี้หมดแล้ว ไม่สามารถรับได้");
        return;
      }
      
      // Use the ReserveDialog for free items too
      setWilling({
        productToReserve: product,
        showReserveDialog: true
      });
    },

    handleCloseReserveDialog: () => {
      setWilling({
        productToReserve: null,
        showReserveDialog: false
      });
    },

    handleShowLoginModal: () => {
      console.log('🔐 Opening login modal for reservation');
      setWilling("showLoginModal", true);
    },

    handleCloseLoginModal: () => {
      setWilling("showLoginModal", false);
    },

    handleLoginSuccess: (userData) => {
      console.log('✅ Login successful:', userData);
      setWilling("showLoginModal", false);
      // After successful login, you might want to reopen the reserve dialog
      // or show a success message
    },

    handleReservationSuccess: (reservationData) => {
      // Handle successful reservation from ReserveDialog for free items
      const { transaction, updatedProduct, reservedQuantity } = reservationData;
      
      console.log("✅ Free item request successful:", {
        transaction,
        updatedProduct,
        reservedQuantity
      });
      
      // Show success message for free items
      alert(`ขอรับสินค้าฟรี "${updatedProduct.productTitle || updatedProduct.title}" จำนวน ${reservedQuantity} ชิ้น เรียบร้อยแล้ว!\n` +
            `เราจะติดต่อกลับในเร็วๆ นี้`);
      
      // Close the reserve dialog
      setWilling({
        productToReserve: null,
        showReserveDialog: false
      });
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
