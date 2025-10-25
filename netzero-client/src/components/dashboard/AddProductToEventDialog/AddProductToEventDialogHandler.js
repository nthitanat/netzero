import { eventProductsService } from "../../../api";

const AddProductToEventDialogHandler = (
  stateAddProductToEventDialog,
  hookFunctions,
  product,
  onSuccess,
  onClose
) => {
  const {
    setSelectedEvent,
    setSelectedEventPrice,
    setSelectedEventQuantity,
    setEditingEventProduct,
    cancelEditEventProduct,
    setEditEventPrice,
    setEditStockQuantity,
    addEventAssignment,
    removeEventAssignment,
    setError,
    clearError,
    loadExistingEventProducts
  } = hookFunctions;

  return {
    handleEventChange: (eventId) => {
      setSelectedEvent(eventId);
      clearError();
      
      // Auto-fill price with product's regular price
      if (eventId && product) {
        setSelectedEventPrice(product.price || "");
      }
    },

    handlePriceChange: (price) => {
      setSelectedEventPrice(price);
      clearError();
    },

    handleQuantityChange: (quantity) => {
      setSelectedEventQuantity(quantity);
      clearError();
    },

    handleAddAssignment: (e) => {
      e?.preventDefault();
      const success = addEventAssignment();
      
      if (success) {
        console.log("✅ Event assignment added");
      }
    },

    handleRemoveAssignment: (eventId) => {
      removeEventAssignment(eventId);
      console.log(`🗑️ Removed event assignment: ${eventId}`);
    },

    handleSubmit: async (e) => {
      e.preventDefault();
      
      if (!stateAddProductToEventDialog.isFormValid) {
        setError("กรุณาตรวจสอบข้อมูลให้ถูกต้อง");
        return;
      }

      if (!product || !product.id) {
        setError("ไม่พบข้อมูลสินค้า");
        return;
      }

      try {
        console.log("🔄 Submitting event assignments...");
        
        // Add product to all selected events
        const assignments = stateAddProductToEventDialog.eventAssignments.map(assignment => ({
          product_id: product.id,
          event_id: assignment.event_id,
          event_price: assignment.event_price,
          stock_quantity: assignment.stock_quantity
        }));

        // Call API to create event products
        await eventProductsService.addProductToEvents(product.id, assignments);

        console.log("✅ Product added to events successfully");
        
        if (onSuccess) {
          onSuccess(assignments);
        }
        
        onClose();
        
      } catch (error) {
        console.error("❌ Error adding product to events:", error);
        
        const errorMessage = error.response?.data?.message || error.message || "ไม่สามารถเพิ่มสินค้าในอีเวนต์ได้";
        setError(errorMessage);
      }
    },

    handleCancel: () => {
      clearError();
      onClose();
    },

    // Existing event product handlers
    handleStartEditEventProduct: (eventProduct) => {
      setEditingEventProduct(
        eventProduct.event_product_id,
        eventProduct.event_price,
        eventProduct.stock_quantity
      );
      clearError();
    },

    handleCancelEditEventProduct: () => {
      cancelEditEventProduct();
      clearError();
    },

    handleEditEventPriceChange: (price) => {
      setEditEventPrice(price);
      clearError();
    },

    handleEditStockQuantityChange: (quantity) => {
      setEditStockQuantity(quantity);
      clearError();
    },

    handleSaveEventProductPrice: async (eventProductId) => {
      try {
        const newPrice = parseFloat(stateAddProductToEventDialog.editEventPrice);
        
        if (isNaN(newPrice) || newPrice < 0) {
          setError("กรุณากรอกราคาที่ถูกต้อง");
          return;
        }

        console.log(`💰 Updating event product ${eventProductId} price to ${newPrice}`);

        await eventProductsService.patchEventProduct(eventProductId, {
          event_price: newPrice
        });

        console.log("✅ Event product price updated successfully");
        
        // Reload existing event products
        await loadExistingEventProducts();
        
        cancelEditEventProduct();
        clearError();
        
      } catch (error) {
        console.error("❌ Error updating event product price:", error);
        const errorMessage = error.response?.data?.message || error.message || "ไม่สามารถอัปเดตราคาได้";
        setError(errorMessage);
      }
    },

    handleSaveEventProductStock: async (eventProductId) => {
      try {
        const newStock = parseInt(stateAddProductToEventDialog.editStockQuantity);
        
        if (isNaN(newStock) || newStock < 0) {
          setError("กรุณากรอกจำนวนที่ถูกต้อง");
          return;
        }

        console.log(`📦 Updating event product ${eventProductId} stock to ${newStock}`);

        const response = await eventProductsService.patchEventProduct(eventProductId, {
          stock_quantity: newStock
        });

        console.log("✅ Event product stock updated successfully");
        console.log("📊 Updated unassigned stock:", response.data.product_unassigned_stock_quantity);
        
        // Reload existing event products to refresh the list
        await loadExistingEventProducts();
        
        cancelEditEventProduct();
        clearError();
        
        // Show success message with stock info
        alert(`อัปเดตจำนวนสินค้าสำเร็จ\nสต็อกที่ยังไม่ได้กำหนดอีเวนต์: ${response.data.product_unassigned_stock_quantity}\nสต็อกรวมทั้งหมด: ${response.data.product_stock_quantity}`);
        
      } catch (error) {
        console.error("❌ Error updating event product stock:", error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "ไม่สามารถอัปเดตจำนวนได้";
        setError(errorMessage);
      }
    }
  };
};

export default AddProductToEventDialogHandler;
