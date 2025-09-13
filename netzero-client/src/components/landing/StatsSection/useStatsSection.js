import { useState, useEffect } from "react";

const useStatsSection = ({ stats, onStatsLoad }) => {
  const [stateStatsSection, setState] = useState({
    animatedStats: {
      carbonReduced: 0,
      treesPlanted: 0,
      communityMembers: 0,
      projectsCompleted: 0
    },
    isVisible: false,
    animationComplete: false
  });

  const setStatsSection = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleStatsSectionField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Animate stats when they come into view
  useEffect(() => {
    if (stats && !stateStatsSection.animationComplete) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const interval = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setStatsSection('animatedStats', {
          carbonReduced: Math.floor(stats.carbonReduced * progress),
          treesPlanted: Math.floor(stats.treesPlanted * progress),
          communityMembers: Math.floor(stats.communityMembers * progress),
          projectsCompleted: Math.floor(stats.projectsCompleted * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
          setStatsSection('animationComplete', true);
          if (onStatsLoad) {
            onStatsLoad();
          }
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [stats, stateStatsSection.animationComplete, onStatsLoad]);

  // Intersection Observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !stateStatsSection.isVisible) {
            setStatsSection('isVisible', true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => {
      if (statsSection) {
        observer.unobserve(statsSection);
      }
    };
  }, [stateStatsSection.isVisible]);

  return {
    stateStatsSection,
    setStatsSection,
    toggleStatsSectionField,
  };
};

export default useStatsSection;
