import styles from "./GoogleIcon.module.scss";

const GoogleIconHandler = (stateGoogleIcon, setGoogleIcon) => {
  return {
    handleIconClick: () => {
      setGoogleIcon("isAnimating", true);
      setTimeout(() => {
        setGoogleIcon("isAnimating", false);
      }, 300);
    },
    
    handleSizeChange: (newSize) => {
      setGoogleIcon("size", newSize);
    },
    
    handleIconTypeChange: (newType) => {
      setGoogleIcon("iconType", newType);
    },
    
    handleVariantChange: (newVariant) => {
      setGoogleIcon("variant", newVariant);
    },
  };
};

export default GoogleIconHandler;
