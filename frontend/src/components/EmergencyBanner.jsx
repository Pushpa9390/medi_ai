import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '../context/EmergencyContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertOctagon, PhoneCall, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmergencyBanner() {
  const { isEmergency, emergencyMessage, clearEmergency } = useEmergency();
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isEmergency && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: '84px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            width: '90%',
            maxWidth: '700px',
          }}
        >
          <div className="emergency-banner" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)' }}>
            <AlertOctagon size={24} style={{ marginTop: '0.15rem', flexShrink: 0, color: '#f87171' }} />
            <div style={{ flexGrow: 1 }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.25rem 0' }}>Emergency Detected!</h4>
              <p style={{ fontSize: '0.9rem', margin: '0 0 0.75rem 0', opacity: 0.9 }}>
                {emergencyMessage}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href="tel:112"
                  className="btn-danger"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <PhoneCall size={14} />
                  Call 112 / 911
                </a>
                <Link
                  to="/emergency"
                  onClick={clearEmergency}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Emergency Contacts & Guide
                </Link>
              </div>
            </div>
            <button
              onClick={clearEmergency}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                opacity: 0.7,
                cursor: 'pointer',
                padding: '0.2rem',
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
