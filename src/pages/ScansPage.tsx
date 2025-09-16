//scanspage
// src/pages/ScansPage.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Camera, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ScansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("Radiology");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5242880) { // 5MB size limit for performance
        toast({ title: "File is too large", description: "Please upload files smaller than 5MB.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Function to convert a file to a Base64 string
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleUpload = async () => {
    if (!file || !user || !title) {
      toast({ title: "Missing Information", description: "Please select a file and provide a title.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const base64Data = await toBase64(file);
      
      // --- MODIFIED PART ---
      // This now saves to the top-level 'reports' collection
      await addDoc(collection(db, "reports"), {
        title: title,
        type: reportType,
        date: serverTimestamp(),
        status: "Completed",
        urgent: false,
        fileName: file.name,
        fileData: base64Data,
        userId: user.uid  // Add this line
        });

      toast({ title: "Upload Successful", description: "Your report has been saved." });
      setFile(null);
      setTitle("");
    } catch (error) {
       console.error("Upload error:", error);
       toast({ title: "Upload Failed", description: "Could not convert or save the file.", variant: "destructive" });
    } finally {
      setIsLoading(false);
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
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Scan & Upload Reports
                </h1>
                <p className="text-muted-foreground">
                  Upload a medical document or use your camera to scan a new one.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="max-w-2xl mx-auto border-0 shadow-md bg-gradient-card">
                  <CardHeader>
                    <CardTitle>New Medical Report</CardTitle>
                    <CardDescription>Fill in the details and upload your document.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="report-title">Report Title</Label>
                      <Input 
                        id="report-title" 
                        placeholder="e.g., Chest X-Ray Results" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        disabled={isLoading} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Report Type</Label>
                      <select 
                        id="report-type" 
                        value={reportType} 
                        onChange={(e) => setReportType(e.target.value)} 
                        disabled={isLoading} 
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option>Radiology</option>
                        <option>Laboratory</option>
                        <option>Medication</option>
                        <option>Examination</option>
                        <option>Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Document</Label>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" className="flex-1 cursor-pointer">
                          <label>
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Upload File
                            <Input 
                              type="file" 
                              className="hidden" 
                              onChange={handleFileChange} 
                              disabled={isLoading} 
                            />
                          </label>
                        </Button>
                        <Button asChild variant="outline" className="flex-1 cursor-pointer">
                          <label>
                            <Camera className="w-4 h-4 mr-2" />
                            Use Camera
                            <Input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              className="hidden" 
                              onChange={handleFileChange} 
                              disabled={isLoading} 
                            />
                          </label>
                        </Button>
                      </div>
                    </div>

                    {file && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 bg-muted rounded-md flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-5 h-5 text-green-600" />
                          <span>{file.name}</span>
                        </div>
                        <button 
                          onClick={() => setFile(null)} 
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          &times;
                        </button>
                      </motion.div>
                    )}
                    
                    <Button 
                      onClick={handleUpload} 
                      disabled={isLoading || !file || !title} 
                      className="w-full"
                    >
                      {isLoading ? "Uploading..." : "Upload Report"}
                    </Button>
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