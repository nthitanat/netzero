import { useState, useEffect } from "react";

const useRecommendedEventsSection = ({ events }) => {
  const [stateRecommendedEventsSection, setState] = useState({
    isLoading: false,
    selectedEvent: null,
    recommendedEvents: [],
    isVisible: false
  });

  const setRecommendedEventsSection = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleRecommendedEventsSectionField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Filter recommended events when events prop changes
  useEffect(() => {
    if (events && events.length > 0) {
      const recommended = events.filter(event => event.isRecommended);
      setRecommendedEventsSection('recommendedEvents', recommended);
    }
  }, [events]);

  return {
    stateRecommendedEventsSection,
    setRecommendedEventsSection,
    toggleRecommendedEventsSectionField,
  };
};

export default useRecommendedEventsSection;
