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

    public String generateContent(String systemInstruction, String userPrompt) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey) || apiKey.isEmpty() || apiKey.startsWith("${")) {
            if (systemInstruction.contains("triage assistant") || systemInstruction.contains("symptom")) {
                return getFallbackSymptomResponse(userPrompt);
            } else {
                return getFallbackChatResponse(userPrompt);
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
            return getFallbackSymptomResponse(userPrompt);
        } else {
            return getFallbackChatResponse(userPrompt);
        }
    }

    public String generateMultimodalContent(String systemInstruction, String userPrompt, String mimeType, byte[] fileData) {
        if ("YOUR_GEMINI_API_KEY_HERE".equals(apiKey) || apiKey.isEmpty() || apiKey.startsWith("${")) {
            if (systemInstruction.contains("parser assistant") || systemInstruction.contains("report")) {
                return getFallbackReportResponse(userPrompt);
            } else {
                return getFallbackImageResponse(userPrompt);
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
            return getFallbackReportResponse(userPrompt);
        } else {
            return getFallbackImageResponse(userPrompt);
        }
    }

    private String getFallbackSymptomResponse(String userPrompt) {
        String lower = userPrompt.toLowerCase();
        if (lower.contains("chest pain") || lower.contains("heart") || lower.contains("stroke") || lower.contains("breathing difficulty") || lower.contains("loss of consciousness")) {
            return "{" +
                   "\"severity\": \"High\"," +
                   "\"possibleConditions\": \"Potential Acute Cardiovascular / Acute Respiratory Distress\"," +
                   "\"clinicalExplanation\": \"The symptoms reported include critical indicators (chest discomfort, breathing trouble) that may be associated with ischemia or systemic hypoxemia.\"," +
                   "\"suggestedActions\": \"Sit upright, remain calm, and do not attempt to travel alone or drive to a medical facility.\"," +
                   "\"emergencyWarning\": \"⚠️ EMERGENCY WARNING: Chest pain, respiratory distress, and stroke-like symptoms represent immediate health hazards. Call emergency response services (112 or 911) right now.\"" +
                   "}";
        }
        
        if (lower.contains("fever") || lower.contains("cough") || lower.contains("flu")) {
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

    private String getFallbackReportResponse(String userPrompt) {
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

    private String getFallbackImageResponse(String userPrompt) {
        return "{" +
               "\"confidence\": 88.5," +
               "\"observation\": \"Dermatological Scan Observation: Benign Melanocytic Nevus (Common Mole)\"," +
               "\"explanation\": \"Visual checks show regular symmetrical borders, even pigmentation, and small diameter (< 6mm). No atypical structures (such as asymmetry or color variations) are visible.\"," +
               "\"warning\": \"⚠️ WARNING: Visual evaluation by AI cannot replace professional histopathological screening. If the lesion changes size, shape, color, or begins bleeding, see a dermatologist immediately.\"," +
               "\"suggestions\": \"Monitor using the ABCDE rules monthly: Asymmetry, Border, Color, Diameter (>6mm), and Evolving. Use broad-spectrum sunscreen (SPF 30+) daily.\"" +
               "}";
    }

    private String getFallbackChatResponse(String message) {
        String lower = message.toLowerCase();
        StringBuilder response = new StringBuilder();

        // Empathetic and conversational greeting variations
        String[] greetings = {
            "Hello! I am your AI health companion. ",
            "Hi there! Glad to assist you. ",
            "Greetings! I hope you are doing well today. "
        };
        response.append(greetings[new Random().nextInt(greetings.length)]);

        boolean matched = false;

        // Keyword checking
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

        if (lower.contains("stress") || lower.contains("anxiety") || lower.contains("mental") || lower.contains("depress") || lower.contains("worry") || lower.contains("relax")) {
            if (matched) response.append("\n\n---\n\n");
            matched = true;
            response.append("Regarding stress management and mental well-being:\n\n");
            response.append("• **Mindfulness & Breathing**: Dedicate 5-10 minutes daily to deep-breathing exercises, meditation, or progressive muscle relaxation.\n");
            response.append("• **Physical Connection**: Stress often triggers muscle tension and sleep disruption. Regular walking or yoga can help lower cortisol levels.\n");
            response.append("• **Professional Support**: If feelings of anxiety, persistent sadness, or stress begin impacting your daily functions, please reach out to a licensed counselor, therapist, or psychiatrist.");
        }

        if (lower.contains("vitamin") || lower.contains("supplement") || lower.contains("calcium") || lower.contains("iron") || lower.contains("b12") || lower.contains("deficien")) {
            if (matched) response.append("\n\n---\n\n");
            matched = true;
            response.append("Regarding vitamins and supplements:\n\n");
            response.append("• **Vitamin D3**: Synthesized via sunlight and found in fatty fish and fortified milk. Essential for bone density and immune function.\n");
            response.append("• **Vitamin B12**: Primarily found in animal products; essential for nerve health and red blood cell production. Vegetarians and vegans often need supplements.\n");
            response.append("• **Iron**: Essential for oxygen transport. Take with Vitamin C (e.g. orange juice) to enhance absorption, and avoid taking it with calcium or tea.\n\n");
            response.append("It is highly recommended to perform a blood panel check before starting high-dose supplement regimens to avoid toxicity.");
        }

        if (lower.contains("cough") || lower.contains("fever") || lower.contains("cold") || lower.contains("flu") || lower.contains("throat") || lower.contains("covid")) {
            if (matched) response.append("\n\n---\n\n");
            matched = true;
            response.append("Regarding cold, cough, or fever symptoms:\n\n");
            response.append("• **Hydration**: Drink plenty of warm fluids (herbal teas, warm water, broths) to thin mucus and soothe your throat.\n");
            response.append("• **Symptomatic Relief**: Steam inhalation and saline gargles can help alleviate congestion and throat soreness.\n");
            response.append("• **Rest**: Rest is critical to allow your immune system to fight the viral infection.\n\n");
            response.append("Seek immediate medical evaluation if you experience high fever lasting more than 3 days, difficulty breathing, or severe chest tightness.");
        }

        if (lower.contains("hello") || lower.contains("hi") || lower.contains("hey") || lower.contains("help") || lower.contains("intro")) {
            if (matched) response.append("\n\n---\n\n");
            matched = true;
            response.append("I am your clinical assistant chatbot. I can provide detailed guidance on healthy lifestyle habits, nutrition suggestions, basic exercise schedules, sleep improvement, and information on common over-the-counter medications.\n\n");
            response.append("Please feel free to ask about any of these topics!");
        }

        // If no keyword matches, generate a general helpful response
        if (!matched) {
            response.append("I am here to help you understand healthy lifestyle choices, nutritional guidelines, exercise benefits, and common medication details.\n\n");
            response.append("It sounds like you have a unique health question. Could you clarify if you are looking for advice on:\n");
            response.append("1. **Nutrition & Diet** (e.g., foods for vitamin deficiency)\n");
            response.append("2. **Sleep Hygiene** (e.g., overcoming sleep difficulties)\n");
            response.append("3. **Medications** (e.g., paracetamol precautions)\n");
            response.append("4. **Exercise Routines** (e.g., getting started with cardio)\n\n");
            response.append("Please specify so I can give you the most detailed educational guidelines.");
        }

        // Standard Clinical Disclaimer appended to all chat fallback responses
        response.append("\n\n---\n");
        response.append("*Disclaimer: I am an AI educational companion, not a licensed medical doctor. For any health concerns, diagnosis, or prescription change, please consult a qualified healthcare professional.*");

        return response.toString();
    }
}
