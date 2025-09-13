const EventCardHandler = (stateEventCard, setEventCard, event, onEventClick) => {
  return {
    handleCardClick: () => {
      if (onEventClick && event) {
        onEventClick(event.id);
      }
    },
    
    handleMouseEnter: () => {
      setEventCard("isHovered", true);
    },
    
    handleMouseLeave: () => {
      setEventCard("isHovered", false);
    },
    
    handleImageLoad: () => {
      setEventCard("isLoading", false);
    },
    
    handleImageError: () => {
      console.error(`Failed to load image for event: ${event?.title}`);
      setEventCard("isLoading", false);
    },
    
    handleLearnMore: () => {
      if (onEventClick && event) {
        onEventClick(event.id);
      }
    },
  };
};

export default EventCardHandler;
