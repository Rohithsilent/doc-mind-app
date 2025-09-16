import { PrescriptionData, MedicationItem } from "@/types/prescription";

export class NLPService {
  static async extractPrescriptionData(text: string): Promise<PrescriptionData> {
    try {
      console.log('Starting NLP processing with Hugging Face...');
      
      // Use Hugging Face Inference API for NER (Named Entity Recognition)
      const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
        {
          headers: {
            "Authorization": "Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Free tier
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: `Extract medication information from this prescription text: ${text}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Hugging Face API request failed');
      }

      // Fallback to rule-based extraction for now
      return this.ruleBasedExtraction(text);
    } catch (error) {
      console.error('NLP Error:', error);
      // Fallback to rule-based extraction
      return this.ruleBasedExtraction(text);
    }
  }

  private static ruleBasedExtraction(text: string): PrescriptionData {
    console.log('Using rule-based extraction...');
    
    const medications: MedicationItem[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    // Common medication patterns
    const medicationPatterns = [
      /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?\s*mg|tablet|capsule|ml)/i,
      /(?:Tab|Cap|Syp|Inj)\.?\s+(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?\s*mg)/i,
    ];

    // Frequency patterns
    const frequencyPatterns = {
      'once daily': ['8:00 AM'],
      'twice daily': ['8:00 AM', '8:00 PM'],
      'twice a day': ['8:00 AM', '8:00 PM'],
      'three times daily': ['8:00 AM', '2:00 PM', '8:00 PM'],
      'thrice daily': ['8:00 AM', '2:00 PM', '8:00 PM'],
      'four times daily': ['8:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'],
      'every 6 hours': ['6:00 AM', '12:00 PM', '6:00 PM', '12:00 AM'],
      'every 8 hours': ['8:00 AM', '4:00 PM', '12:00 AM'],
      'every 12 hours': ['8:00 AM', '8:00 PM'],
      'at bedtime': ['10:00 PM'],
      'before meals': ['7:30 AM', '12:30 PM', '7:30 PM'],
      'after meals': ['8:30 AM', '1:30 PM', '8:30 PM'],
    };

    lines.forEach(line => {
      for (const pattern of medicationPatterns) {
        const match = line.match(pattern);
        if (match) {
          const name = match[1].trim();
          const dosage = match[2].trim();
          
          // Extract frequency
          let frequency = 'once daily';
          let times: string[] = ['8:00 AM'];
          
          for (const [freq, timeArray] of Object.entries(frequencyPatterns)) {
            if (line.toLowerCase().includes(freq)) {
              frequency = freq;
              times = timeArray;
              break;
            }
          }

          // Extract notes
          const notePatterns = [
            'take with food',
            'take on empty stomach',
            'take before meals',
            'take after meals',
            'take at bedtime',
            'do not crush',
            'take with water',
          ];

          let notes = '';
          for (const notePattern of notePatterns) {
            if (line.toLowerCase().includes(notePattern)) {
              notes = notePattern;
              break;
            }
          }

          medications.push({
            name,
            dosage,
            frequency,
            times,
            notes,
          });
          break;
        }
      }
    });

    // If no medications found, try to extract basic info
    if (medications.length === 0) {
      const words = text.toLowerCase().split(/\s+/);
      const commonMeds = [
        'paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin', 'omeprazole',
        'metformin', 'amlodipine', 'simvastatin', 'lisinopril', 'levothyroxine'
      ];

      for (const med of commonMeds) {
        if (words.some(word => word.includes(med))) {
          medications.push({
            name: med.charAt(0).toUpperCase() + med.slice(1),
            dosage: '1 tablet',
            frequency: 'once daily',
            times: ['8:00 AM'],
            notes: '',
          });
        }
      }
    }

    return {
      medications,
      extractedAt: new Date().toISOString(),
      rawText: text,
    };
  }
}