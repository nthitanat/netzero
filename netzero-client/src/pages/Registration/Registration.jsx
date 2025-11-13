import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { SurveyForm } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { surveysService } from '../../api';
import useRegistration from './useRegistration';
import RegistrationHandler from './RegistrationHandler';
import styles from './Registration.module.scss';

/**
 * 3-Step Registration Page Component
 * Step 1: User registration form
 * Step 2: Survey form (Survey ID: 1)
 * Step 3: Success confirmation
 */
const Registration = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const registrationState = useRegistration();
  const {
    currentStep,
    registrationData,
    registrationErrors,
    isLoading,
    successMessage,
    userId,
  } = registrationState;

  const handler = new RegistrationHandler(registrationState, register);

  // Survey data state
  const [surveyData, setSurveyData] = useState(null);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyError, setSurveyError] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentStep === 1) {
      // User is already logged in, redirect to home
      navigate('/');
    }
  }, [isAuthenticated, currentStep, navigate]);

  // Fetch survey data when moving to step 2
  useEffect(() => {
    const fetchSurveyData = async () => {
      if (currentStep === 2 && !surveyData) {
        setSurveyLoading(true);
        setSurveyError(null);
        
        try {
          const response = await surveysService.getById(1);
          console.log('Survey API Response:', response);
          
          // API service returns ApiResponse with data property containing the survey
          if (response.data && response.data.questions) {
            console.log('Survey loaded successfully:', response.data.name);
            console.log('Number of questions:', response.data.questions.length);
            setSurveyData(response.data);
          } else {
            console.error('Invalid survey data structure:', response);
            setSurveyError('ไม่สามารถโหลดแบบสำรวจได้');
          }
        } catch (error) {
          console.error('Error fetching survey:', error);
          setSurveyError(error.message || 'เกิดข้อผิดพลาดในการโหลดแบบสำรวจ');
        } finally {
          setSurveyLoading(false);
        }
      }
    };

    fetchSurveyData();
  }, [currentStep, surveyData]);

  /**
   * Handle survey submission via API
   */
  const handleSurveySubmit = async (answers) => {
    try {
      const submitData = {
        answers: answers,
        respondent_id: userId || null,
      };

      console.log('Submitting survey with data:', submitData);
      const response = await surveysService.submitResponse(1, submitData);
      console.log('Survey submission response:', response);
      
      // API service returns ApiResponse, check status
      if (response.status === 'success') {
        handler.handleSurveySuccess(response);
      } else {
        throw new Error(response.message || 'Failed to submit survey');
      }
    } catch (error) {
      console.error('Survey submission error:', error);
      handler.handleSurveyError(error);
    }
  };

  /**
   * Render Step 1: Registration Form
   */
  const renderRegistrationForm = () => (
    <div className={styles.formStep}>
      <div className={styles.stepHeader}>
        <h2>สร้างบัญชีผู้ใช้</h2>
        <p>กรุณากรอกข้อมูลเพื่อลงทะเบียน</p>
      </div>

      <form onSubmit={handler.handleRegistrationSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">ชื่อ *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={registrationData.firstName}
              onChange={handler.handleInputChange}
              className={registrationErrors.firstName ? styles.error : ''}
              required
            />
            {registrationErrors.firstName && (
              <span className={styles.errorMessage}>{registrationErrors.firstName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">นามสกุล *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={registrationData.lastName}
              onChange={handler.handleInputChange}
              className={registrationErrors.lastName ? styles.error : ''}
              required
            />
            {registrationErrors.lastName && (
              <span className={styles.errorMessage}>{registrationErrors.lastName}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">อีเมล *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={registrationData.email}
            onChange={handler.handleInputChange}
            className={registrationErrors.email ? styles.error : ''}
            required
          />
          {registrationErrors.email && (
            <span className={styles.errorMessage}>{registrationErrors.email}</span>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="password">รหัสผ่าน *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={registrationData.password}
              onChange={handler.handleInputChange}
              className={registrationErrors.password ? styles.error : ''}
              required
            />
            {registrationErrors.password && (
              <span className={styles.errorMessage}>{registrationErrors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={registrationData.confirmPassword}
              onChange={handler.handleInputChange}
              className={registrationErrors.confirmPassword ? styles.error : ''}
              required
            />
            {registrationErrors.confirmPassword && (
              <span className={styles.errorMessage}>{registrationErrors.confirmPassword}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={registrationData.phoneNumber}
            onChange={handler.handleInputChange}
            placeholder="0812345678"
          />
        </div>

        {registrationErrors.general && (
          <div className={styles.generalError}>{registrationErrors.general}</div>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || authLoading}
        >
          {isLoading || authLoading ? 'กำลังสร้างบัญชี...' : 'ดำเนินการต่อ'}
        </button>
      </form>
    </div>
  );

  /**
   * Render Step 2: Survey Form
   */
  const renderSurveyForm = () => (
    <div className={styles.formStep}>
      <div className={styles.stepHeader}>
        <h2>แบบสำรวจ Chula NetZero</h2>
        <p>กรุณาตอบแบบสำรวจเพื่อช่วยเราพัฒนาโครงการ</p>
      </div>

      {surveyLoading && (
        <div className={styles.loadingContainer}>
          <p>กำลังโหลดแบบสำรวจ...</p>
        </div>
      )}

      {surveyError && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{surveyError}</p>
          <button
            onClick={() => handler.skipSurvey()}
            className={styles.secondaryButton}
          >
            ข้ามขั้นตอนนี้
          </button>
        </div>
      )}

      {!surveyLoading && !surveyError && surveyData && (
        <SurveyForm
          survey={surveyData}
          onSubmit={handleSurveySubmit}
          loading={false}
        />
      )}
    </div>
  );

  /**
   * Render Step 3: Success Confirmation
   */
  const renderSuccessConfirmation = () => (
    <div className={styles.formStep}>
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8 12.5L10.5 15L16 9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2>ลงทะเบียนสำเร็จ!</h2>
        <p>{successMessage || 'ขอบคุณที่ร่วมเป็นส่วนหนึ่งของโครงการ Chula NetZero'}</p>

        <div className={styles.successActions}>
          <button
            onClick={() => navigate('/')}
            className={styles.primaryButton}
          >
            ไปหน้าหลัก
          </button>
          <button
            onClick={() => navigate('/market')}
            className={styles.secondaryButton}
          >
            เริ่มช้อปปิ้ง
          </button>
        </div>
      </div>
    </div>
  );

  // Show loading state while checking authentication
  if (authLoading && currentStep === 1) {
    return (
      <div className={styles.registrationPage}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <p>กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.registrationPage}>
      <div className={styles.container}>
        {/* Progress Indicator */}
        <div className={styles.progressIndicator}>
          <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>1</div>
            <span className={styles.stepLabel}>ลงทะเบียน</span>
          </div>
          <div className={styles.progressLine}></div>
          <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>2</div>
            <span className={styles.stepLabel}>แบบสำรวจ</span>
          </div>
          <div className={styles.progressLine}></div>
          <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
            <div className={styles.stepNumber}>3</div>
            <span className={styles.stepLabel}>เสร็จสิ้น</span>
          </div>
        </div>

        {/* Step Content */}
        <div className={styles.stepContent}>
          {currentStep === 1 && renderRegistrationForm()}
          {currentStep === 2 && renderSurveyForm()}
          {currentStep === 3 && renderSuccessConfirmation()}
        </div>
      </div>
    </div>
  );
};

Registration.propTypes = {};

export default Registration;
