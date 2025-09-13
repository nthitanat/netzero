import { useState, useEffect, useCallback } from "react";
import { eventsService, API_STATUS, ApiError } from "../../api";

const useEventDetail = (eventId) => {
  const [stateEventDetail, setState] = useState({
    event: null,
    isLoading: true,
    error: null,
    isSaved: false,
    isRegistered: false,
  });

  const setEventDetail = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventDetailField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Load event data using API service
  const loadEvent = useCallback(async () => {
    if (!eventId) {
      console.log('⚠️ No eventId provided to useEventDetail');
      return;
    }

    try {
      console.log(`🔍 Loading event with ID: ${eventId} (type: ${typeof eventId})`);
      
      setState(prevState => ({ 
        ...prevState, 
        isLoading: true, 
        error: null 
      }));

      const eventResponse = await eventsService.getEventById(eventId);
      
      if (eventResponse.status === API_STATUS.SUCCESS) {
        console.log('✅ Event loaded successfully:', eventResponse.data.title);
        setState(prevState => ({
          ...prevState,
          event: eventResponse.data,
          isLoading: false,
          error: null,
          // Check if event is already saved (from localStorage)
          isSaved: localStorage.getItem(`event_saved_${eventId}`) === 'true',
          isRegistered: localStorage.getItem(`event_registered_${eventId}`) === 'true',
        }));
      }
    } catch (error) {
      console.error('❌ Error loading event:', error);
      
      let errorMessage = 'Failed to load event';
      if (error instanceof ApiError) {
        errorMessage = error.message;
        console.error('📝 API Error details:', {
          message: error.message,
          type: error.type,
          statusCode: error.statusCode,
          details: error.details
        });
      }
      
      setState(prevState => ({
        ...prevState,
        event: null,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [eventId]);

  // Load event data on component mount or when eventId changes
  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  return {
    stateEventDetail,
    setEventDetail,
    toggleEventDetailField,
    loadEvent,
  };
};

export default useEventDetail;
