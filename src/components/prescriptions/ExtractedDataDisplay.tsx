import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Pill, FileText, Calendar } from "lucide-react";
import { PrescriptionData } from "@/types/prescription";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PrescriptionService } from "@/lib/prescriptionService";
import { useAuth } from "@/hooks/useAuth";

interface ExtractedDataDisplayProps {
  data: PrescriptionData;
}

export function ExtractedDataDisplay({ data }: ExtractedDataDisplayProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSavePrescription = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save prescriptions",
        variant: "destructive",
      });
      return;
    }

    try {
      await PrescriptionService.savePrescription(user.uid, data);
      
      toast({
        title: "Prescription saved",
        description: "Your prescription has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({
        title: "Save failed",
        description: "Failed to save prescription",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Extracted Prescription Data
          </CardTitle>
          <Button onClick={handleSavePrescription}>
            Save Prescription
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.medications.length > 0 ? (
          <div className="space-y-4">
            {data.medications.map((medication, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-primary">
                      {medication.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {medication.dosage}
                      </Badge>
                      <Badge variant="outline">
                        {medication.frequency}
                      </Badge>
                    </div>
                  </div>
                </div>

                {medication.times.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Scheduled Times:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {medication.times.map((time, timeIndex) => (
                        <Badge key={timeIndex} variant="outline" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {medication.notes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Notes:</span>
                    </div>
                    <p className="text-sm bg-muted p-2 rounded">
                      {medication.notes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No medications could be extracted from the prescription.</p>
            <p className="text-sm mt-2">
              Please ensure the image is clear and try again.
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span>Extracted on: {new Date(data.extractedAt).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}