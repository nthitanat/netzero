import styles from "./Alert.module.scss";

const AlertHandler = (stateAlert, setAlert, onClose) => {
  return {
    handleClose: () => {
      // Clear auto-close timer if it exists
      if (stateAlert.autoCloseTimer) {
        clearTimeout(stateAlert.autoCloseTimer);
        setAlert("autoCloseTimer", null);
      }
      
      // Hide the alert
      setAlert("isVisible", false);
      
      // Call external close callback if provided
      if (onClose && typeof onClose === "function") {
        onClose();
      }
    },

    handleMouseEnter: () => {
      // Pause auto-close when hovering
      if (stateAlert.autoCloseTimer && stateAlert.autoClose) {
        clearTimeout(stateAlert.autoCloseTimer);
        setAlert("autoCloseTimer", null);
      }
    },

    handleMouseLeave: () => {
      // Resume auto-close when not hovering
      if (stateAlert.isVisible && stateAlert.autoClose && !stateAlert.autoCloseTimer) {
        const timer = setTimeout(() => {
          setAlert("isVisible", false);
        }, stateAlert.autoCloseDelay);
        
        setAlert("autoCloseTimer", timer);
      }
    }
  };
};

export default AlertHandler;