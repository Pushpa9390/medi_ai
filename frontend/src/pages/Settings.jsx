import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { Globe, Moon, Sun, Shield, User, HelpCircle, LogIn, LogOut, ChevronRight, UserPlus } from 'lucide-react';

export default function Settings() {
  const { language, changeLanguage, translations } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '80px', maxWidth: '800px' }}>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <User className="text-sky-400" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Settings</h2>
          </div>

          <DisclaimerBanner />

          {/* Account Section */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              Account
            </h3>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '1.1rem', color: 'white',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(14,165,233,0.3)',
                  }}>
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to="/account" style={{ textDecoration: 'none' }}>
                    <button className="btn-ghost" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} /> Manage Account <ChevronRight size={13} />
                    </button>
                  </Link>
                  <button
                    onClick={logout}
                    style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Not signed in</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Create an account to save your health profile and preferences.</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to="/signup" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <UserPlus size={14} /> Sign Up
                    </button>
                  </Link>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <button className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <LogIn size={14} /> Sign In
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Theme & Language */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              General Options
            </h3>

            {/* Language Switcher row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Globe className="text-sky-400" size={20} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Language Selection</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Configure interface text translation.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { code: 'en', label: 'English' },
                  { code: 'te', label: 'తెలుగు (Telugu)' },
                  { code: 'hi', label: 'हिन्दी (Hindi)' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: language === lang.code ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                      borderColor: language === lang.code ? 'var(--color-primary)' : 'var(--border-glass)',
                      color: language === lang.code ? 'white' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {theme === 'dark' ? <Moon className="text-indigo-400" size={20} /> : <Sun className="text-amber-400" size={20} />}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Visual Theme</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Switch between dark and light modes.</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                {theme === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode'}
              </button>
            </div>
          </GlassCard>

          {/* Privacy & Safety */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              Privacy & Consent
            </h3>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Shield className="text-emerald-400" size={20} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Data Encryption</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  MediAssist AI operates on a decentralized privacy model. All conversation details and medical reports uploaded are processed in high-security environments and never logged persistently on target servers.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <HelpCircle className="text-sky-400" size={20} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Need Help or Support?</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  If you have technical questions or feedback regarding the diagnosis models, contact the clinical engineering desk.
                </p>
              </div>
            </div>
          </GlassCard>

        </motion.div>

      </div>
    </div>
  );
}
