import { useNavigate } from 'react-router-dom';
import { eventsService } from "../../api/events";

const EventDetailHandler = (stateEventDetail, setEventDetail) => {
  const navigate = useNavigate();
  
  return {
    handleBackToEvents: () => {
      // Navigate back to events list using React Router
      navigate('/events');
    },
    
    handleRegister: async () => {
      const { event } = stateEventDetail;
      
      if (!event) return;

      try {
        // Check registration status first
        const statusResponse = await eventsService.getEventRegistrationStatus(event.id);
        const registrationStatus = statusResponse.data;

        if (!registrationStatus.canRegister) {
          let message = 'Registration is not available for this event.';
          if (registrationStatus.isFullyBooked) {
            message = 'Sorry, this event is fully booked.';
          } else if (registrationStatus.registrationClosed) {
            message = 'Registration deadline has passed.';
          } else if (registrationStatus.eventPassed) {
            message = 'This event has already taken place.';
          }
          alert(message);
          return;
        }

        // For demo purposes, use mock registration data
        // In a real app, this would come from a registration form
        const registrationData = {
          name: "Demo User",
          email: "demo@example.com",
          phone: "123-456-7890"
        };

        setEventDetail("isRegistering", true);
        
        const response = await eventsService.registerForEvent(event.id, registrationData);
        
        if (response.status === 'success') {
          setEventDetail("isRegistered", true);
          localStorage.setItem(`event_registered_${event.id}`, 'true');
          
          alert(`Successfully registered for "${event.title}"! Registration ID: ${response.data.id}`);
        }
        
      } catch (error) {
        console.error('Registration failed:', error);
        alert(error.message || 'Failed to register for event. Please try again.');
      } finally {
        setEventDetail("isRegistering", false);
      }
    },
    
    handleShare: () => {
      const { event } = stateEventDetail;
      
      if (!event) return;
      
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: `Join me at this amazing sustainable event: ${event.title}`,
          url: window.location.href,
        }).catch(err => console.error('Error sharing:', err));
      } else {
        // Fallback for browsers that don't support native sharing
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Event link copied to clipboard!');
        }).catch(err => {
          console.error('Failed to copy link:', err);
          alert('Unable to copy link. Please share manually.');
        });
      }
    },
    
    handleSave: () => {
      const { event, isSaved } = stateEventDetail;
      
      if (!event) return;
      
      const newSavedState = !isSaved;
      setEventDetail("isSaved", newSavedState);
      
      // Persist to localStorage
      if (newSavedState) {
        localStorage.setItem(`event_saved_${event.id}`, 'true');
      } else {
        localStorage.removeItem(`event_saved_${event.id}`);
      }
      
      // Show feedback
      const message = newSavedState 
        ? 'Event saved to your favorites!' 
        : 'Event removed from favorites.';
      console.log(message);
    },
    
    handleDownloadCalendar: () => {
      const { event } = stateEventDetail;
      
      if (!event) return;
      
      // Generate ICS file content
      const eventDate = new Date(event.event_date || event.date);
      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Green Events//Event Calendar//EN
BEGIN:VEVENT
UID:event-${event.id}@greenevents.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(eventDate)}
DTEND:${formatDate(new Date(eventDate.getTime() + 8 * 60 * 60 * 1000))}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
CATEGORIES:${event.category}
${event.organizer ? `ORGANIZER:CN=${event.organizer}` : ''}
${event.contact_email ? `:MAILTO:${event.contact_email}` : ''}
END:VEVENT
END:VCALENDAR`;
      
      // Create and download file
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    handleImageError: () => {
      console.error('Failed to load event image');
      // Could set a fallback image here
    },
    
    handleNavigate: (path, label) => {
      navigate(path);
    },
  };
};

export default EventDetailHandler;
