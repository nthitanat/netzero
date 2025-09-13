const LandingHandler = (stateLanding, setLanding, navigate) => {
  return {
    handleGetStarted: () => {
      console.log("Navigating to get started...");
      // Navigate to market or main features
      navigate("/market");
    },

    handleExploreFeatures: () => {
      console.log("Scrolling to features section...");
      const featuresSection = document.getElementById("features-section");
      if (featuresSection) {
        featuresSection.scrollIntoView({ 
          behavior: "smooth",
          block: "start"
        });
      }
    },

    handleStatsLoad: () => {
      console.log("Stats section loaded");
      setLanding("isVisible", {
        ...stateLanding.isVisible,
        stats: true
      });
    },

    handleTestimonialChange: (index) => {
      setLanding("currentTestimonial", index);
    },

    handleJoinCommunity: () => {
      console.log("Navigating to events...");
      navigate("/events");
    },

    handleLearnMore: () => {
      console.log("Scrolling to top for more information...");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },

    handleNavigateToMarket: () => {
      console.log("Navigating to market...");
      navigate("/market");
    },

    handleNavigateToBarterTrade: () => {
      console.log("Navigating to barter trade...");
      navigate("/barther-trade");
    },

    handleNavigateToMap: () => {
      console.log("Navigating to map...");
      navigate("/map");
    },

    handleNavigateToEvents: () => {
      console.log("Navigating to events...");
      navigate("/events");
    },

    handleScrollToSection: (sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ 
          behavior: "smooth",
          block: "start"
        });
      }
    },

    handleVisibilityChange: (sectionName, isVisible) => {
      setLanding("isVisible", {
        ...stateLanding.isVisible,
        [sectionName]: isVisible
      });
    },

    handleNewsletterSubscribe: (email) => {
      console.log("Subscribing to newsletter:", email);
      setLanding("isLoading", true);
      
      // Simulate API call
      setTimeout(() => {
        setLanding("isLoading", false);
        alert("ขอบคุณสำหรับการสมัครรับข่าวสาร!");
      }, 1500);
    },

    handleEventClick: (eventId) => {
      console.log("Navigating to event:", eventId);
      navigate(`/events/${eventId}`);
    },

    handleNavigation: (path, label) => {
      console.log(`Landing received navigation request: ${label} (${path})`);
      navigate(path);
    }
  };
};

export default LandingHandler;
