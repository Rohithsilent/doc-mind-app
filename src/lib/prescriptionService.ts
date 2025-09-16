import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PrescriptionData } from '@/types/prescription';

export class PrescriptionService {
  // Save a prescription to Firestore
  static async savePrescription(
    userUid: string, 
    prescriptionData: PrescriptionData
  ): Promise<string> {
    try {
      const prescriptionDoc = {
        ...prescriptionData,
        userUid,
        savedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionDoc);
      
      console.log('Prescription saved successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving prescription:', error);
      throw error;
    }
  }

  // Get all prescriptions for a user
  static async getPrescriptions(userUid: string): Promise<PrescriptionData[]> {
    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('userUid', '==', userUid)
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
      console.error('Error getting prescriptions:', error);
      throw error;
    }
  }

  // Delete a prescription from Firestore
  static async deletePrescription(prescriptionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'prescriptions', prescriptionId));
      console.log('Prescription deleted successfully:', prescriptionId);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  }
}