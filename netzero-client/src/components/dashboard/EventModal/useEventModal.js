import { useState, useEffect } from "react";

const useEventModal = (initialProps) => {
  const { mode, event } = initialProps;
  
  const getInitialFormData = () => {
    if (mode === 'edit' && event) {
      // Format datetime for datetime-local input
      const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      return {
        title: event.title || '',
        description: event.description || '',
        event_date: formatDateTimeLocal(event.event_date),
        location: event.location || '',
        category: event.category || '',
        organizer: event.organizer || '',
        contact_email: event.contact_email || '',
        contact_phone: event.contact_phone || '',
        max_participants: event.max_participants || 0,
        registration_deadline: formatDateTimeLocal(event.registration_deadline),
        status: event.status || 'active',
        isRecommended: event.isRecommended || false,
      };
    }
    
    return {
      title: '',
      description: '',
      event_date: '',
      location: '',
      category: '',
      organizer: '',
      contact_email: '',
      contact_phone: '',
      max_participants: 0,
      registration_deadline: '',
      status: 'active',
      isRecommended: false,
    };
  };

  const [stateEventModal, setState] = useState({
    formData: getInitialFormData(),
    error: null,
    isValidated: false,
  });

  const setEventModal = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleEventModalField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Reset form data when mode or event changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      formData: getInitialFormData(),
      error: null,
      isValidated: false
    }));
  }, [mode, event]);

  return {
    stateEventModal,
    setEventModal,
    toggleEventModalField,
  };
};

export default useEventModal;