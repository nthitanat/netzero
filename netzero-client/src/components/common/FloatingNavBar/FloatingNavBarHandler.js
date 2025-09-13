const FloatingNavBarHandler = (stateFloatingNavBar, setFloatingNavBar, onNavigate, navigate) => {
  return {
    handleNavClick: (path, label) => {
      console.log("NavBar clicked:", path, label); // Debug log
      setFloatingNavBar("activeRoute", path);
      
      if (onNavigate) {
        console.log("Calling onNavigate:", onNavigate); // Debug log
        onNavigate(path, label);
      } else if (navigate) {
        console.log("Using navigate function"); // Debug log
        navigate(path);
      } else {
        console.log("No navigation function available"); // Debug log
      }
    },

    handleMouseEnter: (index) => {
      setFloatingNavBar("hoveredIndex", index);
    },

    handleMouseLeave: () => {
      setFloatingNavBar("hoveredIndex", null);
    },

    handleScroll: () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > stateFloatingNavBar.lastScrollY;
      
      // Hide/show navbar based on scroll direction
      if (isScrollingDown && currentScrollY > 100) {
        setFloatingNavBar("isVisible", false);
      } else {
        setFloatingNavBar("isVisible", true);
      }
      
      setFloatingNavBar("lastScrollY", currentScrollY);
    },

    setActiveRoute: (route) => {
      setFloatingNavBar("activeRoute", route);
    }
  };
};

export default FloatingNavBarHandler;
