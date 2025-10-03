import { useState } from "react";

const useReserveDialog = (initialProps) => {
  const { isOpen = false, product = null } = initialProps || {};
  
  const [stateReserveDialog, setState] = useState({
    availableQuantity: product?.stock_quantity || 5, // Default to 5 if not provided
    isReserving: false,
    selectedQuantity: 1,
    quantityError: "",
    reservationError: "",
    isDialogOpen: isOpen,
    shippingAddress: "",
    shippingAddressError: "",
    optionOfDelivery: "delivery",
    userNote: "",
    userNoteError: "",
    pickupDate: "",
    pickupDateError: ""
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
      isDialogOpen: false,
      shippingAddress: "",
      shippingAddressError: "",
      optionOfDelivery: "delivery",
      userNote: "",
      userNoteError: "",
      pickupDate: "",
      pickupDateError: ""
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

  const validateShippingAddress = (address) => {
    if (!address || address.trim().length === 0) {
      return "กรุณาระบุที่อยู่จัดส่ง";
    }
    
    if (address.trim().length < 10) {
      return "กรุณาระบุที่อยู่จัดส่งให้ครบถ้วน (อย่างน้อย 10 ตัวอักษร)";
    }
    
    if (address.trim().length > 500) {
      return "ที่อยู่จัดส่งยาวเกินไป (ไม่เกิน 500 ตัวอักษร)";
    }
    
    return "";
  };

  const validateUserNote = (note) => {
    if (note && note.trim().length > 1000) {
      return "หมายเหตุยาวเกินไป (ไม่เกิน 1000 ตัวอักษร)";
    }
    
    return "";
  };

  const validatePickupDate = (date, optionOfDelivery) => {
    if (optionOfDelivery === 'pickup') {
      if (!date || date.trim().length === 0) {
        return "กรุณาเลือกวันที่รับสินค้า";
      }
      
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return "วันที่รับสินค้าต้องไม่เป็นวันในอดีต";
      }
    }
    
    return "";
  };

  return {
    stateReserveDialog,
    setReserveDialog,
    toggleReserveDialogField,
    resetReserveDialog,
    validateQuantity,
    validateShippingAddress,
    validateUserNote,
    validatePickupDate,
  };
};

export default useReserveDialog;
