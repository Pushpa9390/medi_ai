import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { aiService } from '../services/api';
import VoiceInput, { speakText } from '../components/VoiceInput';
import {
  Send, Trash2, Bot, User, Sparkles, Volume2, AlertTriangle,
  Info, Shield, Brain, Heart, RefreshCw
} from 'lucide-react';

const QUICK_PROMPTS = {
  en: [
    { label: '🥗 Diet Tips', query: 'Give me diet and nutrition tips' },
    { label: '😴 Better Sleep', query: 'How can I sleep better?' },
    { label: '💊 Paracetamol', query: 'Paracetamol medication precautions' },
    { label: '🏋️ Exercise Plan', query: 'Basic cardio fitness routine' },
  ],
  te: [
    { label: '🥗 ఆహార చిట్కాలు', query: 'ఆరోగ్యకరమైన ఆహారం మరియు పోషణ చిట్కాలను ఇవ్వండి' },
    { label: '😴 మంచి నిద్ర', query: 'నేను ఎలా బాగా నిద్రపోగలను?' },
    { label: '💊 పారాసిటమాల్', query: 'పారాసిటమాల్ జాగ్రత్తలు ఏమిటి?' },
    { label: '🏋️ వ్యాయామం', query: 'సాధారణ వ్యాయామ దినచర్యను వివరించండి' },
  ],
  hi: [
    { label: '🥗 आहार युक्तियाँ', query: 'मुझे आहार और पोषण के बारे में सुझाव दें' },
    { label: '😴 बेहतर नींद', query: 'मैं बेहतर नींद कैसे ले सकता हूँ?' },
    { label: '💊 पैरासिटामोल', query: 'पैरासिटामोल दवा के लिए सावधानियां बताएं' },
    { label: '🏋️ व्यायाम योजना', query: 'बुनियादी कार्डियो फिटनेस दिनचर्या' },
  ],
  ta: [
    { label: '🥗 உணவு குறிப்புகள்', query: 'உணவு மற்றும் ஊட்டச்சத்து குறிப்புகளை கொடுங்கள்' },
    { label: '😴 நல்ல தூக்கம்', query: 'நான் எப்படி நன்றாக தூங்க முடியும்?' },
    { label: '💊 பாராசிட்டமால்', query: 'பாராசிட்டமால் முன்னெச்சரிக்கைகள் என்ன?' },
    { label: '🏋️ உடற்பயிற்சி', query: 'அடிப்படை உடற்பயிற்சி முறை' },
  ],
  kn: [
    { label: '🥗 ಆಹಾರ ಸಲಹೆಗಳು', query: 'ಆಹಾರ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶದ ಸಲಹೆಗಳನ್ನು ನೀಡಿ' },
    { label: '😴 ಉತ್ತಮ ನಿದ್ರೆ', query: 'ನಾನು ಚೆನ್ನಾಗಿ ನಿದ್ರಿಸುವುದು ಹೇಗೆ?' },
    { label: '💊 ಪ್ಯಾರಸಿಟಮಾಲ್', query: 'ಪ್ಯಾರಸಿಟಮಾಲ್ ತೆಗೆದುಕೊಳ್ಳುವಾಗ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು' },
    { label: '🏋️ ವ್ಯಾಯಾಮ', query: 'ಮೂಲ ವ್ಯಾಯಾಮ ದಿನಚರಿ ತಿಳಿಸಿ' },
  ],
  ml: [
    { label: '🥗 ഭക്ഷണ ടിപ്പുകൾ', query: 'ഭക്ഷണവും പോഷകാഹാരവും സംബന്ധിച്ച വിവരങ്ങൾ തരിക' },
    { label: '😴 നല്ല ഉറക്കം', query: 'നല്ല ഉറക്കം ലഭിക്കാൻ എന്ത് ചെയ്യണം?' },
    { label: '💊 പാരാസിറ്റമോൾ', query: 'പാരാസിറ്റമോൾ കഴിക്കുമ്പോൾ ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ' },
    { label: '🏋️ വ്യായാമം', query: 'ലളിതമായ വ്യായാമങ്ങൾ നിർദ്ദേശിക്കുക' },
  ]
};

export default function ChatAssistant() {
  const { t, language } = useLanguage();
  const { checkForEmergency } = useEmergency();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const sessionId = useRef('chat_' + Date.now());

  // Set default greeting translation based on active language
  useEffect(() => {
    const welcome = {
      id: 'welcome',
      type: 'ai',
      text: t('chatSub') || 'Ask general questions about lifestyle, nutrition, exercise, or common medication instructions.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
    // Reset session ID on load of a new chat screen
    sessionId.current = 'chat_' + Date.now();
  }, [language, t]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveCurrentChatToStorage = (updatedMessages) => {
    const userMessages = updatedMessages.filter(m => m.type === 'user');
    if (userMessages.length === 0) return;
    
    const summary = `Chat about "${userMessages[userMessages.length - 1].text.substring(0, 30)}${userMessages[userMessages.length - 1].text.length > 30 ? '...' : ''}"`;
    const record = {
      id: sessionId.current,
      date: new Date().toLocaleDateString(),
      type: 'AI Chat',
      summary,
      messages: updatedMessages,
      severity: 'low'
    };

    const storedChats = localStorage.getItem('mediassist-chats');
    const chats = storedChats ? JSON.parse(storedChats) : [];
    const index = chats.findIndex(c => c.id === sessionId.current);
    if (index !== -1) {
      chats[index] = record;
    } else {
      chats.unshift(record);
    }
    localStorage.setItem('mediassist-chats', JSON.stringify(chats));
  };

  const handleSend = async (text) => {
    const msgText = typeof text === 'string' ? text : input;
    if (!msgText.trim() || loading) return;

    const userMsg = {
      id: 'u_' + Date.now(),
      type: 'user',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    saveCurrentChatToStorage(newMsgs);
    setInput('');
    checkForEmergency(msgText);
    setLoading(true);

    try {
      // Build proper chat history format for Gemini/Backend
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const r = await aiService.chatMessage(msgText, history);
      
      const aiMsg = {
        id: 'ai_' + Date.now(),
        type: 'ai',
        text: r.text || r.response || 'No response returned.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => {
        const next = [...prev, aiMsg];
        saveCurrentChatToStorage(next);
        return next;
      });
    } catch (err) {
      console.error(err);
      const errMsg = {
        id: 'ai_err_' + Date.now(),
        type: 'ai',
        text: 'Unable to connect to health advisor. Please verify internet connection or try again later.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => {
        const next = [...prev, errMsg];
        saveCurrentChatToStorage(next);
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleClear = () => {
    const welcome = {
      id: 'welcome_' + Date.now(),
      type: 'ai',
      text: t('chatSub') || 'Chat history cleared. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
    sessionId.current = 'chat_' + Date.now();
  };

  const speak = (txt) => {
    const langMap = { en: 'en-US', te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN' };
    speakText(txt, langMap[language] || 'en-US');
  };

  const activeQuickPrompts = QUICK_PROMPTS[language] || QUICK_PROMPTS.en;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      {/* Top Header */}
      <div style={{ padding: '1rem 1.5rem 0.5rem 1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 38, height: 38, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} style={{ color: 'var(--color-emerald)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{t('chatHeading') || 'AI Chat Companion'}</h1>
              <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse-badge 1.5s infinite' }} />
                Gemini Medical Triaging Active
              </span>
            </div>
          </div>
          <button onClick={handleClear} className="btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-rose)', borderColor: 'rgba(244,63,94,0.2)' }}>
            <Trash2 size={13} /> {t('signOut').includes('Sign Out') ? 'Clear Chat' : 'చాట్ తొలగించు'}
          </button>
        </div>
      </div>

      {/* Warning short bar */}
      <div style={{ padding: '0.5rem 1.5rem', background: 'rgba(245, 158, 11, 0.06)', borderBottom: '1px solid var(--border-glass)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Shield size={12} style={{ color: 'var(--color-amber)' }} />
        <span>{t('disclaimer_short')} · Always verify critical medication metrics with physical healthcare providers.</span>
      </div>

      {/* Messages Scroll Panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }} className="chat-messages">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                marginBottom: '1rem'
              }}
            >
              {/* Header Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {msg.type === 'user' ? (
                  <>
                    <span>{msg.time}</span>
                    <User size={10} style={{ color: 'var(--color-primary)' }} />
                  </>
                ) : (
                  <>
                    <Brain size={10} style={{ color: 'var(--color-emerald)' }} />
                    <span style={{ fontWeight: 600 }}>MediAssist AI</span>
                    <span>· {msg.time}</span>
                  </>
                )}
              </div>

              {/* Chat Balloon */}
              <div
                className={`chat-bubble ${msg.type}`}
                style={{
                  background: msg.type === 'user' ? 'var(--gradient-primary)' : 'var(--bg-card)',
                  color: msg.type === 'user' ? '#ffffff' : 'var(--text-primary)',
                  borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  border: msg.type === 'user' ? 'none' : '1px solid var(--border-glass)',
                  padding: '0.75rem 1.125rem',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  boxShadow: msg.type === 'user' ? '0 4px 16px rgba(14,165,233,0.2)' : 'var(--shadow-card)',
                  whiteSpace: 'pre-line',
                  position: 'relative'
                }}
              >
                {msg.text}

                {/* Speak button for AI responses */}
                {msg.type === 'ai' && msg.text.length > 5 && (
                  <button
                    onClick={() => speak(msg.text)}
                    style={{
                      position: 'absolute', right: -30, bottom: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Read Response"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', maxWidth: '80%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Brain size={10} style={{ color: 'var(--color-emerald)' }} />
              <span style={{ fontWeight: 600 }}>MediAssist AI is thinking...</span>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '16px 16px 16px 4px', padding: '0.75rem 1rem' }}>
              <div className="typing-indicator">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input panel & chips */}
      <div style={{ padding: '1rem 1.5rem calc(1rem + env(safe-area-inset-bottom)) 1.5rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-glass)' }}>
        {/* Suggestion tags */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '0.75rem', paddingBottom: '0.2rem' }}>
          {activeQuickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p.query)}
              disabled={loading}
              className="suggestion-pill"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-field"
              placeholder={t('typeMessagePlaceholder') || 'Ask a health question...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              style={{ paddingRight: '3.2rem', height: 46 }}
              required
            />
            <div style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}>
              <VoiceInput onTranscript={text => setInput(prev => prev ? `${prev} ${text}` : text)} />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ height: 46, width: 46, padding: 0, justifyContent: 'center', borderRadius: '12px' }}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
