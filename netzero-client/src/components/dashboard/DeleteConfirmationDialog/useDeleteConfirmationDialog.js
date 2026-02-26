import { useState } from "react";

/**
 * Hook for managing delete confirmation dialog state
 * @param {Object} initialState - Initial state
 * @returns {Object} - State and setState function
 */
export default function useDeleteConfirmationDialog(initialState = {}) {
  const [state, setState] = useState({
    isOpen: false,
    title: "ยืนยันการลบ",
    message: "คุณต้องการลบรายการนี้หรือไม่?",
    itemName: "",
    warningText: "การดำเนินการนี้ไม่สามารถย้อนกลับได้",
    confirmText: "ลบ",
    cancelText: "ยกเลิก",
    isLoading: false,
    itemToDelete: null,
    theme: "default",
    ...initialState
  });

  /**
   * Update state
   * @param {string|Object} key - State key or object with multiple keys
   * @param {*} value - Value to set (if key is string)
   */
  const setDeleteConfirmation = (key, value) => {
    if (typeof key === "string") {
      setState((prevState) => ({
        ...prevState,
        [key]: value
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        ...key
      }));
    }
  };

  /**
   * Open delete confirmation dialog
   * @param {Object} config - Configuration object
   */
  const openDeleteConfirmation = (config = {}) => {
    setDeleteConfirmation({
      isOpen: true,
      isLoading: false,
      ...config
    });
  };

  /**
   * Close delete confirmation dialog
   */
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      isLoading: false,
      itemToDelete: null
    });
  };

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  const setLoading = (loading) => {
    setDeleteConfirmation("isLoading", loading);
  };

  return {
    stateDeleteConfirmation: state,
    setDeleteConfirmation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    setLoading
  };
}
