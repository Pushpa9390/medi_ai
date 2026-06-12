import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergency } from '../context/EmergencyContext';
import GlassCard from '../components/GlassCard';

import VoiceInput, { speakText } from '../components/VoiceInput';
import { Send, Trash2, Bot, User, Sparkles, Volume2, AlertTriangle, Info } from 'lucide-react';

// ─────────────────────────────────────────────
// AI Knowledge Engine — keyword-matched cards
// ─────────────────────────────────────────────
function buildAIResponse(message) {
  const lower = message.toLowerCase();
  const cards = [];
  let matched = false;

  // Emergency check
  if (
    lower.includes('chest pain') || lower.includes('heart attack') ||
    lower.includes('stroke') || lower.includes('can\'t breathe') ||
    lower.includes('unconscious') || lower.includes('severe bleeding')
  ) {
    return {
      type: 'emergency',
      greeting: '⚠️ Emergency Detected',
      cards: [{
        icon: '🚨', color: '#ef4444',
        title: 'Emergency Warning',
        points: [
          'These symptoms may indicate a life-threatening condition.',
          'Do NOT wait — call 112 or 911 immediately.',
          'Keep the person calm and still.',
          'Do not give food or water.',
        ],
        badge: { label: 'CRITICAL', color: '#ef4444' }
      }],
      disclaimer: null
    };
  }

  const greetingOptions = [
    'Hi there! 👋 I am your MediAssist AI health companion.',
    'Hello! 🩺 Ready to help with your health questions.',
    'Greetings! 💊 I am here to guide you on health and wellness.',
  ];
  const greeting = greetingOptions[Math.floor(Math.random() * greetingOptions.length)];

  if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('food') || lower.includes('eat') || lower.includes('weight') || lower.includes('meal')) {
    matched = true;
    cards.push({
      icon: '🥗', color: '#10b981',
      title: 'Nutrition & Diet',
      points: [
        'Lean proteins: poultry, fish, legumes, tofu',
        'Complex carbs: oats, brown rice, quinoa',
        'Healthy fats: olive oil, avocados, nuts, seeds',
        'Fill half your plate with colorful vegetables',
        'Drink 2–3 liters of water daily',
        'Limit added sugars and ultra-processed foods',
      ],
      tip: 'A registered dietitian can build a plan tailored to your metabolism.',
    });
  }

  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired') || lower.includes('rest') || lower.includes('night') || lower.includes('wake up')) {
    matched = true;
    cards.push({
      icon: '😴', color: '#6366f1',
      title: 'Sleep Hygiene',
      points: [
        'Keep a consistent sleep–wake schedule daily',
        'Bedroom temp: 18°C / 65°F — cool, dark, quiet',
        'No screens 45–60 min before bed (blue light)',
        'Avoid caffeine after 2 PM',
        'Try deep breathing or progressive muscle relaxation',
        'Avoid heavy meals or intense exercise near bedtime',
      ],
      tip: 'Adults need 7–9 hours of quality sleep per night.',
    });
  }

  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('cardio') || lower.includes('fitness') || lower.includes('walk')) {
    matched = true;
    cards.push({
      icon: '🏋️', color: '#f59e0b',
      title: 'Exercise & Fitness',
      points: [
        '150 min/week of moderate aerobic activity (WHO)',
        'Strength training: all muscle groups, 2x/week',
        'Always warm up 5–10 min before exercising',
        'Cool down and stretch after every session',
        'Gradually increase intensity — avoid overexertion',
        'Stay hydrated before, during, and after workouts',
      ],
      warning: 'Consult a doctor before starting high-intensity programs.',
    });
  }

  if (lower.includes('paracetamol') || lower.includes('ibuprofen') || lower.includes('aspirin') || lower.includes('medicine') || lower.includes('medication') || lower.includes('drug') || lower.includes('tablet') || lower.includes('pill') || lower.includes('crocin') || lower.includes('brufen')) {
    matched = true;
    cards.push({
      icon: '💊', color: '#0ea5e9',
      title: 'Medication Information',
      points: [
        'Paracetamol: max 4000 mg/day — never exceed (liver risk)',
        'Ibuprofen: always take with food, avoid with ulcers',
        'Aspirin: not for children under 16 (Reye\'s syndrome)',
        'Never combine OTC pain relievers without guidance',
        'Check all product labels for exact dosing instructions',
      ],
      warning: '⚠️ Always consult a pharmacist before changing dosage.',
    });
  }

  if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('mental') || lower.includes('depress') || lower.includes('worry') || lower.includes('sad') || lower.includes('relax') || lower.includes('mood')) {
    matched = true;
    cards.push({
      icon: '🧠', color: '#8b5cf6',
      title: 'Mental Well-being',
      points: [
        '5–10 min daily meditation lowers cortisol levels',
        'Exercise releases natural endorphins — best antidepressant',
        'Maintain social connections — talk to someone you trust',
        '4-7-8 breathing technique reduces acute anxiety fast',
        'Limit alcohol, news overload, and doom-scrolling',
        'Seek a licensed therapist if symptoms persist 2+ weeks',
      ],
      tip: 'Seeking help is a sign of strength, not weakness. 💪',
    });
  }

  if (lower.includes('vitamin') || lower.includes('supplement') || lower.includes('calcium') || lower.includes('iron') || lower.includes('b12') || lower.includes('deficien') || lower.includes('mineral')) {
    matched = true;
    cards.push({
      icon: '🧪', color: '#14b8a6',
      title: 'Vitamins & Supplements',
      points: [
        'Vitamin D3: bone density, immunity — get sun daily',
        'B12: nerve health, RBC — vegetarians often need supplements',
        'Iron: take with Vitamin C, avoid with tea or calcium',
        'Calcium + Magnesium: bones, muscles, nerve function',
        'Omega-3: heart and brain health — found in fatty fish',
      ],
      warning: 'Run a blood panel before starting high-dose supplements.',
    });
  }

  if (lower.includes('cough') || lower.includes('cold') || lower.includes('fever') || lower.includes('flu') || lower.includes('throat') || lower.includes('congestion') || lower.includes('runny nose') || lower.includes('sore')) {
    matched = true;
    cards.push({
      icon: '🤧', color: '#f97316',
      title: 'Cold, Cough & Fever',
      points: [
        'Warm fluids: herbal tea, honey-lemon water, broth',
        'Rest — let your immune system fight the infection',
        'Steam inhalation clears nasal congestion fast',
        'Saltwater gargle (¼ tsp in warm water) soothes throat',
        'Monitor temperature — normal is 36–37.5°C',
        'OTC antihistamines help with runny nose / sneezing',
      ],
      warning: 'Seek care if fever exceeds 39°C or lasts more than 3 days.',
    });
  }

  if (lower.includes('skin') || lower.includes('acne') || lower.includes('rash') || lower.includes('mole') || lower.includes('dry skin') || lower.includes('itch')) {
    matched = true;
    cards.push({
      icon: '🧴', color: '#ec4899',
      title: 'Skin Health',
      points: [
        'Hydrate skin daily with fragrance-free moisturizer',
        'Use SPF 30+ sunscreen every day — even on cloudy days',
        'Acne: avoid touching face, use non-comedogenic products',
        'Monitor moles using ABCDE: Asymmetry, Border, Color, Diameter, Evolving',
        'Gentle cleansing twice daily — avoid harsh soaps',
      ],
      tip: 'See a dermatologist if any mole changes shape or bleeds.',
    });
  }

  if (lower.includes('blood pressure') || lower.includes('hypertension') || lower.includes('bp') || lower.includes('cholesterol') || lower.includes('diabetes') || lower.includes('sugar')) {
    matched = true;
    cards.push({
      icon: '❤️', color: '#ef4444',
      title: 'Chronic Condition Tips',
      points: [
        'Blood pressure: target below 120/80 mmHg',
        'Reduce sodium intake to under 2300 mg/day',
        'Cholesterol: limit saturated fats and trans fats',
        'Blood sugar: choose low glycaemic index foods',
        'Regular monitoring is key — track your readings daily',
        'Medication adherence is critical — never skip doses',
      ],
      warning: 'Work closely with your doctor to manage chronic conditions.',
    });
  }

  // Hello / Help / Intro
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help') || lower.includes('what can') || lower.includes('tell me about yourself')) {
    matched = true;
    cards.push({
      icon: '🩺', color: '#0ea5e9',
      title: 'What I Can Help With',
      points: [
        '🥗 Nutrition & Diet guidance',
        '😴 Sleep hygiene & insomnia tips',
        '🏋️ Exercise & fitness routines',
        '💊 Medication precautions',
        '🧠 Mental health & stress management',
        '🧪 Vitamins & supplements advice',
        '🤧 Common illness home care',
        '❤️ Chronic condition lifestyle tips',
      ],
      tip: 'Ask me anything from the list above!',
    });
  }

  if (!matched) {
    cards.push({
      icon: '💬', color: '#6366f1',
      title: 'How Can I Help?',
      points: [
        '🥗 Diet, nutrition & healthy eating',
        '😴 Sleep, rest & energy',
        '🏋️ Exercise & fitness',
        '💊 Common medications',
        '🧠 Stress, anxiety & mental health',
        '🤧 Cough, fever & cold',
        '❤️ Blood pressure, diabetes, cholesterol',
      ],
      tip: 'Please specify your question for detailed guidance!',
    });
  }

  return {
    type: 'normal',
    greeting,
    cards,
    disclaimer: 'I am an AI assistant, not a licensed doctor. For urgent or serious concerns, please consult a qualified healthcare professional.'
  };
}

// ─────────────────────────────────────────────
// AI Card Bubble Component
// ─────────────────────────────────────────────
function AICardBubble({ response, time }) {
  if (response.type === 'emergency') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'flex-start', maxWidth: '90%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
          <Bot size={12} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>MediAssist AI</span>
          <span style={{ fontSize: '0.7rem', color: '#475569', marginLeft: '0.25rem' }}>{time}</span>
        </div>
        {response.cards.map((card, i) => (
          <div key={i} style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '16px',
            padding: '1rem',
            borderLeft: '4px solid #ef4444',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
              <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '1rem' }}>{card.title}</span>
              {card.badge && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: '6px', padding: '1px 8px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {card.badge.label}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {card.points.map((p, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: '#fca5a5' }}>
                  <span style={{ flexShrink: 0, marginTop: '0.1rem' }}>⚡</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignSelf: 'flex-start', maxWidth: '92%' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Bot size={13} style={{ color: '#10b981' }} />
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>MediAssist AI</span>
        <span style={{ fontSize: '0.7rem', color: '#475569', marginLeft: '0.25rem' }}>{time}</span>
      </div>

      {/* Greeting bubble */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: '18px 18px 18px 4px',
        padding: '0.65rem 1rem',
        fontSize: '0.9rem',
        color: 'var(--text-primary)',
      }}>
        {response.greeting}
      </div>

      {/* Knowledge cards */}
      {response.cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          style={{
            background: `linear-gradient(135deg, rgba(${hexToRgb(card.color)}, 0.06) 0%, rgba(13,20,36,0.8) 100%)`,
            border: `1px solid rgba(${hexToRgb(card.color)}, 0.25)`,
            borderLeft: `3px solid ${card.color}`,
            borderRadius: '12px',
            padding: '0.9rem 1rem',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '1.1rem' }}>{card.icon}</span>
            <span style={{ fontWeight: 700, color: card.color, fontSize: '0.9rem', letterSpacing: '0.01em' }}>{card.title}</span>
          </div>

          {/* Points list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {card.points.map((point, j) => (
              <div key={j} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', alignItems: 'flex-start' }}>
                <span style={{ color: card.color, fontWeight: 700, flexShrink: 0, fontSize: '0.7rem', marginTop: '0.22rem' }}>▸</span>
                <span style={{ lineHeight: 1.5 }}>{point}</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          {card.tip && (
            <div style={{
              marginTop: '0.65rem',
              padding: '0.45rem 0.75rem',
              background: `rgba(${hexToRgb(card.color)}, 0.1)`,
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: card.color,
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'flex-start',
            }}>
              <Info size={12} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span>{card.tip}</span>
            </div>
          )}

          {/* Warning */}
          {card.warning && (
            <div style={{
              marginTop: '0.65rem',
              padding: '0.45rem 0.75rem',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#f59e0b',
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'flex-start',
            }}>
              <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span>{card.warning}</span>
            </div>
          )}
        </motion.div>
      ))}

      {/* Disclaimer */}
      {response.disclaimer && (
        <div style={{ fontSize: '0.73rem', color: '#475569', padding: '0.4rem 0.5rem', borderTop: '1px solid var(--border-glass)', marginTop: '0.1rem' }}>
          ⚕️ {response.disclaimer}
        </div>
      )}
    </motion.div>
  );
}

// Helper: convert hex to rgb values string
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '14, 165, 233';
}

// ─────────────────────────────────────────────
// User Message Bubble
// ─────────────────────────────────────────────
function UserBubble({ text, time }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', alignSelf: 'flex-end', maxWidth: '75%' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>You · {time}</span>
        <User size={12} style={{ color: '#0ea5e9' }} />
      </div>
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        color: 'white',
        borderRadius: '18px 18px 4px 18px',
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        boxShadow: '0 4px 15px rgba(14,165,233,0.3)',
        lineHeight: 1.5,
      }}>
        {text}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Quick Prompt Chips
// ─────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '🥗 Diet Tips', query: 'Give me diet and nutrition tips' },
  { label: '😴 Better Sleep', query: 'How can I sleep better?' },
  { label: '💊 Paracetamol', query: 'Paracetamol medication precautions' },
  { label: '🏋️ Exercise Plan', query: 'Basic cardio fitness routine' },
  { label: '🧠 Manage Stress', query: 'How to manage stress and anxiety' },
  { label: '🧪 Vitamin D', query: 'What foods are rich in Vitamin D?' },
];

// ─────────────────────────────────────────────
// Main ChatAssistant Component
// ─────────────────────────────────────────────
export default function ChatAssistant() {
  const { checkForEmergency } = useEmergency();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Seed welcome message
    const welcome = {
      id: 'welcome',
      type: 'ai',
      response: {
        type: 'normal',
        greeting: '👋 Hello! I am your MediAssist AI health companion.',
        cards: [{
          icon: '🩺', color: '#0ea5e9',
          title: 'How I Can Help',
          points: [
            '🥗 Nutrition & Diet guidance',
            '😴 Sleep hygiene & insomnia tips',
            '🏋️ Exercise & fitness routines',
            '💊 Medication precautions (Paracetamol, Ibuprofen)',
            '🧠 Stress, anxiety & mental health',
            '🧪 Vitamins, minerals & supplements',
            '🤧 Cold, cough & fever home care',
            '❤️ Blood pressure, diabetes & cholesterol tips',
          ],
          tip: 'Use the quick prompts below or ask any health question!',
        }],
        disclaimer: 'I am an AI assistant, not a licensed doctor.'
      },
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (text) => {
    const msgText = typeof text === 'string' ? text : input;
    if (!msgText.trim() || loading) return;

    const userMsg = {
      id: 'u_' + Date.now(),
      type: 'user',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    checkForEmergency(msgText);
    setLoading(true);

    // Simulate thinking delay then generate card response
    setTimeout(() => {
      const aiResponse = buildAIResponse(msgText);
      const aiMsg = {
        id: 'ai_' + Date.now(),
        type: 'ai',
        response: aiResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 900 + Math.random() * 600);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleClear = () => {
    const welcome = {
      id: 'welcome_' + Date.now(),
      type: 'ai',
      response: {
        type: 'normal',
        greeting: '🗑️ Chat cleared! How can I assist you today?',
        cards: [],
        disclaimer: null,
      },
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
  };

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '60px', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* Main chat container */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <GlassCard
            hoverEffect={false}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, padding: '1rem', overflow: 'hidden' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '0.75rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', borderRadius: '10px', padding: '0.4rem', display: 'flex' }}>
                  <Bot size={18} style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Clinical AI Companion</h3>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    Powered by Gemini 1.5 Pro · Offline Mode Active
                  </span>
                </div>
              </div>
              <button
                onClick={handleClear}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>

            {/* Messages area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
              <AnimatePresence>
                {messages.map((msg) =>
                  msg.type === 'user' ? (
                    <UserBubble key={msg.id} text={msg.text} time={msg.time} />
                  ) : (
                    <AICardBubble key={msg.id} response={msg.response} time={msg.time} />
                  )
                )}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <Bot size={12} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>MediAssist AI is thinking...</span>
                  </div>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '18px 18px 18px 4px', padding: '0.75rem 1rem' }}>
                    <div className="typing-indicator"><span /><span /><span /></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-glass)', paddingTop: '0.6rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p.query)}
                    disabled={loading}
                    style={{
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '20px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.color = '#0ea5e9'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Input bar */}
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ask a health question... (e.g. How to sleep better?)"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading}
                    style={{ paddingRight: '3rem' }}
                  />
                  <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                    <VoiceInput onTranscript={text => setInput(prev => prev ? prev + ' ' + text : text)} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.8rem', borderRadius: '12px', flexShrink: 0 }}
                  disabled={!input.trim() || loading}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </GlassCard>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
