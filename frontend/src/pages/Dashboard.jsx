import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHistory } from '../services/api';
import GlassCard from '../components/GlassCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  LineElement, CategoryScale, LinearScale, PointElement,
  Chart as ChartJS, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  LayoutDashboard, History, Heart, Calendar, ArrowRight,
  TrendingUp, Activity, Compass, AlertCircle
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Chart configs for Health parameter progress tracking
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Heart Rate (BPM average)',
        data: [72, 75, 68, 70, 74, 71, 69],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Active Minutes',
        data: [30, 45, 20, 60, 40, 90, 50],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8' }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '80px' }}>
        
        <DisclaimerBanner style={{ marginBottom: '2rem' }} />

        {/* Dashboard grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
          
          {/* Top Row: Metrics Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', background: 'rgba(14,165,233,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity className="text-sky-400" size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Consultations</span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{history.length} Total</h4>
              </div>
            </GlassCard>

            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart className="text-emerald-400" size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Systemic Risk Status</span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#10b981' }}>Low Risk</h4>
              </div>
            </GlassCard>

            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp className="text-indigo-400" size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Health Index Score</span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>94 / 100</h4>
              </div>
            </GlassCard>
          </div>

          {/* Middle Row: Progress Charts & Consultation logs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="dash-middle-grid">
            
            {/* Chart tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard style={{ height: '100%' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp className="text-sky-400" /> Patient Activity & Vitals Tracker
                </h3>
                <div style={{ minHeight: '220px' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </GlassCard>
            </motion.div>

            {/* Previous consultation list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlassCard style={{ height: '100%' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <History className="text-indigo-400" /> Consultations & Activity Log
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
                  {history.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No consultations registered yet.
                    </div>
                  ) : (
                    history.map((record) => {
                      const isHigh = record.severity === 'high' || record.severity === 'critical';
                      return (
                        <div
                          key={record.id}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border-glass)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(14, 165, 233, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                {record.type}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Calendar size={10} /> {record.date}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {record.summary}
                            </h4>
                          </div>

                          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: isHigh ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                                color: isHigh ? '#ef4444' : '#10b981'
                              }}
                            >
                              <AlertCircle size={10} />
                              {record.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </GlassCard>
            </motion.div>

          </div>

        </div>

      </div>

      <style>{`
        .dash-middle-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .dash-middle-grid {
            grid-template-columns: 1.2fr 0.8fr;
          }
        }
      `}</style>
    </div>
  );
}
