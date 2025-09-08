import { motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/Navbar";
import { HealthWorkerSidebar } from "@/components/HealthWorkerSidebar";
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Heart,
  Activity,
  Phone
} from "lucide-react";

const HealthWorkerDashboard = () => {
  const isOnline = navigator.onLine;
  
  const assignedUsers = [
    {
      id: 1,
      name: "Mary Wilson",
      age: 78,
      address: "123 Oak Street",
      condition: "Elderly Care",
      lastSync: "2 hours ago",
      emergencyContact: "+1-555-0123",
      vitals: { heartRate: 72, spO2: 95 },
      status: "stable",
      hasNotes: true
    },
    {
      id: 2,
      name: "James Brown",
      age: 65,
      address: "456 Pine Avenue", 
      condition: "Post-Surgery Recovery",
      lastSync: "30 minutes ago",
      emergencyContact: "+1-555-0456",
      vitals: { heartRate: 88, spO2: 97 },
      status: "monitoring",
      hasNotes: false
    },
    {
      id: 3,
      name: "Linda Garcia",
      age: 82,
      address: "789 Elm Drive",
      condition: "Chronic Heart Disease",
      lastSync: "5 minutes ago",
      emergencyContact: "+1-555-0789",
      vitals: { heartRate: 95, spO2: 92 },
      status: "urgent",
      hasNotes: true
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
        <HealthWorkerSidebar />
        <SidebarInset className="flex-1">
          <Navbar />
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Health Worker Dashboard</h2>
                <p className="text-muted-foreground">
                  Monitor assigned patients and manage field operations.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <Wifi className="mr-1 h-3 w-3" />
                    Online
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                    <WifiOff className="mr-1 h-3 w-3" />
                    Offline
                  </Badge>
                )}
                <Button variant="outline" size="sm" disabled={!isOnline}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Data
                </Button>
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
                    <CardTitle className="text-sm font-medium">Assigned Patients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">15</div>
                    <p className="text-xs text-muted-foreground">Across 3 districts</p>
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
                    <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">5 completed, 3 pending</p>
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
                    <CardTitle className="text-sm font-medium">Emergency Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">2</div>
                    <p className="text-xs text-muted-foreground">Immediate response needed</p>
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
                    <CardTitle className="text-sm font-medium">Offline Notes</CardTitle>
                    <WifiOff className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4</div>
                    <p className="text-xs text-muted-foreground">Pending sync</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Patient Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignedUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + user.id * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Age {user.age} • {user.condition}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {user.address}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-center">
                            <div className="flex items-center space-x-2 mb-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span>{user.vitals.heartRate}</span>
                              <Activity className="h-4 w-4 text-cyan-500" />
                              <span>{user.vitals.spO2}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Last sync: {user.lastSync}
                            </p>
                          </div>
                          
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              View Notes
                            </Button>
                            <Button variant="outline" size="sm">
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </div>
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

export default HealthWorkerDashboard;