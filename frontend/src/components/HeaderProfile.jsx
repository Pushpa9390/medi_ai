import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User, LayoutDashboard, FileText, Settings, Globe,
  ChevronDown, Check
} from 'lucide-react';

const LANGUAGES_LIST = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export default function HeaderProfile() {
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowLangs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES_LIST.find(l => l.code === language) || LANGUAGES_LIST[0];

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.5rem',
        zIndex: 49,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Avatar Trigger */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '999px',
            padding: '0.35rem 0.85rem 0.35rem 0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: 'white',
            boxShadow: '0 2px 8px rgba(14,165,233,0.25)',
            overflow: 'hidden'
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </span>
          <ChevronDown size={12} style={{ opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '210px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-elevated)',
                padding: '0.5rem',
                overflow: 'hidden'
              }}
            >
              {/* User info header */}
              <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '0.4rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>

              <Link to="/account" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div className="nav-item-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <User size={14} /> <span>My Profile</span>
                </div>
              </Link>

              <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div className="nav-item-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <LayoutDashboard size={14} /> <span>Dashboard</span>
                </div>
              </Link>

              <Link to="/records" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div className="nav-item-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <FileText size={14} /> <span>My Records</span>
                </div>
              </Link>

              <Link to="/settings" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div className="nav-item-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <Settings size={14} /> <span>Settings</span>
                </div>
              </Link>

              {/* Language Submenu */}
              <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                <div
                  onClick={() => setShowLangs(!showLangs)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem',
                    cursor: 'pointer', color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={14} /> <span>Language</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>{currentLang.native}</span>
                </div>

                {showLangs && (
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem',
                    padding: '0.25rem 0.5rem', background: 'var(--bg-glass)', borderRadius: '10px', margin: '0.25rem 0'
                  }}>
                    {LANGUAGES_LIST.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { changeLanguage(lang.code); setShowLangs(false); setIsOpen(false); }}
                        style={{
                          background: language === lang.code ? 'rgba(14,165,233,0.1)' : 'transparent',
                          border: 'none', borderRadius: '6px', padding: '0.3rem', cursor: 'pointer',
                          fontSize: '0.72rem', color: language === lang.code ? 'var(--color-primary)' : 'var(--text-secondary)',
                          fontWeight: language === lang.code ? 700 : 400, textAlign: 'center'
                        }}
                      >
                        {lang.native}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
