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
  // Get the actual user ID for a family member
  static async getFamilyMemberUserId(familyMemberId: string): Promise<string | null> {
    try {
      console.log('Getting user ID for family member:', familyMemberId);
      const familyMemberDoc = await getDoc(doc(db, 'familyMembers', familyMemberId));
      
      if (familyMemberDoc.exists()) {
        const data = familyMemberDoc.data();
        console.log('Family member data:', data);
        const userId = data.familyMemberUid || data.userId || null;
        console.log('Extracted user ID:', userId);
        return userId;
      }
      
      console.log('Family member document does not exist');
      return null;
    } catch (error) {
      console.error('Error getting family member user ID:', error);
      return null;
    }
  }
  // Get vitals data for a family member
  static async getFamilyMemberVitals(familyMemberId: string) {
    try {
      // First get the actual user ID for this family member
      const actualUserId = await this.getFamilyMemberUserId(familyMemberId);
      
      if (!actualUserId) {
        console.log('No actual user ID found for family member:', familyMemberId);
        return null;
      }
      
      console.log('Fetching vitals for user ID:', actualUserId);
      // Vitals uses userId as document ID, so we query by document ID directly
      const vitalsDoc = await getDoc(doc(db, 'vitals', actualUserId));
      
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
      
      console.log('No vitals document found for user ID:', actualUserId);
      return null;
    } catch (error) {
      console.error('Error fetching family member vitals:', error);
      throw error;
    }
  }

  // Get prescriptions for a family member
  static async getFamilyMemberPrescriptions(familyMemberId: string): Promise<PrescriptionData[]> {
    try {
      // First get the actual user ID for this family member
      const actualUserId = await this.getFamilyMemberUserId(familyMemberId);
      
      if (!actualUserId) {
        console.log('No actual user ID found for family member:', familyMemberId);
        return [];
      }
      
      console.log('Fetching prescriptions for user ID:', actualUserId);
      const q = query(
        collection(db, 'prescriptions'),
        where('userUid', '==', actualUserId),
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

      console.log('Found prescriptions:', prescriptions.length);
      return prescriptions;
    } catch (error) {
      console.error('Error fetching family member prescriptions:', error);
      throw error;
    }
  }

  // Get reports for a family member
  static async getFamilyMemberReports(familyMemberId: string) {
    try {
      // First get the actual user ID for this family member  
      const actualUserId = await this.getFamilyMemberUserId(familyMemberId);
      
      if (!actualUserId) {
        console.log('No actual user ID found for family member:', familyMemberId);
        return [];
      }
      
      console.log('Fetching reports for user ID:', actualUserId);
      // This is a placeholder implementation
      // Replace with actual reports collection query when available
      const q = query(
        collection(db, 'reports'),
        where('userId', '==', actualUserId), // Note: using userId instead of userUid based on your screenshot
        orderBy('date', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Medical Report',
          type: data.type || 'General',
          date: data.date?.toDate()?.toLocaleDateString() || 'Date not specified',
          content: data.content,
          status: data.status,
          urgent: data.urgent,
          createdAt: data.date?.toDate()?.toISOString()
        };
      });

      console.log('Found reports:', reports.length);
      return reports;
    } catch (error) {
      console.error('Error fetching family member reports:', error);
      // Return empty array instead of throwing to gracefully handle missing reports collection
      return [];
    }
  }
}

export const familyHealthService = FamilyHealthService;