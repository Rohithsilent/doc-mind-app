// src/pages/ReportsHistoryPage.tsx

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  date: Timestamp;
  type: string;
  status: string;
  urgent: boolean;
  fileData: string;
  fileName: string;
}

export default function ReportsHistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, where("userId", "==", user.uid), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: Report[] = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() } as Report);
      });
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp?.toDate) return "No date";
    return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string, urgent: boolean) => {
    if (urgent) return <Badge variant="destructive">Urgent</Badge>;
    if (status === "Completed") return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  // --- THIS IS THE CORRECTED, FULL FUNCTION ---
  const handleViewReport = (report: Report) => {
    try {
      const base64Data = report.fileData.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const extension = report.fileName.split('.').pop()?.toLowerCase();
      let mimeType = 'application/octet-stream';
      
      switch (extension) {
        case 'pdf': mimeType = 'application/pdf'; break;
        case 'jpg': case 'jpeg': mimeType = 'image/jpeg'; break;
        case 'png': mimeType = 'image/png'; break;
        // Add other file types as needed
      }
      
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      if (!newWindow) {
        toast({ title: "Popup Blocked", description: "Please allow popups to view reports.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error viewing report:', error);
      toast({ title: "View Failed", description: "Could not open the report.", variant: "destructive" });
    }
  };

  const handleDownloadReport = (report: Report) => {
    const link = document.createElement('a');
    link.href = report.fileData;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDeleteReport = async (reportId: string, reportTitle: string) => {
    if (!user || !confirm(`Are you sure you want to delete "${reportTitle}"?`)) {
      return;
    }
    setDeletingId(reportId);
    try {
      await deleteDoc(doc(db, "reports", reportId));
      toast({ title: "Report Deleted", description: `"${reportTitle}" was successfully deleted.` });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({ title: "Delete Failed", variant: "destructive" });
    } finally {
      setDeletingId(null);
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
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Reports & History
                </h1>
                <p className="text-muted-foreground">
                  View and manage all your past medical reports and documents.
                </p>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-0 shadow-md bg-gradient-card">
                  <CardHeader>
                    <CardTitle>All Reports</CardTitle>
                    <CardDescription>A complete log of your medical history.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading && <p className="text-center text-muted-foreground py-4">Loading history...</p>}
                    {!loading && reports.length === 0 && <p className="text-center text-muted-foreground py-4">You have no reports saved.</p>}
                    {reports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{report.title}</h4>
                            {getStatusBadge(report.status, report.urgent)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(report.date)}</span>
                            <span>• {report.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewReport(report)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadReport(report)}><Download className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteReport(report.id, report.title)} disabled={deletingId === report.id}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}