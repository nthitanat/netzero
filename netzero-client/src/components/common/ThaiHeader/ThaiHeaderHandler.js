import styles from "./ThaiHeader.module.scss";

const ThaiHeaderHandler = (stateThaiHeader, setThaiHeader) => {
  return {
    handleAnimationComplete: () => {
      setThaiHeader("animationComplete", true);
    },
    
    handleVisibilityToggle: () => {
      setThaiHeader("isVisible", !stateThaiHeader.isVisible);
    },
  };
};

export default ThaiHeaderHandler;
