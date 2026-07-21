import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useLanguage } from './LanguageContext';

// ─── Keyword sets per language ─────────────────────────────────────────────
const EMERGENCY_KEYWORDS = [
  // English
  'chest pain', 'heart attack', 'stroke', "can't breathe", 'cannot breathe',
  'not breathing', 'stop breathing', 'severe bleeding', 'heavy bleeding',
  'unconscious', 'unresponsive', 'loss of consciousness', 'fainted', 'collapsed',
  'severe headache', 'sudden numbness', 'face drooping', 'arm weakness',
  'speech difficulty', 'choking', 'overdose', 'seizure', 'epilepsy attack',
  'anaphylaxis', 'severe allergic reaction', 'severe burns', 'suicide', 'self harm',
  // Telugu
  'ఛాతి నొప్పి', 'హృదయ పోటు', 'శ్వాస తీసుకోలేకపోతున్నాను', 'స్పృహ కోల్పోయాను',
  'తీవ్రమైన రక్తస్రావం', 'పక్షవాతం',
  // Hindi
  'सीने में दर्द', 'दिल का दौरा', 'सांस नहीं आ रही', 'बेहोश', 'दौरा',
  'गंभीर रक्तस्राव', 'लकवा',
  // Tamil
  'நெஞ்சு வலி', 'மாரடைப்பு', 'மூச்சு திணறல்', 'மயக்கம்', 'பக்கவாதம்',
  // Kannada
  'ಎದೆ ನೋವು', 'ಹೃದಯಾಘಾತ', 'ಉಸಿರಾಟ ತೊಂದರೆ', 'ಪ್ರಜ್ಞಾಹೀನ', 'ಪಾರ್ಶ್ವವಾಯು',
  // Malayalam
  'നെഞ്ചുവേദന', 'ഹൃദയാഘാതം', 'ശ്വാസം മുട്ടൽ', 'ബോധക്ഷയം', 'പക്ഷാഘാതം',
];

// Severity levels that warrant an emergency alert
const EMERGENCY_SEVERITIES = ['critical', 'high'];

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const { language } = useLanguage();
  // Track the ID of the last event that was dismissed so the same
  // event never re-triggers the banner after the user closes it.
  const lastDismissedKey = useRef(sessionStorage.getItem('ma_dismissed_emergency') || '');

  // Helper to build translated alert strings
  const getLocalizedMessage = useCallback((type, value, extra, lang) => {
    if (type === 'keyword') {
      switch (lang) {
        case 'te':
          return `⚠️ అత్యవసర కీవర్డ్ కనుగొనబడింది: "${value}" — దయచేసి వెంటనే అత్యవసర సేవలను సంప్రదించండి!`;
        case 'hi':
          return `⚠️ आपातकालीन कीवर्ड पाया गया: "${value}" — कृपया तुरंत आपातकालीन सेवाओं से संपर्क करें!`;
        case 'ta':
          return `⚠️ அவசர முக்கிய வார்த்தை கண்டறியப்பட்டது: "${value}" — தயவுசெய்து அவசர சேவைகளை உடனடியாக தொடர்பு கொள்ளவும்!`;
        case 'kn':
          return `⚠️ ತುರ್ತು কೀವರ್ಡ್ ಪತ್ತೆಯಾಗಿದೆ: "${value}" — ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ತುರ್ತು ಸೇವೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ!`;
        case 'ml':
          return `⚠️ അടിയന്തര കീവേഡ് കണ്ടെത്തി: "${value}" — ദയവായി അടിയന്തര സേവനങ്ങളുമായി ബന്ധപ്പെടുക!`;
        default:
          return `⚠️ Emergency keyword detected: "${value}" — Please call emergency services immediately!`;
      }
    } else {
      const sev = value.toUpperCase();
      const cond = extra ? ` ("${extra}")` : '';
      switch (lang) {
        case 'te':
          return `⚠️ తీవ్రత ${sev} కనుగొనబడింది${cond}. దయచేసి వెంటనే వైద్య సహాయం పొందండి!`;
        case 'hi':
          return `⚠️ गंभीरता ${sev} पाई गई है${cond}। कृपया तुरंत चिकित्सा सहायता लें!`;
        case 'ta':
          return `⚠️ தீவிரம் ${sev} கண்டறியப்பட்டது${cond}. தயவுசெய்து உடனடியாக மருத்துவ உதவியை நாடவும்!`;
        case 'kn':
          return `⚠️ ತೀವ್ರತೆ ${sev} ಪತ್ತೆಯಾಗಿದೆ${cond}. ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ ಪಡೆಯಿರಿ!`;
        case 'ml':
          return `⚠️ ഗുരുതരാവസ്ഥ ${sev} കണ്ടെത്തി${cond}. ദയവായി ഉടനടി വൈദ്യസഹായം തേടുക!`;
        default:
          return `⚠️ ${sev} severity detected${cond}. Please seek immediate medical attention!`;
      }
    }
  }, []);

  /**
   * Trigger the banner from a raw text (keyword match).
   * Used by ChatAssistant where the user types free text.
   */
  const checkForEmergency = useCallback((text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    const matched = EMERGENCY_KEYWORDS.find(kw => lower.includes(kw.toLowerCase()));
    if (!matched) return false;

    // Build a stable key for this event so the same phrase doesn't re-open
    // the banner if the user dismissed it for this exact phrase.
    const eventKey = `kw:${matched}`;
    if (lastDismissedKey.current === eventKey) return false; // already dismissed

    // Log the emergency event
    const storedEmergencies = localStorage.getItem('mediassist-emergencies');
    const emergencies = storedEmergencies ? JSON.parse(storedEmergencies) : [];
    const alreadyLogged = emergencies.some(e => e.summary.includes(matched) && (Date.now() - e.timestamp < 30000));
    if (!alreadyLogged) {
      emergencies.unshift({
        id: 'emergency_' + Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'Emergency',
        summary: `🚨 Emergency keyword detected: "${matched}"`,
        severity: 'critical',
        notes: `Emergency keyword was detected in user chat/symptom check: "${matched}". Immediate action recommended. Please contact 112 / 911 immediately.`,
        timestamp: Date.now()
      });
      localStorage.setItem('mediassist-emergencies', JSON.stringify(emergencies));
    }

    setIsEmergency(true);
    setEmergencyMessage(getLocalizedMessage('keyword', matched, null, language));
    // Persist active key so we can clear/dismiss it properly
    sessionStorage.setItem('ma_current_emergency_key', eventKey);
    return true;
  }, [language, getLocalizedMessage]);

  /**
   * Trigger the banner from an AI severity result (e.g. SymptomChecker).
   * Only fires for 'critical' or 'high' severity returned by the AI.
   */
  const triggerEmergencyBySeverity = useCallback((severity, conditionText) => {
    if (!severity) return false;
    if (!EMERGENCY_SEVERITIES.includes(severity.toLowerCase())) return false;

    const eventKey = `sev:${severity}:${conditionText || ''}`;
    if (lastDismissedKey.current === eventKey) return false;

    // Log the emergency event
    const storedEmergencies = localStorage.getItem('mediassist-emergencies');
    const emergencies = storedEmergencies ? JSON.parse(storedEmergencies) : [];
    const alreadyLogged = emergencies.some(e => e.summary.includes(conditionText || severity) && (Date.now() - e.timestamp < 30000));
    if (!alreadyLogged) {
      emergencies.unshift({
        id: 'emergency_' + Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'Emergency',
        summary: `🚨 Emergency severity: ${severity.toUpperCase()} (${conditionText || 'Acute Distress'})`,
        severity: severity.toLowerCase(),
        notes: `AI severity analysis returned high-risk result: "${severity.toUpperCase()}" with observation "${conditionText || 'N/A'}". Immediate action recommended.`,
        timestamp: Date.now()
      });
      localStorage.setItem('mediassist-emergencies', JSON.stringify(emergencies));
    }

    setIsEmergency(true);
    setEmergencyMessage(getLocalizedMessage('severity', severity, conditionText, language));
    // Persist active key so we can clear/dismiss it properly
    sessionStorage.setItem('ma_current_emergency_key', eventKey);
    return true;
  }, [language, getLocalizedMessage]);

  /**
   * Dismiss the banner and persist the dismissed event key so
   * navigation / re-renders never re-show the same alert.
   */
  const clearEmergency = useCallback(() => {
    // Extract current event key from the message so we can mark it dismissed
    const key = sessionStorage.getItem('ma_current_emergency_key') || '';
    if (key) {
      sessionStorage.setItem('ma_dismissed_emergency', key);
      lastDismissedKey.current = key;
      sessionStorage.removeItem('ma_current_emergency_key');
    }
    setIsEmergency(false);
    setEmergencyMessage('');
  }, []);

  return (
    <EmergencyContext.Provider value={{
      isEmergency,
      emergencyMessage,
      checkForEmergency,
      triggerEmergencyBySeverity,
      clearEmergency,
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergency must be used within EmergencyProvider');
  return ctx;
};
