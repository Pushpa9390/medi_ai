import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { aiService, saveConsultation } from '../services/api';
import {
  Send, FileDown, Plus, HelpCircle, HeartHandshake,
  AlertTriangle, CheckCircle, Activity, Stethoscope, Shield
} from 'lucide-react';

const SEVERITY_CONFIG = {
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'LOW', icon: CheckCircle },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'MODERATE', icon: Activity },
  high:     { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.3)',  label: 'HIGH', icon: AlertTriangle },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)',  label: 'CRITICAL', icon: AlertTriangle },
};

function SeverityBanner({ level }) {
  const cfg = SEVERITY_CONFIG[level?.toLowerCase()] || SEVERITY_CONFIG.medium;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.875rem 1.125rem',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: '14px', color: cfg.color
      }}
    >
      <Icon size={20} />
      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.7, letterSpacing: '0.1em' }}>SEVERITY LEVEL</div>
        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{cfg.label}</div>
      </div>
    </motion.div>
  );
}

function SkeletonLoader() {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 300 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '12px' }} />
        <div className="skeleton" style={{ flex: 1, height: 20, borderRadius: '6px' }} />
      </div>
      {[80, 60, 90, 70].map((w, i) => (
        <div key={i} className="skeleton" style={{ width: `${w}%`, height: 14, borderRadius: '6px' }} />
      ))}
      <div style={{ marginTop: '0.5rem' }}>
        <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: '999px' }} />
      </div>
    </div>
  );
}

const SAMPLE_SYMPTOMS = [
  'Mild headache and coughing since yesterday',
  'Fever of 38°C with body aches',
  'Sharp chest pain when breathing deeply',
  'Itchy red rash on forearm',
];

export default function SymptomChecker() {
  const { t } = useLanguage();
  const { triggerEmergencyBySeverity } = useEmergency();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAnalyze = async (e, override) => {
    if (e) e.preventDefault();
    const text = override || symptoms;
    if (!text.trim()) return;
    setSymptoms(text);
    setLoading(true);
    setResult(null);
    try {
      const r = await aiService.analyzeSymptoms(text, history);
      setResult(r);
      // Trigger emergency banner only if severity is critical or high (🔴 Emergency)
      if (r.severity) {
        triggerEmergencyBySeverity(r.severity, r.condition || r.possibleConditions);
      }
      setHistory(h => [...h, { role: 'user', text }, { role: 'ai', text: r.clinicalExplanation || r.explanation }]);
      saveConsultation({
        type: 'Symptom Check',
        summary: r.condition || r.possibleConditions || 'General Analysis',
        severity: (r.severity || 'medium').toLowerCase(),
        notes: `Symptoms: ${text}`
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(14, 165, 233);
    doc.text('MediAssist AI — Symptom Assessment', 20, 20);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
    doc.setDrawColor(200, 200, 200); doc.line(20, 32, 190, 32);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 30, 30);
    doc.text('Reported Symptoms:', 20, 42);
    doc.setFont('helvetica', 'normal'); doc.text(symptoms, 20, 48, { maxWidth: 170 });
    doc.setFont('helvetica', 'bold'); doc.text('Indicated Condition:', 20, 68);
    doc.setFont('helvetica', 'normal'); doc.text(result.condition || result.possibleConditions || 'N/A', 20, 74);
    doc.setFont('helvetica', 'bold'); doc.text('Severity:', 20, 84);
    doc.setFont('helvetica', 'normal'); doc.text((result.severity || 'Moderate').toUpperCase(), 20, 90);
    doc.setFont('helvetica', 'bold'); doc.text('Clinical Explanation:', 20, 100);
    doc.setFont('helvetica', 'normal'); doc.text(result.clinicalExplanation || result.explanation || '', 20, 106, { maxWidth: 170 });
    doc.setFont('helvetica', 'bold'); doc.text('Suggested Actions:', 20, 145);
    doc.setFont('helvetica', 'normal'); doc.text(result.suggestedActions || result.suggestions || '', 20, 151, { maxWidth: 170 });
    doc.setFillColor(245, 158, 11); doc.rect(20, 255, 170, 18, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(8);
    doc.text('DISCLAIMER: AI-generated report for health information only. Not a medical diagnosis.', 23, 264);
    doc.save('mediassist-symptom-report.pdf');
  };

  const condition = result?.condition || result?.possibleConditions;
  const explanation = result?.clinicalExplanation || result?.explanation;
  const suggestions = result?.suggestedActions || result?.suggestions;
  const severity = result?.severity?.toLowerCase();

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '4rem' }}>

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 36, height: 36, background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h1 className="page-heading" style={{ margin: 0 }}>{t('symptomCheckerHeading')}</h1>
          </div>
          <p className="page-subheading">{t('symptomCheckerSub')}</p>
        </motion.div>

        {/* Disclaimer */}
        <div className="disclaimer-banner">
          <Shield size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>{t('disclaimer_short')}</span>
        </div>

        <div className="symptom-grid">

          {/* Input Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="glass-card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartHandshake size={20} style={{ color: 'var(--color-primary)' }} />
                {t('symptomCheckerTitle')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                {t('symptomCheckerSub')}
              </p>

              {/* Sample suggestions */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                  Try an example:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {SAMPLE_SYMPTOMS.map(s => (
                    <button key={s} className="suggestion-pill" onClick={() => handleAnalyze(null, s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <textarea
                  className="input-field"
                  placeholder={t('describeSymptomsPlaceholder')}
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  style={{ minHeight: 120, resize: 'vertical' }}
                  required
                />
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" onClick={() => { setSymptoms(''); setResult(null); setHistory([]); }} className="btn-ghost">
                    <Plus size={15} /> {t('noAnalysisYet').split(' ')[0]} Check
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading || !symptoms.trim()}>
                    {loading ? (
                      <><div className="loading-spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} /> {t('evaluatingSymptoms').split('.')[0]}...</>
                    ) : (
                      <><Send size={15} /> {t('analyzeSymptomsButton')}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SkeletonLoader />
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: '1rem', textAlign: 'center' }}
                >
                  <div className="animate-float" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HelpCircle size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>{t('noAnalysisYet')}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 280 }}>{t('noAnalysisYetDesc')}</p>
                  </div>
                </motion.div>
              )}

              {!loading && result && (
                <motion.div key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 120 }}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Preliminary Assessment</h3>
                    <button onClick={downloadPDF} className="btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                      <FileDown size={13} /> {t('downloadPDF')}
                    </button>
                  </div>

                  {/* Severity */}
                  <SeverityBanner level={severity} />

                  {/* Condition */}
                  {condition && (
                    <div style={{ padding: '0.875rem', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                        {t('indicatedCondition')}
                      </div>
                      <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: 'var(--color-primary)' }}>{condition}</p>
                    </div>
                  )}

                  {/* Explanation */}
                  {explanation && (
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                        {t('clinicalExplanation')}
                      </div>
                      <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-primary)', lineHeight: 1.65 }}>{explanation}</p>
                    </div>
                  )}

                  {/* Suggestions */}
                  {suggestions && (
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                        {t('suggestedActions')}
                      </div>
                      <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-primary)', lineHeight: 1.65 }}>{suggestions}</p>
                    </div>
                  )}

                  {/* Emergency Warning */}
                  {result.emergencyWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '0.875rem 1rem',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '12px',
                        display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
                        color: '#ef4444', fontSize: '0.85rem'
                      }}
                    >
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{result.emergencyWarning}</span>
                    </motion.div>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ⚕️ {t('disclaimer_short')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
