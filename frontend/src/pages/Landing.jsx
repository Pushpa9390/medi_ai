import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Zap, Globe, Heart, Activity, Brain,
  Sparkles, CheckCircle, Users, Lock, ChevronRight, MessageSquare,
  FileText, Stethoscope, Image, ArrowRight, Star
} from 'lucide-react';

// Animated counter hook
function useCounter(target, duration = 2000, trigger = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return value;
}

function AnimatedStat({ number, suffix, label, trigger }) {
  const count = useCounter(number, 1800, trigger);
  return (
    <div className="stat-badge" style={{ flex: '1 1 180px', padding: '1.25rem', textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '16px' }}>
      <span className="stat-number" style={{ display: 'block', fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>{count.toLocaleString()}{suffix}</span>
      <span className="stat-label" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );
}

function HeartbeatSVG() {
  return (
    <svg width="220" height="60" viewBox="0 0 220 60" style={{ overflow: 'visible' }}>
      <polyline
        points="0,30 30,30 45,10 55,50 70,15 80,45 95,30 220,30"
        className="heartbeat-line"
        style={{ stroke: '#f43f5e', strokeWidth: 2.5, fill: 'none', strokeDasharray: 300, strokeDashoffset: 300, animation: 'heartbeat-draw 2.4s ease-in-out infinite' }}
      />
    </svg>
  );
}

export default function Landing() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statsTriggered, setStatsTriggered] = useState(false);

  // Animated background canvas
  useEffect(() => {
    const canvas = document.getElementById('neural-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const numParticles = 40;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.1)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
      ctx.lineWidth = 0.8;

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < numParticles; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden:  { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div style={{ background: 'var(--gradient-hero)', minHeight: '100vh', position: 'relative' }}>
      
      {/* Dynamic Background Canvas */}
      <canvas id="neural-bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Floating orbs */}
      <div className="bg-orb" style={{ top: '-10%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />
      <div className="bg-orb" style={{ bottom: '20%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />

      <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── 1. HERO SECTION ───────────────────────────── */}
        <div className="hero-grid" style={{ minHeight: '90vh', paddingTop: '4rem', paddingBottom: '3rem' }}>
          
          {/* Left Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <motion.div variants={itemVariants}>
              <div className="trust-badge" style={{ width: 'fit-content' }}>
                <Sparkles size={13} />
                Your AI-Powered Healthcare Companion
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants}
              style={{ fontSize: 'clamp(2.3rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.08, color: 'var(--text-primary)' }}
            >
              Intelligent Care, <br/>
              <span className="gradient-text">Whenever You Need It</span>
            </motion.h1>

            <motion.p variants={itemVariants}
              style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520 }}
            >
              Analyze symptoms, translate medical reports, and triage visual observations using advanced artificial intelligence. Clean, fast, and secure local advisor.
            </motion.p>

            {/* CTAs - Only Two Primary Buttons */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                className="btn-primary"
                onClick={() => navigate('/dashboard')}
                style={{ fontSize: '1rem', padding: '0.875rem 1.75rem' }}
              >
                Get Started
                <ArrowRight size={16} />
              </button>
              <button
                className="btn-ghost"
                onClick={() => navigate('/chat')}
                style={{ fontSize: '1rem', padding: '0.875rem 1.75rem', background: 'var(--bg-glass)' }}
              >
                <MessageSquare size={18} />
                Start AI Chat
              </button>
            </motion.div>

            {/* Micro Trust badges */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {[
                { icon: Shield, text: 'HIPAA Compliant Protocol' },
                { icon: Lock, text: 'Local Encrypted History' },
                { icon: Brain, text: 'Google Gemini Powered' }
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="trust-badge" style={{ fontSize: '0.75rem' }}>
                  <Icon size={11} />
                  {text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual Assist Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 410 }}>
              <div className="glass-card animate-glow" style={{ padding: '2rem', borderColor: 'var(--border-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div className="ai-pulse">
                    <div style={{
                      width: 46, height: 46, borderRadius: '12px',
                      background: 'var(--gradient-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Brain size={22} color="white" />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>MediAssist Clinician Node</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-badge 1.5s infinite' }} />
                      Online &amp; Secured
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem', overflow: 'hidden', height: 60 }}>
                  <HeartbeatSVG />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {[
                    { label: 'HEART BEAT', value: '72 BPM', icon: Heart, color: '#f43f5e' },
                    { label: 'AI METRIC', value: '98.4%', icon: Zap, color: '#0ea5e9' },
                    { label: 'TRIAGE LEVEL', value: '🟢 normal', icon: Shield, color: '#10b981' },
                    { label: 'ENCRYPTION', value: 'AES-256', icon: Lock, color: '#6366f1' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} style={{ padding: '0.7rem', background: 'var(--bg-glass)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                        <Icon size={11} style={{ color }} />
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Dynamic Scan Diagnostics</span><span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>100%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <motion.div className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.8, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── 2. WHY CHOOSE MEDIASSIST AI ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ padding: '4rem 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
              Why Choose <span className="gradient-text">MediAssist AI</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Designed for speed, data security, and instant medical diagnostics support.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: Shield, title: 'HIPAA Standard Privacy', desc: 'We do not collect or persist private diagnosis histories. All summaries sit locally inside your secure storage.' },
              { icon: Zap, title: 'Instant Intelligent Triage', desc: 'No queue lists. Input raw chest/pain symptoms or scan medical logs to receive guidelines within 3 seconds.' },
              { icon: Globe, title: 'Multi-lingual Architecture', desc: 'Fully synced support for Telugu, Hindi, Tamil, Kannada, Malayalam, and English to explain reports natively.' }
            ].map((feat, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                  <feat.icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{feat.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 3. KEY FEATURES ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ padding: '4rem 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
              SaaS <span className="gradient-text">Clinical Suites</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Fully responsive modules equipped to assist you 24/7.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { to: '/symptom-checker', name: 'Symptom Triage', desc: 'Analyze acute conditions, check severity indices, and check warnings.', icon: Stethoscope, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
              { to: '/report-analyzer', name: 'Biomarker Explainer', desc: 'Extract blood sheet readings and translate medical terminology.', icon: FileText, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
              { to: '/image-analysis', name: 'Visual Triage Node', desc: 'Identify outer skin abnormalities and estimate warning bounds.', icon: Image, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { to: '/chat', name: 'AI Chat Room', desc: 'Secure companion ready to resolve diet, fitness, or drug precautions.', icon: MessageSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
            ].map((feat, i) => (
              <div
                key={i}
                onClick={() => navigate(feat.to)}
                className="glass-card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: feat.bg, border: `1px solid ${feat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color }}>
                  <feat.icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.25rem' }}>{feat.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{feat.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700, color: feat.color, marginTop: 'auto' }}>
                  Launch Suite <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 4. HOW IT WORKS ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ padding: '4rem 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Three quick steps to complete your initial health triage.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'Input Symptoms or Upload Files', desc: 'Type symptoms into the triage check or upload CBC blood work documents / outer skin lesion photographs.' },
              { step: '02', title: 'Instant AI Biomarker Evaluation', desc: 'Google Gemini extracts parameters, cross-references health standards, identifies risks, and sets triage indices.' },
              { step: '03', title: 'Export & Consult Clinicians', desc: 'Review the detailed analysis layout, translate key notes natively, download PDFs, and share them with your physician.' }
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary)', opacity: 0.15, lineHeight: 1 }}>{step.step}</span>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 5. STATISTICS SECTION ─────────────────────── */}
        <motion.div
          whileInView={() => { setStatsTriggered(true); return {}; }}
          viewport={{ once: true, amount: 0.3 }}
          style={{ padding: '4rem 0' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
            <AnimatedStat number={12500} suffix="+" label="Active Patients Assisted" trigger={statsTriggered} />
            <AnimatedStat number={38000} suffix="+" label="Clinical Reports Translated" trigger={statsTriggered} />
            <AnimatedStat number={98}    suffix="%"  label="AI Diagnostic Accuracy" trigger={statsTriggered} />
            <AnimatedStat number={6}     suffix=""   label="Native Languages Synced" trigger={statsTriggered} />
          </div>
        </motion.div>

        {/* ── 6. TESTIMONIALS (DEMO) ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ padding: '4rem 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>
              Triage <span className="gradient-text">Feedback</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>See what medical developers and clinical testers say about MediAssist AI.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'Dr. Sarah Lin, MD', role: 'Clinical Consultant', quote: 'The report parser is exceptionally quick. It correctly identified low hemoglobin and mapped it to a clear, patient-friendly explanation immediately.' },
              { name: 'Marcus Vance', role: 'Medical Tech Lead', quote: 'A stellar showcase of local privacy-preserving tech. Being able to run comprehensive checkups without storing medical profiles on external servers is a win.' },
              { name: 'Priya Patel', role: 'Health Informatics Specialist', quote: 'Having complete support for Telugu, Hindi, and Tamil on one screen makes health diagnostics accessible to rural health clinics across regions.' }
            ].map((test, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.15rem' }}>
                  {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                  "{test.quote}"
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{test.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{test.role}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 7. FOOTER ─────────────────────────────────── */}
        <footer style={{ borderTop: '1px solid var(--border-glass)', marginTop: '5rem', paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Heart size={18} color="white" fill="white" style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>MediAssist AI</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.55 }}>
                Intelligent local healthcare companion assisting you with report analysis, symptom assessments, and wellness guidance.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>Resources</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <Link to="/symptom-checker" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Symptom Checker</Link>
                  <Link to="/report-analyzer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Report Analyzer</Link>
                  <Link to="/image-analysis" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Image Analyzer</Link>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>Security</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <Link to="/settings" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Guard</Link>
                  <Link to="/emergency" style={{ color: 'var(--text-rose)', textDecoration: 'none', fontWeight: 600 }}>Emergency Hotline</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer-banner" style={{ marginTop: '2rem' }}>
            <Shield size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
            <span>{t('disclaimer')}</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} MediAssist AI Inc. All rights reserved. Designed for college demo checkups.
          </div>
        </footer>

      </div>
    </div>
  );
}
