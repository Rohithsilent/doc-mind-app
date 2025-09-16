import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  FamilyMember, 
  FamilyRelationship, 
  FamilyRole, 
  DEFAULT_PERMISSIONS,
  AccessPermissions 
} from '@/types/family';

export class FamilyService {
  // Add a family member (sends invite)
  static async addFamilyMember(
    patientUid: string, 
    name: string, 
    email: string, 
    role: FamilyRole,
    customRole?: string
  ): Promise<string> {
    try {
      const inviteToken = crypto.randomUUID();
      
      const familyMember: Omit<FamilyMember, 'id'> = {
        name,
        email: email.toLowerCase(),
        role,
        customRole,
        inviteStatus: 'pending',
        inviteToken,
        invitedAt: new Date(),
        addedBy: patientUid
      };

      const docRef = await addDoc(collection(db, 'familyMembers'), {
        ...familyMember,
        invitedAt: serverTimestamp()
      });

      // TODO: Send email invitation with inviteToken
      console.log(`Family member invitation sent to ${email} with token: ${inviteToken}`);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  }

  // Accept family member invitation
  static async acceptInvitation(inviteToken: string, familyMemberUid: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'familyMembers'),
        where('inviteToken', '==', inviteToken),
        where('inviteStatus', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Invalid or expired invitation token');
      }

      const inviteDoc = querySnapshot.docs[0];
      const inviteData = inviteDoc.data() as FamilyMember;

      // Update family member with acceptance
      await updateDoc(doc(db, 'familyMembers', inviteDoc.id), {
        inviteStatus: 'accepted',
        familyMemberUid,
        acceptedAt: serverTimestamp()
      });

      // Create the family relationship
      const relationship: Omit<FamilyRelationship, 'id'> = {
        patientUid: inviteData.addedBy,
        familyMemberUid,
        role: inviteData.role,
        customRole: inviteData.customRole,
        accessPermissions: DEFAULT_PERMISSIONS[inviteData.role],
        createdAt: new Date(),
        isActive: true
      };

      await addDoc(collection(db, 'familyRelationships'), {
        ...relationship,
        createdAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Get family members for a patient
  static async getFamilyMembers(patientUid: string): Promise<FamilyMember[]> {
    try {
      const q = query(
        collection(db, 'familyMembers'),
        where('addedBy', '==', patientUid),
        orderBy('invitedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invitedAt: doc.data().invitedAt?.toDate() || new Date(),
        acceptedAt: doc.data().acceptedAt?.toDate() || undefined
      })) as FamilyMember[];
    } catch (error) {
      console.error('Error getting family members:', error);
      throw error;
    }
  }

  // Get family relationships for a family member
  static async getFamilyRelationships(familyMemberUid: string): Promise<FamilyRelationship[]> {
    try {
      const q = query(
        collection(db, 'familyRelationships'),
        where('familyMemberUid', '==', familyMemberUid),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FamilyRelationship[];
    } catch (error) {
      console.error('Error getting family relationships:', error);
      throw error;
    }
  }

  // Remove family member (patient action)
  static async removeFamilyMember(patientUid: string, familyMemberId: string): Promise<void> {
    try {
      const familyMemberDoc = await getDoc(doc(db, 'familyMembers', familyMemberId));
      
      if (!familyMemberDoc.exists()) {
        throw new Error('Family member not found');
      }

      const familyMemberData = familyMemberDoc.data() as FamilyMember;
      
      if (familyMemberData.addedBy !== patientUid) {
        throw new Error('Unauthorized to remove this family member');
      }

      // Delete the family member invite
      await deleteDoc(doc(db, 'familyMembers', familyMemberId));

      // Deactivate any existing relationships
      if (familyMemberData.familyMemberUid) {
        const relationshipsQuery = query(
          collection(db, 'familyRelationships'),
          where('patientUid', '==', patientUid),
          where('familyMemberUid', '==', familyMemberData.familyMemberUid),
          where('isActive', '==', true)
        );

        const relationshipsSnapshot = await getDocs(relationshipsQuery);
        const updatePromises = relationshipsSnapshot.docs.map(doc => 
          updateDoc(doc.ref, { isActive: false })
        );
        
        await Promise.all(updatePromises);
      }
    } catch (error) {
      console.error('Error removing family member:', error);
      throw error;
    }
  }

  // Update access permissions
  static async updateAccessPermissions(
    relationshipId: string, 
    permissions: AccessPermissions
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'familyRelationships', relationshipId), {
        accessPermissions: permissions
      });
    } catch (error) {
      console.error('Error updating access permissions:', error);
      throw error;
    }
  }

  // Check if user has family member access to patient data
  static async getFamilyMemberPermissions(
    familyMemberUid: string, 
    patientUid: string
  ): Promise<AccessPermissions | null> {
    try {
      const q = query(
        collection(db, 'familyRelationships'),
        where('familyMemberUid', '==', familyMemberUid),
        where('patientUid', '==', patientUid),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const relationship = querySnapshot.docs[0].data() as FamilyRelationship;
      return relationship.accessPermissions;
    } catch (error) {
      console.error('Error getting family member permissions:', error);
      return null;
    }
  }
}