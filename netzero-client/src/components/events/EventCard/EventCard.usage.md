# EventCard Usage Documentation

## Overview
EventCard is now a stateless component that combines the functionality of the previous EventCard and ItemCard components. It's designed to be a pure presentation component with all logic handled through the EventCardHandler.

## Basic Usage

```jsx
import { EventCard } from '../../components/events';

function EventsPage() {
  const handleEventClick = (eventId, event) => {
    console.log('Event clicked:', eventId, event);
    // Handle navigation or action
  };

  const event = {
    id: 1,
    title: "เทศกาลอาหารท้องถิ่น",
    description: "งานรวมพลคนรักอาหารท้องถิ่น",
    event_date: "2024-03-15",
    location: "สวนลุมพินี",
    organizer: "ชุมชนอาหารไทย",
    max_participants: 50,
    current_participants: 30,
    category: "เทศกาล",
    isRecommended: true,
    status: "active"
  };

  return (
    <EventCard 
      event={event}
      onEventClick={handleEventClick}
    />
  );
}
```

## Advanced Usage with handlerFilter

```jsx
import { EventCard } from '../../components/events';

function FilteredEventsPage() {
  const handleEventClick = (eventId, event) => {
    // Handle click
  };

  // Custom filter handler that can be used for additional filtering logic
  const customHandlerFilter = (filterData, event) => {
    // Example: Filter by region, date range, or other custom criteria
    if (filterData.region && event.region !== filterData.region) {
      return false;
    }
    
    if (filterData.dateRange) {
      const eventDate = new Date(event.event_date);
      const startDate = new Date(filterData.dateRange.start);
      const endDate = new Date(filterData.dateRange.end);
      
      if (eventDate < startDate || eventDate > endDate) {
        return false;
      }
    }
    
    return true; // Show the event
  };

  const event = {
    id: 1,
    title: "เทศกาลอาหารท้องถิ่น",
    description: "งานรวมพลคนรักอาหารท้องถิ่น",
    event_date: "2024-03-15",
    location: "สวนลุมพินี",
    region: "กรุงเทพฯ",
    organizer: "ชุมชนอาหารไทย",
    max_participants: 50,
    current_participants: 30,
    category: "เทศกาล",
    isRecommended: true,
    status: "active"
  };

  return (
    <EventCard 
      event={event}
      onEventClick={handleEventClick}
      handlerFilter={customHandlerFilter}
      config={{
        showThumbnail: true,
        thumbnailHeight: 200,
        borderRadius: 20
      }}
    />
  );
}
```

## Configuration Options

### Config Object
```jsx
const config = {
  showThumbnail: true,        // Show/hide the image slideshow
  thumbnailHeight: 220,       // Height of the image container in pixels
  borderRadius: 24           // Border radius of the card in pixels
};
```

### handlerFilter Function
The `handlerFilter` prop accepts a function with the signature:
```jsx
(filterData, event) => boolean
```
- `filterData`: Any filter criteria you want to apply
- `event`: The current event object
- Return `true` to show the event, `false` to hide it

## Event Object Structure
```jsx
const eventSchema = {
  id: number,                    // Required: Unique identifier
  title: string,                 // Required: Event title
  description: string,           // Required: Event description
  event_date: string,           // Required: ISO date string
  location: string,             // Required: Event location
  organizer: string,            // Optional: Event organizer
  max_participants: number,     // Optional: Maximum participants
  current_participants: number, // Optional: Current participant count
  category: string,             // Optional: Event category
  isRecommended: boolean,       // Optional: Recommended badge
  status: string,              // Optional: 'active', 'cancelled', 'completed', 'postponed'
  region: string,              // Optional: Geographic region
  images: array,               // Optional: Array of image URLs
  thumbnail: string            // Optional: Thumbnail image URL
};
```

## Badge System
EventCard automatically generates badges based on event properties:

1. **Category Badge** (Top Right): Shows if `event.category` is present
2. **Recommended Badge** (Top Left): Shows if `event.isRecommended` is true
3. **Status Badge** (Bottom Left): Shows if `event.status` is not 'active'
4. **Availability Badge** (Bottom Right): Shows participant info if max_participants is set

## Styling
The component uses SCSS modules with the following structure:
- `.Container`: Main card container
- `.ThumbnailContainer`: Image slideshow container
- `.ContentContainer`: Content area
- `.EventContent`: Event-specific content styling
- `.Badge*`: Various badge positioning classes

## Key Features
1. **Stateless Design**: Pure presentation component with no internal state
2. **Combined Functionality**: Merges EventCard and ItemCard capabilities
3. **Handler Separation**: All logic in EventCardHandler for better testing
4. **Filter Integration**: Supports custom filtering through handlerFilter prop
5. **Thai Date Formatting**: Automatic formatting for Thai Buddhist calendar
6. **Responsive Design**: Mobile-optimized layout
7. **Badge System**: Automatic badge generation based on event properties
8. **Image Management**: Integrated with imageUtils for proper image handling