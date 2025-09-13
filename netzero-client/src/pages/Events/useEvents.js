import { useState, useEffect, useCallback } from "react";
import { eventsService, API_STATUS, ApiError } from "../../api";

const useEvents = (initialProps) => {
  const [stateEvents, setState] = useState({
    events: [],
    filteredEvents: [],
    recommendedEvents: [],
    selectedCategory: 'all',
    isLoading: true,
    error: null,
    searchQuery: '',
    pagination: null,
    currentPage: 1,
    hasMoreEvents: false,
    // Modal state
    isModalOpen: false,
    selectedEventId: null,
  });

  const setEvents = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventsField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Load events data using API service
  const loadEvents = useCallback(async (options = {}) => {
    try {
      setState(prevState => ({ 
        ...prevState, 
        isLoading: true, 
        error: null 
      }));

      const {
        page = stateEvents.currentPage,
        category = stateEvents.selectedCategory,
        search = stateEvents.searchQuery,
        limit = 50, // Load more events for better filtering
      } = options;

      let eventsResponse;

      // Use appropriate API endpoint based on filters
      if (search && search.trim()) {
        // Use search API
        eventsResponse = await eventsService.searchEvents(search.trim(), {
          page,
          limit,
          sortBy: 'date',
          sortOrder: 'desc',
        });
      } else if (category && category !== 'all') {
        // Use category API
        eventsResponse = await eventsService.getEventsByCategory(category, {
          page,
          limit,
          sortBy: 'date',
          sortOrder: 'desc',
        });
      } else {
        // Use general events API
        eventsResponse = await eventsService.getEvents({
          page,
          limit,
          sortBy: 'date',
          sortOrder: 'desc',
        });
      }

      if (eventsResponse.status === API_STATUS.SUCCESS) {
        setState(prevState => ({
          ...prevState,
          events: eventsResponse.data,
          filteredEvents: eventsResponse.data,
          pagination: eventsResponse.pagination,
          hasMoreEvents: eventsResponse.pagination?.hasNextPage || false,
          isLoading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Error loading events:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load events';
        
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [stateEvents.currentPage, stateEvents.selectedCategory, stateEvents.searchQuery]);

  // Load recommended events using API service
  const loadRecommendedEvents = useCallback(async () => {
    try {
      const recommendedResponse = await eventsService.getRecommendedEvents(5);
      
      if (recommendedResponse.status === API_STATUS.SUCCESS) {
        setState(prevState => ({
          ...prevState,
          recommendedEvents: recommendedResponse.data,
        }));
      }
    } catch (error) {
      console.error('Error loading recommended events:', error);
      // Don't show error for recommended events, just log it
    }
  }, []);

  // Initial load on component mount
  useEffect(() => {
    const initializeEvents = async () => {
      await Promise.all([
        loadEvents(),
        loadRecommendedEvents(),
      ]);
    };

    initializeEvents();
  }, [loadEvents, loadRecommendedEvents]);

  // Reload events when filters change
  useEffect(() => {
    // Only reload if not searching - search is handled by the handler
    if (!stateEvents.searchQuery && (stateEvents.selectedCategory !== 'all')) {
      loadEvents({
        page: 1, // Reset to first page when filtering
        category: stateEvents.selectedCategory,
        search: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateEvents.selectedCategory, loadEvents]);

  return {
    stateEvents,
    setEvents,
    toggleEventsField,
    loadEvents,
    loadRecommendedEvents,
  };
};

export default useEvents;
