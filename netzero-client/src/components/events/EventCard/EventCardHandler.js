const EventCardHandler = (event, onEventClick, handlerFilter = null) => {
  return {
    handleCardClick: (e) => {
      // Prevent default behavior if clicking on action buttons
      if (e?.target.closest('button')) {
        return;
      }
      
      if (onEventClick && event) {
        onEventClick(event.id || event._id || event.key, event);
      }
    },
    
    handleLearnMore: (e) => {
      e.stopPropagation();
      if (onEventClick && event) {
        onEventClick(event.id);
      }
    },
    
    formatThaiDate: (dateString) => {
      const date = new Date(dateString);
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      
      return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    },
    
    // Utilize handlerFilter if provided for any filtering operations
    applyFilter: (filterData) => {
      if (handlerFilter && typeof handlerFilter === 'function') {
        return handlerFilter(filterData, event);
      }
      return true; // Default to showing the event
    },
    
    // Generate badges configuration
    generateBadges: () => {
      const badges = [];
      
      // Category badge (always present)
      if (event.category) {
        badges.push({
          text: event.category,
          icon: "event",
          position: "TopRight",
          style: {
            backgroundColor: "var(--primary-color-2)",
            color: "white"
          }
        });
      }
      
      // Recommended badge (conditional)
      if (event.isRecommended) {
        badges.push({
          text: "แนะนำ",
          icon: "star", 
          position: "TopLeft",
          style: {
            backgroundColor: "var(--secondary-color-2)",
            color: "var(--primary-color-2)"
          }
        });
      }

      // Status badge
      if (event.status && event.status !== 'active') {
        badges.push({
          text: event.status === 'cancelled' ? 'ยกเลิก' : 
                event.status === 'completed' ? 'เสร็จสิ้น' : 
                event.status === 'postponed' ? 'เลื่อน' : event.status,
          position: "BottomLeft",
          style: {
            backgroundColor: event.status === 'cancelled' ? "var(--warning)" : 
                           event.status === 'completed' ? "var(--active-200)" : 
                           "var(--inactive)",
            color: "white"
          }
        });
      }

      // Availability badge
      if (event.max_participants && event.current_participants !== undefined) {
        const spotsRemaining = event.max_participants - event.current_participants;
        const isAlmostFull = spotsRemaining <= 5 && spotsRemaining > 0;
        const isFull = spotsRemaining <= 0;
        
        if (isFull) {
          badges.push({
            text: "เต็มแล้ว",
            position: "BottomRight",
            style: {
              backgroundColor: "var(--warning)",
              color: "white"
            }
          });
        } else if (isAlmostFull) {
          badges.push({
            text: `เหลือ ${spotsRemaining}`,
            position: "BottomRight",
            style: {
              backgroundColor: "var(--secondary-color-1)",
              color: "white"
            }
          });
        }
      }
      
      return badges;
    }
  };
};

export default EventCardHandler;
