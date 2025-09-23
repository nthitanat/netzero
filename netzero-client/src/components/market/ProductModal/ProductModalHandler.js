const ProductModalHandler = (product, onClose, onReserve, onReservationSuccess, showReserveDialog, onShowReserveDialog, onCloseReserveDialog, isReserving) => {
  return {
    handleClose: () => {
      if (onClose) {
        onClose();
      }
    },

    handleOverlayClick: (event) => {
      // Close modal only if clicking on the overlay itself
      if (event.target === event.currentTarget) {
        if (onClose) {
          onClose();
        }
      }
    },

    handleReserve: async () => {
      // Check if product is in stock - use stock_quantity from database or inStock field for legacy data
      const isInStock = product?.stock_quantity > 0 || product?.inStock;
      
      if (!isInStock || isReserving) {
        return;
      }
      
      // Open the reserve dialog instead of directly calling the reservation
      if (onShowReserveDialog) {
        onShowReserveDialog(product); // Pass the product to the handler
      }
    },

    handleCloseReserveDialog: () => {
      if (onCloseReserveDialog) {
        onCloseReserveDialog();
      }
    },

    handleReservationSuccess: (reservationData) => {
      // Close the reserve dialog
      if (onCloseReserveDialog) {
        onCloseReserveDialog();
      }
      
      // Call the parent callback if provided
      if (onReservationSuccess) {
        onReservationSuccess(reservationData);
      }
      
      // Call the legacy onReserve callback if provided for backwards compatibility
      if (onReserve) {
        onReserve(product, reservationData);
      }
      
      // Close the product modal after successful reservation
      if (onClose) {
        onClose();
      }
    },

    handleKeyDown: (event) => {
      if (event.key === "Escape") {
        if (onClose) {
          onClose();
        }
      }
    }
  };
};

export default ProductModalHandler;
