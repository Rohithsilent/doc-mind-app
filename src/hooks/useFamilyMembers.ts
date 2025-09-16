import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FamilyService } from '@/lib/familyService';
import { FamilyMember, FamilyRelationship, FamilyRole } from '@/types/family';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useFamilyMembers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get family members for current user (patient)
  const {
    data: familyMembers = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['familyMembers', user?.uid],
    queryFn: () => FamilyService.getFamilyMembers(user?.uid || ''),
    enabled: !!user?.uid && user.role === 'user'
  });

  // Add family member mutation
  const addFamilyMemberMutation = useMutation({
    mutationFn: ({
      name,
      email,
      role,
      customRole
    }: {
      name: string;
      email: string;
      role: FamilyRole;
      customRole?: string;
    }) => FamilyService.addFamilyMember(user?.uid || '', name, email, role, customRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers', user?.uid] });
      toast({
        title: "Family Member Added",
        description: "Invitation sent successfully. They will receive an email to set up their account.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Family Member",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  // Remove family member mutation
  const removeFamilyMemberMutation = useMutation({
    mutationFn: (familyMemberId: string) => 
      FamilyService.removeFamilyMember(user?.uid || '', familyMemberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers', user?.uid] });
      toast({
        title: "Family Member Removed",
        description: "Family member has been removed and their access revoked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Removing Family Member",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  return {
    familyMembers,
    isLoading,
    error,
    addFamilyMember: addFamilyMemberMutation.mutate,
    removeFamilyMember: removeFamilyMemberMutation.mutate,
    isAddingMember: addFamilyMemberMutation.isPending,
    isRemovingMember: removeFamilyMemberMutation.isPending
  };
};

export const useFamilyRelationships = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get family relationships for current user (family member)
  const {
    data: relationships = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['familyRelationships', user?.uid],
    queryFn: () => FamilyService.getFamilyRelationships(user?.uid || ''),
    enabled: !!user?.uid
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: (inviteToken: string) => 
      FamilyService.acceptInvitation(inviteToken, user?.uid || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyRelationships', user?.uid] });
    }
  });

  return {
    relationships,
    isLoading,
    error,
    acceptInvitation: acceptInvitationMutation.mutate,
    isAcceptingInvitation: acceptInvitationMutation.isPending
  };
};