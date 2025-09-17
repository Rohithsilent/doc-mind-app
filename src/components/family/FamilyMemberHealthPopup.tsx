import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Heart,
  Activity,
  Pill,
  FileText,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Droplets,
  Footprints,
  TrendingUp,
} from 'lucide-react';
import { FamilyMember } from '@/types/family';
import { PrescriptionData } from '@/types/prescription';
import { familyHealthService } from '@/lib/familyHealthService';
import { formatDistanceToNow } from 'date-fns';

interface FamilyMemberHealthPopupProps {
  member: FamilyMember;
  isOpen: boolean;
  onClose: () => void;
}

interface HealthData {
  vitals: any;
  prescriptions: PrescriptionData[];
  reports: any[];
}

export const FamilyMemberHealthPopup: React.FC<FamilyMemberHealthPopupProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const [healthData, setHealthData] = useState<HealthData>({
    vitals: null,
    prescriptions: [],
    reports: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && member.id) {
      fetchHealthData();
    }
  }, [isOpen, member.id]);

  const fetchHealthData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching health data for member:', member.id, member.name);
      
      const [vitals, prescriptions, reports] = await Promise.allSettled([
        familyHealthService.getFamilyMemberVitals(member.id),
        familyHealthService.getFamilyMemberPrescriptions(member.id),
        familyHealthService.getFamilyMemberReports(member.id),
      ]);

      const vitalsData = vitals.status === 'fulfilled' ? vitals.value : null;
      const prescriptionsData = prescriptions.status === 'fulfilled' ? prescriptions.value || [] : [];
      const reportsData = reports.status === 'fulfilled' ? reports.value || [] : [];
      
      console.log('Fetched data summary:', {
        vitals: vitalsData ? 'Available' : 'None',
        prescriptions: prescriptionsData.length,
        reports: reportsData.length
      });

      setHealthData({
        vitals: vitalsData,
        prescriptions: prescriptionsData,
        reports: reportsData,
      });
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to load health data');
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnyData = healthData.vitals || healthData.prescriptions.length > 0 || healthData.reports.length > 0;

  const VitalsSection = () => {
    if (!healthData.vitals) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{healthData.vitals.heartRate}</div>
              <div className="text-sm text-muted-foreground">bpm</div>
            </div>
            <div className="text-center">
              <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{healthData.vitals.oxygenSaturation}</div>
              <div className="text-sm text-muted-foreground">SpO2 %</div>
            </div>
            <div className="text-center">
              <Footprints className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{healthData.vitals.steps}</div>
              <div className="text-sm text-muted-foreground">steps</div>
            </div>
          </div>
          {healthData.vitals.lastUpdated && (
            <div className="text-xs text-muted-foreground text-center">
              Last updated {formatDistanceToNow(new Date(healthData.vitals.lastUpdated), { addSuffix: true })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const PrescriptionsSection = () => {
    if (healthData.prescriptions.length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5 text-primary" />
            Prescriptions ({healthData.prescriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {healthData.prescriptions.slice(0, 3).map((prescription, index) => (
            <div key={prescription.id || index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {prescription.medications.length} medications
                </Badge>
                {prescription.savedAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(prescription.savedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {prescription.medications.slice(0, 2).map((med, medIndex) => (
                  <div key={medIndex} className="text-sm">
                    <span className="font-medium">{med.name}</span> - {med.dosage}
                    <div className="text-xs text-muted-foreground">{med.frequency}</div>
                  </div>
                ))}
                {prescription.medications.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{prescription.medications.length - 2} more medications
                  </div>
                )}
              </div>
            </div>
          ))}
          {healthData.prescriptions.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{healthData.prescriptions.length - 3} more prescriptions
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ReportsSection = () => {
    if (healthData.reports.length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Reports ({healthData.reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {healthData.reports.slice(0, 3).map((report, index) => (
            <div key={report.id || index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{report.title || 'Medical Report'}</div>
                  <div className="text-xs text-muted-foreground">
                    {report.type || 'General'} • {report.date || 'Date not specified'}
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
          ))}
          {healthData.reports.length > 3 && (
            <div className="text-xs text-muted-foreground text-center">
              +{healthData.reports.length - 3} more reports
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            {member.name}'s Health Information
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            ) : !hasAnyData ? (
              <Card className="border-muted">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">No information available</h3>
                    <p className="text-sm">
                      {member.name} doesn't have any health data available to view at this time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <VitalsSection />
                <PrescriptionsSection />
                <ReportsSection />
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};