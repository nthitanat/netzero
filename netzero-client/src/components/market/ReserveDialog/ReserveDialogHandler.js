import { reservationsService } from "../../../api";

const ReserveDialogHandler = (stateReserveDialog, setReserveDialog, product, onClose, onReservationSuccess, onShowLogin, isAuthenticated, validateShippingAddress, validateUserNote, validatePickupDate) => {
  return {
    handleClose: () => {
      setReserveDialog("reservationError", "");
      setReserveDialog("quantityError", "");
      setReserveDialog("shippingAddressError", "");
      setReserveDialog("userNoteError", "");
      setReserveDialog("pickupDateError", "");
      if (onClose) {
        onClose();
      }
    },

    handleOverlayClick: (event) => {
      // Close dialog only if clicking on the overlay itself
      if (event.target === event.currentTarget) {
        setReserveDialog("reservationError", "");
        setReserveDialog("quantityError", "");
        setReserveDialog("shippingAddressError", "");
        if (onClose) {
          onClose();
        }
      }
    },

    handleKeyDown: (event) => {
      if (event.key === "Escape") {
        setReserveDialog("reservationError", "");
        setReserveDialog("quantityError", "");
        setReserveDialog("shippingAddressError", "");
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

    handleShippingAddressChange: (event) => {
      const value = event.target.value;
      setReserveDialog("shippingAddress", value);
      
      // Clear previous error
      setReserveDialog("shippingAddressError", "");
      
      // Validate on blur or when user stops typing
      if (validateShippingAddress && value.trim().length > 0) {
        const error = validateShippingAddress(value);
        if (error) {
          setReserveDialog("shippingAddressError", error);
        }
      }
    },

    handleDeliveryOptionChange: (event) => {
      const value = event.target.value;
      setReserveDialog("optionOfDelivery", value);
      
      // Clear pickup date if switching to delivery
      if (value === 'delivery') {
        setReserveDialog("pickupDate", "");
        setReserveDialog("pickupDateError", "");
      }
    },

    handleUserNoteChange: (event) => {
      const value = event.target.value;
      setReserveDialog("userNote", value);
      
      // Clear previous error
      setReserveDialog("userNoteError", "");
      
      // Validate user note
      if (validateUserNote) {
        const error = validateUserNote(value);
        if (error) {
          setReserveDialog("userNoteError", error);
        }
      }
    },

    handlePickupDateChange: (event) => {
      const value = event.target.value;
      setReserveDialog("pickupDate", value);
      
      // Clear previous error
      setReserveDialog("pickupDateError", "");
      
      // Validate pickup date
      if (validatePickupDate) {
        const error = validatePickupDate(value, stateReserveDialog.optionOfDelivery);
        if (error) {
          setReserveDialog("pickupDateError", error);
        }
      }
    },

    handleConfirmReservation: async () => {
      // Check authentication first
      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, showing login modal');
        if (onShowLogin) {
          onShowLogin();
        }
        return;
      }

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

      // Validate shipping address (only for delivery option)
      const shippingAddress = stateReserveDialog.shippingAddress;
      const optionOfDelivery = stateReserveDialog.optionOfDelivery;
      
      if (optionOfDelivery === 'delivery' && validateShippingAddress) {
        const addressError = validateShippingAddress(shippingAddress);
        if (addressError) {
          setReserveDialog("shippingAddressError", addressError);
          return;
        }
      }

      // Validate user note
      const userNote = stateReserveDialog.userNote;
      if (validateUserNote) {
        const noteError = validateUserNote(userNote);
        if (noteError) {
          setReserveDialog("userNoteError", noteError);
          return;
        }
      }

      // Validate pickup date (only for pickup option)
      const pickupDate = stateReserveDialog.pickupDate;
      if (validatePickupDate) {
        const dateError = validatePickupDate(pickupDate, optionOfDelivery);
        if (dateError) {
          setReserveDialog("pickupDateError", dateError);
          return;
        }
      }

      setReserveDialog("isReserving", true);
      setReserveDialog("reservationError", "");

      try {
        // Create reservation using the proper API
        const reservationData = {
          product_id: product.id,
          quantity: quantity,
          note: `การจองสินค้า ${product.title} จำนวน ${quantity} ชิ้น`,
          shipping_address: optionOfDelivery === 'delivery' ? shippingAddress.trim() : null,
          option_of_delivery: optionOfDelivery,
          user_note: userNote.trim() || null,
          pickup_date: optionOfDelivery === 'pickup' ? pickupDate : null
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
            reservedQuantity: quantity,
            successMessage: `จองสินค้า "${product.title}" จำนวน ${quantity} ชิ้น เรียบร้อยแล้ว! เราจะติดต่อกลับในเร็วๆ นี้`
          });
        }

        // Close dialog after successful reservation
        if (onClose) {
          onClose();
        }

      } catch (error) {
        console.error("❌ Reservation failed:", error);
        
        let errorMsg = "ไม่สามารถจองสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
        
        // Handle different types of errors based on our API structure
        if (error.response?.status === 400) {
          errorMsg = error.response?.data?.message || "ข้อมูลการจองไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
        } else if (error.response?.status === 409) {
          errorMsg = "สินค้าถูกจองหมดแล้ว กรุณาลองใหม่อีกครั้ง";
        } else if (error.response?.status === 404) {
          errorMsg = "ไม่พบสินค้าที่ต้องการจอง";
        } else if (error.response?.status === 429) {
          errorMsg = "มีการร้องขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่";
        } else if (error.response?.status === 500) {
          errorMsg = "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง";
        }
        
        // Set error for display in dialog
        setReserveDialog("reservationError", errorMsg);
      } finally {
        setReserveDialog("isReserving", false);
      }
    }
  };
};

export default ReserveDialogHandler;
