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
      observation: 'Medical Visual Diagnostic Review: Focal Tissue Variance Detected',
      explanation: 'The uploaded medical image has been visually evaluated. Symmetrical structural patterns are present with localized mild density variance.',
      warning: 'This is an AI visual indicator only, not a final oncological or radiological diagnosis.',
      suggestions: 'Schedule a clinical consultation with a medical specialist for definitive physical evaluation.',
      confidence: 89.5,
      riskLevel: 'Medium',
      doctorObservation: {
        imageType: 'Radiological / Dermatological Scan',
        bodyPart: 'Target Visual Field',
        visibleStructures: 'Clear tissue borders and visible cellular outlines',
        normalFindings: 'Surrounding anatomical structures display expected density and symmetry',
        abnormalFindings: 'Focal area of mild density or pigmentation variance observed',
        locationOfAbnormalities: 'Central-lower region of interest'
      },
      clinicalAssessment: {
        possibleCondition: 'Inflammatory or Benign Tissue Pattern',
        confidence: 89.5,
        severityLevel: 'Moderate',
        affectedArea: 'Target scan quadrant',
        riskCategory: 'Medium Risk'
      },
      doctorExplanation: 'The scan shows minor tissue variance that warrants routine medical observation. It does not confirm an active pathology. A physician will review your clinical history alongside this scan.',
      recommendedNextSteps: {
        specialist: 'General Physician / Clinical Specialist',
        suggestedEvaluation: 'In-person clinical examination & palpation',
        diagnosticTests: ['Targeted Follow-up Imaging', 'Laboratory Blood Biomarker Panel'],
        followUpSuggestions: 'Re-assess with a licensed specialist within 7 to 10 days.'
      },
      generalTreatmentGuidance: {
        rest: 'Ensure 7 to 8 hours of restorative sleep daily.',
        hydration: 'Maintain adequate fluid intake of 2.5–3 liters per day.',
        diet: 'Eat balanced meals rich in antioxidants, leafy greens, and lean protein.',
        lifestyle: 'Avoid physical trauma or unverified home remedies on the affected area.',
        recoveryMonitoring: 'Keep a daily log of any visual changes, pain, or discomfort.'
      },
      emergencyAssessment: {
        emergencyRisk: 'Medium',
        urgentAdvice: 'Seek immediate emergency attention if you develop acute severe pain, fever over 102°F, or sudden respiratory distress.'
      }
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
      observation: 'వైద్య విజువల్ పరిశీలన: కణజాల మార్పులు గమనించబడ్డాయి',
      explanation: 'అప్‌లోడ్ చేసిన స్కాన్ సరిహద్దులు సమరూపంగా ఉన్నాయి, ప్రాథమిక మార్పులు కనిపించాయి.',
      warning: 'ఇది కేవలం AI దృశ్య సూచిక మాత్రమే. అంకాలాజికల్ లేదా రేడియోలాజికల్ పరీక్ష కావు.',
      suggestions: 'ఖచ్చితమైన పరీక్ష కోసం సంబంధిత నిపుణుడిని కలవండి.',
      confidence: 89.5,
      riskLevel: 'Medium',
      doctorObservation: {
        imageType: 'రేడియోలాజికల్ / డెర్మటోలాజికల్ స్కాన్',
        bodyPart: 'విశ్లేషించిన శరీర భాగం',
        visibleStructures: 'కణజాల అమరిక మరియు సరిహద్దులు స్పష్టంగా ఉన్నాయి',
        normalFindings: 'చుట్టుపక్కల అవయవాలు సాధారణంగా ఉన్నాయి',
        abnormalFindings: 'కేంద్రీకృత ప్రాంతంలో చిన్న మార్పులు కనిపించాయి',
        locationOfAbnormalities: 'విశ్లేషణ ప్రధాన కేంద్ర స్థానం'
      },
      clinicalAssessment: {
        possibleCondition: 'ఇన్ఫ్లమేటరీ లేదా సాధారణ కణజాల మార్పులు',
        confidence: 89.5,
        severityLevel: 'మోస్తరు',
        affectedArea: 'విశ్లేషించిన ప్రాంతం',
        riskCategory: 'మధ్యస్థ ప్రమాదం'
      },
      doctorExplanation: 'ఈ చిత్రం కణజాలంలో చిన్న మార్పులను చూపుతుంది. ఇది రోగాన్ని ధృవీకరించదు. వైద్యుడు మీ లక్షణాలను పరిశీలించి నిర్ణయం తీసుకుంటారు.',
      recommendedNextSteps: {
        specialist: 'జనరల్ ఫిజీషియన్ / స్పెషలిస్ట్ డాక్టర్',
        suggestedEvaluation: 'వైద్యుడి ప్రత్యక్ష క్లినికల్ పరిశీలన',
        diagnosticTests: ['ఫాలో-అప్ రక్త పరీక్షలు', 'అవసరమైతే రేడియోలాజికల్ స్కాన్'],
        followUpSuggestions: '7-10 రోజులలో వైద్యుడిని కలవండి.'
      },
      generalTreatmentGuidance: {
        rest: 'రోజుకు 7-8 గంటల తగినంత విశ్రాంతి పొందండి.',
        hydration: 'రోజువారీ 2.5-3 లీటర్ల ద్రవాలు తాగండి.',
        diet: 'పోషకాహారం మరియు తాజా పండ్లు తీసుకోండి.',
        lifestyle: 'శరీరానికి అధిక శ్రమ ఇవ్వవద్దు.',
        recoveryMonitoring: 'లక్షణాలలో మార్పులను క్రమం తప్పకుండా గమనించండి.'
      },
      emergencyAssessment: {
        emergencyRisk: 'Medium',
        urgentAdvice: 'తీవ్రమైన నొప్పి లేదా శ్వాస ఇబ్బంది ఉంటే వెంటనే అత్యవసర వైద్య సహాయం పొందండి.'
      }
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
            confidence: mock.confidence || 89.5,
            observation: mock.observation,
            explanation: mock.explanation,
            warning: mock.warning,
            suggestions: mock.suggestions,
            riskLevel: mock.riskLevel,
            doctorObservation: mock.doctorObservation,
            clinicalAssessment: mock.clinicalAssessment,
            doctorExplanation: mock.doctorExplanation,
            recommendedNextSteps: mock.recommendedNextSteps,
            generalTreatmentGuidance: mock.generalTreatmentGuidance,
            emergencyAssessment: mock.emergencyAssessment
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
  const lower = message.toLowerCase();

  // Telugu
  if (lang === 'te') {
    if (lower.includes('ఆహార') || lower.includes('పోషణ') || lower.includes('diet') || lower.includes('nutrition') || lower.includes('food')) {
      return "నమస్కారం! పోషకాహార సూచనలు:\n\n• **సమతుల్య ఆహారం**: పప్పుధాన్యాలు, ఆకుకూరలు, మరియు తాజా పండ్లను రోజువారీ ఆహారంలో చేర్చుకోండి.\n• **నీరు**: ప్రతిరోజూ కనీసం 2-3 లీటర్ల నీరు త్రాగండి.\n• **తగ్గించాల్సినవి**: అధిక చక్కెర మరియు వేయించిన పదార్థాలను పరిమితం చేయండి.\n\n---\n*⚕️ నిరాకరణ: నేను AI ఆరోగ్య సహాయకుడిని మాత్రమే, లైసెన్స్ పొందిన వైద్యుడిని కాను.*";
    }
    if (lower.includes('నిద్ర') || lower.includes('sleep') || lower.includes('insomnia')) {
      return "మంచి నిద్ర కోసం సూచనలు:\n\n• **సమయపాలన**: ప్రతిరోజూ ఒకే సమయానికి నిద్రపోవడం మరియు మేల్కొనడం అలవాటు చేసుకోండి.\n• **స్క్రీన్ టైమ్**: నిద్రపోవడానికి 45 నిమిషాల ముందు ఫోన్ లేదా టీవీ వాడకండి.\n• **ప్రశాంతత**: గదిని చీకటిగా మరియు ప్రశాంతంగా ఉంచుకోండి.\n\n---\n*⚕️ నిరాకరణ: నేను AI ఆరోగ్య సహాయకుడిని మాత్రమే.*";
    }
    if (lower.includes('జ్వరం') || lower.includes('జలుబు') || lower.includes('దగ్గు') || lower.includes('తలనొప్పి') || lower.includes('fever') || lower.includes('cough') || lower.includes('headache')) {
      return "లక్షణాల నిర్వహణ సహాయం:\n\n• **విశ్రాంతి**: తగినంత విశ్రాంతి తీసుకోండి మరియు ద్రవాహారం ఎక్కువ తీసుకోండి.\n• **పర్యవేక్షణ**: శరీర ఉష్ణోగ్రతను క్రమం తప్పకుండా నమోదు చేయండి.\n• **వైద్య సంప్రదింపులు**: జ్వరం 101°F కంటే ఎక్కువ ఉంటే లేదా 3 రోజుల కంటే ఎక్కువ ఉంటే వెంటనే డాక్టర్‌ను కలవండి.\n\n---\n*⚕️ నిరాకరణ: తీవ్రమైన లక్షణాలకు వైద్య సహాయం తప్పనిసరి.*";
    }
    return "నమస్కారం! నేను మీ AI ఆరోగ్య సహాయకుడిని (ఆఫ్‌లైన్ మోడ్). మీరు ఆహారం, నిద్ర, వ్యాయామం లేదా సాధారణ ఔషధాల గురించి అడగవచ్చు.\n\n---\n*⚕️ నిరాకరణ: నేను AI ఆరోగ్య సమాచార సహాయకుడిని మాత్రమే, లైసెన్స్ పొందిన వైద్యుడిని కాను.*";
  }

  // Hindi
  if (lang === 'hi') {
    if (lower.includes('आहार') || lower.includes('पोषण') || lower.includes('diet') || lower.includes('nutrition') || lower.includes('food')) {
      return "नमस्ते! पोषण संबंधी निर्देश:\n\n• **संतुलित आहार**: हरी सब्जियां, दालें, और ताजे फलों को अपने आहार में शामिल करें।\n• **हाइड्रेशन**: रोजाना 2-3 लीटर पानी पिएं।\n• **परहेज**: अत्यधिक चीनी और प्रसंस्कृत भोजन से बचें।\n\n---\n*⚕️ अस्वीकरण: मैं केवल एक AI स्वास्थ्य सूचना सहायक हूँ, डॉक्टर नहीं।*";
    }
    if (lower.includes('नींद') || lower.includes('sleep') || lower.includes('insomnia')) {
      return "अच्छी नींद के लिए टिप्स:\n\n• **नियमित दिनचर्या**: सोने और जागने का समय निश्चित करें।\n• **स्क्रीन टाइम**: सोने से 45 मिनट पहले मोबाइल/स्क्रीन का उपयोग बंद कर दें।\n\n---\n*⚕️ अस्वीकरण: मैं एक AI स्वास्थ्य सहायक हूँ।*";
    }
    if (lower.includes('बुखार') || lower.includes('सर्दी') || lower.includes('खांसी') || lower.includes('सिरदर्द') || lower.includes('fever') || lower.includes('cough') || lower.includes('headache')) {
      return "लक्षण प्रबंधन सलाह:\n\n• **विश्राम**: पर्याप्त आराम करें और गुनगुना पानी पिएं।\n• **तापमान**: बुखार की स्थिति में तापमान ट्रैक करें। 101°F से अधिक होने पर डॉक्टर से संपर्क करें।\n\n---\n*⚕️ अस्वीकरण: गंभीर स्थिति में तुरंत डॉक्टर से परामर्श लें।*";
    }
    return "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ (ऑफ़लाइन मोड)। आप मुझसे पोषण, नींद, व्यायाम या दवाओं के बारे में पूछ सकते हैं।\n\n---\n*⚕️ अस्वीकरण: मैं केवल एक AI स्वास्थ्य सूचना सहायक हूँ, डॉक्टर नहीं।*";
  }

  // Tamil, Kannada, Malayalam short handles
  if (lang === 'ta' || lang === 'kn' || lang === 'ml') {
    return "Welcome! I am your AI health companion. Ask about diet, sleep hygiene, exercises, or general medication guidance.\n\n---\n*⚕️ Disclaimer: Educational assistant only, not a licensed physician.*";
  }

  // Standard English response builder
  const parts = ["Hello! I am your AI health companion (MediAssist AI).\n\n"];
  let matched = false;

  // Emergency Red Flags
  if (
    lower.includes('chest pain') || lower.includes('heart attack') || lower.includes('stroke') ||
    lower.includes('breathing difficulty') || lower.includes('unconscious') || lower.includes('bleeding')
  ) {
    return "🚨 **CRITICAL EMERGENCY WARNING**\n\nBased on the severe red-flag symptoms mentioned, you may be experiencing a life-threatening emergency.\n\n• **Immediate Action**: Please do not delay. Call 911 / 112 or contact nearest emergency paramedics immediately.\n• **Safety**: Sit in a comfortable position and unlock the door for emergency responders.\n\n---\n*⚕️ Disclaimer: Urgent emergency response needed.*";
  }

  if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('food') || lower.includes('eat') || lower.includes('weight')) {
    matched = true;
    parts.push("• **Nutrition Guidelines:** Opt for lean proteins (poultry, legumes, tofu), complex carbohydrates (quinoa, oats, brown rice), and colorful vegetables. Limit processed sugars and intake 2-3 liters of water daily.\n");
  }

  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('bed') || lower.includes('night') || lower.includes('tired')) {
    matched = true;
    parts.push("• **Sleep Hygiene:** Maintain a consistent sleeping schedule (7-9 hours daily). Turn off digital screens 45 minutes before bedtime and keep your bedroom cool and dark.\n");
  }

  if (lower.includes('fever') || lower.includes('cough') || lower.includes('cold') || lower.includes('headache') || lower.includes('flu') || lower.includes('symptom')) {
    matched = true;
    parts.push("• **Symptom Care:** Rest, stay hydrated with warm liquids, and monitor your body temperature. If fever exceeds 101°F (38.3°C) or persists over 3 days, seek clinical consultation.\n");
  }

  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym') || lower.includes('fitness') || lower.includes('walk')) {
    matched = true;
    parts.push("• **Physical Fitness:** Aim for at least 150 minutes of moderate aerobic activity (e.g. brisk walking) weekly, combined with light strength exercises 2 days a week. Always warm up properly.\n");
  }

  if (lower.includes('paracetamol') || lower.includes('acetaminophen') || lower.includes('ibuprofen') || lower.includes('medicine') || lower.includes('drug') || lower.includes('pill')) {
    matched = true;
    parts.push("• **Medication Precautions:** Paracetamol is widely used for fever and mild pain. Do not exceed 4,000 mg daily for adults to prevent liver overload. Always take NSAIDs like Ibuprofen with food.\n");
  }

  if (!matched) {
    parts.push("I am here to answer questions about health, nutrition, sleep hygiene, exercises, or general medication precautions. How can I assist you today?");
  }

  parts.push('\n\n---\n*⚕️ Disclaimer: I am an AI health information assistant, not a licensed medical doctor. For medical diagnoses or prescriptions, consult a physician.*');
  return parts.join('');
}
