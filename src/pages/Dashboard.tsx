import { motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { VitalsCard } from "@/components/dashboard/VitalsCard";
import { AIAssistantCard } from "@/components/dashboard/AIAssistantCard";
import { EmergencySOSButton } from "@/components/dashboard/EmergencySOSButton";
import { FamilyMonitoringCard } from "@/components/dashboard/FamilyMonitoringCard";
import { RecentReportsCard } from "@/components/dashboard/RecentReportsCard";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { FamilyInvitationNotification } from "@/components/family/FamilyInvitationNotification";
import { useEmergencyAlerts } from "@/hooks/useEmergencyAlerts";

export default function Dashboard() {
  // Initialize emergency alerts listener
  useEmergencyAlerts();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Navbar />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Welcome back, User!
                </h1>
                <p className="text-muted-foreground">
                  Here's your health overview for today
                </p>
              </motion.div>

              {/* Family Invitations */}
              <FamilyInvitationNotification />

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* First Row */}
                <VitalsCard />
                <AIAssistantCard />
                <FamilyMonitoringCard />
                
                {/* Second Row */}
                <RecentReportsCard />
                <NotificationsPanel />
                
                {/* Quick Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="bg-gradient-primary p-6 rounded-lg text-white shadow-card"
                >
                  <h3 className="text-lg font-semibold mb-4">Health Score</h3>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                      className="text-4xl font-bold mb-2"
                    >
                      87/100
                    </motion.div>
                    <p className="text-white/80 text-sm">
                      Excellent health indicators this week
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Physical Activity</span>
                      <span>92%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Vital Signs</span>
                      <span>85%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Medication Adherence</span>
                      <span>95%</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Emergency SOS Button */}
              <EmergencySOSButton />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
