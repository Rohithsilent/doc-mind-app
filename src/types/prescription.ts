export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
}

export interface PrescriptionData {
  medications: MedicationItem[];
  extractedAt: string;
  rawText: string;
  id?: string;
  imageUrl?: string;
  healthSuggestions?: string;
  savedAt?: string;
}

export interface MedicationSchedule {
  id: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  taken: boolean;
  takenAt?: string;
  notes?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number;
  notifyFamily: boolean;
}