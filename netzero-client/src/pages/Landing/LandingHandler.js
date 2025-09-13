const LandingHandler = (stateLanding, setLanding) => {
  return {
    handleGetStarted: () => {
      console.log("Navigating to get started...");
      // Navigate to market or main features
      window.location.href = "/market";
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
      window.location.href = "/events";
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
      window.location.href = "/market";
    },

    handleNavigateToBarterTrade: () => {
      console.log("Navigating to barter trade...");
      window.location.href = "/barther-trade";
    },

    handleNavigateToMap: () => {
      console.log("Navigating to map...");
      window.location.href = "/map";
    },

    handleNavigateToEvents: () => {
      console.log("Navigating to events...");
      window.location.href = "/events";
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
      window.location.href = `/events/${eventId}`;
    },

    handleNavigation: (path, label) => {
      console.log(`Landing received navigation request: ${label} (${path})`);
      window.location.href = path;
    }
  };
};

export default LandingHandler;
