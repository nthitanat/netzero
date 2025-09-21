import styles from "./FeatureSection.module.scss";

const FeatureSectionHandler = (stateFeatureSection, setFeatureSection, navigate) => {
  return {
    handleFeatureClick: (featureId) => {
      console.log("Feature clicked:", featureId);
      setFeatureSection("selectedFeature", featureId);
      
      // Navigate based on feature
      switch(featureId) {
        case 1:
          navigate("/market");
          break;
        case 2:
          navigate("/barther-trade");
          break;
        case 3:
          navigate("/map");
          break;
        case 4:
          navigate("/events");
          break;
        default:
          break;
      }
    },

    handleStartJourney: () => {
      console.log("Start journey clicked");
      navigate("/market");
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
