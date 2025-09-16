import { PrescriptionData } from "@/types/prescription";

export class GeminiService {
  private static readonly API_KEY = "AIzaSyD20kvHZzFGW34dBwG9u01ci4KutDkyOK0";
  private static readonly API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  static async generateHealthSuggestions(prescriptionData: PrescriptionData): Promise<string> {
    try {
      console.log('Generating AI health suggestions with Gemini...');

      const medicationList = prescriptionData.medications
        .map(med => `${med.name} - ${med.dosage} - ${med.frequency}`)
        .join('\n');

      const prompt = `
        As a healthcare AI assistant, provide personalized health suggestions for a patient prescribed the following medications:

        ${medicationList}

        Please provide:
        1. Dietary recommendations specific to these medications
        2. Lifestyle suggestions that complement the treatment
        3. General wellness tips
        4. Important precautions or interactions to be aware of
        5. Tips for medication adherence

        Keep the suggestions practical, safe, and evidence-based. Remind the user to consult their healthcare provider for any concerns.
      `;

      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback suggestions based on common medication advice
      return this.generateFallbackSuggestions(prescriptionData);
    }
  }

  private static generateFallbackSuggestions(prescriptionData: PrescriptionData): string {
    const medicationCount = prescriptionData.medications.length;
    
    return `
## Health Suggestions for Your Prescription

### 🥗 Dietary Recommendations
- Maintain a balanced diet with plenty of fruits and vegetables
- Stay well-hydrated by drinking 8-10 glasses of water daily
- ${medicationCount > 2 ? 'Consider taking medications with food to reduce stomach irritation' : 'Follow any specific food instructions for your medication'}
- Limit alcohol consumption as it may interact with your medications

### 🏃‍♀️ Lifestyle Suggestions
- Maintain a regular exercise routine (consult your doctor about appropriate activities)
- Ensure adequate sleep (7-9 hours per night) to support healing
- Practice stress management techniques like meditation or deep breathing
- Keep a medication diary to track your response and any side effects

### 💊 Medication Adherence Tips
- Set reminders on your phone for medication times
- Use a pill organizer to avoid missing doses
- Take medications at the same time each day
- Don't stop medications abruptly without consulting your healthcare provider

### ⚠️ Important Reminders
- Always consult your healthcare provider before making any changes to your treatment
- Report any unusual side effects or concerns immediately
- Keep all follow-up appointments with your healthcare team
- Store medications properly according to the instructions

*This information is for educational purposes only and should not replace professional medical advice.*
    `;
  }

  static async analyzeSymptoms(symptoms: string, language: string = 'en'): Promise<any> {
    try {
      console.log('Analyzing symptoms with Gemini AI...');

      // Map language codes properly
      const getLanguageName = (langCode: string) => {
        if (langCode.startsWith('hi')) return 'Hindi';
        if (langCode.startsWith('te')) return 'Telugu';
        return 'English';
      };

      const targetLanguage = getLanguageName(language);

      const prompt = `
        As an expert medical AI assistant, analyze the following symptoms and provide a comprehensive assessment in JSON format.

        IMPORTANT: You MUST respond entirely in ${targetLanguage}. All text content should be in ${targetLanguage} language.

        Symptoms: ${symptoms}

        Please provide your response as a JSON object with exactly these fields:
        {
          "assessment": "Brief overall assessment of the condition in ${targetLanguage}",
          "seriousness": "mild|moderate|serious|emergency",
          "remedies": ["remedy1 in ${targetLanguage}", "remedy2 in ${targetLanguage}", "remedy3 in ${targetLanguage}"],
          "precautions": ["precaution1 in ${targetLanguage}", "precaution2 in ${targetLanguage}"],
          "specialistDoctor": "specific type of specialist doctor to consult in ${targetLanguage}",
          "timeframe": "when to seek medical attention in ${targetLanguage}"
        }

        Important guidelines:
        - ALL text content must be written in ${targetLanguage}
        - Keep each field concise but informative
        - Remedies should be safe, general wellness advice
        - Always recommend professional medical consultation
        - Be specific about the type of specialist doctor
        - Only the "seriousness" field should remain in English (mild/moderate/serious/emergency)
      `;

      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini Symptom Analysis Error:', error);
      
      // Map language codes properly for fallback
      const getLanguageName = (langCode: string) => {
        if (langCode.startsWith('hi')) return 'Hindi';
        if (langCode.startsWith('te')) return 'Telugu';
        return 'English';
      };

      const targetLanguage = getLanguageName(language);

      // Multilingual fallback responses
      const fallbackResponses = {
        English: {
          assessment: "Unable to analyze symptoms at this time. Please consult a healthcare professional.",
          remedies: ["Rest and stay hydrated", "Monitor symptoms closely", "Avoid self-medication"],
          precautions: ["Seek immediate medical attention if symptoms worsen", "Keep track of symptom progression"],
          specialistDoctor: "General Physician",
          timeframe: "within 24-48 hours if symptoms persist"
        },
        Hindi: {
          assessment: "इस समय लक्षणों का विश्लेषण करने में असमर्थ। कृपया किसी स्वास्थ्य पेशेवर से सलाह लें।",
          remedies: ["आराम करें और हाइड्रेटेड रहें", "लक्षणों पर बारीकी से नजर रखें", "स्व-चिकित्सा से बचें"],
          precautions: ["यदि लक्षण बिगड़ते हैं तो तुरंत चिकित्सा सहायता लें", "लक्षणों की प्रगति का रिकॉर्ड रखें"],
          specialistDoctor: "सामान्य चिकित्सक",
          timeframe: "यदि लक्षण बने रहते हैं तो 24-48 घंटों के भीतर"
        },
        Telugu: {
          assessment: "ఈ సమయంలో లక్షణాలను విశ్లేషించలేకపోతున్నాము. దయచేసి ఆరోగ్య నిపుణుడిని సంప్రదించండి.",
          remedies: ["విశ్రాంతి తీసుకోండి మరియు నీరసం తీసుకోండి", "లక్షణాలను దగ్గరగా పర్యవేక్షించండి", "స్వీయ వైద్యం చేయకండి"],
          precautions: ["లక్షణాలు మరింత దిగజారితే వెంటనే వైద్య సహాయం తీసుకోండి", "లక్షణాల పురోగతి రికార్డు ఉంచండి"],
          specialistDoctor: "సాధారణ వైద్యుడు",
          timeframe: "లక్షణాలు కొనసాగితే 24-48 గంటల్లో"
        }
      };

      const fallback = fallbackResponses[targetLanguage as keyof typeof fallbackResponses] || fallbackResponses.English;
      
      return {
        assessment: fallback.assessment,
        seriousness: "moderate",
        remedies: fallback.remedies,
        precautions: fallback.precautions,
        specialistDoctor: fallback.specialistDoctor,
        timeframe: fallback.timeframe
      };
    }
  }
}