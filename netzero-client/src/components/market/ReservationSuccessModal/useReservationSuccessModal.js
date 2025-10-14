import { useState } from "react";

const useReservationSuccessModal = (initialProps) => {
  const { isOpen = false, reservationData = null } = initialProps || {};
  
  const [stateReservationSuccessModal, setState] = useState({
    isModalOpen: isOpen,
    reservationData: reservationData,
    isClosing: false
  });

  const setReservationSuccessModal = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleReservationSuccessModalField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return {
    stateReservationSuccessModal,
    setReservationSuccessModal,
    toggleReservationSuccessModalField,
  };
};

export default useReservationSuccessModal;