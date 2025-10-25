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
    addEventAssignment,
    removeEventAssignment,
    setError,
    clearError
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
    }
  };
};

export default AddProductToEventDialogHandler;
