import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Globe, Moon, Sun, Shield, User, HelpCircle,
  ChevronRight, Sliders, Check, Settings as SettingsIcon, Bell, Download
} from 'lucide-react';

const LANGUAGES_LIST = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export default function Settings() {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Local storage bound settings parameters
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('pref-notifications') !== 'false';
  });
  const [privacyOptOut, setPrivacyOptOut] = useState(() => {
    return localStorage.getItem('pref-privacy-opt-out') === 'true';
  });
  const [aiResponseLang, setAiResponseLang] = useState(() => {
    return localStorage.getItem('pref-ai-lang') || 'en';
  });
  const [downloadFormat, setDownloadFormat] = useState(() => {
    return localStorage.getItem('pref-download-format') || 'pdf';
  });

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('pref-notifications', String(next));
  };

  const togglePrivacyOptOut = () => {
    const next = !privacyOptOut;
    setPrivacyOptOut(next);
    localStorage.setItem('pref-privacy-opt-out', String(next));
  };

  const handleAiLangChange = (e) => {
    setAiResponseLang(e.target.value);
    localStorage.setItem('pref-ai-lang', e.target.value);
  };

  const handleDownloadFormatChange = (e) => {
    setDownloadFormat(e.target.value);
    localStorage.setItem('pref-download-format', e.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '5rem', maxWidth: '800px' }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SettingsIcon size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h1 className="page-heading" style={{ margin: 0 }}>{t('settings') || 'Settings'}</h1>
          </div>
          <p className="page-subheading">Configure your multilingual preferences, theme controls, and account information.</p>
        </motion.div>

        {/* Global Disclaimer Banner */}
        <div className="disclaimer-banner" style={{ marginBottom: '2rem' }}>
          <Shield size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>{t('disclaimer')}</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Account Profile Card */}
          <motion.div variants={cardVariants} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.6rem', color: 'var(--text-primary)' }}>
              {t('accountSettings') || 'Account Management'}
            </h3>
            
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '1.2rem', color: 'white',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(14,165,233,0.3)',
                    overflow: 'hidden'
                  }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <Link to="/account" style={{ textDecoration: 'none' }}>
                    <button className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={13} /> Manage Profile <ChevronRight size={12} />
                    </button>
                  </Link>
                </div>
              </div>
          </motion.div>

          {/* Localization Options */}
          <motion.div variants={cardVariants} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.6rem', color: 'var(--text-primary)' }}>
              Localization &amp; Display Options
            </h3>

            {/* Language Picker List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Globe className="text-primary" size={20} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Language Selection</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Select language for instant interface text translation.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.25rem' }}>
                {LANGUAGES_LIST.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    style={{
                      padding: '0.55rem 0.875rem',
                      borderRadius: '10px',
                      border: '1px solid',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: language === lang.code ? 'var(--gradient-card)' : 'var(--bg-glass)',
                      borderColor: language === lang.code ? 'var(--border-primary)' : 'var(--border-glass)',
                      color: language === lang.code ? 'var(--color-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.25s',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    <span>{lang.native}</span>
                    {language === lang.code && <Check size={12} style={{ color: 'var(--color-primary)' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {theme === 'dark' ? <Moon style={{ color: 'var(--color-accent)' }} size={20} /> : <Sun className="text-amber" size={20} />}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Visual Theme Mode</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Switch color systems instantly.</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="btn-ghost"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
              >
                {theme === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode'}
              </button>
            </div>
          </motion.div>

          {/* Preferences Settings (Toggles) */}
          <motion.div variants={cardVariants} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.6rem', color: 'var(--text-primary)' }}>
              Notifications &amp; Download Preferences
            </h3>

            {/* Notifications Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Bell size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>System Notifications</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Receive wellness alerts and medication instructions.</p>
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={toggleNotifications}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0,
                  borderRadius: '34px', transition: '0.4s',
                  background: notifications ? 'var(--color-primary)' : 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: 16, width: 16,
                    left: notifications ? '22px' : '4px', bottom: '3px',
                    backgroundColor: 'white', borderRadius: '50%', transition: '0.4s'
                  }} />
                </span>
              </label>
            </div>

            {/* AI Response Language */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Sliders size={20} style={{ color: 'var(--color-accent)' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>AI Response Language</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Select language preferred for clinical explanations.</p>
                </div>
              </div>
              <select
                value={aiResponseLang}
                onChange={handleAiLangChange}
                className="lang-select"
                style={{ width: '150px', background: 'var(--bg-glass)' }}
              >
                {LANGUAGES_LIST.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.native}</option>
                ))}
              </select>
            </div>

            {/* Download preferences */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Download size={20} style={{ color: 'var(--color-emerald)' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Preferred Download Format</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Export medical files in selected format.</p>
                </div>
              </div>
              <select
                value={downloadFormat}
                onChange={handleDownloadFormatChange}
                className="lang-select"
                style={{ width: '150px', background: 'var(--bg-glass)' }}
              >
                <option value="pdf">Document (PDF)</option>
                <option value="txt">Plain Text (TXT)</option>
              </select>
            </div>
          </motion.div>

          {/* Privacy & Opt-Out */}
          <motion.div variants={cardVariants} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.6rem', color: 'var(--text-primary)' }}>
              Privacy &amp; Data Control
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
                <Shield style={{ color: 'var(--color-emerald)', flexShrink: 0, marginTop: '0.15rem' }} size={20} />
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>Zero persistent logging model</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.55 }}>
                    Opt-out of sending diagnostic telemetry and parsed CBC biomarkers to training servers.
                  </p>
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={privacyOptOut}
                  onChange={togglePrivacyOptOut}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0,
                  borderRadius: '34px', transition: '0.4s',
                  background: privacyOptOut ? '#10b981' : 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: 16, width: 16,
                    left: privacyOptOut ? '22px' : '4px', bottom: '3px',
                    backgroundColor: 'white', borderRadius: '50%', transition: '0.4s'
                  }} />
                </span>
              </label>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
