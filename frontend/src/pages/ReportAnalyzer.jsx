import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { aiService, saveConsultation } from '../services/api';
import GlassCard from '../components/GlassCard';
import FileUpload from '../components/FileUpload';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, AlertCircle, Sparkles, Check } from 'lucide-react';

export default function ReportAnalyzer() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setLoading(true);
    setReportResult(null);

    try {
      const result = await aiService.analyzeReport(file);
      setReportResult(result);

      // Save consultation to dashboard history
      saveConsultation({
        type: 'Report Analysis',
        summary: result.extractedSummary || 'Lab Report Analyzed',
        severity: result.values.some(v => v.status === 'low' || v.status === 'deficient') ? 'medium' : 'low',
        notes: `Analyzed file ${file.name}. Highlighting abnormal metrics: ${result.explanation}`
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="report-grid">
          
          {/* Uploader Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FileText className="text-sky-400" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Report Explainer</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Upload blood panels, hormone readings, thyroid tests, or other lab paperwork. The system processes fields, highlights out-of-range metrics, and translates complex medical phrases into simple explanations.
              </p>

              <FileUpload onFileSelect={handleFileSelect} accept="image/*,application/pdf" />

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={14} className="text-indigo-400" /> Key parameters we extract:
                </h4>
                <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li>Out-of-range metrics flagging (Low/Deficient/Elevated markers)</li>
                  <li>Simplification of medical jargon into understandable descriptions</li>
                  <li>Dietary/lifestyle tips based on findings</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>

          {/* Explanation Output Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading && (
              <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
                <LoadingSpinner text="Reading file text, mapping biomarkers against parameters..." />
              </GlassCard>
            )}

            {!loading && !reportResult && (
              <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <FileText size={48} className="text-slate-500 mb-3 animate-float" />
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Waiting for Upload</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                  Upload a PDF or scan to automatically view structured summaries and abnormal marker alerts.
                </p>
              </GlassCard>
            )}

            {!loading && reportResult && (
              <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    Document Parsed Successfully
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {reportResult.extractedSummary}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Source file: {reportResult.reportName}
                  </p>
                </div>

                {/* Extracted Values Table */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Extracted Biomarkers & Metrics:
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                          <th style={{ padding: '0.5rem' }}>Parameter</th>
                          <th style={{ padding: '0.5rem' }}>Value</th>
                          <th style={{ padding: '0.5rem' }}>Normal Range</th>
                          <th style={{ padding: '0.5rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportResult.values.map((item, idx) => {
                          const isWarning = item.status === 'low' || item.status === 'deficient' || item.status === 'high';
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '0.5rem', fontWeight: 500 }}>{item.parameter}</td>
                              <td style={{ padding: '0.5rem' }}>{item.value}</td>
                              <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{item.normal}</td>
                              <td style={{ padding: '0.5rem' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: isWarning ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                                    color: isWarning ? '#ef4444' : '#10b981'
                                  }}
                                >
                                  {isWarning ? <AlertCircle size={10} /> : <Check size={10} />}
                                  {item.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Simplified Translation:
                  </h4>
                  <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>
                    {reportResult.explanation}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Lifestyle & Nutritional Advice:
                  </h4>
                  <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>
                    {reportResult.suggestions}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ⚠️ Explanations are AI summaries for comprehension. Never alter prescription schedules or medical treatment programs without consulting a physician.
                </div>
              </GlassCard>
            )}
          </motion.div>

        </div>

      </div>

      <style>{`
        .report-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .report-grid {
            grid-template-columns: 1fr 1.2fr;
          }
        }
      `}</style>
    </div>
  );
}
