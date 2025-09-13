import styles from "./StatsSection.module.scss";

const StatsSectionHandler = (stateStatsSection, setStatsSection) => {
  return {
    handleStatCardClick: (statType) => {
      console.log("Stat card clicked:", statType);
      // Could open detailed statistics modal or page
    },

    handleProgressClick: (progressType) => {
      console.log("Progress item clicked:", progressType);
      // Could show detailed progress information
    },

    handleImpactClick: (impactType) => {
      console.log("Impact item clicked:", impactType);
      // Could navigate to detailed impact page
    },

    handleVisibilityChange: (isVisible) => {
      if (isVisible && !stateStatsSection.isVisible) {
        setStatsSection('isVisible', true);
      }
    }
  };
};

export default StatsSectionHandler;
