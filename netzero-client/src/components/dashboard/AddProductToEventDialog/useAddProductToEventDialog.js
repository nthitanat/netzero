import { useState, useEffect } from "react";
import { userEventsService } from "../../../api";

const useAddProductToEventDialog = (product = null, isOpen = false) => {
  const [stateAddProductToEventDialog, setState] = useState({
    // Event assignments
    eventAssignments: [], // Array of {event_id, event_price, stock_quantity, event_title}
    
    // Available events
    availableEvents: [],
    isLoadingEvents: false,
    eventsError: null,
    
    // Selected event for adding
    selectedEventId: "",
    selectedEventPrice: "",
    selectedEventQuantity: "",
    
    // Validation
    maxQuantity: 0,
    totalAssignedQuantity: 0,
    remainingQuantity: 0,
    
    // UI state
    error: null,
    isFormValid: false
  });

  // Load user's events when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadUserEvents();
      
      // Initialize max quantity from product
      if (product) {
        const maxQty = product.unassigned_stock_quantity || product.stock_quantity || 0;
        setAddProductToEventDialog({
          maxQuantity: maxQty,
          remainingQuantity: maxQty,
          eventAssignments: []
        });
      }
    } else {
      // Reset state when dialog closes
      resetState();
    }
  }, [isOpen, product]);

  // Recalculate totals when assignments change
  useEffect(() => {
    const totalAssigned = stateAddProductToEventDialog.eventAssignments.reduce(
      (sum, assignment) => sum + parseInt(assignment.stock_quantity || 0), 
      0
    );
    
    const remaining = stateAddProductToEventDialog.maxQuantity - totalAssigned;
    
    setAddProductToEventDialog({
      totalAssignedQuantity: totalAssigned,
      remainingQuantity: remaining
    });
  }, [stateAddProductToEventDialog.eventAssignments, stateAddProductToEventDialog.maxQuantity]);

  // Validate form
  useEffect(() => {
    const isValid = 
      stateAddProductToEventDialog.eventAssignments.length > 0 &&
      stateAddProductToEventDialog.totalAssignedQuantity <= stateAddProductToEventDialog.maxQuantity;
    
    setAddProductToEventDialog("isFormValid", isValid);
  }, [
    stateAddProductToEventDialog.eventAssignments, 
    stateAddProductToEventDialog.totalAssignedQuantity,
    stateAddProductToEventDialog.maxQuantity
  ]);

  const setAddProductToEventDialog = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const loadUserEvents = async () => {
    try {
      setAddProductToEventDialog({
        isLoadingEvents: true,
        eventsError: null
      });

      const response = await userEventsService.getMyEvents();
      const events = response.data || [];
      
      console.log("📅 All user events:", events);
      console.log("📅 Event statuses:", events.map(e => ({ id: e.id, title: e.title, status: e.status })));
      
      // Filter for active events only (not cancelled or completed)
      const activeEvents = events.filter(event => 
        event.status === 'active'
      );
      
      console.log("📅 Filtered active events:", activeEvents);

      setAddProductToEventDialog({
        availableEvents: activeEvents,
        isLoadingEvents: false
      });

    } catch (error) {
      console.error("Error loading events:", error);
      setAddProductToEventDialog({
        eventsError: "ไม่สามารถโหลดรายการอีเวนต์ได้",
        isLoadingEvents: false,
        availableEvents: []
      });
    }
  };

  const setSelectedEvent = (eventId) => {
    setAddProductToEventDialog("selectedEventId", eventId);
  };

  const setSelectedEventPrice = (price) => {
    setAddProductToEventDialog("selectedEventPrice", price);
  };

  const setSelectedEventQuantity = (quantity) => {
    setAddProductToEventDialog("selectedEventQuantity", quantity);
  };

  const addEventAssignment = () => {
    const { selectedEventId, selectedEventPrice, selectedEventQuantity, availableEvents, eventAssignments } = stateAddProductToEventDialog;
    
    // Validation
    if (!selectedEventId || !selectedEventPrice || !selectedEventQuantity) {
      setAddProductToEventDialog("error", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return false;
    }

    const quantity = parseInt(selectedEventQuantity);
    const price = parseFloat(selectedEventPrice);

    if (quantity <= 0) {
      setAddProductToEventDialog("error", "จำนวนต้องมากกว่า 0");
      return false;
    }

    if (price < 0) {
      setAddProductToEventDialog("error", "ราคาต้องไม่ติดลบ");
      return false;
    }

    // Check if event already assigned
    if (eventAssignments.some(a => a.event_id === parseInt(selectedEventId))) {
      setAddProductToEventDialog("error", "อีเวนต์นี้ถูกเพิ่มแล้ว");
      return false;
    }

    // Check if quantity exceeds available
    const currentTotal = eventAssignments.reduce((sum, a) => sum + parseInt(a.stock_quantity), 0);
    if (currentTotal + quantity > stateAddProductToEventDialog.maxQuantity) {
      setAddProductToEventDialog("error", `จำนวนเกินที่มีอยู่ (เหลือ ${stateAddProductToEventDialog.maxQuantity - currentTotal})`);
      return false;
    }

    // Find event details
    const event = availableEvents.find(e => e.id === parseInt(selectedEventId));
    
    const newAssignment = {
      event_id: parseInt(selectedEventId),
      event_title: event?.title || "Unknown Event",
      event_price: price,
      stock_quantity: quantity
    };

    setAddProductToEventDialog({
      eventAssignments: [...eventAssignments, newAssignment],
      selectedEventId: "",
      selectedEventPrice: "",
      selectedEventQuantity: "",
      error: null
    });

    return true;
  };

  const removeEventAssignment = (eventId) => {
    setAddProductToEventDialog({
      eventAssignments: stateAddProductToEventDialog.eventAssignments.filter(
        a => a.event_id !== eventId
      ),
      error: null
    });
  };

  const setError = (error) => {
    setAddProductToEventDialog("error", error);
  };

  const clearError = () => {
    setAddProductToEventDialog("error", null);
  };

  const resetState = () => {
    setState({
      eventAssignments: [],
      availableEvents: [],
      isLoadingEvents: false,
      eventsError: null,
      selectedEventId: "",
      selectedEventPrice: "",
      selectedEventQuantity: "",
      maxQuantity: 0,
      totalAssignedQuantity: 0,
      remainingQuantity: 0,
      error: null,
      isFormValid: false
    });
  };

  return {
    stateAddProductToEventDialog,
    setAddProductToEventDialog,
    setSelectedEvent,
    setSelectedEventPrice,
    setSelectedEventQuantity,
    addEventAssignment,
    removeEventAssignment,
    setError,
    clearError,
    resetState,
    loadUserEvents
  };
};

export default useAddProductToEventDialog;
