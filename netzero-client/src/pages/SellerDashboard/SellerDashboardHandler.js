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
        productModalMode: "create",
        showProductModal: true
      });
    },

    handleEditProduct: (product) => {
      setSellerDashboard({
        selectedProduct: product,
        productModalMode: "edit",
        showProductModal: true
      });
    },

    handleAddProductToEvent: (product) => {
      setSellerDashboard({
        productForEvent: product,
        showAddToEventDialog: true
      });
    },

    handleCloseAddToEventDialog: () => {
      setSellerDashboard({
        showAddToEventDialog: false,
        productForEvent: null
      });
    },

    handleAddToEventSuccess: async (assignments) => {
      console.log("✅ Product added to events successfully:", assignments);
      
      // Refresh products to get updated unassigned_stock_quantity
      try {
        const response = await productsService.getMyProducts();
        setSellerDashboard({
          products: response.data,
          showAddToEventDialog: false,
          productForEvent: null
        });
        
        alert(`เพิ่มสินค้าในอีเวนต์สำเร็จ (${assignments.length} อีเวนต์)`);
      } catch (error) {
        console.error("Error refreshing products:", error);
      }
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
        showProductModal: false,
        isSubmittingProduct: false
      });
    },

    handleProductSaved: async (productData, imageFiles) => {
      try {
        setSellerDashboard("isSubmittingProduct", true);
        
        // Determine if this was a create or update operation
        const isNewProduct = !stateSellerDashboard.selectedProduct;
        
        let savedProduct;
        
        if (isNewProduct) {
          // Create new product
          console.log("🔄 Creating new product...");
          const response = await productsService.createProduct(productData);
          savedProduct = response.data;
          
          // Upload images if provided
          if (imageFiles.thumbnail) {
            await productsService.uploadProductThumbnail(savedProduct.id, imageFiles.thumbnail);
          }
          if (imageFiles.cover) {
            await productsService.uploadProductCover(savedProduct.id, imageFiles.cover);
          }
          if (imageFiles.additionalImages && imageFiles.additionalImages.length > 0) {
            await productsService.uploadProductImages(savedProduct.id, imageFiles.additionalImages);
          }
          
          // Add new product to local state
          setSellerDashboard({
            products: [...stateSellerDashboard.products, savedProduct],
            selectedProduct: null,
            showProductModal: false,
            isSubmittingProduct: false
          });
          
          console.log("✅ New product created successfully");
          alert(`เพิ่มสินค้า "${savedProduct.title}" เรียบร้อยแล้ว`);
          
        } else {
          // Update existing product
          console.log("🔄 Updating product...");
          const response = await productsService.updateProduct(stateSellerDashboard.selectedProduct.id, productData);
          savedProduct = response.data;
          
          // Upload images if provided
          if (imageFiles.thumbnail) {
            await productsService.uploadProductThumbnail(savedProduct.id, imageFiles.thumbnail);
          }
          if (imageFiles.cover) {
            await productsService.uploadProductCover(savedProduct.id, imageFiles.cover);
          }
          if (imageFiles.additionalImages && imageFiles.additionalImages.length > 0) {
            await productsService.uploadProductImages(savedProduct.id, imageFiles.additionalImages);
          }
          
          // Update existing product in local state
          const updatedProducts = stateSellerDashboard.products.map(p =>
            p.id === savedProduct.id ? savedProduct : p
          );
          
          setSellerDashboard({
            products: updatedProducts,
            selectedProduct: null,
            showProductModal: false,
            isSubmittingProduct: false
          });
          
          console.log("✅ Product updated successfully");
          alert(`อัปเดตสินค้า "${savedProduct.title}" เรียบร้อยแล้ว`);
        }
        
      } catch (error) {
        console.error("❌ Error saving product:", error);
        setSellerDashboard("isSubmittingProduct", false);
        alert(`ไม่สามารถบันทึกสินค้าได้: ${error.message}`);
        throw error; // Let the modal handle the error display
      }
    },

    handleConfirmReservation: async (reservation) => {
      try {
        console.log(`✅ Confirming reservation: ${reservation.reservation_id}`);
        
        const response = await reservationsService.confirmReservation(reservation.reservation_id);
        
        console.log('Confirm Reservation Response:', response);
        
        // Update reservation in local state if response exists
        if (response) {
          const updatedReservations = stateSellerDashboard.reservations.map(r =>
            r.reservation_id === reservation.reservation_id 
              ? { ...r, status: 'confirmed', confirmed_at: new Date().toISOString() }
              : r
          );
          
          setSellerDashboard("reservations", updatedReservations);
          
          console.log("✅ Reservation confirmed successfully");
          alert(`ยืนยันการจอง "${reservation.product?.title || 'สินค้า'}" เรียบร้อยแล้ว`);
        }
        
      } catch (error) {
        console.error("❌ Error confirming reservation:", error);
        alert(`ไม่สามารถยืนยันการจองได้: ${error.message}`);
      }
    },

    handleCancelReservation: async (reservation) => {
      try {
        console.log(`❌ Cancelling reservation: ${reservation.reservation_id}`);
        
        const response = await reservationsService.cancelReservation(reservation.reservation_id);
        
        console.log('Cancel Reservation Response:', response);
        
        // Update reservation in local state if response exists
        if (response) {
          const updatedReservations = stateSellerDashboard.reservations.map(r =>
            r.reservation_id === reservation.reservation_id 
              ? { ...r, status: 'cancelled' }
              : r
          );
          
          setSellerDashboard("reservations", updatedReservations);
          
          console.log("✅ Reservation cancelled successfully");
          alert(`ยกเลิกการจอง "${reservation.product?.title || 'สินค้า'}" เรียบร้อยแล้ว`);
        }
        
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
        
        console.log('Refresh Reservations Response:', response);
        
        // Handle response data properly
        if (response && response.data) {
          setSellerDashboard({
            reservations: response.data,
            isLoading: false
          });
        } else {
          setSellerDashboard({
            reservations: [],
            isLoading: false
          });
        }
        
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