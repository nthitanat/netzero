import { reservationsService, eventProductsService } from "../../../api";

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
      
      // Clear selected event when switching away from event
      if (value !== 'event') {
        setReserveDialog("selectedEvent", null);
        setReserveDialog("selectedEventError", "");
        setReserveDialog("eventPrice", null);
      }
      
      // Fetch events when switching to event delivery
      if (value === 'event' && product && product.id) {
        setReserveDialog("isLoadingEvents", true);
        setReserveDialog("selectedEventError", "");
        
        eventProductsService.getEventsByProductId(product.id)
          .then(response => {
            console.log('📦 Events for product:', response);
            const confirmedEvents = (response.data || []).filter(ep => ep.event_product_status === 'confirmed');
            setReserveDialog("availableEvents", confirmedEvents);
            setReserveDialog("isLoadingEvents", false);
            
            if (confirmedEvents.length === 0) {
              setReserveDialog("selectedEventError", "ไม่มีกิจกรรมที่เกี่ยวข้องกับสินค้านี้");
            }
          })
          .catch(error => {
            console.error('❌ Failed to fetch events:', error);
            setReserveDialog("availableEvents", []);
            setReserveDialog("isLoadingEvents", false);
            setReserveDialog("selectedEventError", "ไม่สามารถโหลดรายการกิจกรรมได้");
          });
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

    handleEventSelection: (event) => {
      const eventId = parseInt(event.target.value);
      
      // Clear previous error
      setReserveDialog("selectedEventError", "");
      
      if (!eventId) {
        setReserveDialog("selectedEvent", null);
        setReserveDialog("eventPrice", null);
        return;
      }
      
      // Find the selected event from available events
      const selectedEventData = stateReserveDialog.availableEvents.find(
        ep => ep.event_id === eventId
      );
      
      console.log('🎫 Event selected, ID:', eventId);
      console.log('🎫 Found event data:', selectedEventData);
      console.log('💰 Event price from data:', selectedEventData?.event_price);
      
      if (selectedEventData) {
        setReserveDialog("selectedEvent", selectedEventData);
        // Convert event_price to number
        const eventPrice = parseFloat(selectedEventData.event_price);
        console.log('💰 Parsed event price:', eventPrice);
        setReserveDialog("eventPrice", eventPrice);
        
        // Update available quantity based on event's stock quantity
        if (selectedEventData.stock_quantity !== undefined) {
          setReserveDialog("availableQuantity", selectedEventData.stock_quantity);
          
          // Reset selected quantity if it exceeds new available quantity
          if (stateReserveDialog.selectedQuantity > selectedEventData.stock_quantity) {
            setReserveDialog("selectedQuantity", Math.min(1, selectedEventData.stock_quantity));
          }
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

      // Validate event selection (only for event option)
      if (optionOfDelivery === 'event') {
        if (!stateReserveDialog.selectedEvent) {
          setReserveDialog("selectedEventError", "กรุณาเลือกกิจกรรมที่ต้องการรับสินค้า");
          return;
        }
      }

      setReserveDialog("isReserving", true);
      setReserveDialog("reservationError", "");

      try {
        // Calculate reserved unit price based on delivery option
        const reservedUnitPrice = optionOfDelivery === 'event' && stateReserveDialog.eventPrice
          ? parseFloat(stateReserveDialog.eventPrice)
          : parseFloat(product.price);
        
        // Create reservation using the proper API
        const reservationData = {
          product_id: product.id,
          event_id: optionOfDelivery === 'event' && stateReserveDialog.selectedEvent
            ? stateReserveDialog.selectedEvent.event_id
            : null,
          quantity: quantity,
          reserved_unit_price: reservedUnitPrice,
          note: `การจองสินค้า ${product.title} จำนวน ${quantity} ชิ้น`,
          shipping_address: optionOfDelivery === 'delivery' ? shippingAddress.trim() : null,
          option_of_delivery: optionOfDelivery,
          user_note: userNote.trim() || null,
          pickup_date: optionOfDelivery === 'pickup' ? pickupDate : null
        };

        console.log('🔄 Creating reservation:', reservationData);
        console.log('� Product object:', product);
        console.log('🎫 Selected event:', stateReserveDialog.selectedEvent);
        console.log('�📊 Reserved unit price:', reservedUnitPrice, 'Type:', typeof reservedUnitPrice);
        console.log('📊 Event price:', stateReserveDialog.eventPrice, 'Type:', typeof stateReserveDialog.eventPrice);
        console.log('📊 Product price:', product.price, 'Type:', typeof product.price);
        console.log('🚚 Delivery option:', optionOfDelivery);
        const response = await reservationsService.createReservation(reservationData);
        
        console.log('✅ Reservation created:', response.data);

        // Calculate total price using reserved unit price
        const totalPrice = reservedUnitPrice * quantity;

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
              totalPrice: totalPrice,
              unitPrice: reservedUnitPrice
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
        console.error("📋 Error response data:", error.response?.data);
        console.error("📋 Error message:", error.response?.data?.message);
        
        let errorMsg = "ไม่สามารถจองสินค้าได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
        
        // Handle different types of errors based on our API structure
        if (error.response?.status === 400) {
          // Use the server's error message directly for 400 errors
          const serverMessage = error.response?.data?.message;
          
          if (serverMessage === "Cannot reserve your own product") {
            errorMsg = "คุณไม่สามารถจองสินค้าของตัวเองได้";
          } else {
            errorMsg = serverMessage || "ข้อมูลการจองไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
          }
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
