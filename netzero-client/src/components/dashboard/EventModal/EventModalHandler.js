const EventModalHandler = (stateEventModal, setEventModal, callbacks) => {
  const { onClose, onSave } = callbacks;

  const handleFieldChange = (field, value) => {
    setEventModal({
      formData: {
        ...stateEventModal.formData,
        [field]: value
      },
      error: null // Clear error when user makes changes
    });
  };

  const validateForm = () => {
    const { formData } = stateEventModal;
    const errors = [];

    // Required fields validation
    if (!formData.title.trim()) {
      errors.push('กรุณาระบุชื่อกิจกรรม');
    }

    if (!formData.event_date) {
      errors.push('กรุณาเลือกวันที่และเวลาจัดกิจกรรม');
    }

    // Date validation
    if (formData.event_date) {
      const eventDate = new Date(formData.event_date);
      const now = new Date();
      
      if (eventDate <= now) {
        errors.push('วันที่จัดกิจกรรมต้องเป็นในอนาคต');
      }

      // Check registration deadline if provided
      if (formData.registration_deadline) {
        const registrationDate = new Date(formData.registration_deadline);
        if (registrationDate >= eventDate) {
          errors.push('กำหนดปิดรับสมัครต้องเป็นก่อนวันจัดกิจกรรม');
        }
      }
    }

    // Email validation
    if (formData.contact_email && !isValidEmail(formData.contact_email)) {
      errors.push('รูปแบบอีเมลไม่ถูกต้อง');
    }

    // Max participants validation
    if (formData.max_participants < 0) {
      errors.push('จำนวนผู้เข้าร่วมสูงสุดต้องเป็นจำนวนบวก');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    const validation = validateForm();
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    
    if (!validation.isValid) {
      setEventModal('error', validation.errors.join(', '));
      return;
    }

    try {
      setEventModal('error', null);
      
      // Format data for API
      const formattedData = {
        ...stateEventModal.formData,
        // Convert datetime-local to ISO string
        event_date: new Date(stateEventModal.formData.event_date).toISOString(),
        registration_deadline: stateEventModal.formData.registration_deadline 
          ? new Date(stateEventModal.formData.registration_deadline).toISOString()
          : null,
        // Handle max_participants (0 means unlimited)
        max_participants: stateEventModal.formData.max_participants || null,
      };

      // Remove empty fields
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === '' || formattedData[key] === null) {
          delete formattedData[key];
        }
      });

      if (onSave) {
        await onSave(formattedData);
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setEventModal('error', error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const resetForm = () => {
    setEventModal({
      formData: {
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
      },
      error: null,
      isValidated: false
    });
  };

  const prefillCurrentUserData = (userData) => {
    setEventModal({
      formData: {
        ...stateEventModal.formData,
        organizer: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : stateEventModal.formData.organizer,
        contact_email: userData.email || stateEventModal.formData.contact_email,
      }
    });
  };

  return {
    handleFieldChange,
    handleSubmit,
    handleClose,
    isFormValid,
    validateForm,
    resetForm,
    prefillCurrentUserData,
  };
};

export default EventModalHandler;