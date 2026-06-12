import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Home, Activity, FileText, Image, MessageSquare,
  LayoutDashboard, AlertTriangle, Settings, Sun, Moon,
  Menu, X, Globe, Heart, User, LogIn
} from 'lucide-react';

const navLinks = [
  { key: 'home', path: '/', icon: Home },
  { key: 'symptomChecker', path: '/symptom-checker', icon: Activity },
  { key: 'reportAnalyzer', path: '/report-analyzer', icon: FileText },
  { key: 'imageAnalysis', path: '/image-analysis', icon: Image },
  { key: 'chat', path: '/chat', icon: MessageSquare },
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'emergency', path: '/emergency', icon: AlertTriangle },
  { key: 'settings', path: '/settings', icon: Settings },
];

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'te', label: 'తె', name: 'Telugu' },
  { code: 'hi', label: 'हि', name: 'Hindi' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(7, 11, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-glass)',
          height: '72px',
        }}
      >
        <div className="section-container" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '1rem' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <motion.div
              whileHover={{ rotate: 10 }}
              style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Heart size={18} color="white" fill="white" />
            </motion.div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.2rem',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {t('appName')}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center', flexWrap: 'nowrap', overflow: 'hidden' }} className="desktop-nav">
            {navLinks.slice(0, 6).map(({ key, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={key}
                  to={path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                    background: active ? 'rgba(14,165,233,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(14,165,233,0.2)' : '1px solid transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  <Icon size={14} />
                  {t(key)}
                </Link>
              );
            })}
            <Link
              to="/emergency"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#ef4444',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              <AlertTriangle size={14} />
              {t('emergency')}
            </Link>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Language Switcher */}
            <div style={{ position: 'relative' }}>
              <button
                id="lang-toggle"
                onClick={() => setLangOpen(!langOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  padding: '0.4rem 0.6rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                }}
              >
                <Globe size={14} />
                {languages.find(l => l.code === language)?.label}
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    style={{
                      position: 'absolute', top: '110%', right: 0,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '10px',
                      padding: '0.5rem',
                      minWidth: '130px',
                      boxShadow: 'var(--shadow-card)',
                      zIndex: 100,
                    }}
                  >
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { changeLanguage(lang.code); setLangOpen(false); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: language === lang.code ? 'rgba(14,165,233,0.15)' : 'transparent',
                          color: language === lang.code ? 'var(--color-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: language === lang.code ? 600 : 400,
                        }}
                      >
                        {lang.label} — {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '0.4rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Account / Sign In */}
            {user ? (
              <Link to="/account" title={user.name} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.9rem', color: 'white',
                    cursor: 'pointer', flexShrink: 0,
                    border: location.pathname === '/account' ? '2px solid #0ea5e9' : '2px solid transparent',
                    boxShadow: '0 2px 12px rgba(14,165,233,0.35)',
                    transition: 'border 0.2s',
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || <User size={16} />}
                </motion.div>
              </Link>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button
                  id="navbar-signin-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.4rem 0.8rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 12px rgba(14,165,233,0.35)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <LogIn size={14} />
                  Sign In
                </button>
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '0.4rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'none',
              }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              position: 'fixed', top: 72, right: 0, bottom: 0,
              width: '280px',
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-glass)',
              zIndex: 999,
              padding: '1.5rem 1rem',
              overflowY: 'auto',
            }}
          >
            {navLinks.map(({ key, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={key}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    marginBottom: '0.25rem',
                    color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                    background: active ? 'rgba(14,165,233,0.1)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <Icon size={18} />
                  {t(key)}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
