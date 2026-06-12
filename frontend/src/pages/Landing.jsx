import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  Activity, FileText, Image, MessageSquare, ShieldAlert,
  Heart, ArrowRight, ShieldCheck, UserCheck, Stethoscope
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Landing() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div style={{ background: 'var(--gradient-hero)', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section className="section-container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="hero-grid">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '0.4rem 0.8rem', borderRadius: '999px', width: 'fit-content' }}>
              <Stethoscope size={16} className="text-sky-400" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>AI-Enabled Clinical Support</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {t('heroTitle').split(' ').map((word, idx) => (
                idx >= 3 ? <span key={idx} className="gradient-text">{word} </span> : word + ' '
              ))}
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '560px', margin: 0 }}>
              {t('heroSubtitle')}
            </p>

            <DisclaimerBanner />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Link to="/symptom-checker" className="btn-primary" style={{ textDecoration: 'none' }}>
                {t('getStarted')}
                <ArrowRight size={18} />
              </Link>
              <Link to="/emergency" className="btn-danger" style={{ textDecoration: 'none' }}>
                <ShieldAlert size={18} />
                Emergency Services
              </Link>
            </div>
          </motion.div>

          <style>{`
            .hero-grid {
              grid-template-columns: 1fr;
            }
            @media (min-width: 1024px) {
              .hero-grid {
                grid-template-columns: 1.2fr 0.8fr;
              }
            }
          `}</style>
        </div>
      </section>

      {/* Feature Section */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border-glass)' }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Advanced Health Assistant Tools
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Select an option below to begin testing our advanced diagnostics tools.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}
          >
            {/* Feature 1 */}
            <Link to="/symptom-checker" style={{ textDecoration: 'none' }}>
              <GlassCard variants={itemVariants} className="h-full flex flex-col justify-between cursor-pointer">
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Activity size={24} className="text-sky-400" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    AI Symptom Checker
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Provide current symptoms to detect severity levels, follow-up questions, and general conditions.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1.5rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Open Symptom Tool <ArrowRight size={14} />
                </div>
              </GlassCard>
            </Link>

            {/* Feature 2 */}
            <Link to="/report-analyzer" style={{ textDecoration: 'none' }}>
              <GlassCard variants={itemVariants} className="h-full flex flex-col justify-between cursor-pointer">
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <FileText size={24} className="text-indigo-400" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Report Analyzer
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Upload lab results or blood work reports. The AI simplifies medical terms and flags warnings.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1.5rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Analyze Report <ArrowRight size={14} />
                </div>
              </GlassCard>
            </Link>

            {/* Feature 3 */}
            <Link to="/image-analysis" style={{ textDecoration: 'none' }}>
              <GlassCard variants={itemVariants} className="h-full flex flex-col justify-between cursor-pointer">
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Image size={24} className="text-emerald-400" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Medical Image Analyzer
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Upload images of skin conditions, rashes, or scans for initial visual analysis.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1.5rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Start Image Analysis <ArrowRight size={14} />
                </div>
              </GlassCard>
            </Link>

            {/* Feature 4 */}
            <Link to="/chat" style={{ textDecoration: 'none' }}>
              <GlassCard variants={itemVariants} className="h-full flex flex-col justify-between cursor-pointer">
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <MessageSquare size={24} className="text-rose-400" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Health Chatbot
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Ask general medical questions, request lifestyle tips, or lookup prescription guidelines.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1.5rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Open AI Chat <ArrowRight size={14} />
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust & Ethics Section */}
      <section style={{ padding: '60px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-glass)' }}>
        <div className="section-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <ShieldCheck size={36} className="text-sky-400 flex-shrink-0" />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Fully Secure</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  All health queries and document uploads are parsed locally and never logged without your active consent.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <UserCheck size={36} className="text-emerald-400 flex-shrink-0" />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Safety Focused</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Rigorous medical alignment filters out bad advice and alerts you if symptoms match critical red-flag situations.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Heart size={36} className="text-rose-400 flex-shrink-0" />
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Patient Friendly</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Complex medical reports are translated into simplified patient-friendly summaries instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
