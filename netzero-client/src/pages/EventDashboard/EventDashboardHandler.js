import { useEffect } from "react";
import { eventsService, userEventsService } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const EventDashboardHandler = (stateEventDashboard, setEventDashboard, navigate) => {
  const { user } = useAuth();

  // Initialize dashboard data when component mounts
  useEffect(() => {
    if (user && ['community_head', 'admin'].includes(user.role)) {
      handleRefreshEvents();
      if (stateEventDashboard.activeTab === 'stats') {
        handleRefreshStats();
      }
    }
  }, [user, stateEventDashboard.activeTab]);

  // Refresh events data
  const handleRefreshEvents = async () => {
    try {
      setEventDashboard("isLoading", true);
      setEventDashboard("error", null);

      // Get user's events
      const response = await userEventsService.getMyEvents();
      setEventDashboard("events", response.data || []);
      
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventDashboard("error", error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม");
    } finally {
      setEventDashboard("isLoading", false);
    }
  };

  // Refresh stats data
  const handleRefreshStats = async () => {
    try {
      setEventDashboard("isLoading", true);
      setEventDashboard("error", null);

      // Get user's events for stats calculation
      const eventsResponse = await userEventsService.getMyEvents();
      const events = eventsResponse.data || [];

      // Calculate stats
      const now = new Date();
      const totalEvents = events.length;
      const activeEvents = events.filter(event => event.status === 'active').length;
      const upcomingEvents = events.filter(event => 
        new Date(event.event_date) > now && event.status === 'active'
      ).length;
      const completedEvents = events.filter(event => event.status === 'completed').length;
      const cancelledEvents = events.filter(event => event.status === 'cancelled').length;

      const stats = {
        totalEvents,
        activeEvents,
        upcomingEvents,
        completedEvents,
        cancelledEvents,
        totalParticipants: events.reduce((sum, event) => sum + (event.current_participants || 0), 0),
        averageParticipants: totalEvents > 0 ? 
          Math.round(events.reduce((sum, event) => sum + (event.current_participants || 0), 0) / totalEvents) : 0
      };

      setEventDashboard("stats", stats);
      
    } catch (error) {
      console.error("Error fetching stats:", error);
      setEventDashboard("error", error.message || "เกิดข้อผิดพลาดในการโหลดสถิติ");
    } finally {
      setEventDashboard("isLoading", false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setEventDashboard("activeTab", tab);
    setEventDashboard("error", null);
    
    if (tab === 'stats') {
      handleRefreshStats();
    } else if (tab === 'events') {
      handleRefreshEvents();
    }
  };

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Event management handlers
  const handleCreateEvent = () => {
    setEventDashboard({
      selectedEvent: null,
      eventModalMode: 'create',
      showEventModal: true,
      error: null
    });
  };

  const handleEditEvent = (event) => {
    setEventDashboard({
      selectedEvent: event,
      eventModalMode: 'edit',
      showEventModal: true,
      error: null
    });
  };

  const handleDeleteEvent = (event) => {
    setEventDashboard({
      selectedEvent: event,
      showDeleteConfirm: true,
      error: null
    });
  };

  const handleConfirmDelete = async () => {
    if (!stateEventDashboard.selectedEvent) return;

    try {
      setEventDashboard("isSubmittingEvent", true);
      setEventDashboard("error", null);

      await eventsService.deleteEvent(stateEventDashboard.selectedEvent.id);
      
      // Refresh events list
      await handleRefreshEvents();
      
      // Close confirmation dialog
      setEventDashboard({
        showDeleteConfirm: false,
        selectedEvent: null
      });

      // Show success message (you could implement a toast system)
      console.log("Event deleted successfully");

    } catch (error) {
      console.error("Error deleting event:", error);
      setEventDashboard("error", error.message || "เกิดข้อผิดพลาดในการลบกิจกรรม");
    } finally {
      setEventDashboard("isSubmittingEvent", false);
    }
  };

  const handleCancelDelete = () => {
    setEventDashboard({
      showDeleteConfirm: false,
      selectedEvent: null,
      error: null
    });
  };

  const handleCloseEventModal = () => {
    setEventDashboard({
      showEventModal: false,
      selectedEvent: null,
      eventModalMode: 'create',
      error: null
    });
  };

  const handleEventSaved = async (eventData) => {
    try {
      setEventDashboard("isSubmittingEvent", true);
      setEventDashboard("error", null);

      if (stateEventDashboard.eventModalMode === 'create') {
        // Create new event (the server will automatically create the user-event relationship)
        await eventsService.createEvent(eventData);
      } else {
        // Update existing event
        await eventsService.updateEvent(stateEventDashboard.selectedEvent.id, eventData);
      }

      // Refresh events list
      await handleRefreshEvents();
      
      // Close modal
      handleCloseEventModal();

      // Show success message
      console.log(`Event ${stateEventDashboard.eventModalMode === 'create' ? 'created' : 'updated'} successfully`);

    } catch (error) {
      console.error(`Error ${stateEventDashboard.eventModalMode === 'create' ? 'creating' : 'updating'} event:`, error);
      setEventDashboard("error", error.message || `เกิดข้อผิดพลาดในการ${stateEventDashboard.eventModalMode === 'create' ? 'สร้าง' : 'แก้ไข'}กิจกรรม`);
    } finally {
      setEventDashboard("isSubmittingEvent", false);
    }
  };

  // Search and filter handlers
  const handleSearch = (searchTerm) => {
    setEventDashboard("searchTerm", searchTerm);
    // Implement client-side filtering or trigger API call
  };

  const handleCategoryFilter = (category) => {
    setEventDashboard("categoryFilter", category);
    // Implement filtering logic
  };

  const handleStatusFilter = (status) => {
    setEventDashboard("statusFilter", status);
    // Implement filtering logic
  };

  const handleSort = (sortBy, sortOrder) => {
    setEventDashboard({
      sortBy,
      sortOrder
    });
    // Implement sorting logic
  };

  return {
    handleTabChange,
    handleNavigate,
    handleRefreshEvents,
    handleRefreshStats,
    handleCreateEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleConfirmDelete,
    handleCancelDelete,
    handleCloseEventModal,
    handleEventSaved,
    handleSearch,
    handleCategoryFilter,
    handleStatusFilter,
    handleSort,
  };
};

export default EventDashboardHandler;