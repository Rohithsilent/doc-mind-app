import { MessageCircle, Sparkles, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";

export function AIAssistantCard() {
  const [question, setQuestion] = useState("");

  const quickQuestions = [
    "Analyze my recent vitals",
    "What should I do about fatigue?",
    "Review my medication schedule",
    "Emergency symptoms to watch for",
  ];

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
              className="flex-1"
            />
            <Button size="icon" className="bg-gradient-primary hover:opacity-90">
              <Send className="h-4 w-4" />
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
                  onClick={() => setQuestion(q)}
                  className="text-left text-xs p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors"
                >
                  <MessageCircle className="h-3 w-3 inline mr-2" />
                  {q}
                </motion.button>
              ))}
            </div>
          </div>

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