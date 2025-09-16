import { Users, AlertCircle, Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { FAMILY_ROLE_LABELS } from "@/types/family";
import { useNavigate } from "react-router-dom";
import { FamilyMemberHealthPopup } from "@/components/family/FamilyMemberHealthPopup";
import { useState } from "react";

export function FamilyMonitoringCard() {
  const { familyMembers, isLoading } = useFamilyMembers();
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showHealthPopup, setShowHealthPopup] = useState(false);

  // Transform family members data to include status and last update
  const familyMembersWithStatus = familyMembers
    .filter(member => member.inviteStatus === 'accepted')
    .map(member => ({
      ...member,
      name: member.name,
      relation: member.customRole || FAMILY_ROLE_LABELS[member.role],
      status: "normal", // Default status - could be enhanced with real health data
      lastUpdate: "Recently", // Could be enhanced with real update timestamps
      alert: null, // Could be enhanced with real health alerts
    }));

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setShowHealthPopup(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <Check className="h-4 w-4 text-green-600" />;
      case "attention":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>;
      case "attention":
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Attention</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="transition-transform duration-200"
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Family Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading family members...</div>
          ) : familyMembersWithStatus.length === 0 ? (
            <div className="text-center text-muted-foreground">No family members added yet</div>
          ) : (
            familyMembersWithStatus.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                onClick={() => handleMemberClick(member)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-secondary">
                    {getStatusIcon(member.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{member.name}</p>
                      {getStatusBadge(member.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.relation}</p>
                    {member.alert && (
                      <p className="text-xs text-orange-600 mt-1">{member.alert}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{member.lastUpdate}</p>
                </div>
              </motion.div>
            ))
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-2 border-t border-border"
          >
            <button 
              onClick={() => navigate('/user/family')}
              className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View All Family Members →
            </button>
          </motion.div>
        </CardContent>
      </Card>

      {selectedMember && (
        <FamilyMemberHealthPopup
          member={selectedMember}
          isOpen={showHealthPopup}
          onClose={() => setShowHealthPopup(false)}
        />
      )}
    </motion.div>
  );
}