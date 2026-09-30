import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthFlow } from '../../../contexts/AuthFlowContext';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { openLogin, openRegister } = useAuthFlow();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: { th: 'หน้าหลัก', en: 'Home' } },
    { path: '/communities', label: { th: 'ชุมชน', en: 'Communities' } },
    { path: '/showroom', label: { th: 'โชว์รูม', en: 'Showroom' } },
    { path: '/courses', label: { th: 'Knowledge Hub', en: 'Knowledge Hub' } }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={styles.Navbar}>
        <div className={styles.Container}>
          <Link to="/" className={styles.Logo}>
            <span className={styles.LogoText}>
              {language === 'th' ? 'Chula-Glocal Market' : 'Chula-Glocal Market'}
            </span>
          </Link>

          <div className={styles.Nav}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${styles.NavLink} ${isActive(link.path) ? styles.active : ''}`}
              >
                {link.label[language]}
              </Link>
            ))}
          </div>

          <div className={styles.Actions}>
            <button 
              className={styles.LanguageToggle}
              onClick={toggleLanguage}
              aria-label="Toggle language"
            >
              <span className="material-symbols-outlined sm">language</span>
              <span>{language === 'th' ? 'EN' : 'TH'}</span>
            </button>

            {isAuthenticated ? (
              <div className={styles.UserMenu}>
                <div className={styles.Avatar}>
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
                <span className={styles.UserName}>{user?.firstName}</span>
                <button
                  className={styles.LogoutBtn}
                  onClick={logout}
                  aria-label="Logout"
                >
                  <span className="material-symbols-outlined sm">logout</span>
                </button>
              </div>
            ) : (
              <div className={styles.AuthButtons}>
                <button className={styles.LoginBtn} onClick={openLogin}>
                  {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                </button>
                <button className={styles.RegisterBtn} onClick={openRegister}>
                  {language === 'th' ? 'สมัครสมาชิก' : 'Register'}
                </button>
              </div>
            )}

            <button
              className={styles.MenuButton}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.MobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.MobileMenuHeader}>
          <h2 className={styles.MobileMenuTitle}>
            {language === 'th' ? 'เมนู' : 'Menu'}
          </h2>
          <button
            className={styles.CloseButton}
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className={styles.MobileNav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.MobileNavLink} ${isActive(link.path) ? styles.active : ''}`}
              onClick={closeMobileMenu}
            >
              {link.label[language]}
            </Link>
          ))}
        </nav>

        <div className={styles.MobileAuthSection}>
          {isAuthenticated ? (
            <>
              <div className={styles.MobileUserInfo}>
                <div className={styles.Avatar}>{user?.firstName?.[0]?.toUpperCase()}</div>
                <span className={styles.MobileUserName}>{user?.firstName} {user?.lastName}</span>
              </div>
              <button
                className={styles.MobileLogoutBtn}
                onClick={() => { logout(); closeMobileMenu(); }}
              >
                <span className="material-symbols-outlined sm">logout</span>
                {language === 'th' ? 'ออกจากระบบ' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.MobileLoginBtn}
                onClick={() => { openLogin(); closeMobileMenu(); }}
              >
                {language === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
              </button>
              <button
                className={styles.MobileRegisterBtn}
                onClick={() => { openRegister(); closeMobileMenu(); }}
              >
                {language === 'th' ? 'สมัครสมาชิก' : 'Register'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`${styles.Overlay} ${mobileMenuOpen ? styles.open : ''}`}
        onClick={closeMobileMenu}
      />
    </>
  );
}
