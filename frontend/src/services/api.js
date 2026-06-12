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

export const aiService = {
  async analyzeSymptoms(symptoms, historyContext = []) {
    try {
      // If server is available, attempt real request
      const res = await axios.post(`${API_BASE}/symptom/analyze`, { symptoms, context: historyContext });
      return res.data;
    } catch (err) {
      console.warn('Backend not responding, using local AI client simulation.', err.message);
      // Premium Mock AI Engine simulation
      return new Promise((resolve) => {
        setTimeout(() => {
          const lower = symptoms.toLowerCase();
          
          // Emergency warning triggers
          if (
            lower.includes('chest pain') || lower.includes('heart') ||
            lower.includes('stroke') || lower.includes('breathing difficulty') ||
            lower.includes('bleeding') || lower.includes('unconscious')
          ) {
            resolve({
              isEmergency: true,
              severity: 'critical',
              condition: 'Potential Cardiovascular / Acute Distress',
              explanation: 'Based on the red-flag symptoms provided, you might be experiencing a life-threatening medical emergency. Highly critical condition.',
              followUp: 'Are you feeling lightheaded, experiencing radiating pain down your arm, or having severe shortness of breath?',
              suggestions: 'Please do not wait. Call 911 or your local emergency response team right now.'
            });
            return;
          }

          if (lower.includes('cough') || lower.includes('fever') || lower.includes('flu')) {
            resolve({
              isEmergency: false,
              severity: 'low',
              condition: 'Common Viral Upper Respiratory Tract Infection',
              explanation: 'Symptoms align closely with common seasonal viral infections such as a cold or mild influenza.',
              followUp: 'Do you have a persistent high fever above 101°F, sore throat, or body aches?',
              suggestions: 'Rest, hydrate, and monitor your temperature. Over-the-counter flu aids can support symptom relief. If fever persists, contact a clinic.'
            });
          } else if (lower.includes('headache') || lower.includes('migraine')) {
            resolve({
              isEmergency: false,
              severity: 'medium',
              condition: 'Tension Headache or Early Migraine onset',
              explanation: 'Moderate localized head pressure typical of tension or migraine headaches.',
              followUp: 'Is the headache accompanied by visual disturbances, nausea, or sensitivity to light?',
              suggestions: 'Rest in a quiet, dark room, keep hydrated. Consider standard pain relief. Seek immediate care if accompanied by sudden numbness or speech changes.'
            });
          } else {
            resolve({
              isEmergency: false,
              severity: 'medium',
              condition: 'General Symptomatic Presentation',
              explanation: 'Symptoms are noted. A general systemic response has been generated.',
              followUp: 'Could you elaborate on when these symptoms started and if they occur at specific times?',
              suggestions: 'Maintain a symptom log, get adequate rest, and schedule a professional general practitioner checkup.'
            });
          }
        }, 1500);
      });
    }
  },

  async analyzeReport(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_BASE}/report/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      console.warn('Backend not responding, using report mock parser.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            reportName: file.name,
            extractedSummary: 'Complete Blood Count (CBC) Panel Analysis',
            values: [
              { parameter: 'Hemoglobin', value: '11.2 g/dL', normal: '12.0 - 15.5 g/dL', status: 'low' },
              { parameter: 'White Blood Cell Count', value: '6.5 x10^3/uL', normal: '4.5 - 11.0 x10^3/uL', status: 'normal' },
              { parameter: 'Platelets', value: '250 x10^3/uL', normal: '150 - 450 x10^3/uL', status: 'normal' },
              { parameter: 'Vitamin D', value: '18 ng/mL', normal: '30 - 100 ng/mL', status: 'deficient' }
            ],
            explanation: 'The report indicates borderline low Hemoglobin (mild anemia marker) and Vitamin D deficiency. Other standard blood parameters including infection markers (WBC) are within normal boundaries.',
            suggestions: 'Focus on consuming iron-rich foods (spinach, legumes) and discuss a vitamin D3 supplement with your primary physician.'
          });
        }, 2000);
      });
    }
  },

  async analyzeImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post(`${API_BASE}/image/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      console.warn('Backend not responding, using image mock analyzer.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            imageName: file.name,
            confidence: 84.5,
            observation: 'Dermatological Observation: Benign Melanocytic Nevus (Common Mole)',
            explanation: 'The uploaded skin lesion exhibits visual symmetry, clear regular borders, uniform coloration, and a diameter under 6mm. These traits typically correlate with standard benign skin moles.',
            warning: 'This is a preliminary visual indicator only. Do not treat this as a final oncology evaluation.',
            suggestions: 'Observe the mole using the ABCDE rule monthly. Check if it becomes asymmetrical, develops uneven borders, changes color, grows, or bleeds.'
          });
        }, 2000);
      });
    }
  },

  async chatMessage(message, chatHistory = []) {
    try {
      const res = await axios.post(`${API_BASE}/chat/message`, { message, history: chatHistory });
      return res.data;
    } catch (err) {
      console.warn('Backend not responding, using dynamic AI simulation.', err.message);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ text: generateLocalChatResponse(message) });
        }, 1000);
      });
    }
  }
};

// Dynamic local AI engine — keyword-matched rich medical advisor
function generateLocalChatResponse(message) {
  const lower = message.toLowerCase();
  const parts = [];

  const greetings = [
    'Hello! I am your AI health companion. ',
    'Hi there! Glad to assist you today. ',
    'Greetings! Here to help with your health queries. '
  ];
  parts.push(greetings[Math.floor(Math.random() * greetings.length)]);

  let matched = false;

  if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('food') || lower.includes('eat') || lower.includes('weight')) {
    matched = true;
    parts.push('**Nutrition & Diet Guidance:**\n\n');
    parts.push('• **Lean Proteins:** Choose skinless poultry, fish, legumes (lentils, chickpeas), or tofu as your primary protein sources.\n');
    parts.push('• **Complex Carbs:** Opt for oats, brown rice, quinoa, and whole-grain bread over refined white options.\n');
    parts.push('• **Healthy Fats:** Include avocados, olive oil, nuts, and seeds for heart health.\n');
    parts.push('• **Vegetables & Fiber:** Fill half your plate with colorful veggies — spinach, broccoli, and carrots are excellent choices.\n');
    parts.push('• **Hydration:** Aim for 2–3 liters of water daily. Limit sugary drinks and processed foods.\n\n');
    parts.push('A registered dietitian can create a personalized plan tailored to your metabolism and health goals.');
  }

  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired') || lower.includes('rest') || lower.includes('night')) {
    if (matched) parts.push('\n\n---\n\n');
    matched = true;
    parts.push('**Sleep Hygiene Tips:**\n\n');
    parts.push('• **Consistent Schedule:** Sleep and wake at the same time daily — even on weekends — to stabilize your circadian rhythm.\n');
    parts.push('• **Bedroom Environment:** Keep the room cool (~18°C / 65°F), dark, and quiet. Use blackout curtains or white noise if needed.\n');
    parts.push('• **Screen-Free Wind Down:** Avoid screens 45–60 minutes before bed. Blue light suppresses melatonin production.\n');
    parts.push('• **Avoid Late Stimulants:** Limit caffeine after 2 PM and avoid heavy meals or intense exercise close to bedtime.\n');
    parts.push('• **Relaxation Techniques:** Try progressive muscle relaxation, deep breathing, or light reading before sleep.');
  }

  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('cardio') || lower.includes('fitness')) {
    if (matched) parts.push('\n\n---\n\n');
    matched = true;
    parts.push('**Exercise & Fitness Guidance:**\n\n');
    parts.push('• **Weekly Goal:** WHO recommends at least **150 minutes** of moderate aerobic activity (e.g. brisk walking, cycling) per week.\n');
    parts.push('• **Strength Training:** Include resistance exercises for all major muscle groups at least **2 days per week**.\n');
    parts.push('• **Warm-Up & Cool-Down:** Always start with 5–10 minutes of light movement and end with stretching to prevent injury.\n');
    parts.push('• **Progression:** Start slowly and gradually increase intensity — sudden overexertion leads to muscle strain.\n\n');
    parts.push('⚠️ Consult a doctor before starting any new high-intensity exercise regimen, especially if you have existing conditions.');
  }

  if (lower.includes('paracetamol') || lower.includes('ibuprofen') || lower.includes('aspirin') || lower.includes('medicine') || lower.includes('medication') || lower.includes('drug') || lower.includes('tablet') || lower.includes('pill')) {
    if (matched) parts.push('\n\n---\n\n');
    matched = true;
    parts.push('**Medication Information:**\n\n');
    parts.push('• **Paracetamol (Acetaminophen / Crocin):** Safe for fever and mild pain relief. However, the daily maximum (4000 mg for adults) must **never** be exceeded — overuse causes liver damage.\n');
    parts.push('• **Ibuprofen (Brufen / Combiflam):** Anti-inflammatory; best taken **with food** to protect the stomach lining. Avoid if you have ulcers, kidney problems, or are pregnant.\n');
    parts.push('• **Aspirin:** Commonly used for pain and as a blood thinner. Not recommended for children under 16 due to risk of Reye\'s syndrome.\n\n');
    parts.push('⚠️ **IMPORTANT:** Always consult a pharmacist or doctor before starting, stopping, or changing any medication dosage.');
  }

  if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('mental') || lower.includes('depress') || lower.includes('worry') || lower.includes('sad') || lower.includes('relax')) {
    if (matched) parts.push('\n\n---\n\n');
    matched = true;
    parts.push('**Mental Well-being & Stress Management:**\n\n');
    parts.push('• **Mindfulness Practice:** Even 5–10 minutes of daily meditation or deep breathing (4-7-8 technique) significantly lowers cortisol levels.\n');
    parts.push('• **Physical Activity:** Regular exercise is one of the most powerful natural antidepressants — it releases endorphins and improves mood.\n');
    parts.push('• **Social Connection:** Maintaining relationships and talking to trusted friends or family reduces feelings of isolation.\n');
    parts.push('• **Professional Help:** If anxiety or low mood persists for more than 2 weeks and impacts daily life, please reach out to a licensed therapist or counselor.\n\n');
    parts.push('You are not alone — seeking help is a sign of strength, not weakness.');
  }

  if (lower.includes('vitamin') || lower.includes('supplement') || lower.includes('calcium') || lower.includes('iron') || lower.includes('b12') || lower.includes('deficien')) {
    if (matched) parts.push('\n\n---\n\n');
    matched = true;
    parts.push('**Vitamins & Supplements:**\n\n');
    parts.push('• **Vitamin D3:** Essential for bone density and immune function. Found in fatty fish, fortified milk, and sunlight exposure. Deficiency is extremely common.\n');
    parts.push('• **Vitamin B12:** Critical for nerve health and red blood cell production. Found mainly in animal products — vegetarians/vegans often need supplements.\n');
    parts.push('• **Iron:** Key for oxygen transport. Take alongside Vitamin C for better absorption. Avoid taking with calcium-rich foods or tea.\n');
    parts.push('• **Calcium & Magnesium:** Important for bone, muscle and nerve health. Found in dairy, leafy greens, and nuts.\n\n');
    parts.push('Always run a blood panel before starting high-dose supplements to avoid toxicity and unnecessary spending.');
  }

  if (lower.includes('cough') || lower.includes('cold') || lower.includes('fever') || lower.includes('flu') || lower.includes('throat') || lower.includes('congestion')) {
    if (matched) parts.push('\n\n---\n\n');
    matched = true;
    parts.push('**Cold, Cough & Fever Care:**\n\n');
    parts.push('• **Stay Hydrated:** Warm fluids — herbal teas, broths, and honey-lemon water — soothe the throat and help break up mucus.\n');
    parts.push('• **Rest:** Allow your immune system the energy it needs to fight infection by getting adequate sleep.\n');
    parts.push('• **Steam Inhalation:** Helps clear nasal congestion and eases breathing.\n');
    parts.push('• **Salt Gargling:** A warm saline gargle (¼ tsp salt in warm water) reduces throat inflammation.\n\n');
    parts.push('🚨 Seek immediate care if fever exceeds **102°F (38.9°C)** for more than 48 hours, or if breathing becomes difficult.');
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help') || lower.includes('what can you')) {
    if (matched) parts.push('\n\n---\n\n');
    matched = true;
    parts.push('I am your clinical AI health assistant. I can provide detailed guidance on:\n\n');
    parts.push('• **Nutrition & Diet** – balanced eating, weight management, food tips\n');
    parts.push('• **Sleep Hygiene** – overcoming insomnia, building better routines\n');
    parts.push('• **Exercise & Fitness** – cardio schedules, strength tips, injury prevention\n');
    parts.push('• **Medications** – common OTC drug info, dosage warnings\n');
    parts.push('• **Mental Health** – stress management, anxiety coping strategies\n');
    parts.push('• **Vitamins & Supplements** – deficiency guidance, what to take and when\n\n');
    parts.push('Ask me anything about the above topics!');
  }

  if (!matched) {
    parts.push('I am here to help you with health and wellness questions. Could you clarify which of these you are asking about?\n\n');
    parts.push('**1. Nutrition & Diet** (e.g. foods rich in Vitamin D)\n');
    parts.push('**2. Sleep Hygiene** (e.g. how to sleep better)\n');
    parts.push('**3. Exercise** (e.g. beginner cardio routine)\n');
    parts.push('**4. Medications** (e.g. paracetamol precautions)\n');
    parts.push('**5. Mental Well-being** (e.g. managing stress)\n\n');
    parts.push('Please specify and I will provide detailed educational guidance!');
  }

  parts.push('\n\n---\n*⚕️ Disclaimer: I am an AI health information assistant, not a licensed medical doctor. For diagnosis, prescriptions, or urgent health concerns, please consult a qualified healthcare professional.*');

  return parts.join('');
}
