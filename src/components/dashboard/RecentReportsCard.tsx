import { FileText, Download, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function RecentReportsCard() {
  const reports = [
    {
      id: 1,
      title: "Chest X-Ray Results",
      date: "Dec 5, 2024",
      type: "Radiology",
      status: "Normal",
      urgent: false,
    },
    {
      id: 2,
      title: "Blood Work Panel",
      date: "Dec 3, 2024", 
      type: "Laboratory",
      status: "Review Required",
      urgent: true,
    },
    {
      id: 3,
      title: "Prescription Refill",
      date: "Dec 1, 2024",
      type: "Medication",
      status: "Completed",
      urgent: false,
    },
    {
      id: 4,
      title: "Annual Physical",
      date: "Nov 28, 2024",
      type: "Examination",
      status: "Completed",
      urgent: false,
    },
  ];

  const getStatusBadge = (status: string, urgent: boolean) => {
    if (urgent) {
      return <Badge variant="destructive">Urgent</Badge>;
    }
    
    switch (status) {
      case "Normal":
      case "Completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case "Review Required":
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="transition-transform duration-200"
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{report.title}</h4>
                  {getStatusBadge(report.status, report.urgent)}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {report.date}
                  </span>
                  <span>• {report.type}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-2 border-t border-border"
          >
            <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors">
              View All Reports →
            </button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}