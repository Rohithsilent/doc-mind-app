import { Heart, Activity, Footprints, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export function VitalsCard() {
  const vitals = [
    {
      label: "Heart Rate",
      value: "72",
      unit: "bpm",
      icon: Heart,
      status: "normal",
      trend: "+2%",
    },
    {
      label: "SpO₂",
      value: "98",
      unit: "%",
      icon: Activity,
      status: "normal",
      trend: "+0.5%",
    },
    {
      label: "Steps Today",
      value: "8,432",
      unit: "steps",
      icon: Footprints,
      status: "good",
      trend: "+15%",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="transition-transform duration-200"
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {vitals.map((vital, index) => (
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
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}