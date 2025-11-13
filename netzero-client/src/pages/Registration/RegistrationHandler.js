/**
 * Handler class for Registration page business logic
 * Manages form validation, submission, and step navigation
 */
class RegistrationHandler {
  constructor(registrationState, registerFunction) {
    this.state = registrationState;
    this.registerFunction = registerFunction;
  }

  /**
   * Get the current hook state
   */
  getState() {
    return this.state;
  }

  /**
   * Handle input change for registration form
   */
  handleInputChange = (event) => {
    const { name, value } = event.target;
    const state = this.getState();
    state.updateRegistrationData(name, value);
  };

  /**
   * Validate registration form data
   */
  validateRegistrationForm(data) {
    const errors = {};

    // First name validation
    if (!data.firstName.trim()) {
      errors.firstName = 'กรุณากรอกชื่อ';
    } else if (data.firstName.length < 2) {
      errors.firstName = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    // Last name validation
    if (!data.lastName.trim()) {
      errors.lastName = 'กรุณากรอกนามสกุล';
    } else if (data.lastName.length < 2) {
      errors.lastName = 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร';
    }

    // Email validation
    if (!data.email.trim()) {
      errors.email = 'กรุณากรอกอีเมล';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
    }

    // Password validation
    if (!data.password) {
      errors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (data.password.length < 6) {
      errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    // Phone number validation (optional)
    if (data.phoneNumber && data.phoneNumber.trim()) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(data.phoneNumber.replace(/[-\s]/g, ''))) {
        errors.phoneNumber = 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก)';
      }
    }

    return errors;
  }

  /**
   * Handle registration form submission (Step 1)
   */
  handleRegistrationSubmit = async (event) => {
    event.preventDefault();
    const state = this.getState();

    // Validate form
    const errors = this.validateRegistrationForm(state.registrationData);
    if (Object.keys(errors).length > 0) {
      state.updateRegistrationErrors(errors);
      return;
    }

    // Clear previous errors
    state.updateRegistrationErrors({});
    state.updateLoadingState(true);

    try {
      // Prepare registration data
      const registrationPayload = {
        email: state.registrationData.email.trim(),
        password: state.registrationData.password,
        firstName: state.registrationData.firstName.trim(),
        lastName: state.registrationData.lastName.trim(),
        phone_number: state.registrationData.phoneNumber.trim() || undefined,
      };

      // Call registration function from AuthContext
      const response = await this.registerFunction(registrationPayload);

      if (response.success) {
        // User is now automatically authenticated via AuthContext
        // Store user ID for survey submission
        if (response.user && response.user.user_id) {
          state.updateUserId(response.user.user_id);
        }

        // Move to step 2 (Survey)
        state.goToStep(2);
      } else {
        // Handle registration failure
        state.updateRegistrationErrors({
          general: response.error || 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      let errorMessage = 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      state.updateRegistrationErrors({
        general: errorMessage,
      });
    } finally {
      state.updateLoadingState(false);
    }
  };

  /**
   * Handle survey submission success (Step 2 -> Step 3)
   */
  handleSurveySuccess = (response) => {
    const state = this.getState();
    
    // Set success message
    state.updateSuccessMessage(
      'ลงทะเบียนและตอบแบบสำรวจเรียบร้อยแล้ว ขอบคุณที่ร่วมเป็นส่วนหนึ่งของโครงการ Chula NetZero'
    );

    // Move to step 3 (Success)
    state.goToStep(3);
  };

  /**
   * Handle survey submission error
   */
  handleSurveyError = (error) => {
    console.error('Survey submission error:', error);
    
    const state = this.getState();
    
    // Show error but still allow to proceed
    // User is already registered, survey is optional
    state.updateSuccessMessage(
      'ลงทะเบียนสำเร็จ แต่เกิดข้อผิดพลาดในการบันทึกแบบสำรวจ คุณสามารถเข้าสู่ระบบและตอบแบบสำรวจได้ภายหลัง'
    );

    // Move to step 3 anyway
    state.goToStep(3);
  };

  /**
   * Navigate back to previous step
   */
  goBack = () => {
    const state = this.getState();
    if (state.currentStep > 1) {
      state.goToStep(state.currentStep - 1);
    }
  };

  /**
   * Skip survey (optional feature)
   */
  skipSurvey = () => {
    const state = this.getState();
    state.updateSuccessMessage(
      'ลงทะเบียนสำเร็จ คุณสามารถเข้าสู่ระบบและตอบแบบสำรวจได้ภายหลัง'
    );
    state.goToStep(3);
  };
}

export default RegistrationHandler;
