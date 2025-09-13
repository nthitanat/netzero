import { axiosInstance } from "../../../api";

const ReserveDialogHandler = (stateReserveDialog, setReserveDialog, product, onClose, onReservationSuccess) => {
  return {
    handleClose: () => {
      setReserveDialog("reservationError", "");
      setReserveDialog("quantityError", "");
      if (onClose) {
        onClose();
      }
    },

    handleOverlayClick: (event) => {
      // Close dialog only if clicking on the overlay itself
      if (event.target === event.currentTarget) {
        setReserveDialog("reservationError", "");
        setReserveDialog("quantityError", "");
        if (onClose) {
          onClose();
        }
      }
    },

    handleKeyDown: (event) => {
      if (event.key === "Escape") {
        setReserveDialog("reservationError", "");
        setReserveDialog("quantityError", "");
        if (onClose) {
          onClose();
        }
      }
    },

    handleQuantityInputChange: (event) => {
      const value = event.target.value;
      const numValue = parseInt(value, 10);
      
      // Clear previous errors
      setReserveDialog("quantityError", "");
      
      // Allow empty input for user convenience
      if (value === "") {
        setReserveDialog("selectedQuantity", "");
        return;
      }
      
      // Validate and set quantity
      if (!isNaN(numValue) && numValue >= 1) {
        if (numValue <= stateReserveDialog.availableQuantity) {
          setReserveDialog("selectedQuantity", numValue);
        } else {
          setReserveDialog("selectedQuantity", stateReserveDialog.availableQuantity);
          setReserveDialog("quantityError", `จำนวนสูงสุดที่สามารถจองได้คือ ${stateReserveDialog.availableQuantity} ชิ้น`);
        }
      }
    },

    handleIncreaseQuantity: () => {
      if (stateReserveDialog.selectedQuantity < stateReserveDialog.availableQuantity) {
        setReserveDialog("selectedQuantity", stateReserveDialog.selectedQuantity + 1);
        setReserveDialog("quantityError", "");
      }
    },

    handleDecreaseQuantity: () => {
      if (stateReserveDialog.selectedQuantity > 1) {
        setReserveDialog("selectedQuantity", stateReserveDialog.selectedQuantity - 1);
        setReserveDialog("quantityError", "");
      }
    },

    handleConfirmReservation: async () => {
      // Validate quantity before proceeding
      const quantity = stateReserveDialog.selectedQuantity;
      
      if (!quantity || quantity <= 0) {
        setReserveDialog("quantityError", "กรุณาระบุจำนวนที่ต้องการจอง");
        return;
      }
      
      if (quantity > stateReserveDialog.availableQuantity) {
        setReserveDialog("quantityError", `จำนวนที่เลือกเกินสินค้าคงเหลือ (คงเหลือ ${stateReserveDialog.availableQuantity} ชิ้น)`);
        return;
      }

      setReserveDialog("isReserving", true);
      setReserveDialog("reservationError", "");

      try {
        // Create transaction data
        const transactionData = {
          productId: product.id,
          productTitle: product.title,
          quantity: quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
          userId: 1, // This should come from auth context in real implementation
          status: "reserved",
          timestamp: new Date().toISOString(),
          productOrigin: product.origin,
          productCategory: product.category
        };

        // Simulate API call to create product transaction
        const response = await axiosInstance.post('/product-transactions', transactionData);
        
        console.log('✅ Reservation created:', response.data);

        // Simulate API call to update product quantity
        const updatedProductData = {
          ...product,
          quantity: stateReserveDialog.availableQuantity - quantity,
          // Update stock status if quantity becomes 0
          inStock: (stateReserveDialog.availableQuantity - quantity) > 0
        };

        await axiosInstance.put(`/products/${product.id}`, updatedProductData);
        
        console.log('✅ Product quantity updated');

        // Call success callback
        if (onReservationSuccess) {
          onReservationSuccess({
            transaction: response.data || transactionData,
            updatedProduct: updatedProductData,
            reservedQuantity: quantity
          });
        }

        // Close dialog after successful reservation
        if (onClose) {
          onClose();
        }

      } catch (error) {
        console.error("❌ Reservation failed:", error);
        
        // Handle different types of errors
        if (error.response?.status === 400) {
          setReserveDialog("reservationError", "ข้อมูลการจองไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        } else if (error.response?.status === 409) {
          setReserveDialog("reservationError", "สินค้าถูกจองหมดแล้ว กรุณาลองใหม่อีกครั้ง");
        } else if (error.response?.status === 500) {
          setReserveDialog("reservationError", "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง");
        } else {
          setReserveDialog("reservationError", "ไม่สามารถจองสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
        }
      } finally {
        setReserveDialog("isReserving", false);
      }
    }
  };
};

export default ReserveDialogHandler;
