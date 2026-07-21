import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { aiService, saveConsultation } from '../services/api';
import {
  FileText, AlertCircle, Sparkles, Check, Upload, X,
  Shield, FileSearch, Microscope, Lightbulb, ChevronRight
} from 'lucide-react';

const PROGRESS_STEPS = [
  { label: 'File Uploaded',         icon: Upload },
  { label: 'OCR Scanning',          icon: FileSearch },
  { label: 'Extracting Biomarkers', icon: Microscope },
  { label: 'AI Analysis Complete',  icon: Sparkles },
];

function UploadZone({ onFileSelect, hasFile }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleDrop = e => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      className={`upload-zone${dragOver ? ' drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onFileSelect(e.target.files[0]); }}
      />
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 1rem', borderRadius: '16px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Upload size={28} style={{ color: 'var(--color-primary)' }} />
        </div>
      </motion.div>
      <p style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.95rem' }}>
        Drop your report here
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        PDF, JPG, PNG supported · Max 20MB
      </p>
    </div>
  );
}

function AnalysisProgress({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1.25rem 0' }}>
      {PROGRESS_STEPS.map(({ label, icon: Icon }, i) => {
        const done = i < step; const active = i === step;
        return (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? 'var(--gradient-primary)' : active ? 'rgba(14,165,233,0.15)' : 'var(--bg-glass)',
              border: `1px solid ${done ? 'transparent' : active ? 'rgba(14,165,233,0.4)' : 'var(--border-glass)'}`,
              transition: 'all 0.3s ease'
            }}>
              {done ? <Check size={14} color="white" /> : <Icon size={14} style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)', animation: active ? 'spin 1s linear infinite' : 'none' }} />}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: done ? 600 : 400, color: done ? 'var(--text-primary)' : active ? 'var(--color-primary)' : 'var(--text-muted)', transition: 'color 0.3s' }}>{label}</span>
            {active && <div className="loading-spinner-ring" style={{ width: 16, height: 16, borderWidth: 2, marginLeft: 'auto' }} />}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ReportAnalyzer() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = async file => {
    setSelectedFile(file);
    setLoading(true);
    setResult(null);
    setStep(0);

    // Simulate step progress
    const stepTimer = setInterval(() => setStep(s => { if (s < 3) return s + 1; clearInterval(stepTimer); return s; }), 900);

    try {
      const r = await aiService.analyzeReport(file);
      setResult(r);
      setStep(3);
      saveConsultation({
        type: 'Report Analysis',
        summary: r.extractedSummary || 'Lab Report Analyzed',
        severity: r.values?.some(v => v.status === 'low' || v.status === 'deficient') ? 'medium' : 'low',
        notes: `Analyzed: ${file.name}`
      });
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  };

  const STATUS_STYLE = {
    normal:   { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: Check },
    low:      { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', icon: AlertCircle },
    high:     { bg: 'rgba(244,63,94,0.1)',  color: '#f43f5e', icon: AlertCircle },
    deficient:{ bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', icon: AlertCircle },
  };

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '4rem' }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 36, height: 36, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} style={{ color: '#6366f1' }} />
            </div>
            <h1 className="page-heading" style={{ margin: 0 }}>{t('reportAnalyzerHeading')}</h1>
          </div>
          <p className="page-subheading">{t('reportAnalyzerSub')}</p>
        </motion.div>

        <div className="disclaimer-banner">
          <Shield size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>{t('disclaimer_short')}</span>
        </div>

        <div className="report-grid">
          {/* Upload Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="glass-card" style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <FileText size={18} style={{ color: '#6366f1' }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{t('reportAnalyzerTitle')}</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                {t('reportAnalyzerDesc')}
              </p>

              {selectedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '12px', marginBottom: '1rem' }}>
                  <FileText size={20} style={{ color: '#6366f1', flexShrink: 0 }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button onClick={() => { setSelectedFile(null); setResult(null); setStep(0); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <UploadZone onFileSelect={handleFileSelect} />
              )}

              {loading && <AnalysisProgress step={step} />}

              <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <Lightbulb size={13} style={{ color: '#6366f1' }} /> {t('parametersExtracted')}:
                </h4>
                <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li>Out-of-range metric flagging with color codes</li>
                  <li>Simplified plain-language explanations</li>
                  <li>Dietary & lifestyle recommendations</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <AnimatePresence mode="wait">
              {loading && !result && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 350, gap: '1.5rem' }}>
                  <div className="ai-pulse">
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Microscope size={26} color="white" />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{t('ocrScanning')}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Processing your medical document...</p>
                  </div>
                  <div className="progress-bar" style={{ width: '80%' }}>
                    <motion.div className="progress-fill" initial={{ width: '10%' }} animate={{ width: '85%' }} transition={{ duration: 2.5, ease: 'easeInOut' }} />
                  </div>
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 350, gap: '1rem', textAlign: 'center' }}>
                  <div className="animate-float" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>{t('waitingForUpload')}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 280 }}>{t('waitingForUploadDesc')}</p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.7rem', background: 'rgba(14,165,233,0.1)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Check size={11} /> {t('documentParsed')}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{result.extractedSummary}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{result.reportName}</p>
                  </div>

                  {/* Biomarker Table */}
                  {result.values?.length > 0 && (
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>{t('tableParameter')}</th>
                            <th>{t('tableValue')}</th>
                            <th>{t('tableNormal')}</th>
                            <th>{t('tableStatus')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.values.map((item, i) => {
                            const s = STATUS_STYLE[item.status] || STATUS_STYLE.normal;
                            const Icon = s.icon;
                            return (
                              <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{item.parameter}</td>
                                <td style={{ fontWeight: 700 }}>{item.value}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{item.normal}</td>
                                <td>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, background: s.bg, color: s.color }}>
                                    <Icon size={10} /> {item.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{t('simplifiedTranslation')}</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>{result.explanation}</p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{t('lifestyleAdvice')}</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>{result.suggestions}</p>
                  </div>

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
