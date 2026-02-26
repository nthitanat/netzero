import { reservationsService } from "../../api";

const MyOrdersHandler = (stateMyOrders, setMyOrders, navigate) => {
  
  const handleLoadReservations = async () => {
    try {
      setMyOrders('isLoading', true);
      setMyOrders('error', null);

      const response = await reservationsService.getMyReservations();
      
      console.log('API Response:', response);
      
      // Check if response has data (regardless of success flag)
      if (response && response.data) {
        setMyOrders('reservations', response.data);
      } else if (response) {
        // If no data but response exists, set empty array
        setMyOrders('reservations', []);
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setMyOrders('error', error.message || 'ไม่สามารถโหลดข้อมูลการจองได้');
    } finally {
      setMyOrders('isLoading', false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      setMyOrders('isUpdating', true);
      
      const response = await reservationsService.cancelReservation(reservationId);
      
      console.log('Cancel Reservation Response:', response);
      
      // Check if response exists (regardless of success flag structure)
      if (response) {
        // Reload reservations to get updated data
        await handleLoadReservations();
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error canceling reservation:', error);
      setMyOrders('error', error.message || 'ไม่สามารถยกเลิกการจองได้');
    } finally {
      setMyOrders('isUpdating', false);
    }
  };

  const handleTabChange = (tab) => {
    setMyOrders('activeTab', tab);
  };

  return {
    handleLoadReservations,
    handleCancelReservation,
    handleTabChange,
  };
};

export default MyOrdersHandler;