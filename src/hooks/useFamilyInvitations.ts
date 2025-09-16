import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FamilyService } from '@/lib/familyService';
import { useAuth } from './useAuth';

export const useFamilyInvitations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get pending invitations for the current user (family member)
  const {
    data: pendingInvitations = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['familyInvitations', user?.email],
    queryFn: () => user?.email ? FamilyService.getPendingInvitations(user.email) : [],
    enabled: !!user?.email,
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: ({ inviteToken, familyMemberUid }: { inviteToken: string; familyMemberUid: string }) =>
      FamilyService.acceptInvitation(inviteToken, familyMemberUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['familyRelationships'] });
    },
  });

  // Reject invitation mutation
  const rejectInvitationMutation = useMutation({
    mutationFn: (inviteToken: string) =>
      FamilyService.rejectInvitation(inviteToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyInvitations'] });
    },
  });

  return {
    pendingInvitations,
    isLoading,
    error,
    acceptInvitation: acceptInvitationMutation.mutateAsync,
    rejectInvitation: rejectInvitationMutation.mutateAsync,
    isAcceptingInvitation: acceptInvitationMutation.isPending,
    isRejectingInvitation: rejectInvitationMutation.isPending,
  };
};