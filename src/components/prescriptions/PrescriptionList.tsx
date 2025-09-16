import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Calendar, Pill, Trash2 } from "lucide-react";
import { PrescriptionData } from "@/types/prescription";
import { useToast } from "@/components/ui/use-toast";

export function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<PrescriptionData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    const filtered = prescriptions.filter(prescription =>
      prescription.medications.some(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || prescription.rawText.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm]);

  const loadPrescriptions = () => {
    try {
      const saved = localStorage.getItem('prescriptions');
      if (saved) {
        const parsedPrescriptions = JSON.parse(saved);
        setPrescriptions(parsedPrescriptions);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast({
        title: "Error loading prescriptions",
        description: "Failed to load saved prescriptions",
        variant: "destructive",
      });
    }
  };

  const deletePrescription = (id: string) => {
    try {
      const updated = prescriptions.filter(p => p.id !== id);
      setPrescriptions(updated);
      localStorage.setItem('prescriptions', JSON.stringify(updated));
      
      toast({
        title: "Prescription deleted",
        description: "Prescription has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete prescription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search prescriptions by medication name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((prescription, index) => (
            <motion.div
              key={prescription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Prescription from {new Date(prescription.extractedAt).toLocaleDateString()}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePrescription(prescription.id!)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Medications */}
                  <div className="space-y-3">
                    {prescription.medications.map((medication, medIndex) => (
                      <div key={medIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-primary" />
                            <span className="font-medium">{medication.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {medication.dosage}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {medication.frequency}
                            </Badge>
                          </div>
                          {medication.times.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {medication.times.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Raw Text Preview */}
                  <div className="border-t pt-4">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-muted-foreground">
                        View Original Text
                      </summary>
                      <div className="mt-2 p-3 bg-muted text-xs rounded">
                        <pre className="whitespace-pre-wrap">
                          {prescription.rawText.substring(0, 200)}
                          {prescription.rawText.length > 200 && '...'}
                        </pre>
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No prescriptions found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No prescriptions match your search.' : 'Upload your first prescription to get started.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}