import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  SidebarProvider, 
  SidebarInset 
} from '@/components/ui/sidebar';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFamilyRelationships } from '@/hooks/useFamilyMembers';
import { FamilyService } from '@/lib/familyService';
import { AccessPermissions, FAMILY_ROLE_LABELS } from '@/types/family';
import { 
  Heart, 
  Pill, 
  Calendar, 
  FileText, 
  Phone, 
  Shield,
  Users,
  Lock,
  Eye
} from 'lucide-react';

export default function FamilyMemberDashboard() {
  const { patientId } = useParams<{ patientId: string }>();
  const { relationships, isLoading } = useFamilyRelationships();
  const [permissions, setPermissions] = useState<AccessPermissions | null>(null);
  const [patientName, setPatientName] = useState<string>('');

  // Find the relationship for this specific patient
  const currentRelationship = relationships.find(rel => rel.patientUid === patientId);

  useEffect(() => {
    const loadPermissions = async () => {
      if (patientId && currentRelationship) {
        try {
          const perms = await FamilyService.getFamilyMemberPermissions(
            currentRelationship.familyMemberUid, 
            patientId
          );
          setPermissions(perms);
          
          // TODO: Load patient name from user profile
          setPatientName('Your Family Member');
        } catch (error) {
          console.error('Error loading permissions:', error);
        }
      }
    };

    loadPermissions();
  }, [patientId, currentRelationship]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentRelationship || !permissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Not Found</h2>
            <p className="text-muted-foreground">
              You don't have permission to view this patient's information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-secondary">
        <SidebarInset className="flex-1">
          <Navbar />
          
          <main className="flex-1 space-y-8 p-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    {patientName}'s Health Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Viewing as {currentRelationship.role === 'other' && currentRelationship.customRole 
                      ? currentRelationship.customRole 
                      : FAMILY_ROLE_LABELS[currentRelationship.role]
                    }
                  </p>
                </div>
                
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <Shield className="h-3 w-3 mr-1" />
                  {currentRelationship.role === 'other' && currentRelationship.customRole 
                    ? currentRelationship.customRole 
                    : FAMILY_ROLE_LABELS[currentRelationship.role]
                  }
                </Badge>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Eye className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  You have read-only access to this patient's health information based on your family role. 
                  You cannot edit or modify any data.
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Access Permissions Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Your Access Permissions
                  </CardTitle>
                  <CardDescription>
                    Based on your family role, you can view the following information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className={`text-center p-3 rounded-lg ${
                      permissions.canViewMedications 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <Pill className={`h-6 w-6 mx-auto mb-2 ${
                        permissions.canViewMedications ? 'text-green-600' : 'text-red-400'
                      }`} />
                      <p className={`text-xs font-medium ${
                        permissions.canViewMedications ? 'text-green-800' : 'text-red-600'
                      }`}>
                        Medications
                      </p>
                    </div>

                    <div className={`text-center p-3 rounded-lg ${
                      permissions.canViewVitals 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <Heart className={`h-6 w-6 mx-auto mb-2 ${
                        permissions.canViewVitals ? 'text-green-600' : 'text-red-400'
                      }`} />
                      <p className={`text-xs font-medium ${
                        permissions.canViewVitals ? 'text-green-800' : 'text-red-600'
                      }`}>
                        Vitals
                      </p>
                    </div>

                    <div className={`text-center p-3 rounded-lg ${
                      permissions.canViewAppointments 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <Calendar className={`h-6 w-6 mx-auto mb-2 ${
                        permissions.canViewAppointments ? 'text-green-600' : 'text-red-400'
                      }`} />
                      <p className={`text-xs font-medium ${
                        permissions.canViewAppointments ? 'text-green-800' : 'text-red-600'
                      }`}>
                        Appointments
                      </p>
                    </div>

                    <div className={`text-center p-3 rounded-lg ${
                      permissions.canViewReports 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <FileText className={`h-6 w-6 mx-auto mb-2 ${
                        permissions.canViewReports ? 'text-green-600' : 'text-red-400'
                      }`} />
                      <p className={`text-xs font-medium ${
                        permissions.canViewReports ? 'text-green-800' : 'text-red-600'
                      }`}>
                        Reports
                      </p>
                    </div>

                    <div className={`text-center p-3 rounded-lg ${
                      permissions.canViewEmergencyContacts 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <Phone className={`h-6 w-6 mx-auto mb-2 ${
                        permissions.canViewEmergencyContacts ? 'text-green-600' : 'text-red-400'
                      }`} />
                      <p className={`text-xs font-medium ${
                        permissions.canViewEmergencyContacts ? 'text-green-800' : 'text-red-600'
                      }`}>
                        Emergency
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medications Card */}
              {permissions.canViewMedications && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-card shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-blue-600" />
                        Medication Schedule
                      </CardTitle>
                      <CardDescription>Current medications and schedules</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No medication data available yet.</p>
                        <p className="text-sm mt-2">This feature will show medication schedules when connected to health devices.</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Vitals Card */}
              {permissions.canViewVitals && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gradient-card shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-600" />
                        Health Metrics
                      </CardTitle>
                      <CardDescription>Latest vitals from health devices</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No vital signs data available yet.</p>
                        <p className="text-sm mt-2">This feature will show health metrics from connected devices like FastTrack Watch.</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Appointments Card */}
              {permissions.canViewAppointments && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-card shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Appointments
                      </CardTitle>
                      <CardDescription>Upcoming medical appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No appointments scheduled.</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Reports Card */}
              {permissions.canViewReports && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="bg-gradient-card shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Health Reports
                      </CardTitle>
                      <CardDescription>Medical reports and test results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No health reports available.</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Emergency Contacts */}
            {permissions.canViewEmergencyContacts && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-gradient-card shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-orange-600" />
                      Emergency Contacts
                    </CardTitle>
                    <CardDescription>Important contacts for emergencies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No emergency contacts configured.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}