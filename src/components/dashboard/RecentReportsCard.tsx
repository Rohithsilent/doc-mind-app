//reportcard
// src/components/RecentReportsCard.tsx

import { useEffect, useState, useCallback } from "react";
import { FileText, Download, Eye, Calendar, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp, doc, deleteDoc, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  date: Timestamp;
  type: string;
  status: string;
  urgent: boolean;
  fileData: string; // This now holds the Base64 string
  fileName: string;
  userId?: string; // Add this to ensure proper typing
}

export function RecentReportsCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Manual refresh function
  const refreshReports = useCallback(async () => {
    if (!user) return;
    
    setRefreshing(true);
    console.log("Manual refresh for user:", user.uid);
    
    try {
      const reportsRef = collection(db, "reports");
      const q = query(
        reportsRef, 
        where("userId", "==", user.uid)
        // Remove orderBy temporarily
      );
      
      const querySnapshot = await getDocs(q);
      console.log("Manual refresh query snapshot size:", querySnapshot.size);
      
      const reportsData: Report[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Manual refresh document data:", data);
        reportsData.push({ id: doc.id, ...data } as Report);
      });
      
      // Sort manually and take first 4
      reportsData.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(0);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log("Manual refresh final reports data:", reportsData);
      setReports(reportsData.slice(0, 4));
      
      if (reportsData.length > 0) {
        toast({
          title: "Reports Refreshed",
          description: `Found ${reportsData.length} reports.`
        });
      } else {
        toast({
          title: "No Reports Found",
          description: "No reports found for your account."
        });
      }
    } catch (error) {
      console.error('Error refreshing reports:', error);
      console.error("Refresh error code:", error.code);
      console.error("Refresh error message:", error.message);
      toast({
        title: "Refresh Failed",
        description: `Could not refresh reports: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log("Fetching reports for user:", user.uid);
    
    const reportsRef = collection(db, "reports");
    
    // Try without orderBy first to see if that's causing issues
    const q = query(
      reportsRef, 
      where("userId", "==", user.uid)
      // Temporarily remove orderBy to test
      // orderBy("date", "desc"), 
      // limit(4)
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        console.log("Query snapshot size:", querySnapshot.size);
        const reportsData: Report[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Document data:", data);
          // Ensure the document belongs to the current user
          if (data.userId === user.uid) {
            reportsData.push({ id: doc.id, ...data } as Report);
          }
        });
        
        // Sort manually and take first 4
        reportsData.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(0);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        
        console.log("Final reports data:", reportsData);
        setReports(reportsData.slice(0, 4));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching reports:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        toast({
          title: "Error Loading Reports",
          description: `Could not load reports: ${error.message}`,
          variant: "destructive"
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Unknown date";
    return timestamp.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string, urgent: boolean) => {
    if (urgent) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Urgent
        </Badge>
      );
    }
    
    const variants = {
      "Completed": "default",
      "Pending": "secondary",
      "In Progress": "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"} className="text-xs">
        {status}
      </Badge>
    );
  };

  const handleViewReport = (report: Report) => {
    try {
      // Handle case where fileData might not have data URL prefix
      let base64Data = report.fileData;
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Determine MIME type based on file extension
      const extension = report.fileName.split('.').pop()?.toLowerCase();
      let mimeType = 'application/octet-stream';
      
      switch (extension) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        case 'txt':
          mimeType = 'text/plain';
          break;
        case 'doc':
          mimeType = 'application/msword';
          break;
        case 'docx':
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
      }
      
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Open in new tab
      const newWindow = window.open(url, '_blank');
      
      // Clean up the URL after a delay to prevent memory leaks
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
      
      if (!newWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site to view reports.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error viewing report:', error);
      toast({
        title: "View Failed",
        description: "Could not open the report. The file might be corrupted.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadReport = (report: Report) => {
    try {
      const link = document.createElement('a');
      link.href = report.fileData;
      link.download = report.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `${report.fileName} is being downloaded.`
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the report.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReport = async (reportId: string, reportTitle: string) => {
    if (!user) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${reportTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingId(reportId);
    
    try {
      await deleteDoc(doc(db, "reports", reportId));
      toast({
        title: "Report Deleted",
        description: `${reportTitle} has been successfully deleted.`
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Recent Reports
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={refreshReports}
              disabled={refreshing || loading}
              title="Refresh Reports"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <p className="text-center text-muted-foreground py-4">Loading...</p>
          )}
          {!loading && reports.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No reports found.</p>
          )}
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
                    {formatDate(report.date)}
                  </span>
                  <span>• {report.type}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleViewReport(report)}
                  title="View Report"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDownloadReport(report)}
                  title="Download Report"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteReport(report.id, report.title)}
                  disabled={deletingId === report.id}
                  title="Delete Report"
                >
                  <Trash2 className={`h-4 w-4 ${deletingId === report.id ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
            </motion.div>
          ))}
          
          {!loading && reports.length > 0 && (
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                View All Reports
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}