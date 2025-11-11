import { eventsService } from "../../../api";

const EventDetailModalHandler = (stateEventDetail, setEventDetail, onClose) => {
  
  return {
    handleClose: () => {
      if (onClose) {
        onClose();
      }
    },
    
    handleShare: () => {
      const { event } = stateEventDetail;
      
      if (!event) return;
      
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: `Join me at this amazing sustainable event: ${event.title}`,
          url: `${window.location.origin}/events/${event.id}`,
        }).catch(err => console.error('Error sharing:', err));
      } else {
        // Fallback for browsers that don't support native sharing
        navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`).then(() => {
          alert('Event link copied to clipboard!');
        }).catch(err => {
          console.error('Failed to copy link:', err);
          alert('Unable to share link.');
        });
      }
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
  };
};

export default EventDetailModalHandler;
