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
const queryClient = new QueryClient();

const App = () => {
  const { isOffline } = usePWA();
  const { user, loading } = useAuth();

  const getDashboardRedirect = () => {
    if (!user) return "/login";
    
    console.log('Getting dashboard redirect for user role:', user.role);
    
    // If role is undefined (failed to fetch), redirect to login to retry
    if (!user.role) {
      console.log('User role is undefined, redirecting to login');
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            
            
            {/* Role-based dashboard redirects */}
            <Route path="/dashboard" element={<Navigate to={getDashboardRedirect()} replace />} />
            
            {/* User dashboard routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <RoleGuard allowedRoles={['user']}>
                  <Dashboard />
                </RoleGuard>
              } 
            />
            <Route path="/user/vitals-dashboard" element={<VitalsDashboard />} />
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
            
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            {/* Doctor dashboard routes */}
            <Route 
              path="/doctor/dashboard" 
              element={
                <RoleGuard allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </RoleGuard>
              } 
            />
            
            {/* Health Worker dashboard routes */}
            <Route 
              path="/healthworker/dashboard" 
              element={
                <RoleGuard allowedRoles={['healthworker']}>
                  <HealthWorkerDashboard />
                </RoleGuard>
              } 
            />
            
            <Route path="/offline" element={<Offline />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={isOffline ? <Offline /> : <NotFound />} />
          </Routes>
          <PWAInstallPrompt />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
