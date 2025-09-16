import { motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { PrescriptionUpload } from "@/components/prescriptions/PrescriptionUpload";
import { PrescriptionList } from "@/components/prescriptions/PrescriptionList";
import { MedicationSchedule } from "@/components/prescriptions/MedicationSchedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PrescriptionsPage() {
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
                  Prescription Management
                </h1>
                <p className="text-muted-foreground">
                  Upload, manage, and track your prescriptions with AI-powered insights
                </p>
              </motion.div>

              {/* Tabs for different sections */}
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">Upload Prescription</TabsTrigger>
                  <TabsTrigger value="list">My Prescriptions</TabsTrigger>
                  <TabsTrigger value="schedule">Medication Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6">
                  <PrescriptionUpload />
                </TabsContent>

                <TabsContent value="list" className="space-y-6">
                  <PrescriptionList />
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6">
                  <MedicationSchedule />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}