import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, Heart, FileText, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { healthStorage } from "@/lib/storage";

const Offline = () => {
  const [cachedData, setCachedData] = useState<{
    vitals: any[];
    reports: any[];
  }>({ vitals: [], reports: [] });

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const vitals = await healthStorage.getVitals();
        const reports = await healthStorage.getReports();
        setCachedData({ vitals: vitals.slice(-5), reports: reports.slice(-3) });
      } catch (error) {
        console.error('Failed to load cached data:', error);
      }
    };

    loadCachedData();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Offline Status Card */}
        <Card className="text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4"
            >
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            </motion.div>
            <CardTitle className="text-2xl">You're Offline</CardTitle>
            <CardDescription>
              Don't worry! HealthAI works offline too. You can still access your cached health data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>

        {/* Cached Data Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-red-500" />
                Recent Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cachedData.vitals.length > 0 ? (
                <div className="space-y-2">
                  {cachedData.vitals.map((vital, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>Heart Rate</span>
                      <span className="font-medium">72 BPM</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No cached vitals available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-500" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cachedData.reports.length > 0 ? (
                <div className="space-y-2">
                  {cachedData.reports.map((report, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">Blood Test</div>
                      <div className="text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No cached reports available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Offline Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Available Offline Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">View cached vitals</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Access recent reports</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Emergency SOS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Basic health tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Your data will sync automatically when you're back online
        </div>
      </motion.div>
    </div>
  );
};

export default Offline;