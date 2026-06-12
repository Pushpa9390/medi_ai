import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { aiService, saveConsultation } from '../services/api';
import GlassCard from '../components/GlassCard';
import FileUpload from '../components/FileUpload';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { Image, ShieldAlert, Sparkles, Percent } from 'lucide-react';

export default function ImageAnalysis() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileSelect = async (file) => {
    // Generate image preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setLoading(true);
    setImageResult(null);

    try {
      const result = await aiService.analyzeImage(file);
      setImageResult(result);

      // Save consultation to dashboard history
      saveConsultation({
        type: 'Image Analysis',
        summary: result.observation || 'Skin lesion/Scan analysis',
        severity: result.confidence < 70 ? 'medium' : 'low',
        notes: `Analyzed medical image: ${file.name}. AI observation: ${result.observation}. Confidence score: ${result.confidence}%`
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '80px' }}>
        
        <DisclaimerBanner style={{ marginBottom: '2rem' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="image-grid">
          
          {/* File input / Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Image className="text-sky-400" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Visual Diagnostics</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Upload photos of skin irritation, insect bites, rashes, or scans. The AI detects surface irregularities, calculates statistical confidence metrics, and flags visual warning triggers.
              </p>

              {!previewUrl ? (
                <FileUpload onFileSelect={handleFileSelect} accept="image/*" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      maxHeight: '320px',
                      border: '1px solid var(--border-glass)',
                      background: 'black',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Medical scan preview"
                      style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }}
                    />
                    <button
                      onClick={() => { setPreviewUrl(''); setImageResult(null); }}
                      style={{
                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                        background: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        color: 'white',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      Clear File
                    </button>
                  </div>
                  {previewUrl && !loading && !imageResult && (
                    <button onClick={() => handleFileSelect(selectedFile)} className="btn-primary" style={{ justifyContent: 'center' }}>
                      Re-Analyze Image
                    </button>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Results Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading && (
              <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
                <LoadingSpinner text="Analyzing image pixels, processing edge filters and color variance patterns..." />
              </GlassCard>
            )}

            {!loading && !imageResult && (
              <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <Image size={48} className="text-slate-500 mb-3 animate-float" />
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Awaiting Medical Photo</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                  Upload a skin photo or scan to review confidence scores, visual findings, and ABCDE monitoring charts.
                </p>
              </GlassCard>
            )}

            {!loading && imageResult && (
              <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.5rem' }}>
                    <Sparkles size={12} /> Visual Scan Completed
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {imageResult.observation}
                  </h3>
                </div>

                {/* Confidence bar meter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      AI Model Confidence score:
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                      <Percent size={14} /> {imageResult.confidence}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${imageResult.confidence}%` }} />
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Visual Observations:
                  </h4>
                  <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>
                    {imageResult.explanation}
                  </p>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                    borderWidth: '1px',
                    borderRadius: '12px',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    display: 'flex',
                    gap: '0.65rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div>
                    <h5 style={{ fontWeight: 700, marginBottom: '0.15rem' }}>Visual Scanner Caveat</h5>
                    <p style={{ margin: 0 }}>{imageResult.warning}</p>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Suggested Actions & Checks:
                  </h4>
                  <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>
                    {imageResult.suggestions}
                  </p>
                </div>
              </GlassCard>
            )}
          </motion.div>

        </div>

      </div>

      <style>{`
        .image-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .image-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
