export const navItems = [
    { path: "/", icon: "home", label: "showroom" },
    { path: "/events", icon: "event", label: "Events" },
    { path: "/market", icon: "store", label: "Market" },
    { path: "/willing", icon: "volunteer_activism", label: "Willing" },
    { path: "/barther-trade", icon: "swap_horiz", label: "Barther Trade" },
    { path: "/chat", icon: "chat", label: "Chat" },
    { path: "/map", icon: "map", label: "แผนที่" }
];

// Helper function to get current active route from window.location
export const getCurrentRoute = () => {
    // For HashRouter, use window.location.hash instead of pathname
    const hash = window.location.hash;
    const path = hash.startsWith('#') ? hash.substring(1) : '/';
    const matchedItem = navItems.find(item => path === item.path || path.startsWith(item.path + '/'));
    return matchedItem ? matchedItem.path : path;
};