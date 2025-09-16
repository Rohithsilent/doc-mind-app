import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SidebarProvider, 
  SidebarInset 
} from '@/components/ui/sidebar';
import { Navbar } from '@/components/Navbar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddFamilyMemberDialog } from '@/components/family/AddFamilyMemberDialog';
import { FamilyMemberCard } from '@/components/family/FamilyMemberCard';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Heart,
  AlertCircle,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FamilyPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { familyMembers, isLoading } = useFamilyMembers();

  const activeMembers = familyMembers.filter(member => member.inviteStatus === 'accepted');
  const pendingMembers = familyMembers.filter(member => member.inviteStatus === 'pending');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-secondary">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Navbar />
          
          <main className="flex-1 space-y-8 p-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  Family Circle
                </h1>
                <p className="text-muted-foreground mt-2">
                  Securely share your health information with trusted family members
                </p>
              </div>
              
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-primary shadow-glow hover:shadow-card transition-all duration-300"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Family Member
              </Button>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Alert className="border-primary/20 bg-primary/5">
                <Shield className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <strong>Security & Privacy:</strong> Family members must create their own secure accounts. 
                  Access permissions are role-based and you can revoke access anytime.
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {activeMembers.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Invites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {pendingMembers.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Family Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {familyMembers.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Family Members List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : familyMembers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-card shadow-card text-center py-12">
                  <CardContent>
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="text-xl mb-2">No Family Members Yet</CardTitle>
                    <CardDescription className="mb-6 max-w-md mx-auto">
                      Start building your family circle by inviting trusted family members 
                      to securely access your health information.
                    </CardDescription>
                    <Button 
                      onClick={() => setShowAddDialog(true)}
                      className="bg-gradient-primary"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Your First Family Member
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {activeMembers.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Active Family Members ({activeMembers.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeMembers.map((member) => (
                        <FamilyMemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </div>
                )}

                {pendingMembers.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Pending Invitations ({pendingMembers.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingMembers.map((member) => (
                        <FamilyMemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-accent/20 border-accent/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-primary" />
                    How Family Access Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong>1. Secure Invitations:</strong> Family members receive email invitations 
                    to create their own password-protected accounts.
                  </p>
                  <p>
                    <strong>2. Role-Based Access:</strong> Different family roles (Parent, Spouse, Guardian, etc.) 
                    have different levels of access to your health data.
                  </p>
                  <p>
                    <strong>3. You're in Control:</strong> You can remove family members and revoke 
                    their access at any time from this page.
                  </p>
                  <p>
                    <strong>4. Read-Only Access:</strong> Family members can only view your health information; 
                    they cannot edit or modify any data.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </SidebarInset>

        <AddFamilyMemberDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog} 
        />
      </div>
    </SidebarProvider>
  );
}