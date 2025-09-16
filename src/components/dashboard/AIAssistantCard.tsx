import { MessageCircle, Sparkles, Send, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { GeminiService } from "@/lib/geminiService";
import { PrescriptionService } from "@/lib/prescriptionService";
import { useAuth } from "@/hooks/useAuth";
import { PrescriptionData } from "@/types/prescription";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export function AIAssistantCard() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const { user } = useAuth();

  const quickQuestions = [
    "Analyze my recent vitals",
    "What should I do about fatigue?",
    "Review my medication schedule",
    "Emergency symptoms to watch for",
  ];

  // Load patient data on component mount
  useEffect(() => {
    if (user?.uid) {
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = async () => {
    if (!user?.uid) return;

    try {
      // Load prescriptions
      const userPrescriptions = await PrescriptionService.getPrescriptions(user.uid);
      setPrescriptions(userPrescriptions);

      // Load reports
      const reportsQuery = query(
        collection(db, "reports"),
        where("userId", "==", user.uid)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const userReports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(userReports);
    } catch (error) {
      console.error("Error loading patient data:", error);
    }
  };

  const handleAskQuestion = async (questionText: string = question) => {
    if (!questionText.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const aiResponse = await GeminiService.chatWithHealthAssistant(
        questionText,
        prescriptions,
        reports
      );
      setResponse(aiResponse);
      setQuestion(""); // Clear input after sending
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get response from AI assistant");
      setResponse("I'm sorry, I couldn't process your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="transition-transform duration-200"
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1 rounded-lg bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Health Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about symptoms, scans, or health concerns..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              size="icon" 
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => handleAskQuestion()}
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Quick Questions:</p>
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((q, index) => (
                <motion.button
                  key={q}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAskQuestion(q)}
                  className="text-left text-xs p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors"
                >
                  <MessageCircle className="h-3 w-3 inline mr-2" />
                  {q}
                </motion.button>
              ))}
            </div>
          </div>

          {/* AI Response Display */}
          {(response || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-secondary/30 border border-secondary/50"
            >
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm font-medium text-primary">AI Assistant Response:</span>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing your question...</span>
                </div>
              ) : (
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {response}
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-3 rounded-lg bg-primary/5 border border-primary/10"
          >
            <p className="text-xs text-primary">
              💡 AI responses are for informational purposes only. Always consult healthcare professionals for medical advice.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}