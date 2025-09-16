import { useEffect, useState } from "react";
import { Heart, Activity, Footprints, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

type Vital = {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  status: "normal" | "good" | "warning";
  trend: string;
};

// --- NEW: Define your static data here as the ultimate fallback ---
const staticVitalsData: { [key: string]: string } = {
  "Heart Rate": "72",
  "SpO₂": "98",
  "Steps Today": "8,432",
};

const initialVitals: Vital[] = [
  { label: "Heart Rate", value: "...", unit: "bpm", icon: Heart, status: "normal", trend: "+2%" },
  { label: "SpO₂", value: "...", unit: "%", icon: Activity, status: "normal", trend: "+0.5%" },
  { label: "Steps Today", value: "...", unit: "steps", icon: Footprints, status: "good", trend: "+15%" },
];

export function VitalsCard() {
  const [vitals, setVitals] = useState<Vital[]>(initialVitals);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAllVitals = async () => {
      const accessToken = sessionStorage.getItem('googleFitAccessToken');

      if (!user || !accessToken) {
        setIsLoading(false);
        // On failure to authenticate, set all to static data
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
      
      const stepsRequestBody = { /* ...unchanged... */ };
      const heartRateRequestBody = { /* ...unchanged... */ };
      const spo2RequestBody = { /* ...unchanged... */ };

      // Re-add request bodies for clarity
      stepsRequestBody.aggregateBy = [{ dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" }];
      heartRateRequestBody.aggregateBy = [{ dataTypeName: "com.google.heart_rate.bpm", dataSourceId: "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm" }];
      spo2RequestBody.aggregateBy = [{ dataTypeName: "com.google.oxygen_saturation", dataSourceId: "derived:com.google.oxygen_saturation:com.google.android.gms:merge_oxygen_saturation" }];
      [stepsRequestBody, heartRateRequestBody, spo2RequestBody].forEach(body => {
        body.bucketByTime = { durationMillis: 86400000 };
        body.startTimeMillis = startTime.getTime();
        body.endTimeMillis = endTime.getTime();
      });

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
        
        // --- UPDATED LOGIC: Use static data as a fallback for each vital ---

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

      } catch (error) {
        console.error('Error fetching vitals:', error);
        // On any critical error, fall back completely to static data
        setVitals(initialVitals.map(v => ({...v, value: staticVitalsData[v.label]})));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVitals();
  }, [user]);

  // Your JSX return statement remains unchanged
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading Vitals...</span>
            </div>
          ) : (
            vitals.map((vital, index) => (
              <motion.div
                key={vital.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    vital.status === 'normal' ? 'bg-green-100 text-green-600' :
                    vital.status === 'good' ? 'bg-blue-100 text-blue-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <vital.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{vital.label}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {vital.value}
                      </span>
                      <span className="text-xs text-muted-foreground">{vital.unit}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">{vital.trend}</span>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}