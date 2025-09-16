//app with vital
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import HealthWorkerDashboard from "./pages/HealthWorkerDashboard";
import FamilyPage from "./pages/FamilyPage";
import FamilyMemberDashboard from "./pages/FamilyMemberDashboard";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import VitalsDashboard from "./pages/VitalsDashboard";
import SymptomChecker from "./pages/SymptomChecker";
import NotFound from "./pages/NotFound";
import Offline from "./pages/Offline";
import Appointments from "./pages/Appointments";
import DoctorAppointments from "./pages/DoctorAppointments";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { RoleGuard } from "./components/RoleGuard";
import { usePWA } from "./hooks/usePWA";
import { useAuth } from "./hooks/useAuth";
import ScansPage from './pages/ScansPage';
import ReportsHistoryPage from './pages/ReportsHistoryPage';

// --- ADD THESE IMPORTS ---
import { useEffect } from 'react';
import { auth } from '@/lib/firebase'; // Assuming 'auth' is exported from your firebase config
import { syncVitalsFromGoogleFit } from '@/lib/vitalsService';

const queryClient = new QueryClient();

const App = () => {
  const { isOffline } = usePWA();
  const { user, loading } = useAuth();

  // --- VITALS SYNC LOGIC ---
  // This hook runs when the app loads or the user's auth state changes.
  useEffect(() => {
    // Run the sync immediately when the user is logged in
    if (user) {
      syncVitalsFromGoogleFit();
    }

    // Set up an interval to run the sync every hour (3600000 milliseconds)
    const intervalId = setInterval(() => {
      // We check auth.currentUser here because the 'user' object in the closure might be stale
      if (auth.currentUser) { 
        console.log("Running hourly vitals sync...");
        syncVitalsFromGoogleFit();
      }
    }, 3600000);

    // This is a cleanup function that runs when the component unmounts
    // It prevents memory leaks by clearing the interval.
    return () => clearInterval(intervalId);
  }, [user]); // The dependency array ensures this effect re-runs if the user logs in or out.
  // -------------------------

  const getDashboardRedirect = () => {
    // This function is unchanged
    if (!user) return "/login";
    if (!user.role) {
      return "/login";
    }
    switch (user.role) {
      case 'doctor':
        return "/doctor/dashboard";
      case 'healthworker':
        return "/healthworker/dashboard";
      default:
        return "/user/dashboard";
    }
  };

  if (loading) {
    // This part is unchanged
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // The JSX return statement is completely unchanged
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={<Navigate to={getDashboardRedirect()} replace />} />
            
            <Route 
              path="/user/dashboard" 
              element={
                <RoleGuard allowedRoles={['user']}>
                  <Dashboard />
                </RoleGuard>
              } 
            />
            <Route path="/user/vitals-dashboard" element={<VitalsDashboard />} />
            <Route path="/user/scans" element={<ScansPage />} />
            <Route 
              path="/user/symptom-checker" 
              element={
                <RoleGuard allowedRoles={['user']}>
                  <SymptomChecker />
                </RoleGuard>
              } 
            />
            <Route 
              path="/user/family" 
              element={
                <RoleGuard allowedRoles={['user']}>
                  <FamilyPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="/user/prescriptions" 
              element={
                <RoleGuard allowedRoles={['user']}>
                  <PrescriptionsPage />
                </RoleGuard>
              } 
            />
            <Route 
              path="/family-dashboard/:patientId" 
              element={
                <FamilyMemberDashboard />
              } 
            />
            <Route path="/user/reports-history" element={<ReportsHistoryPage />} />
            
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            <Route 
              path="/doctor/dashboard" 
              element={
                <RoleGuard allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </RoleGuard>
              } 
            />
            
            <Route 
              path="/healthworker/dashboard" 
              element={
                <RoleGuard allowedRoles={['healthworker']}>
                  <HealthWorkerDashboard />
                </RoleGuard>
              } 
            />
            
            <Route path="/offline" element={<Offline />} />
            <Route path="*" element={isOffline ? <Offline /> : <NotFound />} />
          </Routes>
          <PWAInstallPrompt />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;