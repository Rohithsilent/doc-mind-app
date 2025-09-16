import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { db, auth } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { 
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  doctorEmail: string;
  date: string;
  time: string;
  reason: string;
  status: string;
}

const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "canceled">("pending");

  useEffect(() => {
    const loadAppointments = async () => {
      if (!auth.currentUser?.email) return;

      try {
        const q = query(
          collection(db, "appointments"),
          where("doctorEmail", "==", auth.currentUser.email)
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Appointment)
        );
        setAppointments(docs);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, status: "confirmed" | "canceled") => {
    try {
      const appointmentRef = doc(db, "appointments", id);
      await updateDoc(appointmentRef, { status });

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status } : apt
        )
      );

      alert(`Appointment ${status}`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'canceled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DoctorSidebar />
          <SidebarInset className="flex-1">
            <Navbar />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const filteredAppointments = appointments.filter(
    (apt) => apt.status === activeTab
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DoctorSidebar />
        <SidebarInset className="flex-1">
          <Navbar />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between space-y-2"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Doctor's Appointments</h2>
                <p className="text-muted-foreground">
                  Manage and review your patient appointments.
                </p>
              </div>
            </motion.div>

            {/* Status Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex space-x-2"
            >
              {["pending", "confirmed", "canceled"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab as any)}
                  className="capitalize"
                >
                  {tab}
                </Button>
              ))}
            </motion.div>

            {/* Appointments List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No {activeTab} appointments.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="text-left py-3 px-4 font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Patient Name
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Time
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-foreground">
                              Reason
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-foreground">
                              Status
                            </th>
                            {activeTab === "pending" && (
                              <th className="text-left py-3 px-4 font-medium text-foreground">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAppointments.map((apt, index) => (
                            <motion.tr
                              key={apt.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + index * 0.05 }}
                              className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                            >
                              <td className="py-3 px-4 text-foreground font-medium">
                                {apt.patientName}
                              </td>
                              <td className="py-3 px-4 text-foreground">
                                {apt.date}
                              </td>
                              <td className="py-3 px-4 text-foreground">
                                {apt.time}
                              </td>
                              <td className="py-3 px-4 text-foreground">
                                {apt.reason}
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={getStatusColor(apt.status)}>
                                  {apt.status}
                                </Badge>
                              </td>
                              {activeTab === "pending" && (
                                <td className="py-3 px-4">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-200 hover:bg-green-50"
                                      onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                      onClick={() => handleUpdateStatus(apt.id, "canceled")}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </td>
                              )}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DoctorAppointments;