import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Stethoscope, Shield } from "lucide-react";
import { UserRole } from "@/hooks/useAuth";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelect: (role: UserRole, specialist?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RoleSelectionModal = ({ isOpen, onRoleSelect, onCancel, isLoading }: RoleSelectionModalProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [specialist, setSpecialist] = useState<string>('');

  const handleSubmit = () => {
    if (selectedRole === 'doctor' && !specialist) {
      return; // Don't proceed if doctor role but no specialist selected
    }
    onRoleSelect(selectedRole, specialist);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Complete Your Account Setup</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Please select your account type to continue
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Patient</span>
                  </div>
                </SelectItem>
                <SelectItem value="doctor">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>Doctor</span>
                  </div>
                </SelectItem>
                <SelectItem value="healthworker">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Health Worker</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Specialist field for doctors */}
          {selectedRole === 'doctor' && (
            <div className="space-y-2">
              <Label htmlFor="specialist">Medical Specialization</Label>
              <Select value={specialist} onValueChange={setSpecialist}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="emergency">Emergency Medicine</SelectItem>
                  <SelectItem value="endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="family">Family Medicine</SelectItem>
                  <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="internal">Internal Medicine</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="obstetrics">Obstetrics & Gynecology</SelectItem>
                  <SelectItem value="oncology">Oncology</SelectItem>
                  <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="psychiatry">Psychiatry</SelectItem>
                  <SelectItem value="pulmonology">Pulmonology</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="urology">Urology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {selectedRole === 'doctor' && !specialist && (
                <p className="text-sm text-muted-foreground">Please select your specialization to continue</p>
              )}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (selectedRole === 'doctor' && !specialist)}
              className="flex-1"
            >
              {isLoading ? "Setting up..." : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};