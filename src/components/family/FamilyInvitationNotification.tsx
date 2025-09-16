import { useState } from 'react';
import { Bell, Users, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { useFamilyInvitations } from '@/hooks/useFamilyInvitations';
import { useAuth } from '@/hooks/useAuth';
import { FamilyMember } from '@/types/family';
import { toast } from 'sonner';

export function FamilyInvitationNotification() {
  const { user } = useAuth();
  const { pendingInvitations, acceptInvitation, rejectInvitation, isAcceptingInvitation, isRejectingInvitation } = useFamilyInvitations();
  const [selectedInvitation, setSelectedInvitation] = useState<FamilyMember | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);

  if (!pendingInvitations?.length) {
    return null;
  }

  const handleAcceptClick = (invitation: FamilyMember) => {
    setSelectedInvitation(invitation);
    setShowAcceptDialog(true);
  };

  const handleAcceptInvitation = () => {
    if (!selectedInvitation || !user?.uid) return;

    console.log('Attempting to accept invitation:', selectedInvitation.inviteToken);
    acceptInvitation(
      {
        inviteToken: selectedInvitation.inviteToken,
        familyMemberUid: user.uid
      },
      {
        onSuccess: () => {
          console.log('Invitation accepted successfully');
          toast.success('Family invitation accepted successfully!');
          setShowAcceptDialog(false);
          setSelectedInvitation(null);
        },
        onError: (error) => {
          console.error('Error accepting invitation in component:', error);
          toast.error('Failed to accept invitation. Please try again.');
        }
      }
    );
  };

  const handleRejectInvitation = (invitation: FamilyMember) => {
    rejectInvitation(invitation.inviteToken, {
      onSuccess: () => {
        toast.success('Invitation declined');
      },
      onError: (error) => {
        console.error('Error rejecting invitation:', error);
        toast.error('Failed to decline invitation. Please try again.');
      }
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
        className="transition-transform duration-200"
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Family Invitations
              </CardTitle>
              <Badge variant="default" className="bg-primary text-primary-foreground">
                {pendingInvitations.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvitations.map((invitation, index) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-background border border-primary/10 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">Family Access Invitation</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {invitation.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      You've been invited to access family health information as a {invitation.role}
                      {invitation.customRole && ` (${invitation.customRole})`}.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptClick(invitation)}
                        disabled={isAcceptingInvitation}
                        className="flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectInvitation(invitation)}
                        disabled={isRejectingInvitation}
                        className="flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Family Invitation</DialogTitle>
            <DialogDescription>
              You're about to accept an invitation to access family health information as a{' '}
              <span className="font-medium">{selectedInvitation?.role}</span>
              {selectedInvitation?.customRole && (
                <span> ({selectedInvitation.customRole})</span>
              )}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">You will have access to:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Medication schedules (read-only)</li>
                <li>• Basic health metrics (read-only)</li>
                <li>• Emergency contact information</li>
                {selectedInvitation?.role === 'guardian' && (
                  <li>• Extended health reports and history</li>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={isAcceptingInvitation}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptInvitation}
              disabled={isAcceptingInvitation}
            >
              {isAcceptingInvitation ? 'Accepting...' : 'Accept Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}