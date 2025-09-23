import { reservationsService } from "../../../api";

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
        // Create reservation using the proper API
        const reservationData = {
          product_id: product.id,
          quantity: quantity,
          note: `การจองสินค้า ${product.title} จำนวน ${quantity} ชิ้น`
        };

        console.log('🔄 Creating reservation:', reservationData);
        const response = await reservationsService.createReservation(reservationData);
        
        console.log('✅ Reservation created:', response.data);

        // Calculate updated product info
        const updatedProductInfo = {
          ...product,
          stock_quantity: stateReserveDialog.availableQuantity - quantity,
          inStock: (stateReserveDialog.availableQuantity - quantity) > 0
        };

        // Call success callback with the proper data structure
        if (onReservationSuccess) {
          onReservationSuccess({
            transaction: {
              ...response.data,
              totalPrice: product.price * quantity,
              unitPrice: product.price
            },
            updatedProduct: updatedProductInfo,
            reservedQuantity: quantity
          });
        }

        // Close dialog after successful reservation
        if (onClose) {
          onClose();
        }

      } catch (error) {
        console.error("❌ Reservation failed:", error);
        
        // Handle different types of errors based on our API structure
        if (error.response?.status === 400) {
          const errorMsg = error.response?.data?.message || "ข้อมูลการจองไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
          setReserveDialog("reservationError", errorMsg);
        } else if (error.response?.status === 409) {
          setReserveDialog("reservationError", "สินค้าถูกจองหมดแล้ว กรุณาลองใหม่อีกครั้ง");
        } else if (error.response?.status === 404) {
          setReserveDialog("reservationError", "ไม่พบสินค้าที่ต้องการจอง");
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
