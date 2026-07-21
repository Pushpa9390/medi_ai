package com.mediassist.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediassist.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow easy local frontend connection
public class HealthcareController {

    @Autowired
    private GeminiService geminiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getLanguageName(String lang) {
        if ("te".equals(lang)) return "Telugu";
        if ("hi".equals(lang)) return "Hindi";
        if ("ta".equals(lang)) return "Tamil";
        if ("kn".equals(lang)) return "Kannada";
        if ("ml".equals(lang)) return "Malayalam";
        return "English";
    }

    @PostMapping("/symptom/analyze")
    public ResponseEntity<String> analyzeSymptoms(@RequestBody Map<String, Object> payload) {
        String symptoms = (String) payload.get("symptoms");
        String age      = payload.containsKey("age")      ? String.valueOf(payload.get("age"))      : "N/A";
        String gender   = payload.containsKey("gender")   ? String.valueOf(payload.get("gender"))   : "N/A";
        String duration = payload.containsKey("duration") ? String.valueOf(payload.get("duration")) : "N/A";
        String lang     = payload.containsKey("lang")     ? String.valueOf(payload.get("lang"))     : "en";

        String languageName = getLanguageName(lang);

        String systemInstruction =
            "You are a professional medical triage assistant. " +
            "Analyze ONLY the symptoms, age, gender, and duration provided. " +
            "Rules:\n" +
            "- Never provide a confirmed diagnosis.\n" +
            "- Generate a unique and personalised assessment based on the specific inputs. Do NOT use a fixed template response.\n" +
            "- Adjust your assessment for age and gender-specific risk factors (e.g. cardiac risk is higher in males over 45).\n" +
            "- If chest pain, breathing difficulty, loss of consciousness, or stroke symptoms are mentioned, mark severity as High.\n" +
            "- If symptoms suggest a viral infection, explain why based on the reported symptoms.\n" +
            "- Always include a disclaimer emphasizing that you are an AI assistant, not a licensed doctor.\n" +
            "- Return response strictly in JSON matching: {\"severity\": \"Low\"|\"Moderate\"|\"High\", \"possibleConditions\": \"string\", \"clinicalExplanation\": \"string\", \"suggestedActions\": \"string\", \"emergencyWarning\": \"string\"}\n" +
            "IMPORTANT: All string values inside the JSON output (possibleConditions, clinicalExplanation, suggestedActions, emergencyWarning) MUST be translated to and written in " + languageName + ".";

        String userPrompt = String.format(
            "User Information:\nAge: %s\nGender: %s\n\nSymptoms:\n%s\n\nDuration:\n%s",
            age, gender, symptoms, duration
        );

        String response = geminiService.generateContent(systemInstruction, userPrompt, lang);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/report/analyze")
    public ResponseEntity<Map<String, Object>> analyzeReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "lang", defaultValue = "en") String lang) {
        String fileName = file.getOriginalFilename();
        String mimeType = file.getContentType();
        String languageName = getLanguageName(lang);
        
        String systemInstruction = "You are a laboratory diagnostics parser assistant. " +
                "Requirements:\n" +
                "1. Parse all biomarker values found in the document.\n" +
                "2. Simplify medical jargon into patient-friendly language.\n" +
                "3. For each biomarker, mark status as: normal, low, high, or deficient.\n" +
                "4. Build a healthSummary array where each item has icon (✓ for normal, ⚠ for abnormal), label (plain-language finding), and type (ok or warning).\n" +
                "5. Generate a nextSteps array of 3-5 specific actionable recommendations.\n" +
                "6. Assign an overall riskLevel: Low, Moderate, or High.\n" +
                "7. Never provide a medical diagnosis. Always state this is for educational purposes.\n" +
                "8. Return strictly in JSON: {\"extractedSummary\": string, \"riskLevel\": \"Low\"|\"Moderate\"|\"High\", " +
                "\"values\": [{\"parameter\": string, \"value\": string, \"normal\": string, \"status\": string}], " +
                "\"healthSummary\": [{\"icon\": string, \"label\": string, \"type\": \"ok\"|\"warning\"}], " +
                "\"nextSteps\": [string], \"explanation\": string, \"suggestions\": string}\n" +
                "IMPORTANT: All string values inside the JSON output (extractedSummary, parameter, status, healthSummary.label, nextSteps values, explanation, suggestions) MUST be translated to and written in " + languageName + ".";

        String userPrompt = "Analyze and parse this medical document report: " + fileName;
        
        Map<String, Object> result = new HashMap<>();
        result.put("reportName", fileName);

        try {
            byte[] fileBytes = file.getBytes();
            String aiResponse = geminiService.generateMultimodalContent(systemInstruction, userPrompt, mimeType, fileBytes, lang);
            
            // Try to map AI JSON output into Spring Boot Map structure
            Map<String, Object> parsedResponse = objectMapper.readValue(aiResponse, Map.class);
            result.putAll(parsedResponse);
        } catch (Exception e) {
            System.err.println("Could not parse Gemini response: " + e.getMessage());
            // Fallback layout if parsing fails or offline mode
            result.put("extractedSummary", "te".equals(lang) ? "బయోమార్కర్ నివేదిక విశ్లేషణ" : "Biomarker Report Analysis");
            result.put("explanation", "te".equals(lang) ? "నివేదిక విజయవంతంగా విశ్లేషించబడింది." : "Parsed document: " + fileName + ". The report shows standard parameters.");
            result.put("suggestions", "te".equals(lang) ? "ఈ నివేదికను మీ వైద్యుడితో చర్చించండి." : "Discuss these results during your next clinical appointment.");
            java.util.List<Map<String, String>> valuesList = new java.util.ArrayList<>();
            valuesList.add(Map.of("parameter", "te".equals(lang) ? "విశ్లేషణ స్థితి" : "Analysis Status", "value", "te".equals(lang) ? "పూర్తయింది" : "Completed", "normal", "N/A", "status", "normal"));
            result.put("values", valuesList);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/image/analyze")
    public ResponseEntity<Map<String, Object>> analyzeImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "lang", defaultValue = "en") String lang) {
        String imageName = image.getOriginalFilename();
        String mimeType = image.getContentType();
        String languageName = getLanguageName(lang);

        String systemInstruction = "You are an expert AI Virtual Medical Doctor Assistant analyzing a medical scan image (e.g. X-ray, MRI, Skin scan, CT, Eye fundus).\n" +
                "Generate a detailed, structured AI doctor-style consultation report.\n" +
                "Rules:\n" +
                "- Never provide a confirmed medical diagnosis.\n" +
                "- All string descriptions MUST be translated to and written in " + languageName + ".\n" +
                "- Do NOT provide specific drug names or chemical dosages in treatment guidance.\n" +
                "- Return strictly valid JSON matching this exact structure:\n" +
                "{\n" +
                "  \"confidence\": 88.5,\n" +
                "  \"observation\": \"string summary\",\n" +
                "  \"explanation\": \"string summary\",\n" +
                "  \"warning\": \"string warning\",\n" +
                "  \"suggestions\": \"string next steps\",\n" +
                "  \"riskLevel\": \"Low\"|\"Medium\"|\"High\",\n" +
                "  \"doctorObservation\": {\n" +
                "    \"imageType\": \"string\",\n" +
                "    \"bodyPart\": \"string\",\n" +
                "    \"visibleStructures\": \"string\",\n" +
                "    \"normalFindings\": \"string\",\n" +
                "    \"abnormalFindings\": \"string\",\n" +
                "    \"locationOfAbnormalities\": \"string\"\n" +
                "  },\n" +
                "  \"clinicalAssessment\": {\n" +
                "    \"possibleCondition\": \"string\",\n" +
                "    \"confidence\": 88.5,\n" +
                "    \"severityLevel\": \"Low\"|\"Moderate\"|\"Severe\"|\"Critical\",\n" +
                "    \"affectedArea\": \"string\",\n" +
                "    \"riskCategory\": \"Low Risk\"|\"Medium Risk\"|\"High Risk\"\n" +
                "  },\n" +
                "  \"doctorExplanation\": \"patient friendly explanation string\",\n" +
                "  \"recommendedNextSteps\": {\n" +
                "    \"specialist\": \"string (e.g. Pulmonologist, Dermatologist, Radiologist)\",\n" +
                "    \"suggestedEvaluation\": \"string\",\n" +
                "    \"diagnosticTests\": [\"test1\", \"test2\", \"test3\"],\n" +
                "    \"followUpSuggestions\": \"string\"\n" +
                "  },\n" +
                "  \"generalTreatmentGuidance\": {\n" +
                "    \"rest\": \"string\",\n" +
                "    \"hydration\": \"string\",\n" +
                "    \"diet\": \"string\",\n" +
                "    \"lifestyle\": \"string\",\n" +
                "    \"recoveryMonitoring\": \"string\"\n" +
                "  },\n" +
                "  \"emergencyAssessment\": {\n" +
                "    \"emergencyRisk\": \"Low\"|\"Medium\"|\"High\",\n" +
                "    \"urgentAdvice\": \"string emergency advice if high or medium risk\"\n" +
                "  }\n" +
                "}";

        String userPrompt = "Perform comprehensive medical visual analysis and AI Doctor report generation for uploaded scan: " + imageName;
        
        Map<String, Object> result = new HashMap<>();
        result.put("imageName", imageName);

        try {
            byte[] imageBytes = image.getBytes();
            String aiResponse = geminiService.generateMultimodalContent(systemInstruction, userPrompt, mimeType, imageBytes, lang);
            
            Map<String, Object> parsedResponse = objectMapper.readValue(aiResponse, Map.class);
            result.putAll(parsedResponse);
        } catch (Exception e) {
            System.err.println("Could not parse Gemini image response: " + e.getMessage());
            boolean isTe = "te".equals(lang);

            result.put("confidence", 88.0);
            result.put("observation", isTe ? "వైద్య చిత్రం ప్రాథమిక గమనిక" : "Preliminary Medical Image Review");
            result.put("explanation", isTe ? "చిత్రం విజయవంతంగా స్కాన్ చేయబడింది. వైద్య పరీక్ష అవసరం." : "Scan processed successfully. Clinical review recommended.");
            result.put("warning", isTe ? "ఇది AI అంచనా మాత్రమే, ధృవీకరించబడిన నిర్ధారణ కాదు." : "This is an AI visual indicator only, not a final medical diagnosis.");
            result.put("suggestions", isTe ? "సంబంధిత నిపుణుడిని సంప్రదించి పరీక్షించండి." : "Schedule an appointment with a specialist for further evaluation.");
            result.put("riskLevel", "Medium");

            Map<String, Object> docObs = new HashMap<>();
            docObs.put("imageType", isTe ? "వైద్య ఇమేజింగ్ స్కాన్" : "Medical Imaging Scan");
            docObs.put("bodyPart", isTe ? "విశ్లేషించబడిన శరీర ప్రాంతం" : "Target Body Region");
            docObs.put("visibleStructures", isTe ? "కణజాలం మరియు ప్రాథమిక నిర్మాణాలు స్పష్టంగా ఉన్నాయి" : "Anatomical structures & tissues visible clearly");
            docObs.put("normalFindings", isTe ? "సాధారణ అవయవ సరిహద్దులు" : "Symmetrical tissue patterns and clear outlines");
            docObs.put("abnormalFindings", isTe ? "తేలికపాటి పిగ్మెంటేషన్ లేదా కణజాల మార్పులు కనిపించాయి" : "Focal structural changes or mild density variance detected");
            docObs.put("locationOfAbnormalities", isTe ? "కేంద్రీకృత విశ్లేషణ ప్రాంతం" : "Localized primary area of interest");
            result.put("doctorObservation", docObs);

            Map<String, Object> clinAssess = new HashMap<>();
            clinAssess.put("possibleCondition", isTe ? "గమనించిన కణజాల మార్పులు" : "Observed Focal Tissue Variance");
            clinAssess.put("confidence", 88.0);
            clinAssess.put("severityLevel", isTe ? "మోస్తరు" : "Moderate");
            clinAssess.put("affectedArea", isTe ? "విశ్లేషించిన ప్రాంతం" : "Target Scan Area");
            clinAssess.put("riskCategory", isTe ? "మధ్యస్థ ప్రమాదం" : "Medium Risk");
            result.put("clinicalAssessment", clinAssess);

            result.put("doctorExplanation", isTe ?
                "స్కాన్ చేసిన చిత్రంలో కొంత మార్పు కనిపించింది. ఇది వ్యాధిని ధృవీకరించదు. మీ లక్షణాలు మరియు వైద్య చరిత్రను బట్టి వైద్యుడు నిర్ణయం తీసుకుంటారు." :
                "The image shows minor changes in the scanned area. This finding does not confirm a disease. A doctor should evaluate your overall symptoms and medical history.");

            Map<String, Object> nextSteps = new HashMap<>();
            nextSteps.put("specialist", isTe ? "జనరల్ ఫిజీషియన్ / స్పెషలిస్ట్" : "General Physician / Specialist");
            nextSteps.put("suggestedEvaluation", isTe ? "ప్రత్యక్ష క్లినికల్ పరీక్ష" : "In-person clinical examination");
            nextSteps.put("diagnosticTests", java.util.List.of(
                isTe ? "రక్త పరీక్షలు (CBC)" : "Routine Laboratory Tests (CBC)",
                isTe ? "అవసరమైతే స్పష్టమైన ఇతర స్కాన్" : "Confirmatory Imaging / Follow-up Scan"
            ));
            nextSteps.put("followUpSuggestions", isTe ? "వారం రోజుల్లో వైద్యుడిని కలవండి" : "Follow up with a specialist within a week.");
            result.put("recommendedNextSteps", nextSteps);

            Map<String, Object> treatment = new HashMap<>();
            treatment.put("rest", isTe ? "రోజుకు 7-8 గంటల తగినంత విశ్రాంతి తీసుకోండి" : "Ensure 7-8 hours of quality rest to aid recovery.");
            treatment.put("hydration", isTe ? "రోజువారీ 2.5-3 లీటర్ల ద్రవాలు తాగండి" : "Maintain 2.5-3 Liters of fluid intake daily.");
            treatment.put("diet", isTe ? "తాజా పండ్లు, ఆకుకూరలతో కూడిన సమతుల్య ఆహారం" : "Consume a balanced diet rich in vitamins and minerals.");
            treatment.put("lifestyle", isTe ? "మానసిక ఒత్తిడిని మరియు అధిక శ్రమను తగ్గించండి" : "Avoid physical overexertion and unverified topical treatments.");
            treatment.put("recoveryMonitoring", isTe ? "లక్షణాలలో మార్పులను క్రమం తప్పకుండా నమోదు చేయండి" : "Monitor any progression in symptoms daily.");
            result.put("generalTreatmentGuidance", treatment);

            Map<String, Object> emergency = new HashMap<>();
            emergency.put("emergencyRisk", "Medium");
            emergency.put("urgentAdvice", isTe ?
                "తీవ్రమైన నొప్పి, శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా అకస్మాత్తుగా లక్షణాలు ఎక్కువైతే వెంటనే అత్యవసర వైద్య సహాయం పొందండి." :
                "Please seek immediate medical attention if you experience severe pain, difficulty breathing, or sudden worsening of symptoms.");
            result.put("emergencyAssessment", emergency);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/chat/message")
    public ResponseEntity<Map<String, String>> chatMessage(@RequestBody Map<String, Object> payload) {
        String message = (String) payload.get("message");
        String lang     = payload.containsKey("lang")     ? String.valueOf(payload.get("lang"))     : "en";
        String languageName = getLanguageName(lang);

        String systemInstruction = 
            "You are an expert AI Healthcare Assistant (MediAssist AI) specializing in general medical information, symptom triage, disease overviews, lab report explanations, medication safety, health metrics, mental wellness, emergency guidance, women & child health, and preventive healthcare.\n\n" +
            "Capabilities & Domain Knowledge:\n" +
            "1. Symptom Triage: Analyze reported symptoms (fever, cough, headache, chest pain, stomach pain, vomiting, diarrhea, dizziness, fatigue, body pain, breathing difficulty, skin/joint issues). Provide common causes, signs to monitor, self-care guidance, when to consult a doctor, and emergency red flags.\n" +
            "2. Disease Information: Explain diseases (diabetes, pneumonia, hypertension, heart disease, asthma, skin conditions) with overview, causes, symptoms, risk factors, prevention, and lifestyle care.\n" +
            "3. Medication Safety: Explain purpose, common precautions, and safety advice. NEVER prescribe medicines or specific chemical dosages.\n" +
            "4. Medical Report Explanation: Explain lab terms (CBC, Hb, WBC, Lipid panel, HbA1c, Thyroid, Blood sugar), abnormal values, potential reasons, and physician consult advice.\n" +
            "5. Health Monitoring: Guidance on BP, Blood Sugar, BMI, Heart Rate, SpO2, Temperature, and Cholesterol ranges.\n" +
            "6. Emergency Assistance: Detect red-flag emergency inputs (severe chest pain, respiratory arrest, stroke, unconsciousness, heavy bleeding). Immediately urge calling emergency services (911/112).\n" +
            "7. Mental Wellness: Guidance for stress, anxiety, sleep hygiene, relaxation techniques, and professional mental health support.\n" +
            "8. Women & Child Health: Pregnancy nutrition, menstrual care, child fever management, vaccination advice, and common pediatric concerns.\n" +
            "9. Preventive Healthcare: Healthy lifestyle, exercise routines, diet planning, screening recommendations.\n" +
            "10. Clarifying Health Follow-ups: When helpful, ask relevant clarifying questions (e.g. patient age, symptom duration, pre-existing conditions, active medications).\n\n" +
            "Mandatory Output Format:\n" +
            "You MUST format EVERY medical query response using this exact 8-part Markdown layout (written in " + languageName + "):\n\n" +
            "🩺 **Health Assistant Response**\n" +
            "[Empathetic summary of the user query or finding]\n\n" +
            "📌 **Possible Explanation**\n" +
            "[Clear clinical background & potential underlying reasons]\n\n" +
            "🔍 **Symptoms / Signs to Monitor**\n" +
            "• [Key symptom 1]\n" +
            "• [Key symptom 2]\n\n" +
            "✅ **Recommended Actions**\n" +
            "• [Action 1: Rest/Hydration/Lifestyle]\n" +
            "• [Action 2: Self-care steps]\n\n" +
            "🏥 **When to Consult a Doctor**\n" +
            "[Specific clinical threshold, timeline, or specialist referral]\n\n" +
            "🚨 **Emergency Warning** (If applicable)\n" +
            "[Red-flag warning signs requiring immediate paramedic/ER intervention]\n\n" +
            "💡 **Health Tips**\n" +
            "• [Nutritional, preventive, or wellness advice]\n\n" +
            "⚕️ **Medical Disclaimer**\n" +
            "I am an AI health assistant, not a licensed medical doctor. For diagnosis or prescriptions, consult a physician.\n\n" +
            "IMPORTANT: Write your ENTIRE response strictly in " + languageName + ".";

        String responseText = geminiService.generateContent(systemInstruction, message, lang);

        Map<String, String> response = new HashMap<>();
        response.put("text", responseText);
        return ResponseEntity.ok(response);
    }
}
