import axios from 'axios';

// Local storage helpers for consult history
export function getHistory() {
  const data = localStorage.getItem('mediassist-consultations');
  return data ? JSON.parse(data) : getMockHistory();
}

export function saveConsultation(consultation) {
  const history = getHistory();
  const newRecord = {
    id: 'consult_' + Date.now(),
    date: new Date().toLocaleDateString(),
    ...consultation
  };
  history.unshift(newRecord);
  localStorage.setItem('mediassist-consultations', JSON.stringify(history));
  return newRecord;
}

// Fallback Mock History for Dashboard
function getMockHistory() {
  const initial = [
    {
      id: 'consult_1',
      date: '2026-06-08',
      type: 'Symptom Check',
      summary: 'Mild dry cough & fatigue',
      severity: 'low',
      notes: 'Recommended resting, warm fluids, and monitoring body temperature.'
    },
    {
      id: 'consult_2',
      date: '2026-06-05',
      type: 'Report Analysis',
      summary: 'Blood Test Report (CBC)',
      severity: 'medium',
      notes: 'Detected borderline low Hemoglobin. Suggested iron-rich diet consult.'
    },
    {
      id: 'consult_3',
      date: '2026-06-01',
      type: 'Image Analysis',
      summary: 'Skin Mole Inspection',
      severity: 'low',
      notes: 'Benign appearance with symmetrical borders. Continue checking for changes.'
    }
  ];
  localStorage.setItem('mediassist-consultations', JSON.stringify(initial));
  return initial;
}

// AI Service API layer (scaffolded to support backend if backend is connected)
const API_BASE = '/api';

// Simple dictionary of mock fallbacks to return if backend is offline/fails
const LOCAL_MOCKS = {
  en: {
    symptom: {
      emergency: {
        isEmergency: true,
        severity: 'critical',
        condition: 'Potential Cardiovascular / Acute Distress',
        explanation: 'Based on the red-flag symptoms provided, you might be experiencing a life-threatening medical emergency. Highly critical condition.',
        followUp: 'Are you feeling lightheaded, experiencing radiating pain down your arm, or having severe shortness of breath?',
        suggestions: 'Please do not wait. Call 911 or your local emergency response team right now.'
      },
      cold: {
        isEmergency: false,
        severity: 'low',
        condition: 'Common Viral Upper Respiratory Tract Infection',
        explanation: 'Symptoms align closely with common seasonal viral infections such as a cold or mild influenza.',
        followUp: 'Do you have a persistent high fever above 101°F, sore throat, or body aches?',
        suggestions: 'Rest, hydrate, and monitor your temperature. Over-the-counter flu aids can support symptom relief. If fever persists, contact a clinic.'
      },
      headache: {
        isEmergency: false,
        severity: 'medium',
        condition: 'Tension Headache or Early Migraine onset',
        explanation: 'Moderate localized head pressure typical of tension or migraine headaches.',
        followUp: 'Is the headache accompanied by visual disturbances, nausea, or sensitivity to light?',
        suggestions: 'Rest in a quiet, dark room, keep hydrated. Consider standard pain relief. Seek immediate care if accompanied by sudden numbness or speech changes.'
      },
      general: {
        isEmergency: false,
        severity: 'medium',
        condition: 'General Symptomatic Presentation',
        explanation: 'Symptoms are noted. A general systemic response has been generated.',
        followUp: 'Could you elaborate on when these symptoms started and if they occur at specific times?',
        suggestions: 'Maintain a symptom log, get adequate rest, and schedule a professional general practitioner checkup.'
      }
    },
    report: {
      extractedSummary: 'Complete Blood Count (CBC) Panel Analysis',
      explanation: 'The report indicates borderline low Hemoglobin (mild anemia marker) and Vitamin D deficiency. Other standard blood parameters including infection markers (WBC) are within normal boundaries.',
      suggestions: 'Focus on consuming iron-rich foods (spinach, legumes) and discuss a vitamin D3 supplement with your primary physician.'
    },
    image: {
      observation: 'Dermatological Observation: Benign Melanocytic Nevus (Common Mole)',
      explanation: 'The uploaded skin lesion exhibits visual symmetry, clear regular borders, uniform coloration, and a diameter under 6mm. These traits typically correlate with standard benign skin moles.',
      warning: 'This is a preliminary visual indicator only. Do not treat this as a final oncology evaluation.',
      suggestions: 'Observe the mole using the ABCDE rule monthly. Check if it becomes asymmetrical, develops uneven borders, changes color, grows, or bleeds.'
    }
  },
  te: {
    symptom: {
      emergency: {
        isEmergency: true,
        severity: 'critical',
        condition: 'గుండె సంబంధిత / తీవ్రమైన శ్వాసకోశ ఇబ్బంది',
        explanation: 'మీరు తెలిపిన తీవ్రమైన లక్షణాల ఆధారంగా, ఇది ప్రాణాంతక అత్యవసర పరిస్థితి కావచ్చు.',
        followUp: 'మీకు తల తిరగడం, చేతికి నొప్పి వ్యాపించడం లేదా శ్వాస తీసుకోవడంలో తీవ్ర ఇబ్బంది ఉందా?',
        suggestions: 'దయచేసి ఆలస్యం చేయవద్దు. వెంటనే మీ స్థానిక అత్యవసర సేవలకు (108 లేదా 112) కాల్ చేయండి.'
      },
      cold: {
        isEmergency: false,
        severity: 'low',
        condition: 'సాధారణ వైరల్ శ్వాసకోశ ఇన్‌ఫెక్షన్',
        explanation: 'మీ లక్షణాలు సాధారణ జలుబు లేదా తేలికపాటి ఇన్‌ఫ్లుఎంజా వంటి వైరల్ ఇన్‌ఫెక్షన్‌ను సూచిస్తున్నాయి.',
        followUp: 'మీకు 101°F కంటే ఎక్కువ జ్వరం, గొంతు నొప్పి లేదా ఒంటి నొప్పులు ఉన్నాయా?',
        suggestions: 'విశ్రాంతి తీసుకోండి, తగినంత నీరు త్రాగండి మరియు మీ జ్వరాన్ని పర్యవేక్షించండి. జ్వరం తగ్గకపోతే డాక్టర్‌ను సంప్రదించండి.'
      },
      headache: {
        isEmergency: false,
        severity: 'medium',
        condition: 'టెన్షన్ తలనొప్పి లేదా మైగ్రేన్ ప్రారంభం',
        explanation: 'టెన్షన్ లేదా మైగ్రేన్ తలనొప్పికి సంబంధించిన మోస్తరు ఒత్తిడి కనిపించింది.',
        followUp: 'తలనొప్పితో పాటు కంటి చూపు మందగించడం, వికారం లేదా కాంతి పట్ల సున్నితత్వం ఉందా?',
        suggestions: 'నిశ్శబ్దమైన, చీకటి గదిలో విశ్రాంతి తీసుకోండి, నీరు త్రాగండి. అవసరమైతే తగిన పెయిన్ కిల్లర్ ఉపయోగించండి.'
      },
      general: {
        isEmergency: false,
        severity: 'medium',
        condition: 'సాధారణ లక్షణాల ప్రదర్శన',
        explanation: 'మీరు తెలిపిన లక్షణాలు నమోదు చేయబడ్డాయి. సాధారణ వైద్య సహాయం అందించబడింది.',
        followUp: 'ఈ లక్షణాలు ఎప్పుడు ప్రారంభమయ్యాయో మరియు ఏ సమయంలో ఎక్కువగా ఉన్నాయో వివరించగలరా?',
        suggestions: 'లక్షణాల డైరీని మెయింటైన్ చేయండి, తగినంత విశ్రాంతి తీసుకోండి మరియు సాధారణ వైద్యుడిని సంప్రదించండి.'
      }
    },
    report: {
      extractedSummary: 'కంప్లీట్ బ్లడ్ కౌంట్ (CBC) ప్యానెల్ విశ్లేషణ',
      explanation: 'ఈ నివేదిక బోర్డర్‌లైన్ తక్కువ హిమోగ్లోబిన్ (రక్తహీనత సంకేతం) మరియు విటమిన్ డి లోపాన్ని సూచిస్తుంది. ఇతర పారామితులు సాధారణంగా ఉన్నాయి.',
      suggestions: 'ఐరన్ అధికంగా ఉండే ఆహారాలు (పాలకూర, పప్పుధాన్యాలు) తీసుకోండి మరియు విటమిన్ డి3 సప్లిమెంట్ల కోసం వైద్యుడిని సంప్రదించండి.'
    },
    image: {
      observation: 'చర్మ పరిశీలన: బెంయిన్ మెలనోసైటిక్ నెవస్ (సాధారణ పుట్టుమచ్చ)',
      explanation: 'చర్మంపై ఉన్న మచ్చ సమరూప సరిహద్దులు, ఏకరీతి రంగు మరియు 6 మిమీ కంటే తక్కువ పరిమాణాన్ని కలిగి ఉంది. ఇది సాధారణ పుట్టుమచ్చను సూచిస్తుంది.',
      warning: 'ఇది ప్రాథమిక దృశ్య సూచిక మాత్రమే. క్యాన్సర్ పరీక్షగా భావించవద్దు.',
      suggestions: 'ప్రతినెలా ABCDE నియమాల ప్రకారం పుట్టుమచ్చను గమనించండి. ఏవైనా మార్పులు ఉంటే చర్మవ్యాధి నిపుణుడిని సంప్రదించండి.'
    }
  }
};

// Map translation helpers to fallback languages cleanly
function getLocalMock(lang, section) {
  const selectedLang = LOCAL_MOCKS[lang] ? lang : 'en';
  return LOCAL_MOCKS[selectedLang][section];
}

export const aiService = {
  async analyzeSymptoms(symptoms, historyContext = []) {
    const lang = localStorage.getItem('mediassist-lang') || 'en';
    try {
      const res = await axios.post(`${API_BASE}/symptom/analyze`, { symptoms, context: historyContext, lang });
      return res.data;
    } catch (err) {
      console.warn('Backend not responding, using local AI client simulation.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          const lower = symptoms.toLowerCase();
          const mock = getLocalMock(lang, 'symptom');
          
          if (
            lower.includes('chest pain') || lower.includes('heart') ||
            lower.includes('stroke') || lower.includes('breathing difficulty') ||
            lower.includes('bleeding') || lower.includes('unconscious')
          ) {
            resolve(mock.emergency);
            return;
          }

          if (lower.includes('cough') || lower.includes('fever') || lower.includes('flu')) {
            resolve(mock.cold);
          } else if (lower.includes('headache') || lower.includes('migraine')) {
            resolve(mock.headache);
          } else {
            resolve(mock.general);
          }
        }, 1500);
      });
    }
  },

  async analyzeReport(file) {
    const lang = localStorage.getItem('mediassist-lang') || 'en';
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('lang', lang);
      const res = await axios.post(`${API_BASE}/report/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      console.warn('Backend not responding, using report mock parser.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          const mock = getLocalMock(lang, 'report');
          resolve({
            reportName: file.name,
            extractedSummary: mock.extractedSummary,
            values: [
              { parameter: 'Hemoglobin', value: '11.2 g/dL', normal: '12.0 - 15.5 g/dL', status: 'low' },
              { parameter: 'White Blood Cell Count', value: '6.5 x10^3/uL', normal: '4.5 - 11.0 x10^3/uL', status: 'normal' },
              { parameter: 'Platelets', value: '250 x10^3/uL', normal: '150 - 450 x10^3/uL', status: 'normal' },
              { parameter: 'Vitamin D', value: '18 ng/mL', normal: '30 - 100 ng/mL', status: 'deficient' }
            ],
            explanation: mock.explanation,
            suggestions: mock.suggestions
          });
        }, 2000);
      });
    }
  },

  async analyzeImage(file) {
    const lang = localStorage.getItem('mediassist-lang') || 'en';
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('lang', lang);
      const res = await axios.post(`${API_BASE}/image/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      console.warn('Backend not responding, using image mock analyzer.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          const mock = getLocalMock(lang, 'image');
          resolve({
            imageName: file.name,
            confidence: 84.5,
            observation: mock.observation,
            explanation: mock.explanation,
            warning: mock.warning,
            suggestions: mock.suggestions
          });
        }, 2000);
      });
    }
  },

  async chatMessage(message, chatHistory = []) {
    const lang = localStorage.getItem('mediassist-lang') || 'en';
    try {
      const res = await axios.post(`${API_BASE}/chat/message`, { message, history: chatHistory, lang });
      return res.data;
    } catch (err) {
      console.warn('Backend not responding, using dynamic AI simulation.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ text: generateLocalChatResponse(message, lang) });
        }, 1000);
      });
    }
  }
};

// Dynamic local AI engine — keyword-matched rich medical advisor
function generateLocalChatResponse(message, lang) {
  // If Telugu is selected, return a friendly response in Telugu
  if (lang === 'te') {
    return "నమస్కారం! నేను మీ AI ఆరోగ్య సహాయకుడిని. ప్రత్యామ్నాయంగా, మా సర్వర్ ఇప్పుడు ఆఫ్‌లైన్‌లో ఉంది. దయచేసి విటమిన్లు, పోషకాహారం, నిద్ర లేదా సాధారణ వ్యాయామాల గురించి అడగండి. \n\n---\n*⚕️ నిరాకరణ: నేను AI ఆరోగ్య సమాచార సహాయకుడిని మాత్రమే, లైసెన్స్ పొందిన వైద్యుడిని కాను.*";
  } else if (lang === 'hi') {
    return "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ। वर्तमान में हमारा सर्वर ऑफ़लाइन है। कृपया पोषण, नींद या व्यायाम के बारे में पूछें। \n\n---\n*⚕️ अस्वीकरण: मैं केवल एक AI स्वास्थ्य सूचना सहायक हूँ, डॉक्टर नहीं।*";
  }
  
  // Standard English responses
  const lower = message.toLowerCase();
  const parts = [];
  
  parts.push("Hello! I am your AI health companion (Local Simulation Mode). ");
  
  let matched = false;
  if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('food')) {
    matched = true;
    parts.push("\n• **Nutrition Guidelines:** Opt for lean proteins, complex carbs (quinoa, brown rice), and fresh vegetables. Stay hydrated.");
  }
  if (lower.includes('sleep') || lower.includes('insomnia')) {
    matched = true;
    parts.push("\n• **Sleep Hygiene:** Build a consistent sleeping schedule. Avoid screen time for at least 45 minutes before sleep.");
  }
  
  if (!matched) {
    parts.push("\nHow can I help you today? You can ask about diet, nutrition, sleep hygiene, or basic exercises.");
  }
  
  parts.push('\n\n---\n*⚕️ Disclaimer: I am an AI health information assistant, not a licensed medical doctor.*');
  return parts.join('');
}
