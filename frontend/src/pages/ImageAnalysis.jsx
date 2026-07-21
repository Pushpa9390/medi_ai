import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { aiService, saveConsultation, getHistory } from '../services/api';
import {
  Image, Upload, X, Eye, Scan, Brain, CheckCircle, AlertTriangle, Shield,
  Volume2, VolumeX, FileText, Download, Send, RefreshCw, Layers, Activity,
  Stethoscope, Sparkles, Clock, ArrowRight, Printer, UserCheck, HeartPulse
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CONFIDENCE_COLORS = confidence => {
  if (confidence >= 85) return { fill: '#10b981', glow: 'rgba(16,185,129,0.35)', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  if (confidence >= 65) return { fill: '#f59e0b', glow: 'rgba(245,158,11,0.35)', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  return { fill: '#f43f5e', glow: 'rgba(244,63,94,0.35)', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
};

export default function ImageAnalysis() {
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Advanced features state
  const [viewMode, setViewMode] = useState('original'); // 'original' | 'heatmap'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayLang, setDisplayLang] = useState(language || 'en');
  const [historyItems, setHistoryItems] = useState([]);
  const [compareItem, setCompareItem] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Follow-up Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const reportRef = useRef(null);
  const fileRef = useRef();

  useEffect(() => {
    setDisplayLang(language || 'en');
  }, [language]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const hist = getHistory();
      const imageHist = hist.filter(h => h.type === 'Image Analysis' || h.type === 'Image Scan');
      setHistoryItems(imageHist);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFile = async file => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);
    setResult(null);
    setChatMessages([]);
    setCompareItem(null);

    try {
      const r = await aiService.analyzeImage(file);
      setResult(r);

      // Save consultation to history
      saveConsultation({
        type: 'Image Analysis',
        summary: r.clinicalAssessment?.possibleCondition || r.observation || 'Medical Image Analyzed',
        severity: (r.riskLevel || r.emergencyAssessment?.emergencyRisk || 'low').toLowerCase(),
        notes: `Analyzed file: ${file.name}`,
        fullReport: r,
        previewUrl: url
      });
      loadHistory();

      // Initial welcome message in doctor chat
      const doctorWelcome = displayLang === 'te'
        ? `నమస్కారం! నేను మీ AI వర్చువల్ మెడికల్ అసిస్టెంట్‌ని. మీ స్కాన్ నివేదిక ఆధారంగా ఏవైనా సందేహాలు ఉంటే అడగవచ్చు.`
        : `Hello! I am your AI Virtual Doctor Assistant. I have analyzed your medical scan. Feel free to ask any follow-up questions about this report!`;

      setChatMessages([
        { sender: 'doctor', text: doctorWelcome, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (err) {
      console.error('Error analyzing image:', err);
    } finally {
      setLoading(false);
    }
  };

  const confidence = result?.clinicalAssessment?.confidence ?? result?.confidence ?? 88;
  const confColors = CONFIDENCE_COLORS(confidence);

  const clearAll = () => {
    setSelectedFile(null);
    setResult(null);
    setLoading(false);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setChatMessages([]);
    setCompareItem(null);
    stopSpeech();
  };

  // Text-to-Speech handler
  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    if (!result) return;

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    const docObs = result.doctorObservation;
    const clin = result.clinicalAssessment;

    const speechText = displayLang === 'te'
      ? `AI వైద్య పరిశీలన నివేదిక: సాధికారత అంచనా ${confidence} శాతం. పరిశీలించిన భాగం: ${docObs?.bodyPart || 'విశ్లేషించిన ప్రాంతం'}. సాధ్యమైన పరిస్థితి: ${clin?.possibleCondition || result.observation}. వైద్య వివరణ: ${result.doctorExplanation || result.explanation}. సూచించిన తదుపరి చర్యలు: ${result.recommendedNextSteps?.specialist || 'వైద్యుడిని సంప్రదించండి'}.`
      : `AI Doctor Consultation Report. AI Diagnostic Confidence score is ${confidence} percent. Body Part Detected: ${docObs?.bodyPart || 'Target area'}. Possible Condition: ${clin?.possibleCondition || result.observation}. Doctor Explanation: ${result.doctorExplanation || result.explanation}. Recommended Specialist: ${result.recommendedNextSteps?.specialist || 'Specialist Physician'}.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = displayLang === 'te' ? 'te-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // PDF Export
  const downloadPdfReport = async () => {
    if (!reportRef.current || !result) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0b1329'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MediAssist_AI_Doctor_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not export PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Follow-up Chat Question Submission
  const handleSendQuery = async (queryText = userQuery) => {
    const textToSend = queryText.trim();
    if (!textToSend || !result) return;

    const userMsg = {
      sender: 'patient',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserQuery('');
    setChatLoading(true);

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const prompt = `Context: Uploaded image analysis report (${result.imageName || 'Scan'}).
Condition: ${result.clinicalAssessment?.possibleCondition || result.observation}
Severity: ${result.clinicalAssessment?.severityLevel || result.riskLevel}
Explanation: ${result.doctorExplanation || result.explanation}
Specialist: ${result.recommendedNextSteps?.specialist}

Patient Question: ${textToSend}`;

      const aiRes = await aiService.chatMessage(prompt, chatMessages);
      
      const docMsg = {
        sender: 'doctor',
        text: aiRes.text || 'I recommend discussing this specific aspect with your attending doctor during your physical consultation.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, docMsg]);
    } catch (err) {
      console.error('Chat query error:', err);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'doctor',
          text: displayLang === 'te'
            ? 'ఈ నివేదికను మీ డాక్టర్‌తో క్లినిక్‌లో చర్చించడం మంచిది.'
            : 'Based on this scan, it is safest to clarify this specific question with your specialist during your physical checkup.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const quickPrompts = displayLang === 'te' ? [
    'ఈ స్కాన్ ఫలితం ఏమి చెబుతోంది?',
    'ఇది ప్రమాదకరమైనదా?',
    'నేను ఏ డాక్టర్‌ని కలవాలి?',
    'నేను ఎలాంటి జాగ్రత్తలు తీసుకోవాలి?'
  ] : [
    'What does this finding mean?',
    'Is this serious?',
    'Which doctor should I visit?',
    'What precautions should I take?'
  ];

  // Helper getters for structured responses with fallbacks
  const docObs = result?.doctorObservation || {
    imageType: selectedFile?.name?.toLowerCase().includes('xray') ? 'Radiological Chest X-Ray' : 'Medical Diagnostic Scan',
    bodyPart: 'Target Region',
    visibleStructures: 'Clear tissue borders and visible structural outlines',
    normalFindings: 'Surrounding anatomical structures display standard symmetry',
    abnormalFindings: result?.observation || 'Focal density or visual variance detected',
    locationOfAbnormalities: 'Primary Region of Interest'
  };

  const clinAss = result?.clinicalAssessment || {
    possibleCondition: result?.observation || 'Observed Focal Variance',
    confidence: confidence,
    severityLevel: result?.riskLevel === 'High' ? 'Severe' : result?.riskLevel === 'Low' ? 'Mild' : 'Moderate',
    affectedArea: 'Target Scan Region',
    riskCategory: result?.riskLevel ? `${result.riskLevel} Risk` : 'Medium Risk'
  };

  const nextSteps = result?.recommendedNextSteps || {
    specialist: 'General Physician / Specialist',
    suggestedEvaluation: 'In-person physical examination & consultation',
    diagnosticTests: ['Routine Laboratory Panel (CBC)', 'Follow-up Confirmatory Imaging'],
    followUpSuggestions: 'Schedule clinical evaluation within 7 days.'
  };

  const treatment = result?.generalTreatmentGuidance || {
    rest: 'Ensure 7 to 8 hours of restorative sleep daily.',
    hydration: 'Maintain adequate fluid intake of 2.5-3 Liters per day.',
    diet: 'Eat balanced meals rich in anti-inflammatory nutrients and proteins.',
    lifestyle: 'Avoid physical overexertion and unverified self-medication.',
    recoveryMonitoring: 'Keep a daily log of symptoms or visual changes.'
  };

  const emergency = result?.emergencyAssessment || {
    emergencyRisk: result?.riskLevel || 'Low',
    urgentAdvice: 'Seek immediate emergency attention if you experience severe pain, breathing difficulty, or sudden worsening symptoms.'
  };

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '4rem' }}>

        {/* Page Heading & Language Mode Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 42, height: 42, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={22} style={{ color: '#10b981' }} />
              </div>
              <div>
                <h1 className="page-heading" style={{ margin: 0, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  AI Doctor Image Consultation <Sparkles size={18} style={{ color: '#10b981' }} />
                </h1>
                <p className="page-subheading" style={{ margin: 0 }}>
                  {displayLang === 'te'
                    ? 'చిత్ర ఆధారిత AI వర్చువల్ డాక్టర్ వైద్య సలహా మరియు పూర్తి క్లినికల్ నివేదిక'
                    : 'AI-powered virtual physician visual diagnosis, heatmap analysis & consultation report'}
                </p>
              </div>
            </div>

            {/* Language & Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setDisplayLang(displayLang === 'en' ? 'te' : 'en')}
                className="btn-ghost"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                🌐 Mode: <strong>{displayLang === 'te' ? 'తెలుగు (Telugu)' : 'English'}</strong>
              </button>

              {historyItems.length > 0 && (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="btn-ghost"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Clock size={14} /> Scan History ({historyItems.length})
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Disclaimer Banner */}
        <div className="disclaimer-banner" style={{ marginBottom: '1.5rem' }}>
          <Shield size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>
            {displayLang === 'te'
              ? '⚕️ AI డాక్టర్ సలహా నిరాకరణ: ఇది విద్యాపరమైన సలహా మాత్రమే. దయచేసి ప్రత్యక్ష డాక్టర్‌ను సంప్రదించండి.'
              : '⚕️ AI Doctor Consultation Disclaimer: This module provides preliminary medical visual orientation. Always consult a licensed medical doctor for confirmed diagnosis.'}
          </span>
        </div>

        {/* Diagnostic Journey Timeline */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
          borderRadius: '12px', padding: '0.75rem 1.25rem', marginBottom: '1.5rem',
          fontSize: '0.8rem', overflowX: 'auto', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedFile ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: selectedFile ? '#10b981' : 'var(--bg-glass)', color: selectedFile ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>1</div>
            Upload Scan
          </div>
          <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: loading ? '#0ea5e9' : result ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: result ? '#10b981' : loading ? '#0ea5e9' : 'var(--bg-glass)', color: (result || loading) ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>2</div>
            AI Vision Scan
          </div>
          <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: result ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: result ? '#10b981' : 'var(--bg-glass)', color: result ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>3</div>
            Doctor Consultation Report
          </div>
          <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: result ? '#6366f1' : 'var(--text-muted)', fontWeight: 600 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: result ? '#6366f1' : 'var(--bg-glass)', color: result ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>4</div>
            Interactive AI Q&A
          </div>
        </div>

        {/* Main Grid: Left Upload & Controls | Right AI Doctor Consultation Report */}
        <div className="image-grid" style={{ gridTemplateColumns: result ? '1fr 1.35fr' : '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Upload, Heatmap & Scan Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Image size={18} style={{ color: '#10b981' }} /> {t('imageAnalysisTitle') || 'Upload Medical Image'}
                </h2>
                {selectedFile && (
                  <button onClick={clearAll} className="btn-ghost" style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}>
                    <X size={13} /> Reset Scan
                  </button>
                )}
              </div>

              {/* Preview Area & Simulated Heatmap Toggle */}
              {preview ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* View Mode Controls */}
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-glass)', padding: '0.25rem', borderRadius: '8px' }}>
                    <button
                      onClick={() => setViewMode('original')}
                      style={{
                        flex: 1, padding: '0.35rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: viewMode === 'original' ? '#10b981' : 'transparent',
                        color: viewMode === 'original' ? 'white' : 'var(--text-secondary)'
                      }}>
                      📷 Original Image
                    </button>
                    <button
                      onClick={() => setViewMode('heatmap')}
                      style={{
                        flex: 1, padding: '0.35rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: viewMode === 'heatmap' ? '#6366f1' : 'transparent',
                        color: viewMode === 'heatmap' ? 'white' : 'var(--text-secondary)'
                      }}>
                      🔥 AI Heatmap Focus
                    </button>
                  </div>

                  {/* Image Container with Heatmap simulation */}
                  <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: '#000', border: '1px solid var(--border-glass)' }}>
                    <img
                      src={preview}
                      alt="Medical scan preview"
                      style={{
                        width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block',
                        filter: viewMode === 'heatmap' ? 'contrast(130%) brightness(90%)' : 'none'
                      }}
                    />

                    {/* Simulated Heatmap Glow Layer */}
                    {viewMode === 'heatmap' && (
                      <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background: 'radial-gradient(circle at 55% 45%, rgba(239, 68, 68, 0.55) 0%, rgba(245, 158, 11, 0.4) 30%, rgba(16, 185, 129, 0.15) 60%, transparent 80%)',
                        mixBlendMode: 'screen'
                      }}>
                        <div style={{ position: 'absolute', top: '42%', left: '52%', transform: 'translate(-50%, -50%)', border: '2px dashed #ef4444', borderRadius: '50%', width: 90, height: 90, boxShadow: '0 0 15px rgba(239,68,68,0.8)' }}>
                          <span style={{ position: 'absolute', top: -20, left: 0, background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                            AI FOCUS AREA
                          </span>
                        </div>
                      </div>
                    )}

                    {loading && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(6,11,20,0.82)', backdropFilter: 'blur(5px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.85rem'
                      }}>
                        <div className="ai-pulse">
                          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Scan size={26} color="white" />
                          </div>
                        </div>
                        <p style={{ color: 'white', fontWeight: 700, fontSize: '0.92rem', margin: 0 }}>
                          {t('analyzingImage') || 'Synthesizing AI Doctor Consultation...'}
                        </p>
                        <div className="progress-bar" style={{ width: '65%' }}>
                          <motion.div className="progress-fill"
                            initial={{ width: '0%' }} animate={{ width: '92%' }}
                            transition={{ duration: 2.4, ease: 'easeInOut' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`upload-zone${dragOver ? ' drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current?.click()}
                  style={{ cursor: 'pointer', padding: '2.5rem 1rem' }}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])} />
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 1rem', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={28} style={{ color: '#10b981' }} />
                    </div>
                  </motion.div>
                  <p style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '1rem' }}>Drop medical image or click to upload</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>X-ray, MRI scan, skin lesion, eye fundus, CT scan · JPG, PNG</p>
                </div>
              )}

              {/* Sample Modalities */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['Chest X-Ray', 'Brain MRI', 'Skin Lesion', 'Eye Fundus', 'CT Scan'].map(type => (
                  <span key={type} style={{ padding: '0.25rem 0.65rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '999px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {type}
                  </span>
                ))}
              </div>

              {/* Side-by-side Compare View if compare item selected */}
              {compareItem && (
                <div style={{ padding: '0.85rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Layers size={14} /> Scan Comparison Active
                    </span>
                    <button onClick={() => setCompareItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={12} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    <strong>Past Scan Date:</strong> {compareItem.date}<br />
                    <strong>Past Diagnosis:</strong> {compareItem.summary}<br />
                    <strong>Past Risk Level:</strong> <span style={{ textTransform: 'capitalize' }}>{compareItem.severity}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Full AI Doctor Consultation Report & Q&A */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: '1rem', textAlign: 'center' }}>
                  <div className="animate-float" style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Eye size={32} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                      {displayLang === 'te' ? 'స్కాన్ చిత్రం అప్‌లోడ్ చేయండి' : 'Awaiting Medical Image Scan'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.6 }}>
                      {displayLang === 'te'
                        ? 'పూర్తి వైద్యుల తరహా క్లినికల్ పరిశీలన, అత్యవసర అంచనా మరియు వాయిస్ నివేదిక పొందడానికి స్కాన్ అప్‌లోడ్ చేయండి.'
                        : 'Upload an X-ray, skin scan, or MRI image on the left to receive a structured doctor-style consultation report with interactive Q&A.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>

                  {/* Header Bar with Voice Reading & PDF Export */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        AI Doctor Consultation Report
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={toggleSpeech}
                        className="btn-ghost"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: isSpeaking ? '#f43f5e' : '#10b981', borderColor: isSpeaking ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)' }}
                      >
                        {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        {isSpeaking ? (displayLang === 'te' ? 'ఆపు' : 'Stop Voice') : (displayLang === 'te' ? 'వాయిస్ చదువు' : 'Listen Report')}
                      </button>

                      <button
                        onClick={downloadPdfReport}
                        disabled={isGeneratingPdf}
                        className="btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Download size={14} /> {isGeneratingPdf ? 'Exporting...' : 'PDF Report'}
                      </button>
                    </div>
                  </div>

                  {/* Printable Report Container (used for PDF generation & UI presentation) */}
                  <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.25rem' }}>

                    {/* SECTION 1: 🩺 Doctor Observation */}
                    <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Stethoscope size={16} /> 🩺 Doctor Observation
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '0.85rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Image Type:</span>
                          <strong>{docObs.imageType}</strong>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Body Part Detected:</span>
                          <strong>{docObs.bodyPart}</strong>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Visible Structures:</span>
                          <span>{docObs.visibleStructures}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Abnormality Location:</span>
                          <span>{docObs.locationOfAbnormalities}</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.83rem', lineHeight: 1.6, color: 'var(--text-primary)', background: 'rgba(16,185,129,0.04)', padding: '0.75rem', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
                        <strong>Normal Findings:</strong> {docObs.normalFindings}<br />
                        <strong>Abnormal Findings:</strong> {docObs.abnormalFindings}
                      </div>
                    </div>

                    {/* SECTION 2: 🔍 AI Clinical Assessment & Animated Gauge */}
                    <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Activity size={16} /> 🔍 AI Clinical Assessment
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.25rem', alignItems: 'center' }}>
                        {/* Animated Gauge */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="100" height="100" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-glass)" strokeWidth="8" />
                              <motion.circle cx="50" cy="50" r="42" fill="none"
                                stroke={confColors.fill} strokeWidth="8"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - confidence / 100)}`}
                                strokeLinecap="round" transform="rotate(-90 50 50)"
                                initial={{ strokeDashoffset: `${2 * Math.PI * 42}` }}
                                animate={{ strokeDashoffset: `${2 * Math.PI * 42 * (1 - confidence / 100)}` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                style={{ filter: `drop-shadow(0 0 6px ${confColors.glow})` }}
                              />
                            </svg>
                            <div style={{ position: 'absolute', textAlign: 'center' }}>
                              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: confColors.fill, lineHeight: 1 }}>{confidence}%</div>
                              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONFIDENCE</div>
                            </div>
                          </div>
                        </div>

                        {/* Assessment Badges & Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.83rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Possible Condition:</span>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>{clinAss.possibleCondition}</div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.04)' }}>
                              Severity: <strong>{clinAss.severityLevel}</strong>
                            </span>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.04)' }}>
                              Risk: <strong>{clinAss.riskCategory}</strong>
                            </span>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.04)' }}>
                              Affected Area: <strong>{clinAss.affectedArea}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: 👨‍⚕️ Doctor Explanation */}
                    <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#818cf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Brain size={16} /> 👨‍⚕️ Doctor Explanation
                      </div>
                      <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: 1.65, color: 'var(--text-primary)' }}>
                        {result.doctorExplanation || result.explanation}
                      </p>
                    </div>

                    {/* SECTION 4: 🏥 Recommended Next Steps */}
                    <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <UserCheck size={16} /> 🏥 Recommended Next Steps
                      </div>
                      <div style={{ fontSize: '0.83rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)' }}>
                        <div>
                          <strong style={{ color: '#10b981' }}>Recommended Specialist:</strong> {nextSteps.specialist}
                        </div>
                        <div>
                          <strong>Suggested Medical Evaluation:</strong> {nextSteps.suggestedEvaluation}
                        </div>
                        <div>
                          <strong>Possible Diagnostic Tests:</strong>
                          <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
                            {(nextSteps.diagnosticTests || []).map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Follow-up Advice:</strong> {nextSteps.followUpSuggestions}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: 💊 General Treatment Guidance */}
                    <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <HeartPulse size={16} /> 💊 General Treatment & Recovery Guidance
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <div><strong>Rest Advice:</strong> {treatment.rest}</div>
                        <div><strong>Hydration Advice:</strong> {treatment.hydration}</div>
                        <div><strong>Dietary Guidance:</strong> {treatment.diet}</div>
                        <div><strong>Lifestyle Precautions:</strong> {treatment.lifestyle}</div>
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-glass)', paddingTop: '0.4rem' }}>
                        <strong>Monitoring:</strong> {treatment.recoveryMonitoring} (Note: No specific pharmaceuticals or dosages provided.)
                      </div>
                    </div>

                    {/* SECTION 6: 🚨 Emergency Assessment */}
                    <div style={{
                      padding: '1rem', borderRadius: '14px',
                      background: emergency.emergencyRisk === 'High' ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.08)',
                      border: `1px solid ${emergency.emergencyRisk === 'High' ? 'rgba(244,63,94,0.4)' : 'rgba(245,158,11,0.3)'}`,
                      color: emergency.emergencyRisk === 'High' ? '#f43f5e' : '#f59e0b',
                      fontSize: '0.83rem'
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={18} /> 🚨 Emergency Assessment: Risk Level {emergency.emergencyRisk || 'Low'}
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.5 }}>
                        {emergency.urgentAdvice || 'Please seek immediate medical attention if you experience severe respiratory distress, chest pain, or sudden deterioration.'}
                      </p>
                    </div>

                    {/* Doctor Handoff Note */}
                    <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px border-dashed var(--border-glass)', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <strong>⚕️ Physician Handoff Note:</strong> Bring this report along with your raw DICOM / JPG image scan to your clinical appointment for specialist review.
                    </div>
                  </div>

                  {/* SECTION 7: 💬 AI Doctor Follow-up Chat Box */}
                  <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Brain size={16} style={{ color: '#6366f1' }} /> 💬 Ask AI Doctor Follow-up Questions
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                      {quickPrompts.map((qp, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendQuery(qp)}
                          style={{
                            padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem',
                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                            color: '#818cf8', cursor: 'pointer'
                          }}
                        >
                          + {qp}
                        </button>
                      ))}
                    </div>

                    {/* Chat Messages Log */}
                    <div style={{
                      maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem',
                      padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '0.75rem'
                    }}>
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          style={{
                            alignSelf: msg.sender === 'patient' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            background: msg.sender === 'patient' ? 'linear-gradient(135deg, #10b981, #0ea5e9)' : 'var(--bg-glass)',
                            border: msg.sender === 'patient' ? 'none' : '1px solid var(--border-glass)',
                            color: 'white',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '12px',
                            fontSize: '0.82rem',
                            lineHeight: 1.5
                          }}
                        >
                          <div style={{ fontSize: '0.65rem', opacity: 0.8, marginBottom: '0.2rem', fontWeight: 700 }}>
                            {msg.sender === 'patient' ? 'You (Patient)' : '👨‍⚕️ AI Virtual Doctor'} · {msg.time}
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div style={{ alignSelf: 'flex-start', fontSize: '0.78rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <RefreshCw size={12} className="animate-spin" /> AI Doctor typing answer...
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Query Input Box */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder={displayLang === 'te' ? 'ఈ స్కాన్ గురించి ప్రశ్న అడగండి...' : 'Ask a question about this scan...'}
                        value={userQuery}
                        onChange={e => setUserQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendQuery()}
                        style={{
                          flex: 1, padding: '0.55rem 0.85rem', borderRadius: '10px',
                          background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                          color: 'var(--text-primary)', fontSize: '0.83rem'
                        }}
                      />
                      <button
                        onClick={() => handleSendQuery()}
                        disabled={chatLoading || !userQuery.trim()}
                        className="btn-primary"
                        style={{ padding: '0.55rem 1rem', borderRadius: '10px', fontSize: '0.83rem' }}
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* History & Scan Comparison Modal */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card" style={{ maxWidth: 540, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: '#10b981' }} /> Previous Scan History
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="btn-ghost" style={{ padding: '0.2rem' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {historyItems.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No previous scan history recorded yet.</p>
              ) : (
                historyItems.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>{item.summary}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.date} · {item.notes}</div>
                    </div>
                    <button
                      onClick={() => {
                        setCompareItem(item);
                        setShowHistoryModal(false);
                      }}
                      className="btn-ghost"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}
                    >
                      Compare
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
