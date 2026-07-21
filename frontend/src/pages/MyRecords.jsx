import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../context/LanguageContext';
import { getHistory } from '../services/api';
import {
  FileText, Search, Trash2, Download, Eye, Calendar,
  AlertCircle, ChevronRight, X, Heart, Shield, HelpCircle,
  MessageSquare, Stethoscope, Image, AlertTriangle
} from 'lucide-react';

const TYPE_CONFIG = {
  'Symptom Check': { icon: Stethoscope, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  'Report Analysis': { icon: FileText, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  'Image Analysis': { icon: Image, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'AI Chat': { icon: MessageSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'Emergency': { icon: AlertTriangle, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' }
};

export default function MyRecords() {
  const { t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Load records from local storage
  const loadRecords = () => {
    // 1. Consultations
    const consults = getHistory();
    
    // 2. Chat History
    const storedChats = localStorage.getItem('mediassist-chats');
    const chats = storedChats ? JSON.parse(storedChats) : [];
    
    // 3. Emergency History
    const storedEmergencies = localStorage.getItem('mediassist-emergencies');
    const emergencies = storedEmergencies ? JSON.parse(storedEmergencies) : [];

    const all = [...consults, ...chats, ...emergencies];
    setRecords(all);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleDelete = (id, type) => {
    if (type === 'AI Chat') {
      const storedChats = localStorage.getItem('mediassist-chats');
      const chats = storedChats ? JSON.parse(storedChats) : [];
      const updated = chats.filter(c => c.id !== id);
      localStorage.setItem('mediassist-chats', JSON.stringify(updated));
    } else if (type === 'Emergency') {
      const storedEmergencies = localStorage.getItem('mediassist-emergencies');
      const emergencies = storedEmergencies ? JSON.parse(storedEmergencies) : [];
      const updated = emergencies.filter(e => e.id !== id);
      localStorage.setItem('mediassist-emergencies', JSON.stringify(updated));
    } else {
      const consults = getHistory();
      const updated = consults.filter(c => c.id !== id);
      localStorage.setItem('mediassist-consultations', JSON.stringify(updated));
    }
    loadRecords();
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleDownload = (record) => {
    if (record.type === 'AI Chat') {
      // Download chat history as a txt file
      const transcript = record.messages
        .map(m => `[${m.time || 'Time'}] ${m.type === 'user' ? 'USER' : 'AI'}: ${m.text}`)
        .join('\n\n');
      const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MediAssist_Chat_${record.date.replace(/[/:\s]/g, '_')}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Default to PDF download using jsPDF
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(14, 165, 233);
      doc.text(`MediAssist AI — ${record.type} Report`, 20, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`Record Date: ${record.date}`, 20, 28);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 32, 190, 32);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text('Summary / Assessment:', 20, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(record.summary || 'N/A', 20, 48, { maxWidth: 170 });

      doc.setFont('helvetica', 'bold');
      doc.text('Severity:', 20, 64);
      doc.setFont('helvetica', 'normal');
      doc.text((record.severity || 'medium').toUpperCase(), 20, 70);

      if (record.notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Clinical Assessment & Recommendations:', 20, 82);
        doc.setFont('helvetica', 'normal');
        doc.text(record.notes, 20, 88, { maxWidth: 170 });
      }

      // Add a footer disclaimer
      doc.setFillColor(245, 158, 11);
      doc.rect(20, 255, 170, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('DISCLAIMER: AI-generated report for information only. Consult a physician in case of severe symptoms.', 22, 266);

      doc.save(`MediAssist_${record.type.replace(/\s+/g, '_')}_${record.id}.pdf`);
    }
  };

  // Filter & Sort logic
  const filteredRecords = records
    .filter(r => {
      const matchSearch = (r.summary?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (r.notes?.toLowerCase() || '').includes(search.toLowerCase());
      const matchFilter = filterType === 'All' || r.type === filterType;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      return (a.summary || '').localeCompare(b.summary || '');
    });

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '5rem' }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 36, height: 36, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h1 className="page-heading" style={{ margin: 0 }}>My Health Records</h1>
          </div>
          <p className="page-subheading">View, filter, sort, and download all diagnostic logs, report evaluations, and chat consultations.</p>
        </motion.div>

        {/* Global Disclaimer Banner */}
        <div className="disclaimer-banner" style={{ marginBottom: '2rem' }}>
          <Shield size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>{t('disclaimer')}</span>
        </div>

        {/* Controls Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '1rem'
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem', height: 42 }}
            />
          </div>

          {/* Filter Type */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="lang-select"
              style={{ width: '160px', height: 42, background: 'var(--bg-glass)' }}
            >
              <option value="All">All Types</option>
              <option value="Symptom Check">Symptom Check</option>
              <option value="Report Analysis">Report Analysis</option>
              <option value="Image Analysis">Image Analysis</option>
              <option value="AI Chat">AI Chat History</option>
              <option value="Emergency">Emergency History</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="lang-select"
              style={{ width: '140px', height: 42, background: 'var(--bg-glass)' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">A - Z</option>
            </select>
          </div>
        </motion.div>

        {/* Records Listing */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <AnimatePresence>
            {filteredRecords.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  color: 'var(--text-secondary)'
                }}
              >
                No records found matching your filters.
              </motion.div>
            ) : (
              filteredRecords.map((record) => {
                const conf = TYPE_CONFIG[record.type] || { icon: FileText, color: 'var(--color-accent)', bg: 'rgba(99,102,241,0.1)' };
                const Icon = conf.icon;
                return (
                  <motion.div
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      boxShadow: 'var(--shadow-card)',
                      transition: 'border-color 0.25s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '12px',
                        background: conf.bg, border: `1px solid ${conf.color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Icon size={20} style={{ color: conf.color }} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: conf.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {record.type}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={10} /> {record.date}
                          </span>
                          {record.severity && (
                            <span style={{
                              fontSize: '0.62rem', fontWeight: 800, padding: '0.05rem 0.35rem', borderRadius: '4px',
                              background: record.severity === 'critical' || record.severity === 'high' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
                              color: record.severity === 'critical' || record.severity === 'high' ? 'var(--color-rose)' : 'var(--color-emerald)',
                              textTransform: 'uppercase'
                            }}>
                              {record.severity}
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {record.summary || 'Consultation Session'}
                        </h3>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedRecord(record)}
                        className="btn-ghost"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={12} /> View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(record)}
                        className="btn-ghost"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Download size={12} /> Download
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, background: 'rgba(244,63,94,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(record.id, record.type)}
                        style={{
                          background: 'none', border: '1px solid rgba(244,63,94,0.2)',
                          color: 'var(--color-rose)', borderRadius: '10px', width: 32, height: 32,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* View Details Modal */}
        <AnimatePresence>
          {selectedRecord && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem', background: 'rgba(6,11,20,0.65)', backdropFilter: 'blur(8px)'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '580px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.1rem 0.5rem', borderRadius: '4px', background: 'var(--bg-glass)', color: 'var(--color-primary)' }}>
                      {selectedRecord.type}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0 0' }}>{selectedRecord.summary || 'Session Details'}</h2>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                      <Calendar size={12} /> Registered on {selectedRecord.date}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {selectedRecord.severity && (
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Severity Level</div>
                      <span style={{
                        fontSize: '0.8rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px',
                        background: selectedRecord.severity === 'critical' || selectedRecord.severity === 'high' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
                        color: selectedRecord.severity === 'critical' || selectedRecord.severity === 'high' ? 'var(--color-rose)' : 'var(--color-emerald)',
                        textTransform: 'uppercase'
                      }}>
                        {selectedRecord.severity}
                      </span>
                    </div>
                  )}

                  {selectedRecord.notes && (
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Clinical Evaluation</div>
                      <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: 'var(--bg-glass)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        {selectedRecord.notes}
                      </p>
                    </div>
                  )}

                  {selectedRecord.messages && (
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Chat Transcript</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto', background: 'var(--bg-glass)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        {selectedRecord.messages.map((m, idx) => (
                          <div key={idx} style={{ padding: '0.4rem', borderRadius: '8px', background: m.type === 'user' ? 'rgba(255,255,255,0.02)' : 'rgba(14,165,233,0.04)' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: m.type === 'user' ? 'var(--text-secondary)' : 'var(--color-primary)' }}>
                              {m.type === 'user' ? 'User' : 'Assistant'} • {m.time}
                            </div>
                            <div style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>{m.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-glass)', marginTop: '1.5rem', paddingTop: '1rem' }}>
                  <button className="btn-ghost" onClick={() => setSelectedRecord(null)}>Close</button>
                  <button className="btn-primary" onClick={() => handleDownload(selectedRecord)}>
                    <Download size={14} /> Download File
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
