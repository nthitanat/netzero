import { productsService, reservationsService } from "../../api";

const SellerDashboardHandler = (stateSellerDashboard, setSellerDashboard, navigate) => {
  
  return {
    handleTabChange: (tab) => {
      setSellerDashboard("activeTab", tab);
      
      // Note: Data loading is handled by the initial useEffect in the hook
      // We don't need to trigger loading here since data is loaded on component mount
      // The empty array check was causing infinite loading when there are genuinely no items
    },

    handleCreateProduct: () => {
      setSellerDashboard({
        selectedProduct: null,
        showProductModal: true
      });
    },

    handleEditProduct: (product) => {
      setSellerDashboard({
        selectedProduct: product,
        showProductModal: true
      });
    },

    handleDeleteProduct: (product) => {
      setSellerDashboard({
        productToDelete: product,
        showDeleteConfirm: true
      });
    },

    handleConfirmDelete: async () => {
      const productToDelete = stateSellerDashboard.productToDelete;
      
      if (!productToDelete) return;
      
      try {
        console.log(`🗑️ Deleting product: ${productToDelete.title}`);
        
        await productsService.deleteProduct(productToDelete.id);
        
        // Remove product from local state
        const updatedProducts = stateSellerDashboard.products.filter(
          p => p.id !== productToDelete.id
        );
        
        setSellerDashboard({
          products: updatedProducts,
          productToDelete: null,
          showDeleteConfirm: false
        });
        
        console.log(`✅ Product deleted successfully`);
        alert(`ลบสินค้า "${productToDelete.title}" เรียบร้อยแล้ว`);
        
      } catch (error) {
        console.error("❌ Error deleting product:", error);
        alert(`ไม่สามารถลบสินค้า "${productToDelete.title}" ได้: ${error.message}`);
      }
    },

    handleCancelDelete: () => {
      setSellerDashboard({
        productToDelete: null,
        showDeleteConfirm: false
      });
    },

    handleCloseProductModal: () => {
      setSellerDashboard({
        selectedProduct: null,
        showProductModal: false
      });
    },

    handleProductSaved: async (savedProduct) => {
      try {
        // Determine if this was a create or update operation
        const isNewProduct = !stateSellerDashboard.selectedProduct;
        
        if (isNewProduct) {
          // Add new product to local state
          setSellerDashboard({
            products: [...stateSellerDashboard.products, savedProduct],
            selectedProduct: null,
            showProductModal: false
          });
          
          console.log("✅ New product added to list");
          alert(`เพิ่มสินค้า "${savedProduct.title}" เรียบร้อยแล้ว`);
          
        } else {
          // Update existing product in local state
          const updatedProducts = stateSellerDashboard.products.map(p =>
            p.id === savedProduct.id ? savedProduct : p
          );
          
          setSellerDashboard({
            products: updatedProducts,
            selectedProduct: null,
            showProductModal: false
          });
          
          console.log("✅ Product updated in list");
          alert(`อัปเดตสินค้า "${savedProduct.title}" เรียบร้อยแล้ว`);
        }
        
      } catch (error) {
        console.error("❌ Error handling saved product:", error);
      }
    },

    handleConfirmReservation: async (reservation) => {
      try {
        console.log(`✅ Confirming reservation: ${reservation.reservation_id}`);
        
        const response = await reservationsService.confirmReservation(reservation.reservation_id);
        
        // Update reservation in local state
        const updatedReservations = stateSellerDashboard.reservations.map(r =>
          r.reservation_id === reservation.reservation_id 
            ? { ...r, status: 'confirmed' }
            : r
        );
        
        setSellerDashboard("reservations", updatedReservations);
        
        console.log("✅ Reservation confirmed successfully");
        alert(`ยืนยันการจอง "${reservation.product_title}" เรียบร้อยแล้ว`);
        
      } catch (error) {
        console.error("❌ Error confirming reservation:", error);
        alert(`ไม่สามารถยืนยันการจองได้: ${error.message}`);
      }
    },

    handleCancelReservation: async (reservation) => {
      try {
        console.log(`❌ Cancelling reservation: ${reservation.reservation_id}`);
        
        const response = await reservationsService.cancelReservation(reservation.reservation_id);
        
        // Update reservation in local state
        const updatedReservations = stateSellerDashboard.reservations.map(r =>
          r.reservation_id === reservation.reservation_id 
            ? { ...r, status: 'cancelled' }
            : r
        );
        
        setSellerDashboard("reservations", updatedReservations);
        
        console.log("✅ Reservation cancelled successfully");
        alert(`ยกเลิกการจอง "${reservation.product_title}" เรียบร้อยแล้ว`);
        
      } catch (error) {
        console.error("❌ Error cancelling reservation:", error);
        alert(`ไม่สามารถยกเลิกการจองได้: ${error.message}`);
      }
    },

    handleRefreshStats: async () => {
      try {
        setSellerDashboard("isLoading", true);
        
        // Reload both products and reservations to recalculate stats
        await Promise.all([
          // These will trigger the useEffect in the hook to recalculate stats
          setSellerDashboard("isLoading", false)
        ]);
        
      } catch (error) {
        console.error("❌ Error refreshing stats:", error);
        setSellerDashboard("isLoading", false);
      }
    },

    handleRefreshProducts: async () => {
      try {
        setSellerDashboard("isLoading", true);
        
        const response = await productsService.getMyProducts();
        
        setSellerDashboard({
          products: response.data,
          isLoading: false
        });
        
        console.log("✅ Products refreshed");
        
      } catch (error) {
        console.error("❌ Error refreshing products:", error);
        setSellerDashboard("isLoading", false);
      }
    },

    handleRefreshReservations: async () => {
      try {
        setSellerDashboard("isLoading", true);
        
        const response = await reservationsService.getMyProductReservations();
        
        setSellerDashboard({
          reservations: response.data,
          isLoading: false
        });
        
        console.log("✅ Reservations refreshed");
        
      } catch (error) {
        console.error("❌ Error refreshing reservations:", error);
        setSellerDashboard("isLoading", false);
      }
    },

    handleNavigate: (path, label) => {
      navigate(path);
    }
  };
};

export default SellerDashboardHandler;