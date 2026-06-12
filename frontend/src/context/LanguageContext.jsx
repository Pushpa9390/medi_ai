import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appName: 'MediAssist AI',
    home: 'Home',
    symptomChecker: 'Symptom Checker',
    reportAnalyzer: 'Report Analyzer',
    imageAnalysis: 'Image Analysis',
    chat: 'AI Chat',
    dashboard: 'Dashboard',
    emergency: 'Emergency',
    settings: 'Settings',
    disclaimer: 'MediAssist AI is not a substitute for professional medical advice. Always consult a licensed healthcare provider.',
    emergencyCall: 'Call Emergency Services',
    heroTitle: 'Intelligent Healthcare Assistant',
    heroSubtitle: 'Get instant insights on symptoms, medical reports, and health questions — powered by advanced AI.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    typeSymptoms: 'Describe your symptoms...',
    analyze: 'Analyze',
    uploadReport: 'Upload Medical Report',
    typeMessage: 'Type a health question...',
    send: 'Send',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    loading: 'Analyzing...',
    severity: 'Severity',
    recommendations: 'Recommendations',
    disclaimer_short: 'AI analysis only — not a diagnosis',
  },
  te: {
    appName: 'మెడిఅసిస్ట్ AI',
    home: 'హోమ్',
    symptomChecker: 'లక్షణాల తనిఖీ',
    reportAnalyzer: 'నివేదిక విశ్లేషణ',
    imageAnalysis: 'చిత్ర విశ్లేషణ',
    chat: 'AI చాట్',
    dashboard: 'డాష్‌బోర్డ్',
    emergency: 'అత్యవసరం',
    settings: 'సెట్టింగ్‌లు',
    disclaimer: 'MediAssist AI వృత్తిపరమైన వైద్య సలహాకు ప్రత్యామ్నాయం కాదు. ఎల్లప్పుడూ లైసెన్స్ పొందిన వైద్యుడిని సంప్రదించండి.',
    emergencyCall: 'అత్యవసర సేవలకు కాల్ చేయండి',
    heroTitle: 'మీ AI ఆరోగ్య సహాయకుడు',
    heroSubtitle: 'లక్షణాలు, వైద్య నివేదికలు మరియు ఆరోగ్య ప్రశ్నలపై తక్షణ అంతర్దృష్టి పొందండి.',
    getStarted: 'ప్రారంభించండి',
    learnMore: 'మరింత తెలుసుకోండి',
    typeSymptoms: 'మీ లక్షణాలను వివరించండి...',
    analyze: 'విశ్లేషించు',
    uploadReport: 'వైద్య నివేదికను అప్‌లోడ్ చేయండి',
    typeMessage: 'ఆరోగ్య ప్రశ్న టైప్ చేయండి...',
    send: 'పంపు',
    darkMode: 'డార్క్ మోడ్',
    lightMode: 'లైట్ మోడ్',
    language: 'భాష',
    loading: 'విశ్లేషిస్తోంది...',
    severity: 'తీవ్రత',
    recommendations: 'సిఫారసులు',
    disclaimer_short: 'AI విశ్లేషణ మాత్రమే — రోగనిర్ధారణ కాదు',
  },
  hi: {
    appName: 'मेडीअसिस्ट AI',
    home: 'होम',
    symptomChecker: 'लक्षण जांचक',
    reportAnalyzer: 'रिपोर्ट विश्लेषक',
    imageAnalysis: 'छवि विश्लेषण',
    chat: 'AI चैट',
    dashboard: 'डैशबोर्ड',
    emergency: 'आपातकाल',
    settings: 'सेटिंग्स',
    disclaimer: 'MediAssist AI पेशेवर चिकित्सा सलाह का विकल्प नहीं है। हमेशा लाइसेंस प्राप्त स्वास्थ्य प्रदाता से परामर्श करें।',
    emergencyCall: 'आपातकालीन सेवाएं कॉल करें',
    heroTitle: 'आपका AI स्वास्थ्य साथी',
    heroSubtitle: 'लक्षणों, चिकित्सा रिपोर्ट और स्वास्थ्य प्रश्नों पर तत्काल जानकारी प्राप्त करें।',
    getStarted: 'शुरू करें',
    learnMore: 'और जानें',
    typeSymptoms: 'अपने लक्षण बताएं...',
    analyze: 'विश्लेषण करें',
    uploadReport: 'मेडिकल रिपोर्ट अपलोड करें',
    typeMessage: 'स्वास्थ्य प्रश्न टाइप करें...',
    send: 'भेजें',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    language: 'भाषा',
    loading: 'विश्लेषण हो रहा है...',
    severity: 'गंभीरता',
    recommendations: 'सिफारिशें',
    disclaimer_short: 'केवल AI विश्लेषण — निदान नहीं',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('mediassist-lang') || 'en');

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('mediassist-lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
