const ReservationSuccessModalHandler = (stateReservationSuccessModal, setReservationSuccessModal, onClose) => {
  return {
    handleClose: () => {
      setReservationSuccessModal("isClosing", true);
      
      // Add a small delay for smooth closing animation
      setTimeout(() => {
        setReservationSuccessModal({
          isModalOpen: false,
          isClosing: false,
          reservationData: null
        });
        
        if (onClose && typeof onClose === 'function') {
          onClose();
        }
      }, 150);
    },

    handleOverlayClick: (event) => {
      // Close modal only if clicking on the overlay itself, not the modal content
      if (event.target === event.currentTarget) {
        setReservationSuccessModal("isClosing", true);
        
        setTimeout(() => {
          setReservationSuccessModal({
            isModalOpen: false,
            isClosing: false,
            reservationData: null
          });
          
          if (onClose && typeof onClose === 'function') {
            onClose();
          }
        }, 150);
      }
    },

    handleKeyDown: (event) => {
      // Handle Escape key to close modal
      if (event.key === "Escape") {
        setReservationSuccessModal("isClosing", true);
        
        setTimeout(() => {
          setReservationSuccessModal({
            isModalOpen: false,
            isClosing: false,
            reservationData: null
          });
          
          if (onClose && typeof onClose === 'function') {
            onClose();
          }
        }, 150);
      }
    }
  };
};

export default ReservationSuccessModalHandler;