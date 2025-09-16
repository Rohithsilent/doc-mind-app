import { PrescriptionData } from "@/types/prescription";

export class GeminiService {
  private static readonly API_KEY = "AIzaSyBZ-ppC05jkxeH3_9_EzNsF2M9Yg0SELME";
  private static readonly API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
}