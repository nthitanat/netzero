const ProductModalHandler = (stateProductModal, setProductModal, product, onClose, onReserve, onReservationSuccess) => {
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
      if (!product.inStock || stateProductModal.isReserving) {
        return;
      }
      
      // Open the reserve dialog instead of directly calling the reservation
      setProductModal("showReserveDialog", true);
    },

    handleCloseReserveDialog: () => {
      setProductModal("showReserveDialog", false);
    },

    handleReservationSuccess: (reservationData) => {
      // Close the reserve dialog
      setProductModal("showReserveDialog", false);
      
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
