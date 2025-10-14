import { useState } from "react";

const useMyOrders = () => {
  const [stateMyOrders, setState] = useState({
    activeTab: 'reservations',
    reservations: [],
    isLoading: false,
    isUpdating: false,
    error: null,
  });

  const setMyOrders = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleMyOrdersField = (field) => {
    setMyOrders(field, !stateMyOrders[field]);
  };

  return {
    stateMyOrders,
    setMyOrders,
    toggleMyOrdersField,
  };
};

export default useMyOrders;