import styles from "./HeroSection.module.scss";

const HeroSectionHandler = (stateHeroSection, setHeroSection) => {
  return {
    handleAnimationComplete: () => {
      setHeroSection('animationComplete', true);
    },

    handleScrollToFeatures: () => {
      const featuresSection = document.getElementById('features-section');
      if (featuresSection) {
        featuresSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    },

    handleGetStartedClick: () => {
      console.log("Get started clicked from hero section");
      // Add analytics or tracking here if needed
    },

    handleExploreFeaturesClick: () => {
      console.log("Explore features clicked from hero section");
      // Add analytics or tracking here if needed
    }
  };
};

export default HeroSectionHandler;
