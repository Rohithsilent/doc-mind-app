export type FamilyRole = 
  | 'parent' 
  | 'child' 
  | 'spouse' 
  | 'sibling' 
  | 'guardian' 
  | 'caregiver' 
  | 'other';

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: FamilyRole;
  customRole?: string; // Used when role is 'other'
  inviteStatus: 'pending' | 'accepted' | 'expired';
  inviteToken?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  addedBy: string; // Patient UID who added this family member
  familyMemberUid?: string; // UID once they accept the invite
}

export interface FamilyRelationship {
  id: string;
  patientUid: string;
  familyMemberUid: string;
  role: FamilyRole;
  customRole?: string;
  accessPermissions: AccessPermissions;
  createdAt: Date;
  isActive: boolean;
}

export interface AccessPermissions {
  canViewMedications: boolean;
  canViewVitals: boolean;
  canViewAppointments: boolean;
  canViewReports: boolean;
  canViewEmergencyContacts: boolean;
}

export const FAMILY_ROLE_LABELS: Record<FamilyRole, string> = {
  parent: 'Parent',
  child: 'Child',
  spouse: 'Spouse',
  sibling: 'Sibling',
  guardian: 'Guardian',
  caregiver: 'Caregiver',
  other: 'Other'
};

// Default permissions based on role
export const DEFAULT_PERMISSIONS: Record<FamilyRole, AccessPermissions> = {
  parent: {
    canViewMedications: true,
    canViewVitals: true,
    canViewAppointments: true,
    canViewReports: true,
    canViewEmergencyContacts: true,
  },
  spouse: {
    canViewMedications: true,
    canViewVitals: true,
    canViewAppointments: true,
    canViewReports: true,
    canViewEmergencyContacts: true,
  },
  guardian: {
    canViewMedications: true,
    canViewVitals: true,
    canViewAppointments: true,
    canViewReports: true,
    canViewEmergencyContacts: true,
  },
  caregiver: {
    canViewMedications: true,
    canViewVitals: true,
    canViewAppointments: false,
    canViewReports: false,
    canViewEmergencyContacts: true,
  },
  child: {
    canViewMedications: false,
    canViewVitals: true,
    canViewAppointments: false,
    canViewReports: false,
    canViewEmergencyContacts: false,
  },
  sibling: {
    canViewMedications: false,
    canViewVitals: true,
    canViewAppointments: false,
    canViewReports: false,
    canViewEmergencyContacts: false,
  },
  other: {
    canViewMedications: false,
    canViewVitals: true,
    canViewAppointments: false,
    canViewReports: false,
    canViewEmergencyContacts: false,
  },
};