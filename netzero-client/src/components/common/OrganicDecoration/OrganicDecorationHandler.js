import styles from "./OrganicDecoration.module.scss";

const OrganicDecorationHandler = (stateOrganicDecoration, setOrganicDecoration) => {
  return {
    handleToggleVisibility: () => {
      setOrganicDecoration("isVisible", !stateOrganicDecoration.isVisible);
    },
    
    handleToggleAnimations: () => {
      setOrganicDecoration("animationsEnabled", !stateOrganicDecoration.animationsEnabled);
    },
    
    handleOpacityChange: (opacity) => {
      setOrganicDecoration("opacity", Math.max(0, Math.min(1, opacity)));
    },
  };
};

export default OrganicDecorationHandler;
