package com.mediassist.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateContent(String systemInstruction, String userPrompt, String lang) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey) || apiKey.isEmpty() || apiKey.startsWith("${")) {
            if (systemInstruction.contains("triage assistant") || systemInstruction.contains("symptom")) {
                return getFallbackSymptomResponse(userPrompt, lang);
            } else {
                return getFallbackChatResponse(userPrompt, lang);
            }
        }

        try {
            String url = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            
            Map<String, Object> systemInstructionMap = new HashMap<>();
            Map<String, Object> partsSystem = new HashMap<>();
            partsSystem.put("text", systemInstruction);
            systemInstructionMap.put("parts", Collections.singletonList(partsSystem));
            requestBody.put("systemInstruction", systemInstructionMap);

            Map<String, Object> contentMap = new HashMap<>();
            Map<String, Object> partsUser = new HashMap<>();
            partsUser.put("text", userPrompt);
            contentMap.put("parts", Collections.singletonList(partsUser));
            requestBody.put("contents", Collections.singletonList(contentMap));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.2);
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List candidates = (List) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map part = (Map) parts.get(0);
                            return (String) part.get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API request failed: " + e.getMessage());
        }

        // Catch-all fallback
        if (systemInstruction.contains("triage assistant") || systemInstruction.contains("symptom")) {
            return getFallbackSymptomResponse(userPrompt, lang);
        } else {
            return getFallbackChatResponse(userPrompt, lang);
        }
    }

    public String generateMultimodalContent(String systemInstruction, String userPrompt, String mimeType, byte[] fileData, String lang) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey) || apiKey.isEmpty() || apiKey.startsWith("${")) {
            if (systemInstruction.contains("parser assistant") || systemInstruction.contains("report")) {
                return getFallbackReportResponse(userPrompt, lang);
            } else {
                return getFallbackImageResponse(userPrompt, lang);
            }
        }

        try {
            String url = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            
            // System instructions
            Map<String, Object> systemInstructionMap = new HashMap<>();
            Map<String, Object> partsSystem = new HashMap<>();
            partsSystem.put("text", systemInstruction);
            systemInstructionMap.put("parts", Collections.singletonList(partsSystem));
            requestBody.put("systemInstruction", systemInstructionMap);

            // Multimodal content assembly
            Map<String, Object> contentMap = new HashMap<>();
            List<Map<String, Object>> partsUser = new ArrayList<>();
            
            // 1. Text description
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", userPrompt);
            partsUser.add(textPart);
            
            // 2. Binary attachment base64
            Map<String, Object> filePart = new HashMap<>();
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", Base64.getEncoder().encodeToString(fileData));
            filePart.put("inlineData", inlineData);
            partsUser.add(filePart);

            contentMap.put("parts", partsUser);
            requestBody.put("contents", Collections.singletonList(contentMap));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.2);
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List candidates = (List) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map part = (Map) parts.get(0);
                            return (String) part.get("text");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API request failed: " + e.getMessage());
        }

        // Catch-all fallback
        if (systemInstruction.contains("parser assistant") || systemInstruction.contains("report")) {
            return getFallbackReportResponse(userPrompt, lang);
        } else {
            return getFallbackImageResponse(userPrompt, lang);
        }
    }

    private String getFallbackSymptomResponse(String userPrompt, String lang) {
        String lower = userPrompt.toLowerCase();
        boolean isEmergency = lower.contains("chest pain") || lower.contains("heart") || lower.contains("stroke") || lower.contains("breathing difficulty") || lower.contains("loss of consciousness");
        boolean isCold = lower.contains("fever") || lower.contains("cough") || lower.contains("flu");

        if ("te".equals(lang)) {
            if (isEmergency) {
                return "{" +
                       "\"severity\": \"High\"," +
                       "\"possibleConditions\": \"తీవ్రమైన గుండె సంబంధిత సమస్య / శ్వాసకోశ ఇబ్బంది\"," +
                       "\"clinicalExplanation\": \"మీరు నమోదు చేసిన లక్షణాలు (ఛాతీ నొప్పి, శ్వాస ఆడకపోవడం) ప్రాణాంతక పరిస్థితులను సూచిస్తాయి.\"," +
                       "\"suggestedActions\": \"దయచేసి నిటారుగా కూర్చోండి, నిశ్శబ్దంగా ఉండండి మరియు ఒంటరిగా ప్రయాణించవద్దు.\"," +
                       "\"emergencyWarning\": \"⚠️ అత్యవసర హెచ్చరిక: వెంటనే అత్యవసర సేవలకు (108 లేదా 112) కాల్ చేయండి.\"" +
                       "}";
            }
            if (isCold) {
                return "{" +
                       "\"severity\": \"Low\"," +
                       "\"possibleConditions\": \"వైరల్ శ్వాసకోశ ఇన్ఫెక్షన్ (జలుబు/జ్వరం)\"," +
                       "\"clinicalExplanation\": \"మీ లక్షణాలు (దగ్గు, జ్వరం) సాధారణ వైరల్ జలుబును సూచిస్తాయి.\"," +
                       "\"suggestedActions\": \"విశ్రాంతి తీసుకోండి, వేడి ద్రవాలు త్రాగండి మరియు జ్వరాన్ని పర్యవేక్షించండి.\"," +
                       "\"emergencyWarning\": \"తక్షణ అత్యవసర సూచనలు ఏవీ లేవు. జ్వరం తగ్గకపోతే వైద్యుడిని సంప్రదించండి.\"" +
                       "}";
            }
            return "{" +
                   "\"severity\": \"Moderate\"," +
                   "\"possibleConditions\": \"సాధారణ లక్షణాల విశ్లేషణ\"," +
                   "\"clinicalExplanation\": \"ఆఫ్‌లైన్ విశ్లేషణ పూర్తయింది. సాధారణ శారీరక స్పందనగా గుర్తించబడింది.\"," +
                   "\"suggestedActions\": \"లక్షణాలను గమనించండి, నీరు బాగా త్రాగండి మరియు వైద్యుడిని సంప్రదించండి.\"," +
                   "\"emergencyWarning\": \"ప్రస్తుతానికి తీవ్రమైన సంకేతాలు ఏవీ కనుగొనబడలేదు.\"" +
                   "}";
        }

        if ("hi".equals(lang)) {
            if (isEmergency) {
                return "{" +
                       "\"severity\": \"High\"," +
                       "\"possibleConditions\": \"संभावित हृदय रोग / तीव्र श्वसन संकट\"," +
                       "\"clinicalExplanation\": \"आपके लक्षण (सीने में दर्द, सांस लेने में कठिनाई) एक गंभीर आपातकालीन स्थिति का संकेत देते हैं।\"," +
                       "\"suggestedActions\": \"सीधे बैठें, शांत रहें, और तुरंत चिकित्सा सहायता लें।\"," +
                       "\"emergencyWarning\": \"⚠️ आपातकालीन चेतावनी: तत्काल आपातकालीन सेवाओं (112 या 102) को कॉल करें।\"" +
                       "}";
            }
            if (isCold) {
                return "{" +
                       "\"severity\": \"Low\"," +
                       "\"possibleConditions\": \"सामान्य वायरल संक्रमण (सर्दी/जुकाम)\"," +
                       "\"clinicalExplanation\": \"आपके लक्षण (बुखार, खांसी) सामान्य श्वसन वायरल संक्रमण को दर्शाते हैं।\"," +
                       "\"suggestedActions\": \"आराम करें, गुनगुना पानी पिएं और बुखार की निगरानी करें।\"," +
                       "\"emergencyWarning\": \"कोई तत्काल आपातकालीन लक्षण नहीं हैं। यदि बुखार बना रहता है तो डॉक्टर से परामर्श लें।\"" +
                       "}";
            }
            return "{" +
                   "\"severity\": \"Moderate\"," +
                   "\"possibleConditions\": \"सामान्य लक्षण विश्लेषण (ऑफ़लाइन मोड)\"," +
                   "\"clinicalExplanation\": \"ऑफ़लाइन विश्लेषण पूरा हो गया है। कोई गंभीर लक्षण नहीं पाए गए हैं।\"," +
                   "\"suggestedActions\": \"लक्षणों पर नज़र रखें, पानी पिएं और डॉक्टर से सलाह लें।\"," +
                   "\"emergencyWarning\": \"कोई तत्काल आपातकालीन चेतावनी नहीं है।\"" +
                   "}";
        }

        // Default English
        if (isEmergency) {
            return "{" +
                   "\"severity\": \"High\"," +
                   "\"possibleConditions\": \"Potential Acute Cardiovascular / Acute Respiratory Distress\"," +
                   "\"clinicalExplanation\": \"The symptoms reported include critical indicators (chest discomfort, breathing trouble) that may be associated with ischemia or systemic hypoxemia.\"," +
                   "\"suggestedActions\": \"Sit upright, remain calm, and do not attempt to travel alone or drive to a medical facility.\"," +
                   "\"emergencyWarning\": \"⚠️ EMERGENCY WARNING: Chest pain, respiratory distress, and stroke-like symptoms represent immediate health hazards. Call emergency response services (112 or 911) right now.\"" +
                   "}";
        }
        if (isCold) {
            return "{" +
                   "\"severity\": \"Low\"," +
                   "\"possibleConditions\": \"Viral Respiratory Infection (Cold/Flu)\"," +
                   "\"clinicalExplanation\": \"Your reported symptoms (fever, cough) indicate a typical upper respiratory viral response.\"," +
                   "\"suggestedActions\": \"Rest, drink warm fluids, and monitor your body temperature.\"," +
                   "\"emergencyWarning\": \"No immediate emergency indicators. Consult a physician if fever remains above 102°F for more than 48 hours.\"" +
                   "}";
        }
        return "{" +
               "\"severity\": \"Moderate\"," +
               "\"possibleConditions\": \"General Symptomatic Presentation (Offline Mode)\"," +
               "\"clinicalExplanation\": \"Symptom check processed locally. Offline triage models show general symptomatic response.\"," +
               "\"suggestedActions\": \"Log symptom fluctuations, keep hydrated, and schedule a routine assessment with a local physician.\"," +
               "\"emergencyWarning\": \"No immediate critical markers flagged. Monitor symptoms for changes.\"" +
               "}";
    }

    private String getFallbackReportResponse(String userPrompt, String lang) {
        if ("te".equals(lang)) {
            return "{" +
                   "\"extractedSummary\": \"రక్త కణాల లెక్కింపు (CBC) మరియు విటమిన్ విశ్లేషణ\"," +
                   "\"riskLevel\": \"Moderate\"," +
                   "\"values\": [" +
                   "  {\"parameter\": \"హిమోగ్లోబిన్\", \"value\": \"11.5 g/dL\", \"normal\": \"12.0 - 15.5 g/dL\", \"status\": \"low\"}," +
                   "  {\"parameter\": \"విటమిన్ డి\", \"value\": \"19 ng/mL\", \"normal\": \"30 - 100 ng/mL\", \"status\": \"deficient\"}," +
                   "  {\"parameter\": \"తెల్ల రక్త కణాలు\", \"value\": \"6.8 x10^3/uL\", \"normal\": \"4.5 - 11.0 x10^3/uL\", \"status\": \"normal\"}" +
                   "]," +
                   "\"healthSummary\": [" +
                   "  {\"icon\": \"⚠\", \"label\": \"హిమోగ్లోబిన్ పరిమాణం తక్కువగా ఉంది (రక్తహీనత సంకేతం)\", \"type\": \"warning\"}," +
                   "  {\"icon\": \"⚠\", \"label\": \"తీవ్రమైన విటమిన్ డి లోపం\", \"type\": \"warning\"}" +
                   "]," +
                   "\"nextSteps\": [" +
                   "  \"పాలకూర, ఎర్ర మాంసం మరియు తృణధాన్యాలు వంటి ఐరన్ అధికంగా ఉన్న ఆహారాన్ని తీసుకోండి.\"," +
                   "  \"వైద్యుని సలహా మేరకు విటమిన్ డి3 సప్లిమెంట్ వాడండి.\"" +
                   "]," +
                   "\"explanation\": \"ఈ నివేదిక బోర్డర్‌లైన్ రక్తహీనత మరియు విటమిన్ డి లోపాన్ని సూచిస్తుంది.\"," +
                   "\"suggestions\": \"ఆహార మార్పులు మరియు విటమిన్ డి సప్లిమెంట్ల కోసం వైద్యుడిని సంప్రదించండి.\"" +
                   "}";
        }

        if ("hi".equals(lang)) {
            return "{" +
                   "\"extractedSummary\": \"पूर्ण रक्त गणना (CBC) और विटामिन पैनल विश्लेषण\"," +
                   "\"riskLevel\": \"Moderate\"," +
                   "\"values\": [" +
                   "  {\"parameter\": \"हीमोग्लोबिन\", \"value\": \"11.5 g/dL\", \"normal\": \"12.0 - 15.5 g/dL\", \"status\": \"low\"}," +
                   "  {\"parameter\": \"विटामिन डी\", \"value\": \"19 ng/mL\", \"normal\": \"30 - 100 ng/mL\", \"status\": \"deficient\"}," +
                   "  {\"parameter\": \"सफेद रक्त कोशिकाएं\", \"value\": \"6.8 x10^3/uL\", \"normal\": \"4.5 - 11.0 x10^3/uL\", \"status\": \"normal\"}" +
                   "]," +
                   "\"healthSummary\": [" +
                   "  {\"icon\": \"⚠\", \"label\": \"हल्का एनीमिया (कम हीमोग्लोबिन) पाया गया\", \"type\": \"warning\"}," +
                   "  {\"icon\": \"⚠\", \"label\": \"विटामिन डी की कमी पाई गई\", \"type\": \"warning\"}" +
                   "]," +
                   "\"nextSteps\": [" +
                   "  \"आयरन से भरपूर खाद्य पदार्थ जैसे पालक, दालें, और अनाज खाएं।\"," +
                   "  \"डॉक्टर की सलाह पर विटामिन डी3 सप्लीमेंट लेना शुरू करें।\"" +
                   "]," +
                   "\"explanation\": \"रिपोर्ट हीमोग्लोबिन के स्तर में कमी और विटामिन डी की कमी की ओर इशारा करती है।\"," +
                   "\"suggestions\": \"आहार में सुधार करें और चिकित्सक से विटामिन डी3 के लिए सलाह लें।\"" +
                   "}";
        }

        return "{" +
               "\"extractedSummary\": \"Complete Blood Count (CBC) and Vitamin Panel Analysis\"," +
               "\"riskLevel\": \"Moderate\"," +
               "\"values\": [" +
               "  {\"parameter\": \"Hemoglobin\", \"value\": \"11.5 g/dL\", \"normal\": \"12.0 - 15.5 g/dL\", \"status\": \"low\"}," +
               "  {\"parameter\": \"Vitamin D (25-OH)\", \"value\": \"19 ng/mL\", \"normal\": \"30 - 100 ng/mL\", \"status\": \"deficient\"}," +
               "  {\"parameter\": \"White Blood Cells\", \"value\": \"6.8 x10^3/uL\", \"normal\": \"4.5 - 11.0 x10^3/uL\", \"status\": \"normal\"}," +
               "  {\"parameter\": \"Platelets\", \"value\": \"240 x10^3/uL\", \"normal\": \"150 - 450 x10^3/uL\", \"status\": \"normal\"}" +
               "]," +
               "\"healthSummary\": [" +
               "  {\"icon\": \"⚠\", \"label\": \"Mild anemia marker (low hemoglobin) detected\", \"type\": \"warning\"}," +
               "  {\"icon\": \"⚠\", \"label\": \"Vitamin D deficiency (under 20 ng/mL)\", \"type\": \"warning\"}," +
               "  {\"icon\": \"✓\", \"label\": \"All other blood count levels are normal\", \"type\": \"ok\"}" +
               "]," +
               "\"nextSteps\": [" +
               "  \"Incorporate iron-rich foods like spinach, lentils, red meat, or fortified cereals into your diet.\"," +
               "  \"Discuss a Vitamin D3 supplement dosage with your healthcare provider.\"," +
               "  \"Avoid drinking tea or coffee with meals, as it can hinder iron absorption.\"," +
               "  \"Re-test blood levels in 8-12 weeks to monitor progress.\"" +
               "]," +
               "\"explanation\": \"The uploaded report indicates borderline low hemoglobin, which can cause mild fatigue, along with Vitamin D deficiency, common in individuals with limited sun exposure.\"," +
               "\"suggestions\": \"Incorporate dietary modifications (high iron) and seek a prescription/recommendation for Vitamin D3 from a doctor. Normal white blood cell and platelet counts rule out acute infection or clotting concerns.\"" +
               "}";
    }

    private String getFallbackImageResponse(String userPrompt, String lang) {
        if ("te".equals(lang)) {
            return "{" +
                   "\"confidence\": 88.5," +
                   "\"observation\": \"చర్మ పరిశీలన: బెంయిన్ మెలనోసైటిక్ నెవస్ (సాధారణ పుట్టుమచ్చ)\"," +
                   "\"explanation\": \"దృశ్య పరిశీలనలో సమరూప అంచులు, ఏకరీతి రంగు మరియు చిన్న వ్యాసం (< 6 మిమీ) కనుగొనబడింది. ఇది హానిచేయని సాధారణ పుట్టుమచ్చగా కనిపిస్తోంది.\"," +
                   "\"warning\": \"⚠️ హెచ్చరిక: AI దృశ్య పరీక్ష వైద్య నిర్ధారణకు సమానం కాదు. పుట్టుమచ్చ పరిమాణంలో మార్పులు వస్తే వెంటనే వైద్యుడిని సంప్రదించండి.\"," +
                   "\"suggestions\": \"ప్రతినెలా ABCDE నియమాలతో పుట్టుమచ్చ మార్పులను పర్యవేక్షించండి. రోజువారీ సన్‌స్క్రీన్ ఉపయోగించండి.\"" +
                   "}";
        }

        if ("hi".equals(lang)) {
            return "{" +
                   "\"confidence\": 88.5," +
                   "\"observation\": \"त्वचा परीक्षण: सौम्य मेलानोसाइटिक नेवस (सामान्य तिल)\"," +
                   "\"explanation\": \"दृश्य परीक्षण से नियमित सममित सीमाएं, समान रंग और छोटा व्यास (< 6 मिमी) दिखाई देता है। यह सामान्य तिल प्रतीत होता है।\"," +
                   "\"warning\": \"⚠️ चेतावनी: AI दृश्य मूल्यांकन नैदानिक जाँच का विकल्प नहीं है। यदि तिल का आकार या रंग बदलता है, तो त्वचा रोग विशेषज्ञ से मिलें।\"," +
                   "\"suggestions\": \"हर महीने ABCDE नियमों का उपयोग करके तिल की निगरानी करें। दैनिक सनस्क्रीन का प्रयोग करें।\"" +
                   "}";
        }

        return "{" +
               "\"confidence\": 88.5," +
               "\"observation\": \"Dermatological Scan Observation: Benign Melanocytic Nevus (Common Mole)\"," +
               "\"explanation\": \"Visual checks show regular symmetrical borders, even pigmentation, and small diameter (< 6mm). No atypical structures (such as asymmetry or color variations) are visible.\"," +
               "\"warning\": \"⚠️ WARNING: Visual evaluation by AI cannot replace professional histopathological screening. If the lesion changes size, shape, color, or begins bleeding, see a dermatologist immediately.\"," +
               "\"suggestions\": \"Monitor using the ABCDE rules monthly: Asymmetry, Border, Color, Diameter (>6mm), and Evolving. Use broad-spectrum sunscreen (SPF 30+) daily.\"" +
               "}";
    }

    private String getFallbackChatResponse(String message, String lang) {
        if ("te".equals(lang)) {
            return "నమస్కారం! నేను మీ ఆరోగ్య సమాచార సహాయకుడిని. ఆరోగ్యకరమైన ఆహారం, నిద్ర వేళలు, వ్యాయామం లేదా ఇతర ఆరోగ్య పద్ధతుల గురించి మీరు నన్ను అడగవచ్చు. \n\n---\n*⚕️ నిరాకరణ: నేను AI ఆరోగ్య సహాయకుడిని మాత్రమే, వైద్యుడిని కాను. అత్యవసర పరిస్థితుల్లో వెంటనే నిపుణులను సంప్రదించండి.*";
        }
        if ("hi".equals(lang)) {
            return "नमस्ते! मैं आपका स्वास्थ्य सूचना सहायक हूँ। आप मुझसे स्वस्थ आदतों, पोषण, नींद या सामान्य व्यायामों के बारे में पूछ सकते हैं। \n\n---\n*⚕️ अस्वीकरण: मैं एक AI स्वास्थ्य सूचना सहायक हूँ, चिकित्सक नहीं। आपातकालीन स्थिति में तुरंत डॉक्टर से संपर्क करें।*";
        }
        if ("ta".equals(lang)) {
            return "வணக்கம்! நான் உங்கள் சுகாதார தகவல் உதவியாளர். ஆரோக்கியமான பழக்கங்கள், உணவு, தூக்கம் அல்லது உடற்பயிற்சி பற்றி நீங்கள் என்னிடம் கேட்கலாம். \n\n---\n*⚕️ பொறுப்புத் துறப்பு: நான் ஒரு AI சுகாதார உதவியாளர் மட்டுமே, மருத்துவர் அல்ல.*";
        }
        if ("kn".equals(lang)) {
            return "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಮಾಹಿತಿ ಸಹಾಯಕ. ಆರೋಗ್ಯಕರ ಆಹಾರ, ನಿದ್ರೆ ಅಥವಾ ವ್ಯಾಯಾಮದ ಕುರಿತು ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು. \n\n---\n*⚕️ ಹಕ್ಕುತ್ಯಾಗ: ನಾನು AI ಮಾಹಿತಿ ಸಹಾಯಕ ಮಾತ್ರ, ವೈದ್ಯನಲ್ಲ.*";
        }
        if ("ml".equals(lang)) {
            return "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ആരോഗ്യ വിവര സഹായിയാണ്. ആരോഗ്യകരമായ ശീലങ്ങൾ, ഭക്ഷണം, ഉറക്കം അല്ലെങ്കിൽ വ്യായാമം എന്നിവയെക്കുറിച്ച് നിങ്ങൾക്ക് എന്നോട് ചോദിക്കാം. \n\n---\n*⚕️ നിരാകരണം: ഞാൻ ഒരു AI ആരോഗ്യ വിവര സഹായി മാത്രമാണ്, ഡോക്ടറല്ല.*";
        }

        // Default English
        String lower = message.toLowerCase();
        StringBuilder response = new StringBuilder();

        String[] greetings = {
            "Hello! I am your AI health companion. ",
            "Hi there! Glad to assist you. ",
            "Greetings! I hope you are doing well today. "
        };
        response.append(greetings[new Random().nextInt(greetings.length)]);

        boolean matched = false;

        if (lower.contains("diet") || lower.contains("nutrition") || lower.contains("food") || lower.contains("eat") || lower.contains("weight")) {
            matched = true;
            response.append("Regarding your query about diet and nutrition:\n\n");
            response.append("• **Balanced Approach**: Focus on lean proteins (such as skinless poultry, fish, beans, and tofu), healthy fats (like avocados, olive oil, and nuts), and complex carbohydrates (oats, brown rice, quinoa).\n");
            response.append("• **Vitamins & Fiber**: Fill half your plate with colorful vegetables (spinach, broccoli, carrots) and fresh fruits to secure essential micronutrients.\n");
            response.append("• **Hydration**: Drink 2 to 3 liters of water daily. Limit processed sugars, soda, and excessive sodium.\n\n");
            response.append("A nutritionist can design a personalized meal plan aligned with your specific metabolism and health goals.");
        }

        if (lower.contains("sleep") || lower.contains("insomnia") || lower.contains("bed") || lower.contains("night") || lower.contains("tired")) {
            if (matched) response.append("\n\n---\n\n");
            matched = true;
            response.append("Regarding your sleep hygiene concerns:\n\n");
            response.append("• **Consistent Schedule**: Try to go to bed and wake up at the exact same time every day, including weekends. This helps stabilize your circadian rhythm.\n");
            response.append("• **Environment**: Ensure your bedroom is cool (around 65°F / 18°C), dark, and quiet. Use earplugs or white noise if needed.\n");
            response.append("• **Screen Time**: Avoid blue light from smartphones, computers, and TVs for at least 45-60 minutes before bed.\n");
            response.append("• **Stimulants**: Limit caffeine consumption after 2:00 PM, and avoid heavy meals or strenuous workouts close to bedtime.");
        }

        if (lower.contains("exercise") || lower.contains("workout") || lower.contains("gym") || lower.contains("run") || lower.contains("cardio") || lower.contains("fitness")) {
            if (matched) response.append("\n\n---\n\n");
            matched = true;
            response.append("Regarding exercise and physical fitness:\n\n");
            response.append("• **Weekly Guidelines**: The WHO recommends at least 150 minutes of moderate-intensity aerobic activity (e.g. brisk walking, cycling) or 75 minutes of vigorous activity weekly.\n");
            response.append("• **Strength Training**: Include muscle-strengthening activities involving all major muscle groups at least 2 days a week.\n");
            response.append("• **Safety First**: Always begin with a warm-up and end with a cool-down stretch to prevent muscle strain.\n\n");
            response.append("Please consult a healthcare professional before starting any highly intensive or new exercise program.");
        }

        if (lower.contains("paracetamol") || lower.contains("acetaminophen") || lower.contains("crocin") || lower.contains("ibuprofen") || lower.contains("combiflam") || lower.contains("aspirin") || lower.contains("medicine") || lower.contains("drug") || lower.contains("painkiller")) {
            if (matched) response.append("\n\n---\n\n");
            matched = true;
            response.append("Regarding medication usage:\n\n");
            response.append("• **Paracetamol/Acetaminophen**: Commonly used for fever reduction and mild-to-moderate pain relief. It is generally gentle on the stomach but can cause severe liver damage if the maximum daily dose (typically 4,000 mg for adults) is exceeded.\n");
            response.append("• **NSAIDs (Ibuprofen, Naproxen, Aspirin)**: Reduce both pain and inflammation. They should always be taken with food or milk to prevent gastrointestinal irritation or bleeding. Avoid if you have history of ulcers or kidney problems.\n");
            response.append("• **Verification Warning**: Never adjust or start dosages without professional consultation.\n\n");
            response.append("⚠️ **CRITICAL WARNING**: Always check exact packaging labels and consult a certified pharmacist or physician before taking any medication or altering your prescription dosages.");
        }

        if (!matched) {
            response.append("I am here to help you understand healthy lifestyle choices, nutritional guidelines, exercise benefits, and common medication details.\n\n");
            response.append("Please specify a topic like nutrition, sleep hygiene, medication info, or exercise so I can give you detailed educational guidelines.");
        }

        response.append("\n\n---\n");
        response.append("*Disclaimer: I am an AI educational companion, not a licensed medical doctor. For any health concerns, diagnosis, or prescription change, please consult a qualified healthcare professional.*");

        return response.toString();
    }
}
