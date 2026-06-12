import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { AlertTriangle, Phone, Activity, Heart, ShieldAlert, CheckSquare } from 'lucide-react';

const emergencyScenarios = [
  {
    title: 'Chest Pain / Heart Attack',
    symptoms: 'Crushing chest pressure, pain radiating to neck/left arm, sweating, nausea, shortness of breath.',
    action: 'Sit down, take deep breaths, call emergency lines immediately, chew aspirin if recommended by medical dispatch.'
  },
  {
    title: 'Stroke (F.A.S.T.)',
    symptoms: 'Face drooping, Arm weakness, Speech difficulty, Time to call emergency services immediately.',
    action: 'Note the exact time symptoms started. Keep the patient lying down on their side.'
  },
  {
    title: 'Breathing Difficulty',
    symptoms: 'Severe asthma, choking, gasping for air, blue coloration around the lips or fingernails.',
    action: 'Help patient sit upright. Locate inhaler/epipen. Prepare for CPR if breathing stops.'
  },
  {
    title: 'Severe Bleeding',
    symptoms: 'Steady arterial blood flow that does not stop with minor compression.',
    action: 'Apply direct firm pressure with clean cloth. Elevate wound if possible. Do not apply tourniquet unless trained.'
  }
];

export default function Emergency() {
  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '80px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="emergency-grid">
          
          {/* Main Action Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="emergency-banner"
              style={{
                padding: '2rem',
                borderRadius: '16px',
                color: 'white',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldAlert size={36} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Critical Emergency Hotline</h2>
              </div>
              <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: '600px', margin: 0 }}>
                If you or someone nearby is experiencing acute symptoms like chest pain, stroke warning signs, or severe breathing distress, do not browse this app. Call assistance now.
              </p>
              
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <a
                  href="tel:112"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'white',
                    color: '#7f1d1d',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                >
                  <Phone size={20} /> Call 112 (India)
                </a>
                <a
                  href="tel:911"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '1.1rem'
                  }}
                >
                  <Phone size={20} /> Call 911 (US/Global)
                </a>
              </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Red-Flag Symptoms Guide</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {emergencyScenarios.map((item, idx) => (
                <GlassCard key={idx} hoverEffect={false} style={{ borderColor: 'rgba(239, 68, 68, 0.15)' }}>
                  <h4 style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h4>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Symptoms:</span>
                    <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)' }}>{item.symptoms}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Immediate Action:</span>
                    <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>{item.action}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* Quick Action CPR Guidelines card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity className="text-sky-400" /> Basic CPR Reference Steps
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                If an adult is unresponsive and not breathing:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { step: '1', title: 'Check Responsiveness', desc: 'Tap shoulders and shout "Are you okay?". Check chest movement.' },
                  { step: '2', title: 'Call Emergency', desc: 'Direct someone specific to call 112 / 911 immediately and fetch an AED.' },
                  { step: '3', title: 'Compressions', desc: 'Place hands in center of chest. Push hard and fast (100-120 compressions/min).' },
                  { step: '4', title: 'Rescue Breaths', desc: 'If trained, provide 2 breaths after every 30 compressions. Repeat.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{item.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

        </div>

      </div>

      <style>{`
        .emergency-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .emergency-grid {
            grid-template-columns: 1fr 320px;
          }
        }
      `}</style>
    </div>
  );
}
