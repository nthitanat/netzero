const FloatingNavBarHandler = (stateFloatingNavBar, setFloatingNavBar, onNavigate, navigate, logout) => {
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
    },

    // Authentication-related handlers
    handleLoginClick: () => {
      setFloatingNavBar("showLoginModal", true);
    },

    handleLoginSuccess: (userData) => {
      setFloatingNavBar("showLoginModal", false);
      console.log('User logged in:', userData);
    },

    handleUserClick: () => {
      setFloatingNavBar("showUserMenu", !stateFloatingNavBar.showUserMenu);
    },

    handleProfileClick: () => {
      setFloatingNavBar("showUserMenu", false);
      if (navigate) {
        navigate('/profile');
      }
    },

    handleSellerDashboardClick: () => {
      setFloatingNavBar("showUserMenu", false);
      if (navigate) {
        navigate('/seller-dashboard');
      }
    },

    handleLogoutClick: async () => {
      setFloatingNavBar("showUserMenu", false);
      try {
        if (logout) {
          await logout();
          console.log('User logged out successfully');
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    handleUserMenuBlur: (e) => {
      // Close menu when clicking outside
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setFloatingNavBar("showUserMenu", false);
      }
    },

    handleCloseLoginModal: () => {
      setFloatingNavBar("showLoginModal", false);
    }
  };
};

export default FloatingNavBarHandler;
