import { useState } from "react";

const useReserveDialog = (initialProps) => {
  const { isOpen = false, product = null } = initialProps || {};
  
  const [stateReserveDialog, setState] = useState({
    availableQuantity: product?.stock_quantity || 5, // Default to 5 if not provided
    isReserving: false,
    selectedQuantity: 1,
    quantityError: "",
    reservationError: "",
    isDialogOpen: isOpen
  });

  const setReserveDialog = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleReserveDialogField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const resetReserveDialog = () => {
    setState({
      isReserving: false,
      selectedQuantity: 1,
      availableQuantity: product?.stock_quantity || 5,
      quantityError: "",
      reservationError: "",
      isDialogOpen: false
    });
  };

  const validateQuantity = (quantity) => {
    const numQuantity = parseInt(quantity, 10);
    
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return "กรุณาระบุจำนวนที่ถูกต้อง";
    }
    
    if (numQuantity > stateReserveDialog.availableQuantity) {
      return `จำนวนที่เลือกเกินสินค้าคงเหลือ (คงเหลือ ${stateReserveDialog.availableQuantity} ชิ้น)`;
    }
    
    return "";
  };

  return {
    stateReserveDialog,
    setReserveDialog,
    toggleReserveDialogField,
    resetReserveDialog,
    validateQuantity,
  };
};

export default useReserveDialog;
