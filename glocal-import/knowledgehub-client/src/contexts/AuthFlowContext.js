import React, { createContext, useContext, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from './AuthContext';
import AuthModal from '../components/common/AuthModal/AuthModal';
import SurveyModal from '../components/common/SurveyModal/SurveyModal';
import Toast from '../components/common/Toast/Toast';

// ── Context ───────────────────────────────────────────────────────
const AuthFlowContext = createContext(null);

export const useAuthFlow = () => {
  const ctx = useContext(AuthFlowContext);
  if (!ctx) throw new Error('useAuthFlow must be used within AuthFlowProvider');
  return ctx;
};

// ── Provider ──────────────────────────────────────────────────────
export function AuthFlowProvider({ children }) {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [authModalOpen,  setAuthModalOpen]  = useState(false);
  const [authModalMode,  setAuthModalMode]  = useState('login');
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [toastVisible,   setToastVisible]   = useState(false);

  const toastMessage = { th: 'ลงทะเบียนเสร็จสิ้น', en: 'Registration complete' };

  // Public API — skip auth modal if already logged in
  const openLogin    = () => {
    if (isAuthenticated) { setSurveyModalOpen(true); return; }
    setAuthModalMode('login');    setAuthModalOpen(true);
  };
  const openRegister = () => {
    if (isAuthenticated) { setSurveyModalOpen(true); return; }
    setAuthModalMode('register'); setAuthModalOpen(true);
  };

  // Internal handlers
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setSurveyModalOpen(true);
  };

  const handleSurveyClose = () => {
    setSurveyModalOpen(false);
    setToastVisible(true);
  };

  return (
    <AuthFlowContext.Provider value={{ openLogin, openRegister }}>
      {children}

      <AuthModal
        isOpen={authModalOpen}
        mode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onModeChange={setAuthModalMode}
        onLoginSuccess={handleAuthSuccess}
        onRegisterSuccess={handleAuthSuccess}
      />

      <SurveyModal
        isOpen={surveyModalOpen}
        onClose={handleSurveyClose}
      />

      <Toast
        isVisible={toastVisible}
        message={toastMessage[language]}
        variant="success"
        onDismiss={() => setToastVisible(false)}
      />
    </AuthFlowContext.Provider>
  );
}
