import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  AlertTriangle, Phone, Activity, Heart, ShieldAlert,
  CheckSquare, ArrowRight, Shield, HeartIcon
} from 'lucide-react';

const EMERGENCY_SCENARIOS = {
  en: [
    { title: 'Chest Pain / Heart Attack', symptoms: 'Crushing chest pressure, pain radiating to neck/left arm, sweating, nausea, shortness of breath.', action: 'Sit down, take deep breaths, call emergency lines immediately, chew aspirin if recommended by medical dispatch.' },
    { title: 'Stroke (F.A.S.T.)', symptoms: 'Face drooping, Arm weakness, Speech difficulty, Time to call emergency services immediately.', action: 'Note the exact time symptoms started. Keep the patient lying down on their side.' },
    { title: 'Breathing Difficulty', symptoms: 'Severe asthma, choking, gasping for air, blue coloration around the lips or fingernails.', action: 'Help patient sit upright. Locate inhaler/epipen. Prepare for CPR if breathing stops.' },
    { title: 'Severe Bleeding', symptoms: 'Steady arterial blood flow that does not stop with minor compression.', action: 'Apply direct firm pressure with clean cloth. Elevate wound if possible. Do not apply tourniquet unless trained.' }
  ],
  te: [
    { title: 'ရင်ဘတ်အောင့်ခြင်း / နှလုံးရောဂါ (Telugu Fallback)', symptoms: 'ရင်ဘတ်အောင့်ခြင်း၊ လည်ပင်း/ဘယ်ဘက်လက်မောင်းသို့ နာကျင်မှုပျံ့နှံ့ခြင်း၊ ချွေးထွက်ခြင်း၊ အသက်ရှူကျပ်ခြင်း။', action: 'ချက်ချင်းထိုင်ပါ၊ အသက်ပြင်းပြင်းရှူပါ၊ အရေးပေါ်ဖုန်းခေါ်ဆိုပါ။' },
    { title: 'పక్షవాతం (Stroke - F.A.S.T.)', symptoms: 'ముఖం వంకరపోవడం, చేయి బలహీనపడటం, మాట ముద్దగా రావడం, వెంటనే ఆసుపత్రికి వెళ్ళాల్సిన సమయం.', action: 'లక్షణాలు ప్రారంభమైన సమయాన్ని గుర్తించండి. రోగిని పక్కకు పడుకోబెట్టండి.' },
    { title: 'శ్వాస తీసుకోవడంలో ఇబ్బంది', symptoms: 'తీవ్రమైన ఉబ్బసం, గొంతులో ఏదైనా అడ్డుపడటం, పెదవులు లేదా గోళ్లు నీలం రంగులోకి మారడం.', action: 'రోగిని నిటారుగా కూర్చోబెట్టండి. ఇన్హేలర్ అందించండి. అవసరమైతే సీపీఆర్ సిద్ధం చేయండి.' },
    { title: 'తీవ్ర రక్తస్రావం', symptoms: 'చిన్నపాటి నొక్కి ఉంచినా కూడా తగ్గని నిరంతర రక్తప్రవాహం.', action: 'శుభ్రమైన గుడ్డతో నేరుగా గట్టిగా నొక్కండి. గాయాన్ని వీలైతే పైకి పెట్టండి.' }
  ],
  hi: [
    { title: 'सीने में दर्द / दिल का दौरा', symptoms: 'सीने में तेज दबाव, दर्द का गर्दन/बाएं हाथ में फैलना, पसीना आना, सांस फूलना।', action: 'बैठ जाएं, गहरी सांसें लें, तुरंत एम्बुलेंस बुलाएं।' },
    { title: 'स्ट्रोक (Stroke - F.A.S.T.)', symptoms: 'चेहरे का लटकना, हाथ की कमजोरी, बोलने में कठिनाई, तुरंत डॉक्टर को बुलाने का समय।', action: 'लक्षण शुरू होने का समय नोट करें। मरीज को करवट दिलाकर लिटाएं।' },
    { title: 'सांस लेने में कठिनाई', symptoms: 'गंभीर अस्थमा, दम घुटना, होंठों या नाखूनों का नीला पड़ना।', action: 'मरीज को सीधा बैठाएं। इनहेलर ढूँढें। सांस रुकने पर सीपीआर के लिए तैयार रहें।' },
    { title: 'गंभीर रक्तस्राव', symptoms: 'लगातार बहता खून जो दबाने से भी न रुके।', action: 'साफ कपड़े से सीधे घाव पर जोर से दबाव डालें। घाव वाले हिस्से को ऊंचा रखें।' }
  ],
  ta: [
    { title: 'நெஞ்சு வலி / மாரடைப்பு', symptoms: 'நெஞ்சில் அதிக அழுத்தம், வலி கழுத்து/இடது கைக்கு பரவுதல், வியர்வை, மூச்சுத் திணறல்.', action: 'அமர்ந்து ஆழமாக சுவாசிக்கவும், உடனடியாக அவசர உதவிக்கு அழைக்கவும்.' },
    { title: 'பக்கவாதம் (Stroke - F.A.S.T.)', symptoms: 'முகம் கோணுதல், கை பலவீனம், பேச்சு குழறுதல், உடனடியாக அழைக்க வேண்டிய நேரம்.', action: 'அறிகுறிகள் தொடங்கிய நேரத்தைக் குறித்துக் கொள்ளவும். நோயாளியை ஒரு பக்கமாக படுக்க வைக்கவும்.' },
    { title: 'மூச்சுத் திணறல்', symptoms: 'கடுமையான ஆஸ்துமா, மூச்சு முட்டுதல், உதடுகள் அல்லது நகங்கள் நீல நிறமாதல்.', action: 'நோயாளியை நேராக உட்கார வைக்கவும். இன்ஹேலரை பயன்படுத்தவும்.' },
    { title: 'அதிக இரத்தப்போக்கு', symptoms: 'சாதாரண அழுத்தத்திற்கு கட்டுப்படாத தொடர்ச்சியான இரத்தப்போக்கு.', action: 'சுத்தமான துணியால் நேரடியாக அழுத்தம் கொடுக்கவும். காயமடைந்த பகுதியை உயர்த்தவும்.' }
  ],
  kn: [
    { title: 'ಎದೆ ನೋವು / ಹೃದಯಾಘಾತ', symptoms: 'ಎದೆಯಲ್ಲಿ ತೀವ್ರ ಒತ್ತಡ, ಎಡಗೈ ಅಥವಾ ಕುತ್ತಿಗೆಗೆ ನೋವು ಹರಡುವುದು, ಉಸಿರಾಟದ ತೊಂದರೆ.', action: 'ಕೂಳಿತುಕೊಳ್ಳಿ, ನಿಧಾನವಾಗಿ ಉಸಿರಾಡಿ, ತಕ್ಷಣ ತುರ್ತು ಸೇವೆಗೆ ಕರೆ ಮಾಡಿ.' },
    { title: 'ಪಾರ್ಶ್ವವಾಯು (Stroke - F.A.S.T.)', symptoms: 'ಮುಖದ ವಿರೂಪತೆ, ಕೈಯಲ್ಲಿ ದೌರ್ಬಲ್ಯ, ಮಾತಿನಲ್ಲಿ ತೊದಲುವಿಕೆ, ತಕ್ಷಣ ಕರೆ ಮಾಡಬೇಕಾದ ಸಮಯ.', action: 'ಲಕ್ಷಣಗಳು ಪ್ರಾರಂಭವಾದ ಸಮಯವನ್ನು ಗುರುತಿಸಿ. ರೋಗಿಯನ್ನು ಒಂದು ಮಗ್ಗುಲಿಗೆ ಮಲಗಿಸಿ.' },
    { title: 'ಉಸಿರಾಟದ ತೊಂದರೆ', symptoms: 'ತೀವ್ರವಾದ ಉಬ್ಬಸ, ಗಂಟಲಿನಲ್ಲಿ ಅಡಚಣೆ, ತುಟಿ ಅಥವಾ ಉಗುರುಗಳು ನೀಲಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು.', action: 'ರೋಗಿಯನ್ನು ನೆಟ್ಟಗೆ ಕುಳ್ಳಿರಿಸಿ. ಇನ್ಹೇಲರ್ ಬಳಸಿ. ಸಿಪಿಆರ್ ಮಾಡಲು ಸಿದ್ಧರಾಗಿ.' },
    { title: 'ತೀವ್ರ ರಕ್ತಸ್ರಾವ', symptoms: 'ಸಾಮಾನ್ಯ ಒತ್ತಡಕ್ಕೆ ನಿಲ್ಲದ ನಿರಂತರ ರಕ್ತಸ್ರಾವ.', action: 'ಸ್ವಚ್ಛವಾದ ಬಟ್ಟೆಯಿಂದ ಗಾಯದ ಮೇಲೆ ನೇರ ಒತ್ತಡ ಹಾಕಿ. ಗಾಯದ ಭಾಗವನ್ನು ಮೇಲಕ್ಕೆತ್ತಿ.' }
  ],
  ml: [
    { title: 'നെഞ്ചുവേദന / ഹൃദയാഘാതം', symptoms: 'നെഞ്ചിൽ കടുത്ത അമർച്ച, വേദന കഴുത്തിലേക്കോ ഇടതുകൈയിലേക്കോ പടരുക, ശ്വാസംമുട്ടൽ.', action: 'ഇരിക്കുക, ആഴത്തിൽ ശ്വാസമെടുക്കുക, ഉടനടി ആംബുലൻസ് വിളിക്കുക.' },
    { title: 'പക്ഷാഘാതം (Stroke - F.A.S.T.)', symptoms: 'മുഖം കോടുക, കൈയ്ക്ക് തളർച്ച, സംസാരിക്കാൻ ബുദ്ധിമുട്ട്, ഉടൻ ഡോക്ടറെ കാണേണ്ട സമയം.', action: 'ലക്ഷണങ്ങൾ തുടങ്ങിയ സമയം കുറിച്ചുവെക്കുക. രോഗിയെ ഒരു വശത്തേക്ക് ചരിച്ചു കിടത്തുക.' },
    { title: 'ശ്വാസതടസ്സം', symptoms: 'ഗുരുതരമായ ആസ്ത്മ, ശ്വാസം മുട്ടൽ, നഖങ്ങളിലോ ചുണ്ടുകളിലോ നീലനിറം വരിക.', action: 'രോഗിയെ നിവർത്തി ഇരുത്തുക. ഇൻഹേലർ ലഭ്യമാക്കുക.' },
    { title: 'അമിത രക്തസ്രാവം', symptoms: 'സാധാരണ രീതിയിൽ അമർത്തിയാലും നിർത്താൻ കഴിയാത്ത രക്തപ്രവാഹം.', action: 'വൃത്തിയുള്ള തുണികൊണ്ട് മുറിവിൽ അമർത്തിപ്പിടിക്കുക. മുറിവേറ്റ ഭാഗം ഉയർത്തി വെക്കുക.' }
  ]
};

const CPR_STEPS = {
  en: [
    { step: '1', title: 'Check Responsiveness', desc: 'Tap shoulders and shout "Are you okay?". Check chest movement.' },
    { step: '2', title: 'Call Emergency', desc: 'Direct someone specific to call 112 / 911 immediately and fetch an AED.' },
    { step: '3', title: 'Compressions', desc: 'Place hands in center of chest. Push hard and fast (100-120 compressions/min).' },
    { step: '4', title: 'Rescue Breaths', desc: 'If trained, provide 2 breaths after every 30 compressions. Repeat.' }
  ],
  te: [
    { step: '1', title: 'స్పందన తనిఖీ చేయండి', desc: 'భుజాలపై తట్టి "మీరు బాగున్నారా?" అని అడగండి. ఛాతీ కదలికను చూడండి.' },
    { step: '2', title: 'తుర్తు సహాయం కోరండి', desc: 'వెంటనే 112 లేదా 911 కి కాల్ చేయమని ఎవరికైనా సూచించండి.' },
    { step: '3', title: 'ఛాతీ నొక్కడం', desc: 'ఛాతీ మధ్యలో చేతులు ఉంచి వేగంగా మరియు బలంగా నొక్కండి (నిమిషానికి 100-120 సార్లు).' },
    { step: '4', title: 'కృత్రిమ శ్వాస', desc: 'శిక్షణ పొంది ఉంటే, ప్రతి 30 నొక్కుల తర్వాత 2 సార్లు కృత్రిమ శ్వాస అందించండి.' }
  ],
  hi: [
    { step: '1', title: 'प्रतिक्रिया की जांच करें', desc: 'कंधे थपथपाएं और पूछें "क्या आप ठीक हैं?". छाती की गति देखें।' },
    { step: '2', title: 'आपातकालीन कॉल करें', desc: 'किसी को तुरंत 112 / 911 पर कॉल करने और एईडी लाने का निर्देश दें।' },
    { step: '3', title: 'छाती दबाएं (Compressions)', desc: 'हथेली को छाती के बीच में रखें। तेजी से और जोर से दबाएं (100-120 प्रति मिनट)।' },
    { step: '4', title: 'कृत्रिम सांस दें', desc: 'यदि प्रशिक्षित हैं, तो हर 30 बार दबाने के बाद 2 बार मुंह से सांस दें।' }
  ],
  ta: [
    { step: '1', title: 'பதிலைச் சோதிக்கவும்', desc: 'தோள்களைத் தட்டி "நீங்கள் நலமாக இருக்கிறீர்களா?" என்று கேட்கவும். மூச்சை சோதிக்கவும்.' },
    { step: '2', title: 'அவசர உதவிக்கு அழைக்கவும்', desc: 'உடனடியாக 112 / 911 க்கு அழைக்கச் சொல்லுங்கள்.' },
    { step: '3', title: 'நெஞ்சு அழுத்தங்கள்', desc: 'நெஞ்சின் மையப்பகுதியில் கைகளை வைத்து வேகமாக அழுத்தவும் (நிமிடத்திற்கு 100-120 அழுத்தங்கள்).' },
    { step: '4', title: 'செயற்கை சுவாசம்', desc: 'பயிற்சி பெற்றிருந்தால், ஒவ்வொரு 30 அழுத்தங்களுக்குப் பின் 2 முறை செயற்கை சுவாசம் அளிக்கவும்.' }
  ],
  kn: [
    { step: '1', title: 'ಸ್ಪಂದನೆ ಪರಿಶೀಲಿಸಿ', desc: 'ಹೆಗಲನ್ನು ತಟ್ಟಿ "ನೀವು ಆರಾಮವಾಗಿದ್ದೀರಾ?" ಎಂದು ಕೇಳಿ. ಎದೆಯ ಚಲನೆಯನ್ನು ಗಮನಿಸಿ.' },
    { step: '2', title: 'ತುರ್ತು ಕರೆ ಮಾಡಿ', desc: 'ತಕ್ಷಣವೇ 112 / 911 ಗೆ ಕರೆ ಮಾಡಲು ಮತ್ತು ಎಇಡಿ ತರಲು ಯಾರಿಗಾದರೂ ಸೂಚಿಸಿ.' },
    { step: '3', title: 'ಎದೆಯನ್ನು ಒತ್ತಿರಿ', desc: 'ಎದೆಯ ಮಧ್ಯಭಾಗದಲ್ಲಿ ಕೈಗಳನ್ನಿಟ್ಟು ವೇಗವಾಗಿ ಒತ್ತಿರಿ (ನಿಮಿಷಕ್ಕೆ 100-120 ಬಾರಿ).' },
    { step: '4', title: 'ಕೃತಕ ಉಸಿರಾಟ', desc: 'ತರಬೇತಿ ಪಡೆದಿದ್ದರೆ, ಪ್ರತಿ 30 ಒತ್ತಡಗಳ ನಂತರ 2 ಬಾರಿ ಉಸಿರಾಟ ನೀಡಿ.' }
  ],
  ml: [
    { step: '1', title: 'പ്രതികരണം പരിശോധിക്കുക', desc: 'തോളിൽ തട്ടി വിളിക്കുക. നെഞ്ചിന്റെ ചലനം ശ്രദ്ധിക്കുക.' },
    { step: '2', title: 'തുർത്തു സഹായം വിളിക്കുക', desc: 'ഉടനടി 112 / 911 എന്ന നമ്പറിൽ ബന്ധപ്പെടാൻ ആവശ്യപ്പെടുക.' },
    { step: '3', title: 'നെഞ്ച് അമർത്തൽ (CPR)', desc: 'നെഞ്ചിന്റെ മധ്യഭാഗത്ത് കൈകൾ വെച്ച് വേഗത്തിലും ശക്തമായും അമർത്തുക (മിനിറ്റിൽ 100-120 തവണ).' },
    { step: '4', title: 'കൃത്രിമ ശ്വാസം', desc: 'പരിശീലനം സിദ്ധിച്ചവരാണെങ്കിൽ, ഓരോ 30 പ്രാവശ്യം അമർത്തിയ ശേഷവും 2 തവണ കൃത്രിമ ശ്വാസം നൽകുക.' }
  ]
};

export default function Emergency() {
  const { t, language } = useLanguage();

  const scenarios = EMERGENCY_SCENARIOS[language] || EMERGENCY_SCENARIOS.en;
  const cprSteps = CPR_STEPS[language] || CPR_STEPS.en;

  return (
    <div className="page-wrapper" style={{ background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-base) 100%)' }}>
      <div className="section-container" style={{ paddingBottom: '5rem' }}>

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 38, height: 38, background: 'rgba(239, 68, 68, 0.18)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} style={{ color: 'var(--color-rose)' }} />
            </div>
            <h1 className="page-heading" style={{ margin: 0, color: 'var(--color-rose)' }}>{t('emergencyHeading')}</h1>
          </div>
          <p className="page-subheading" style={{ color: 'var(--text-secondary)' }}>{t('emergencySub')}</p>
        </motion.div>

        <div className="symptom-grid" style={{ gridTemplateColumns: '1fr' }}>
          {/* Top Warning & Contacts Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(13, 20, 36, 0.8) 100%)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              borderWidth: '1px',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="ai-pulse" style={{ animation: 'none' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--color-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(244, 63, 94, 0.5)' }}>
                    <ShieldAlert size={28} color="white" />
                  </div>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: 'var(--color-rose)' }}>{t('emergencyContacts')}</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABLE 24/7 NATIONWIDE</span>
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: 700 }}>
                If you or a loved one is experiencing severe chest distress, stroke indicators, acute bleeding, or airway obstructions, do not waste time reading articles or talking to chatbot assistants. Reach clinical paramedics immediately.
              </p>

              {/* Call Hotline Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  href="tel:112"
                  className="btn-danger"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.875rem 1.75rem', textDecoration: 'none', fontSize: '1.05rem',
                    background: 'linear-gradient(135deg, #f43f5e, #ef4444)', color: 'white'
                  }}
                >
                  <Phone size={18} /> {t('emergencyCall') || 'Call Emergency'} - 112
                </a>
                <a
                  href="tel:911"
                  className="btn-ghost"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.875rem 1.75rem', textDecoration: 'none', fontSize: '1.05rem',
                    border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)',
                    background: 'var(--bg-glass)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                >
                  <Phone size={18} /> Call US Dispatch - 911
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lower Grid: Red Flags + CPR Instructions */}
        <div className="symptom-grid" style={{ marginTop: '2rem' }}>
          
          {/* Scenario Red-Flags Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="glass-card" style={{ height: '100%' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} style={{ color: 'var(--color-rose)' }} />
                Red-Flag Symptom Indicators
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {scenarios.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-glass)',
                    borderLeft: '4px solid var(--color-rose)'
                  }}>
                    <h4 style={{ color: 'var(--color-rose)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.35rem' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.4rem' }}>
                      <strong style={{ color: 'var(--text-muted)' }}>Symptoms: </strong>{item.symptoms}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      <strong style={{ color: 'var(--text-muted)' }}>First-Aid action: </strong>{item.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CPR Steps Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="glass-card" style={{ height: '100%' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: 'var(--color-rose)' }} />
                Basic CPR Reference Steps
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                If an adult is completely unresponsive and shows no breathing patterns:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cprSteps.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f43f5e, #ef4444)',
                      color: 'white', fontWeight: 800, fontSize: '0.8rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, boxShadow: '0 2px 8px rgba(244, 63, 94, 0.3)'
                    }}>
                      {item.step}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.15rem 0', color: 'var(--text-primary)' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', padding: '0.75rem', border: '1px dashed rgba(244, 63, 94, 0.3)', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.03)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Heart size={14} style={{ color: 'var(--color-rose)', flexShrink: 0 }} />
                <span>Immediate CPR maintains vital blood circulation to the brain until emergency responders arrive.</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── [NEW] Hospital Listings, Safety & Preparedness ── */}
        <div className="symptom-grid" style={{ marginTop: '2rem' }}>
          
          {/* Nearby Hospital Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card" style={{ height: '100%' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: 'var(--color-primary)' }} />
                Nearby Emergency Hospitals (Demo)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'City Central General Hospital', distance: '1.8 km', phone: '+1 555-0199', address: '450 Clinical Way, Sector 4' },
                  { name: 'Apollo Trauma & Cardiac Center', distance: '3.4 km', phone: '+1 555-0240', address: '12 Medical Plaza, Bypass Road' },
                  { name: 'St. Jude Children & Community Clinic', distance: '4.9 km', phone: '+1 555-0377', address: '88 Wellness Avenue, Downtown' }
                ].map((hosp, i) => (
                  <div key={i} style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>{hosp.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>{hosp.distance}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{hosp.address}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-rose)', fontWeight: 700, marginTop: '0.25rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      <Phone size={10} /> Emergency Desk: {hosp.phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Safety & Preparedness Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="glass-card" style={{ height: '100%' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} style={{ color: '#10b981' }} />
                Preparedness & Safety Tips
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>•</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Keep an Emergency Contacts Card:</strong> Place emergency numbers, blood group info, and a list of current medications in your wallet or on your phone's lock screen.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>•</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Maintain a First Aid Kit:</strong> Keep standard bandages, antiseptics, sterile gauze, aspirin, allergy relievers, and scissors in an accessible cabinet.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>•</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Calmness under Pressure:</strong> If someone collapses, take deep breaths to steady yourself, call emergency dispatch, turn speakerphone on, and state your exact address first.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>•</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Know AED Locations:</strong> Find out where AEDs (Automated External Defibrillators) are located in your workplace, shopping center, or college campus building.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
