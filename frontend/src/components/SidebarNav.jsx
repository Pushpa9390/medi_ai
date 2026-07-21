import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Stethoscope, FileText, Image, MessageCircle,
  AlertTriangle, Settings, Heart, Sun, Moon, Globe, LogOut,
  ChevronRight, User
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

const NAV_ITEMS = [
  { to: '/',                  key: 'dashboard',      icon: LayoutDashboard },
  { to: '/symptom-checker',   key: 'symptomChecker', icon: Stethoscope },
  { to: '/report-analyzer',   key: 'reportAnalyzer', icon: FileText },
  { to: '/image-analysis',    key: 'imageAnalysis',  icon: Image },
  { to: '/chat',              key: 'chat',           icon: MessageCircle },
  { to: '/records',           key: 'myRecords',      icon: FileText },
  { to: '/emergency',         key: 'emergency',      icon: AlertTriangle, danger: true },
];

export default function SidebarNav() {
  const { t, language, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <motion.div
            className="sidebar-logo-icon"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart size={20} color="white" fill="white" />
          </motion.div>
          <span className="sidebar-logo-text">MediAssist AI</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, key, icon: Icon, danger }) => (
            <NavLink
              key={key}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}${danger ? ' emergency-nav' : ''}`
              }
            >
              <Icon size={18} className="nav-icon" />
              <span>{t(key)}</span>
            </NavLink>
          ))}

          <div className="divider" style={{ margin: '0.5rem 0' }} />

          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Settings size={18} className="nav-icon" />
            <span>{t('settings')}</span>
          </NavLink>
        </nav>

        {/* Footer Controls */}
        <div className="sidebar-footer">
          {/* Language Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangMenu(p => !p)}
              className="theme-toggle"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={14} />
                <span>{currentLang.native}</span>
              </div>
              <ChevronRight size={12} style={{ transform: showLangMenu ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    bottom: '110%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-elevated)',
                    zIndex: 200,
                  }}
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setShowLangMenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.6rem 0.875rem',
                        background: language === lang.code ? 'rgba(14,165,233,0.1)' : 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--border-glass)',
                        cursor: 'pointer',
                        color: language === lang.code ? 'var(--color-primary)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '0.8rem',
                        fontWeight: language === lang.code ? 600 : 400,
                        transition: 'background 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (language !== lang.code) e.currentTarget.style.background = 'var(--bg-glass)'; }}
                      onMouseLeave={e => { if (language !== lang.code) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>{lang.native}</span>
                      <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>{lang.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Auth */}
          {user ? (
            <button className="theme-toggle" onClick={handleLogout}
              style={{ color: 'var(--color-rose)', borderColor: 'rgba(244,63,94,0.2)' }}>
              <LogOut size={14} />
              <span>{t('signOut')}</span>
            </button>
          ) : (
            <button className="theme-toggle" onClick={() => navigate('/login')}>
              <User size={14} />
              <span>{t('signInButton')}</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation ──────────────────── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.slice(0, 5).map(({ to, key, icon: Icon, danger }) => (
          <NavLink
            key={key}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `bottom-nav-item${isActive ? ' active' : ''}${danger ? ' emergency-nav-btn' : ''}`
            }
          >
            <Icon size={20} />
            <span>{t(key).split(' ')[0]}</span>
          </NavLink>
        ))}
        <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <Settings size={20} />
          <span>{t('settings').split(' ')[0]}</span>
        </NavLink>
      </nav>
    </>
  );
}
