import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { getHistory } from '../services/api';
import {
  LineElement, CategoryScale, LinearScale, PointElement,
  Chart as ChartJS, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Activity, Heart, TrendingUp, Calendar, AlertCircle,
  Stethoscope, FileText, Image, MessageSquare, Zap,
  Brain, Shield, ChevronRight, Sparkles, Clock, Bell, AlertTriangle
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AI_TIPS = [
  { icon: '💧', tip: 'Drink at least 8 glasses of water today — proper hydration improves cognitive function by up to 14%.' },
  { icon: '🚶', tip: 'A 20-minute brisk walk after meals reduces blood sugar spikes significantly.' },
  { icon: '😴', tip: 'Aim for 7-9 hours of sleep tonight. Sleep deprivation raises cortisol levels and weakens immunity.' },
  { icon: '🥗', tip: 'Include leafy greens in today\'s meals — spinach and broccoli are high in folate and iron.' },
  { icon: '🧘', tip: 'Try 5 minutes of deep breathing: inhale for 4 counts, hold for 4, exhale for 6. Lowers cortisol.' },
];

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isEmergency } = useEmergency();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [chats, setChats] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [tipIndex] = useState(() => Math.floor(Math.random() * AI_TIPS.length));

  useEffect(() => {
    // Load consultations
    setHistory(getHistory());
    
    // Load chats
    const storedChats = localStorage.getItem('mediassist-chats');
    setChats(storedChats ? JSON.parse(storedChats) : []);
    
    // Load emergency logs
    const storedEmergencies = localStorage.getItem('mediassist-emergencies');
    setEmergencies(storedEmergencies ? JSON.parse(storedEmergencies) : []);
  }, []);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: [72, 75, 68, 70, 74, 71, 69],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,0.08)',
        tension: 0.4, fill: true, pointRadius: 4,
        pointBackgroundColor: '#0ea5e9', pointBorderColor: 'var(--bg-base)', pointBorderWidth: 2
      },
      {
        label: 'Active Minutes',
        data: [30, 45, 20, 60, 40, 90, 50],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.06)',
        tension: 0.4, fill: true, pointRadius: 4,
        pointBackgroundColor: '#10b981', pointBorderColor: 'var(--bg-base)', pointBorderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } } },
      tooltip: { backgroundColor: 'rgba(13,22,38,0.9)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } }
    }
  };

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay }
  });

  const recentReports = history.filter(item => item.type === 'Report Analysis').slice(0, 3);
  const recentAnalyses = history.filter(item => item.type !== 'Report Analysis').slice(0, 3);

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '5rem' }}>
        
        {/* Welcome Card */}
        <motion.div {...cardAnim(0)} style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.06) 100%)',
            borderColor: 'var(--border-primary)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="trust-badge" style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', color: '#0ea5e9' }}>
                    <Sparkles size={12} /> AI HEALTH MONITOR
                  </span>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                  Welcome back, <span className="gradient-text">{user?.name || 'Health Explorer'}</span>
                </h1>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6 }}>
                  Review your diagnostic scans, medical report translations, and AI health checkups. Let's monitor your vitals and stay protected today.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => navigate('/symptom-checker')} className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                  <Stethoscope size={15} /> Symptom Check
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Vitals & Health Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Heart rate metric */}
          <motion.div {...cardAnim(0.1)} className="metric-card" style={{ padding: '1.25rem' }}>
            <div className="metric-icon" style={{ background: 'rgba(244,63,94,0.1)' }}>
              <Heart size={20} style={{ color: 'var(--color-rose)' }} />
            </div>
            <div>
              <div className="metric-label">{t('heartRate')}</div>
              <div className="metric-value" style={{ color: 'var(--color-rose)' }}>72 BPM</div>
            </div>
          </motion.div>

          {/* Active minutes metric */}
          <motion.div {...cardAnim(0.15)} className="metric-card" style={{ padding: '1.25rem' }}>
            <div className="metric-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <Activity size={20} style={{ color: 'var(--color-emerald)' }} />
            </div>
            <div>
              <div className="metric-label">{t('activeMinutes')}</div>
              <div className="metric-value" style={{ color: 'var(--color-emerald)' }}>47 min</div>
            </div>
          </motion.div>

          {/* Health Index score */}
          <motion.div {...cardAnim(0.2)} className="metric-card" style={{ padding: '1.25rem' }}>
            <div className="metric-icon" style={{ background: 'rgba(14,165,233,0.1)' }}>
              <TrendingUp size={20} style={{ color: '#0ea5e9' }} />
            </div>
            <div>
              <div className="metric-label">{t('healthScore')}</div>
              <div className="metric-value" style={{ color: '#0ea5e9' }}>94/100</div>
            </div>
          </motion.div>

          {/* Emergency status */}
          <motion.div {...cardAnim(0.25)} className="metric-card" style={{
            padding: '1.25rem',
            border: isEmergency ? '1px solid rgba(244,63,94,0.4)' : '1px solid var(--border-glass)',
            background: isEmergency ? 'rgba(244,63,94,0.06)' : 'var(--bg-card)'
          }}>
            <div className="metric-icon" style={{ background: isEmergency ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.1)' }}>
              <AlertTriangle size={20} style={{ color: isEmergency ? 'var(--color-rose)' : 'var(--color-emerald)' }} />
            </div>
            <div>
              <div className="metric-label">Emergency Status</div>
              <div className="metric-value" style={{ color: isEmergency ? 'var(--color-rose)' : 'var(--color-emerald)' }}>
                {isEmergency ? 'RED ALERT' : 'SECURE'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Grid: Vital Tracker & Notifications */}
        <div className="dash-middle-grid" style={{ marginBottom: '1.5rem' }}>
          {/* Vital Chart */}
          <motion.div {...cardAnim(0.3)}>
            <div className="glass-card" style={{ height: '100%', minHeight: '340px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
                Weekly Activity &amp; Health Summary
              </h3>
              <div style={{ height: '240px', position: 'relative' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </motion.div>

          {/* Notifications Panel */}
          <motion.div {...cardAnim(0.35)}>
            <div className="glass-card" style={{ height: '100%' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: '#f59e0b' }} />
                Real-Time Health Notifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {isEmergency && (
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--color-rose)' }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Critical Warning:</strong> High risk symptoms detected recently. Please check the Emergency hotline details immediately.
                    </div>
                  </div>
                )}
                {[
                  { title: 'Vitamin D Checkup', msg: 'Your parsed laboratory report indicates borderline low levels. Consult a GP.', time: '2h ago' },
                  { title: 'Hydration Target', msg: 'Remember to track your daily fluid intake. Take a quick hydration check.', time: '5h ago' },
                  { title: 'Multilingual Support', msg: 'Telugu, Hindi, Tamil, Kannada, Malayalam, and English are fully synced.', time: '1d ago' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{item.title}</strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.time}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem' }}>{item.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lower Grid: Quick Actions & Recent Files */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* Quick Actions */}
          <motion.div {...cardAnim(0.4)}>
            <div className="glass-card" style={{ height: '100%' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} style={{ color: '#f59e0b' }} />
                Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { name: 'Symptom Checker', to: '/symptom-checker', icon: Stethoscope, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
                  { name: 'Report Analyzer', to: '/report-analyzer', icon: FileText, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                  { name: 'Image Analyzer', to: '/image-analysis', icon: Image, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                  { name: 'Health Chatbot', to: '/chat', icon: MessageSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(act.to)}
                    style={{
                      background: act.bg,
                      border: `1px solid ${act.color}25`,
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: act.color,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <act.icon size={22} />
                    {act.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent AI Analyses & Chats */}
          <motion.div {...cardAnim(0.45)}>
            <div className="glass-card" style={{ height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} style={{ color: 'var(--color-primary)' }} />
                  Recent Analyses &amp; Reports
                </h3>
                <Link to="/records" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {history.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    No diagnostic records saved yet.
                  </div>
                ) : history.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/records')}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                  >
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {item.type}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.summary}</div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent AI Chats */}
          <motion.div {...cardAnim(0.5)}>
            <div className="glass-card" style={{ height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} style={{ color: 'var(--color-accent)' }} />
                  Recent Chat History
                </h3>
                <Link to="/records" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {chats.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    No recent chat history found.
                  </div>
                ) : chats.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/records')}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                  >
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Chat Session • {item.date}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.summary}</div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Health Advice Tip */}
        <motion.div {...cardAnim(0.55)} style={{ marginTop: '1.5rem' }}>
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.06))',
            borderColor: 'var(--border-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '12px',
                background: 'var(--gradient-primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontSize: '1.2rem'
              }}>
                {AI_TIPS[tipIndex].icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('aiHealthTipTitle')}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
                  {AI_TIPS[tipIndex].tip}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
