import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { emergencyService } from '@/lib/emergencyService';

export function useEmergencyAlerts() {
  const { user } = useAuth();
  const { familyMembers } = useFamilyMembers();

  useEffect(() => {
    if (!user || !familyMembers?.length) return;

    // Get family member IDs to listen for their emergencies
    const familyMemberIds = familyMembers
      .filter(member => member.familyMemberUid)
      .map(member => member.familyMemberUid!);
    
    // Start listening for emergency alerts from family members (excluding current user)
    emergencyService.startEmergencyListener(familyMemberIds, user.uid);

    return () => {
      emergencyService.stopEmergencyListener();
    };
  }, [user, familyMembers]);
}