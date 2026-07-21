import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { aiService, saveConsultation } from '../services/api';
import { Image, Upload, X, Eye, Scan, Brain, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

const CONFIDENCE_COLORS = confidence => {
  if (confidence >= 85) return { fill: '#10b981', glow: 'rgba(16,185,129,0.3)' };
  if (confidence >= 65) return { fill: '#f59e0b', glow: 'rgba(245,158,11,0.3)' };
  return { fill: '#f43f5e', glow: 'rgba(244,63,94,0.3)' };
};

export default function ImageAnalysis() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = async file => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);
    setResult(null);
    try {
      const r = await aiService.analyzeImage(file);
      setResult(r);
      saveConsultation({
        type: 'Image Analysis',
        summary: r.condition || r.diagnosis || 'Medical Image Analyzed',
        severity: r.riskLevel?.toLowerCase() || 'low',
        notes: `Analyzed: ${file.name}`
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confidence = result?.confidence ?? result?.aiScore ?? 0;
  const confColors = CONFIDENCE_COLORS(confidence);

  const clearAll = () => {
    setSelectedFile(null); setResult(null); setLoading(false);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '4rem' }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 36, height: 36, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image size={18} style={{ color: '#10b981' }} />
            </div>
            <h1 className="page-heading" style={{ margin: 0 }}>{t('imageAnalysisHeading')}</h1>
          </div>
          <p className="page-subheading">{t('imageAnalysisSub')}</p>
        </motion.div>

        <div className="disclaimer-banner">
          <Shield size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>{t('disclaimer_short')}</span>
        </div>

        <div className="image-grid">
          {/* Upload & Preview */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Image size={18} style={{ color: '#10b981' }} /> {t('imageAnalysisTitle')}
                </h2>
                {selectedFile && (
                  <button onClick={clearAll} className="btn-ghost" style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}>
                    <X size={13} /> Clear
                  </button>
                )}
              </div>

              {/* Preview Area */}
              {preview ? (
                <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: 'var(--bg-glass)' }}>
                  <img src={preview} alt="Medical image preview"
                    style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
                  {loading && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(6,11,20,0.75)', backdropFilter: 'blur(4px)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                    }}>
                      <div className="ai-pulse">
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Scan size={22} color="white" />
                        </div>
                      </div>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{t('analyzingImage')}</p>
                      <div className="progress-bar" style={{ width: '60%' }}>
                        <motion.div className="progress-fill"
                          initial={{ width: '0%' }} animate={{ width: '90%' }}
                          transition={{ duration: 2.5, ease: 'easeInOut' }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`upload-zone${dragOver ? ' drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])} />
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 1rem', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={28} style={{ color: '#10b981' }} />
                    </div>
                  </motion.div>
                  <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Drop medical image here</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>X-ray, MRI, skin, eye images · JPG, PNG</p>
                </div>
              )}

              {/* Sample types */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['X-Ray', 'MRI Scan', 'Skin Lesion', 'Eye Fundus', 'CT Scan'].map(type => (
                  <span key={type} style={{ padding: '0.25rem 0.65rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '999px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, gap: '1rem', textAlign: 'center' }}>
                  <div className="animate-float" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Eye size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>{t('noImageYet')}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 260 }}>{t('noImageYetDesc')}</p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Confidence ring */}
                  <div style={{ textAlign: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      <svg width="110" height="110" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="48" fill="none" stroke="var(--border-glass)" strokeWidth="8" />
                        <motion.circle cx="55" cy="55" r="48" fill="none"
                          stroke={confColors.fill} strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 48}`}
                          strokeDashoffset={`${2 * Math.PI * 48 * (1 - confidence / 100)}`}
                          strokeLinecap="round" transform="rotate(-90 55 55)"
                          initial={{ strokeDashoffset: `${2 * Math.PI * 48}` }}
                          animate={{ strokeDashoffset: `${2 * Math.PI * 48 * (1 - confidence / 100)}` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          style={{ filter: `drop-shadow(0 0 6px ${confColors.glow})` }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: confColors.fill, lineHeight: 1 }}>{confidence}%</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIDENCE</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>AI Diagnostic Confidence</div>
                  </div>

                  {result.condition && (
                    <div style={{ padding: '0.875rem', background: 'rgba(16,185,129,0.06)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>{t('imageCondition')}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>{result.condition}</div>
                    </div>
                  )}

                  {result.diagnosis && (
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>{t('imageDiagnosis')}</div>
                      <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: 1.65 }}>{result.diagnosis}</p>
                    </div>
                  )}

                  {result.findings && (
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>{t('imageFindings')}</div>
                      <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: 1.65 }}>{result.findings}</p>
                    </div>
                  )}

                  {result.recommendations && (
                    <div style={{ padding: '0.875rem', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>{t('imageRecommendations')}</div>
                      <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{result.recommendations}</p>
                    </div>
                  )}

                  {result.riskLevel && (
                    <div style={{
                      padding: '0.7rem 0.875rem',
                      background: result.riskLevel === 'Low' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                      border: `1px solid ${result.riskLevel === 'Low' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                      borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      fontSize: '0.85rem', fontWeight: 600,
                      color: result.riskLevel === 'Low' ? '#10b981' : '#f59e0b'
                    }}>
                      {result.riskLevel === 'Low' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                      Risk Level: {result.riskLevel}
                    </div>
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
