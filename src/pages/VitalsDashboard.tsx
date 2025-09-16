import { useEffect, useState } from "react";
import { Heart, Activity, Footprints, TrendingUp, Loader2, Calendar, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

type Vital = {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  status: "normal" | "good" | "warning";
  trend: string;
  color: string;
  bgColor: string;
};

type ActivityData = {
  name: string;
  duration: number;
  calories: number;
};

type ChartData = {
  time: string;
  heartRate?: number;
  steps?: number;
};

// Static fallback data
const staticVitalsData: { [key: string]: string } = {
  "Heart Rate": "72",
  "SpO₂": "98",
  "Steps Today": "8,432",
};

const initialVitals: Vital[] = [
  { 
    label: "Heart Rate", 
    value: "...", 
    unit: "bpm", 
    icon: Heart, 
    status: "normal", 
    trend: "+2%",
    color: "text-red-500",
    bgColor: "bg-red-50"
  },
  { 
    label: "SpO₂", 
    value: "...", 
    unit: "%", 
    icon: Activity, 
    status: "normal", 
    trend: "+0.5%",
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  { 
    label: "Steps Today", 
    value: "...", 
    unit: "steps", 
    icon: Footprints, 
    status: "good", 
    trend: "+15%",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
];

// Mock chart data for demonstration
const mockHeartRateData: ChartData[] = [
  { time: '6 AM', heartRate: 65 },
  { time: '9 AM', heartRate: 72 },
  { time: '12 PM', heartRate: 78 },
  { time: '3 PM', heartRate: 82 },
  { time: '6 PM', heartRate: 75 },
  { time: '9 PM', heartRate: 68 },
];

const mockStepsData: ChartData[] = [
  { time: '6 AM', steps: 0 },
  { time: '9 AM', steps: 1200 },
  { time: '12 PM', steps: 3500 },
  { time: '3 PM', steps: 5800 },
  { time: '6 PM', steps: 7200 },
  { time: '9 PM', steps: 8432 },
];

export default function VitalsDashboard() {
  const [vitals, setVitals] = useState<Vital[]>(initialVitals);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [heartRateData, setHeartRateData] = useState<ChartData[]>(mockHeartRateData);
  const [stepsData, setStepsData] = useState<ChartData[]>(mockStepsData);
  const { user } = useAuth();

  const fetchPhysicalActivities = async (accessToken: string) => {
    const endTime = Date.now();
    const startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 7 days ago

    try {
      const response = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTime).toISOString()}&endTime=${new Date(endTime).toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const activityData: ActivityData[] = data.session?.map((session: any) => ({
          name: session.name || session.activityType?.toString() || 'Unknown Activity',
          duration: Math.round((session.endTimeMillis - session.startTimeMillis) / 60000), // minutes
          calories: session.activeTimeMillis ? Math.round(session.activeTimeMillis / 60000 * 5) : 0, // rough estimate
        })) || [];
        
        setActivities(activityData.slice(0, 5)); // Show last 5 activities
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    const fetchAllVitals = async () => {
      const accessToken = sessionStorage.getItem('googleFitAccessToken');

      if (!user || !accessToken) {
        setIsLoading(false);
        setVitals(initialVitals.map(v => ({...v, value: staticVitalsData[v.label]})));
        return;
      }

      const startTime = new Date();
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date();

      const fetchGoogleFitData = (requestBody: object) => {
        return fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      };
      
      const stepsRequestBody: any = {
        aggregateBy: [{ 
          dataTypeName: "com.google.step_count.delta", 
          dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" 
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime.getTime(),
        endTimeMillis: endTime.getTime()
      };

      const heartRateRequestBody: any = {
        aggregateBy: [{ 
          dataTypeName: "com.google.heart_rate.bpm", 
          dataSourceId: "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm" 
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime.getTime(),
        endTimeMillis: endTime.getTime()
      };

      const spo2RequestBody: any = {
        aggregateBy: [{ 
          dataTypeName: "com.google.oxygen_saturation", 
          dataSourceId: "derived:com.google.oxygen_saturation:com.google.android.gms:merge_oxygen_saturation" 
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime.getTime(),
        endTimeMillis: endTime.getTime()
      };

      try {
        const results = await Promise.allSettled([
          fetchGoogleFitData(stepsRequestBody),
          fetchGoogleFitData(heartRateRequestBody),
          fetchGoogleFitData(spo2RequestBody)
        ]);

        const [stepsResponse, heartRateResponse, spo2Response] = await Promise.all(
          results.map(async (result) => {
            if (result.status === 'fulfilled' && result.value.ok) return result.value.json();
            return null;
          })
        );
        
        const finalVitals = [...initialVitals];

        // Update Heart Rate or use static fallback
        if (heartRateResponse?.bucket[0]?.dataset[0]?.point[0]?.value[0]?.fpVal) {
          finalVitals[0].value = Math.round(heartRateResponse.bucket[0].dataset[0].point[0].value[0].fpVal).toString();
        } else {
          finalVitals[0].value = staticVitalsData["Heart Rate"];
        }

        // Update SpO₂ or use static fallback
        if (spo2Response?.bucket[0]?.dataset[0]?.point[0]?.value[0]?.fpVal) {
          finalVitals[1].value = Math.round(spo2Response.bucket[0].dataset[0].point[0].value[0].fpVal).toString();
        } else {
          finalVitals[1].value = staticVitalsData["SpO₂"];
        }
        
        // Update Steps or use static fallback
        if (stepsResponse?.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal) {
          finalVitals[2].value = stepsResponse.bucket[0].dataset[0].point[0].value[0].intVal.toLocaleString();
        } else {
          finalVitals[2].value = staticVitalsData["Steps Today"];
        }

        setVitals(finalVitals);

        // Fetch physical activities
        await fetchPhysicalActivities(accessToken);

      } catch (error) {
        console.error('Error fetching vitals:', error);
        setVitals(initialVitals.map(v => ({...v, value: staticVitalsData[v.label]})));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVitals();
  }, [user]);

  const getHealthSuggestions = () => {
    const currentSteps = parseInt(vitals[2].value.replace(/,/g, ''));
    const currentHeartRate = parseInt(vitals[0].value);
    
    const suggestions = [];
    
    if (currentSteps < 8000) {
      suggestions.push({
        icon: Footprints,
        title: "Increase Daily Steps",
        description: "Aim for 10,000 steps daily. Try taking a 15-minute walk after meals.",
        color: "text-blue-500"
      });
    }
    
    if (currentHeartRate > 80) {
      suggestions.push({
        icon: Heart,
        title: "Heart Rate Management",
        description: "Consider meditation or deep breathing exercises to lower resting heart rate.",
        color: "text-red-500"
      });
    }
    
    suggestions.push({
      icon: Zap,
      title: "Stay Active",
      description: "Try 30 minutes of moderate exercise like brisk walking or cycling.",
      color: "text-green-500"
    });

    if (activities.length > 0) {
      suggestions.push({
        icon: Target,
        title: "Activity Consistency",
        description: "Great job staying active! Try to maintain this routine.",
        color: "text-purple-500"
      });
    }
    
    return suggestions;
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
                  Vitals Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Monitor your health vitals with real-time data from Google Fit
                </p>
              </motion.div>

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-8"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-muted-foreground">Loading vitals data...</span>
                </motion.div>
              )}

              {/* Vitals Cards Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {vitals.map((vital, index) => (
                  <motion.div
                    key={vital.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {vital.label}
                        </CardTitle>
                        <div className={`${vital.bgColor} p-2 rounded-full`}>
                          <vital.icon className={`h-4 w-4 ${vital.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-bold">{vital.value}</span>
                          <span className="text-sm text-muted-foreground">{vital.unit}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-transparent">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {vital.trend}
                          </Badge>
                          <span className="text-xs text-muted-foreground">from yesterday</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Charts Section */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Heart Rate Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="border-0 shadow-md bg-gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Heart Rate Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={heartRateData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="heartRate" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            dot={{ fill: '#ef4444', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Steps Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card className="border-0 shadow-md bg-gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Footprints className="h-5 w-5 text-blue-500" />
                        Steps Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={stepsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="steps" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Activities and Suggestions */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Activities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Card className="border-0 shadow-md bg-gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        Recent Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activities.length > 0 ? (
                        <div className="space-y-3">
                          {activities.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                              <div>
                                <p className="font-medium text-sm">{activity.name}</p>
                                <p className="text-xs text-muted-foreground">{activity.duration} minutes</p>
                              </div>
                              <Badge variant="outline">{activity.calories} cal</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No recent activities found</p>
                          <p className="text-xs">Start tracking your workouts!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Health Suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Card className="border-0 shadow-md bg-gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-500" />
                        Health Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getHealthSuggestions().map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                            <div className="p-2 rounded-full bg-background">
                              <suggestion.icon className={`h-4 w-4 ${suggestion.color}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{suggestion.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}