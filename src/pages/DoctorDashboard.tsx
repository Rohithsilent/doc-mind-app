import { motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/Navbar";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Download,
  Heart,
  Thermometer,
  Droplets
} from "lucide-react";

const DoctorDashboard = () => {
  const patients = [
    { 
      id: 1, 
      name: "John Smith", 
      age: 45, 
      condition: "Hypertension", 
      lastVisit: "2024-01-15",
      vitals: { heartRate: 85, temperature: 98.6, spO2: 98 },
      status: "stable"
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      age: 62, 
      condition: "Diabetes Type 2", 
      lastVisit: "2024-01-14",
      vitals: { heartRate: 92, temperature: 99.1, spO2: 96 },
      status: "monitoring"
    },
    { 
      id: 3, 
      name: "Robert Chen", 
      age: 38, 
      condition: "Asthma", 
      lastVisit: "2024-01-13",
      vitals: { heartRate: 78, temperature: 98.4, spO2: 94 },
      status: "urgent"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'monitoring': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

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
                <h2 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h2>
                <p className="text-muted-foreground">
                  Monitor patients, review reports, and manage healthcare delivery.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">+2 from last week</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+1 from yesterday</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Urgent Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reports Pending</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">AI scans to review</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="col-span-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Patient Overview</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + patient.id * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Age {patient.age} • {patient.condition}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last visit: {patient.lastVisit}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span>{patient.vitals.heartRate} BPM</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Thermometer className="h-4 w-4 text-blue-500" />
                              <span>{patient.vitals.temperature}°F</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Droplets className="h-4 w-4 text-cyan-500" />
                              <span>{patient.vitals.spO2}%</span>
                            </div>
                          </div>
                          
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                          
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DoctorDashboard;