import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './AuthModal.module.scss';

const labels = {
  th: {
    login: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    firstName: 'ชื่อ',
    lastName: 'นามสกุล',
    phone: 'เบอร์โทรศัพท์ (ไม่บังคับ)',
    address: 'หน่วยงาน',
    loginBtn: 'เข้าสู่ระบบ',
    registerBtn: 'สมัครสมาชิก',
    loading: 'กำลังโหลด...',
    passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
    switchToRegister: 'ยังไม่มีบัญชี? สมัครสมาชิก',
    switchToLogin: 'มีบัญชีแล้ว? เข้าสู่ระบบ',
  },
  en: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number (optional)',
    address: 'Organization',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    loading: 'Loading...',
    passwordMismatch: 'Passwords do not match',
    switchToRegister: "Don't have an account? Register",
    switchToLogin: 'Already have an account? Login',
  },
};

export default function AuthModal({ isOpen, mode, onClose, onModeChange, onLoginSuccess, onRegisterSuccess }) {
  const { login, register, isLoading, error, clearError } = useAuth();
  const { language } = useLanguage();
  const t = labels[language];

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phoneNumber: '', address: '',
  });
  const [localError, setLocalError] = useState('');

  // Clear errors and reset forms when modal opens/mode changes
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [isOpen, mode, clearError]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginChange = (e) =>
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegisterChange = (e) =>
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const result = await login({ email: loginForm.email, password: loginForm.password });
    if (result.success) {
      setLoginForm({ email: '', password: '' });
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        onClose();
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setLocalError(t.passwordMismatch);
      return;
    }

    const { confirmPassword, ...payload } = registerForm;
    const result = await register(payload);
    if (result.success) {
      setRegisterForm({
        email: '', password: '', confirmPassword: '',
        firstName: '', lastName: '', phoneNumber: '', address: '',
      });
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        onClose();
      }
    }
  };

  const displayError = localError || error;

  return (
    <div className={styles.Overlay} role="dialog" aria-modal="true">
      <div className={styles.Modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.Header}>
          <div className={styles.Tabs}>
            <button
              className={`${styles.Tab} ${mode === 'login' ? styles.active : ''}`}
              onClick={() => onModeChange('login')}
              type="button"
            >
              {t.login}
            </button>
            <button
              className={`${styles.Tab} ${mode === 'register' ? styles.active : ''}`}
              onClick={() => onModeChange('register')}
              type="button"
            >
              {t.register}
            </button>
          </div>
          <button className={styles.CloseBtn} onClick={onClose} aria-label="Close" type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Error */}
        {displayError && (
          <div className={styles.ErrorBanner} role="alert">
            <span className="material-symbols-outlined sm">error</span>
            {displayError}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form className={styles.Form} onSubmit={handleLoginSubmit} noValidate>
            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="login-email">{t.email}</label>
              <input
                id="login-email"
                className={styles.Input}
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="email@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="login-password">{t.password}</label>
              <input
                id="login-password"
                className={styles.Input}
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button className={styles.SubmitBtn} type="submit" disabled={isLoading}>
              {isLoading ? t.loading : t.loginBtn}
            </button>
            <button
              className={styles.SwitchLink}
              type="button"
              onClick={() => onModeChange('register')}
            >
              {t.switchToRegister}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form className={styles.Form} onSubmit={handleRegisterSubmit} noValidate>
            <div className={styles.Row}>
              <div className={styles.Field}>
                <label className={styles.Label} htmlFor="reg-firstName">{t.firstName}</label>
                <input
                  id="reg-firstName"
                  className={styles.Input}
                  type="text"
                  name="firstName"
                  value={registerForm.firstName}
                  onChange={handleRegisterChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className={styles.Field}>
                <label className={styles.Label} htmlFor="reg-lastName">{t.lastName}</label>
                <input
                  id="reg-lastName"
                  className={styles.Input}
                  type="text"
                  name="lastName"
                  value={registerForm.lastName}
                  onChange={handleRegisterChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="reg-email">{t.email}</label>
              <input
                id="reg-email"
                className={styles.Input}
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="email@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="reg-password">{t.password}</label>
              <input
                id="reg-password"
                className={styles.Input}
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="reg-confirmPassword">{t.confirmPassword}</label>
              <input
                id="reg-confirmPassword"
                className={styles.Input}
                type="password"
                name="confirmPassword"
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="reg-phone">{t.phone}</label>
              <input
                id="reg-phone"
                className={styles.Input}
                type="tel"
                name="phoneNumber"
                value={registerForm.phoneNumber}
                onChange={handleRegisterChange}
                autoComplete="tel"
              />
            </div>
            <div className={styles.Field}>
              <label className={styles.Label} htmlFor="reg-address">{t.address}</label>
              <input
                id="reg-address"
                className={styles.Input}
                type="text"
                name="address"
                value={registerForm.address}
                onChange={handleRegisterChange}
                autoComplete="street-address"
              />
            </div>
            <button className={styles.SubmitBtn} type="submit" disabled={isLoading}>
              {isLoading ? t.loading : t.registerBtn}
            </button>
            <button
              className={styles.SwitchLink}
              type="button"
              onClick={() => onModeChange('login')}
            >
              {t.switchToLogin}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
