import { 
  collection, 
  doc,
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PrescriptionData } from '@/types/prescription';

export class FamilyHealthService {
  // Get vitals data for a family member
  static async getFamilyMemberVitals(familyMemberUid: string) {
    try {
      const vitalsDoc = await getDoc(doc(db, 'vitals', familyMemberUid));
      
      if (vitalsDoc.exists()) {
        const data = vitalsDoc.data();
        return {
          heartRate: data.heartRate || '72',
          oxygenSaturation: data.oxygenSaturation || '98',
          steps: data.steps || '0',
          lastUpdated: data.lastUpdated?.toDate()?.toISOString() || null,
          userId: data.userId
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching family member vitals:', error);
      throw error;
    }
  }

  // Get prescriptions for a family member
  static async getFamilyMemberPrescriptions(familyMemberUid: string): Promise<PrescriptionData[]> {
    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('userUid', '==', familyMemberUid),
        orderBy('savedAt', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const prescriptions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          medications: data.medications || [],
          rawText: data.rawText || '',
          extractedAt: data.extractedAt || new Date().toISOString(),
          savedAt: data.savedAt?.toDate()?.toISOString() || new Date().toISOString(),
          imageUrl: data.imageUrl,
          healthSuggestions: data.healthSuggestions
        } as PrescriptionData;
      });

      return prescriptions;
    } catch (error) {
      console.error('Error fetching family member prescriptions:', error);
      throw error;
    }
  }

  // Get reports for a family member (placeholder - extend as needed)
  static async getFamilyMemberReports(familyMemberUid: string) {
    try {
      // This is a placeholder implementation
      // Replace with actual reports collection query when available
      const q = query(
        collection(db, 'reports'),
        where('userUid', '==', familyMemberUid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Medical Report',
          type: data.type || 'General',
          date: data.date || data.createdAt?.toDate()?.toLocaleDateString(),
          content: data.content,
          createdAt: data.createdAt?.toDate()?.toISOString()
        };
      });

      return reports;
    } catch (error) {
      console.error('Error fetching family member reports:', error);
      // Return empty array instead of throwing to gracefully handle missing reports collection
      return [];
    }
  }
}

export const familyHealthService = FamilyHealthService;