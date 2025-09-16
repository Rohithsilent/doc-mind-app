import { useState } from 'react';
import { motion } from 'framer-motion';
import { FamilyMemberHealthPopup } from './FamilyMemberHealthPopup';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FamilyMember, FAMILY_ROLE_LABELS } from '@/types/family';
import { 
  User, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Shield
} from 'lucide-react';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { formatDistanceToNow } from 'date-fns';

interface FamilyMemberCardProps {
  member: FamilyMember;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ member }) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showHealthPopup, setShowHealthPopup] = useState(false);
  const { removeFamilyMember, isRemovingMember } = useFamilyMembers();

  const getStatusBadge = () => {
    switch (member.inviteStatus) {
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleRemove = () => {
    removeFamilyMember(member.id);
    setShowRemoveDialog(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
      >
        <Card 
          className="bg-gradient-card shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer"
          onClick={() => member.inviteStatus === 'accepted' && setShowHealthPopup(true)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3" />
                    {member.role === 'other' && member.customRole 
                      ? member.customRole 
                      : FAMILY_ROLE_LABELS[member.role]
                    }
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {member.email}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Invited {formatDistanceToNow(member.invitedAt, { addSuffix: true })}
              </div>
              
              {member.inviteStatus === 'accepted' && member.acceptedAt && (
                <div className="text-green-600 text-xs">
                  Joined {formatDistanceToNow(member.acceptedAt, { addSuffix: true })}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {member.inviteStatus === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement resend invitation
                    console.log('Resend invitation to', member.email);
                  }}
                >
                  Resend Invitation
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRemoveDialog(true);
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isRemovingMember}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{member.name}</strong> from your family circle? 
              This will immediately revoke their access to your health information and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {member.inviteStatus === 'accepted' && (
        <FamilyMemberHealthPopup
          member={member}
          isOpen={showHealthPopup}
          onClose={() => setShowHealthPopup(false)}
        />
      )}
    </>
  );
};