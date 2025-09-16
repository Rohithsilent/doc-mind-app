import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, FileText, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { OCRService } from "@/lib/ocrService";
import { NLPService } from "@/lib/nlpService";
import { GeminiService } from "@/lib/geminiService";
import { PrescriptionData } from "@/types/prescription";
import { ExtractedDataDisplay } from "./ExtractedDataDisplay";
import { AIHealthSuggestions } from "./AIHealthSuggestions";

export function PrescriptionUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [extractedData, setExtractedData] = useState<PrescriptionData | null>(null);
  const [healthSuggestions, setHealthSuggestions] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setOcrText("");
        setExtractedData(null);
        setHealthSuggestions("");
        setProgress(0);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const processPrescription = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Step 1: OCR Processing
      setCurrentStep("Extracting text from image...");
      setProgress(20);
      const extractedText = await OCRService.extractText(selectedFile);
      setOcrText(extractedText);
      
      if (!extractedText.trim()) {
        throw new Error("No text could be extracted from the image");
      }

      // Step 2: NLP Processing
      setCurrentStep("Analyzing prescription data...");
      setProgress(50);
      const structuredData = await NLPService.extractPrescriptionData(extractedText);
      setExtractedData(structuredData);

      // Step 3: AI Health Suggestions
      setCurrentStep("Generating AI health suggestions...");
      setProgress(80);
      const suggestions = await GeminiService.generateHealthSuggestions(structuredData);
      setHealthSuggestions(suggestions);

      setProgress(100);
      setCurrentStep("Processing complete!");
      
      toast({
        title: "Prescription processed successfully",
        description: "Your prescription has been analyzed and suggestions generated",
      });

    } catch (error) {
      console.error("Error processing prescription:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process prescription",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Prescription Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
            {selectedFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative max-w-md mx-auto">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected prescription"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute top-2 right-2 bg-background rounded-full p-2 shadow-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  File: {selectedFile.name}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    Change Image
                  </Button>
                  <Button
                    onClick={processPrescription}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Process Prescription
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Upload Prescription Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Take a clear photo of your prescription or upload an existing image
                  </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Select Image
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Processing Progress */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {currentStep}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {ocrText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Extracted Text (OCR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{ocrText}</pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Extracted Data Display */}
      {extractedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ExtractedDataDisplay data={extractedData} />
        </motion.div>
      )}

      {/* AI Health Suggestions */}
      {healthSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AIHealthSuggestions suggestions={healthSuggestions} />
        </motion.div>
      )}
    </div>
  );
}