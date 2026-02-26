/**
 * Handler for delete confirmation dialog actions
 * @param {Object} state - Dialog state
 * @param {Function} setDeleteConfirmation - State setter function
 * @param {Object} callbacks - Callback functions
 * @returns {Object} - Handler functions
 */
export default function DeleteConfirmationDialogHandler(
  state,
  setDeleteConfirmation,
  callbacks = {}
) {
  const { onConfirm, onCancel } = callbacks;

  /**
   * Handle confirm action
   */
  const handleConfirm = async () => {
    if (state.isLoading) return;

    try {
      setDeleteConfirmation("isLoading", true);
      
      if (onConfirm) {
        await onConfirm(state.itemToDelete);
      }
      
      // Close dialog on success
      setDeleteConfirmation({
        isOpen: false,
        isLoading: false,
        itemToDelete: null
      });
    } catch (error) {
      console.error("Delete confirmation error:", error);
      setDeleteConfirmation("isLoading", false);
      throw error; // Re-throw to allow parent component to handle
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    if (state.isLoading) return;
    
    if (onCancel) {
      onCancel();
    }
    
    setDeleteConfirmation({
      isOpen: false,
      isLoading: false,
      itemToDelete: null
    });
  };

  return {
    handleConfirm,
    handleCancel
  };
}
