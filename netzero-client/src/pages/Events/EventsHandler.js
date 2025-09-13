import { useNavigate } from 'react-router-dom';

const EventsHandler = (stateEvents, setEvents) => {
  const navigate = useNavigate();
  
  return {
    handleCategoryFilter: async (category) => {
      setEvents("selectedCategory", category);
      
      // Fetch events by category using the API
      try {
        setEvents("isLoading", true);
        const { eventsService } = await import('../../api');
        
        let response;
        if (category && category !== 'all') {
          // Use the new category API endpoint
          response = await eventsService.getEventsByCategory(category);
        } else {
          // Get all events
          response = await eventsService.getEvents();
        }
        
        if (response.status === 'success') {
          setEvents({
            filteredEvents: response.data,
            isLoading: false,
            error: null,
            searchQuery: '' // Clear search when filtering by category
          });
        }
      } catch (error) {
        setEvents({
          isLoading: false,
          error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
        });
      }
    },
    
    handleEventClick: (eventId) => {
      // Open modal instead of navigating to a separate page
      setEvents({
        selectedEventId: eventId,
        isModalOpen: true
      });
    },
    
    handleNavigate: (path, label) => {
      // Navigate to the specified route
      navigate(path);
    },
    
    handleSearchChange: async (query) => {
      setEvents("searchQuery", query);
      
      if (query.trim()) {
        try {
          setEvents("isLoading", true);
          const { eventsService } = await import('../../api');
          
          // Use the new search API endpoint
          const response = await eventsService.searchEvents(query.trim());
          
          if (response.status === 'success') {
            setEvents({
              filteredEvents: response.data,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          setEvents({
            filteredEvents: [],
            isLoading: false,
            error: `ไม่พบงานที่ตรงกับการค้นหา: ${query}`
          });
        }
      } else {
        // If search is empty, reload all events
        try {
          setEvents("isLoading", true);
          const { eventsService } = await import('../../api');
          
          let response;
          if (stateEvents.selectedCategory && stateEvents.selectedCategory !== 'all') {
            response = await eventsService.getEventsByCategory(stateEvents.selectedCategory);
          } else {
            response = await eventsService.getEvents();
          }
          
          if (response.status === 'success') {
            setEvents({
              filteredEvents: response.data,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          setEvents({
            isLoading: false,
            error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
          });
        }
      }
    },
    
    handleLoadMore: () => {
      // Implementation for pagination if needed
      console.log('Load more events');
    },
    
    handleRefresh: () => {
      setEvents("isLoading", true);
      
      // Simulate refresh delay
      setTimeout(() => {
        setEvents("isLoading", false);
      }, 1000);
    },
    
    handleShare: (eventId) => {
      if (navigator.share) {
        navigator.share({
          title: 'Green Events Showcase',
          text: 'Check out this amazing sustainable event!',
          url: `${window.location.origin}/events/${eventId}`,
        });
      } else {
        // Fallback for browsers that don't support native sharing
        navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
        alert('Event link copied to clipboard!');
      }
    },

    handleCloseModal: () => {
      setEvents({
        isModalOpen: false,
        selectedEventId: null
      });
    },
  };
};

export default EventsHandler;
