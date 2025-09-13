import styles from "./FeatureSection.module.scss";

const FeatureSectionHandler = (stateFeatureSection, setFeatureSection) => {
  return {
    handleFeatureClick: (featureId) => {
      console.log("Feature clicked:", featureId);
      setFeatureSection("selectedFeature", featureId);
      
      // Navigate based on feature
      switch(featureId) {
        case 1:
          window.location.href = "/market";
          break;
        case 2:
          window.location.href = "/barther-trade";
          break;
        case 3:
          window.location.href = "/map";
          break;
        case 4:
          window.location.href = "/events";
          break;
        default:
          break;
      }
    },

    handleStartJourney: () => {
      console.log("Start journey clicked");
      window.location.href = "/market";
    },

    handleFeatureHover: (featureId) => {
      // Add any hover effects or analytics here
      console.log("Feature hovered:", featureId);
    },

    handleLearnMore: (featureId) => {
      console.log("Learn more clicked for feature:", featureId);
      // Could open a modal or navigate to detailed page
    }
  };
};

export default FeatureSectionHandler;
