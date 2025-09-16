import { collection, addDoc, onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notificationService } from '@/lib/notificationService';

export interface EmergencyAlert {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: Timestamp;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'resolved';
}

export class EmergencyService {
  private static instance: EmergencyService;
  private emergencyListener: (() => void) | null = null;

  static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  async createEmergencyAlert(patientId: string, patientName: string): Promise<void> {
    try {
      const emergencyData = {
        patientId,
        patientName,
        timestamp: Timestamp.now(),
        status: 'active',
        location: await this.getCurrentLocation()
      };

      await addDoc(collection(db, 'emergencies'), emergencyData);
      
      // Create local notification for the patient
      notificationService.addNotification({
        id: `emergency-${Date.now()}`,
        type: 'alert',
        title: '🚨 Emergency Alert Sent',
        message: 'Your emergency alert has been sent to family members',
        time: 'now',
        timestamp: Date.now(),
        urgent: true
      });

    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  }

  startEmergencyListener(familyMemberIds: string[], currentUserId: string): void {
    if (this.emergencyListener) {
      this.emergencyListener();
    }

    const emergenciesRef = collection(db, 'emergencies');
    const emergenciesQuery = query(
      emergenciesRef,
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    this.emergencyListener = onSnapshot(emergenciesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const emergency: EmergencyAlert = {
            id: change.doc.id,
            patientId: data.patientId,
            patientName: data.patientName,
            timestamp: data.timestamp,
            location: data.location,
            status: data.status
          };

          // Only create notifications for family members' emergencies, NOT your own
          if (familyMemberIds.includes(emergency.patientId) && emergency.patientId !== currentUserId) {
            this.createEmergencyNotification(emergency);
          }
        }
      });
    });
  }

  stopEmergencyListener(): void {
    if (this.emergencyListener) {
      this.emergencyListener();
      this.emergencyListener = null;
    }
  }

  private createEmergencyNotification(emergency: EmergencyAlert): void {
    notificationService.addNotification({
      id: `emergency-alert-${emergency.id}`,
      type: 'alert',
      title: '🚨 EMERGENCY ALERT',
      message: `${emergency.patientName} has triggered an emergency alert`,
      time: 'now',
      timestamp: Date.now(),
      urgent: true
    });

    // Trigger UI update
    window.dispatchEvent(new CustomEvent('notificationUpdate'));
  }

  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | undefined> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve(undefined);
        },
        { timeout: 5000 }
      );
    });
  }
}

export const emergencyService = EmergencyService.getInstance();