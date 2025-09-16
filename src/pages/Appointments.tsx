import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { createAppointment, getAppointments } from "../lib/storage";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const Appointments: React.FC = () => {
  const [patientName, setPatientName] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<{ uid: string; email?: string }[]>([]);

  // Load appointments
  useEffect(() => {
    const loadAppointments = async () => {
      const data = await getAppointments();
      setAppointments(data);
    };
    loadAppointments();
  }, []);

  // Load doctors (emails) from Firestore
  useEffect(() => {
    const loadDoctors = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "doctor"));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        email: doc.data().email,
      }));
      setDoctors(docs);
    };
    loadDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName || !doctorEmail || !date || !time || !reason) {
      alert("Please fill all fields");
      return;
    }

    const appointment = {
      patientName, // ✅ ensure patientName is stored
      doctorEmail,
      date,
      time,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      await createAppointment(appointment);
      alert("Appointment booked successfully!");
      setPatientName("");
      setDoctorEmail("");
      setDate("");
      setTime("");
      setReason("");
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Error creating appointment:", err);
      alert("Failed to book appointment");
    }
  };

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
                  Appointment Scheduling
                </h1>
                <p className="text-muted-foreground">
                  Book and manage your medical appointments
                </p>
              </motion.div>

              {/* Form Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-card p-6 rounded-lg shadow-card"
              >
                <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Doctor
                    </label>
                    <select
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doc) => (
                        <option key={doc.uid} value={doc.email || ""}>
                          {doc.email || doc.uid}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Time
                      </label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Reason
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-gradient-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Book Appointment
                  </button>
                </form>
              </motion.div>

              {/* Appointment List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-card p-6 rounded-lg shadow-card"
              >
                <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                {appointments.length === 0 ? (
                  <p className="text-muted-foreground">No appointments found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-border">
                          <th className="text-left py-3 px-4 font-medium text-foreground">
                            Patient
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">
                            Doctor Email
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">
                            Time
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">
                            Reason
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((apt, idx) => (
                          <tr key={idx} className="border-b border-border/50">
                            <td className="py-3 px-4 text-foreground">
                              {apt.patientName}
                            </td>
                            <td className="py-3 px-4 text-foreground">
                              {apt.doctorEmail}
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
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {apt.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Appointments;