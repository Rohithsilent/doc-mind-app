import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Utensils, Activity } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface AIHealthSuggestionsProps {
  suggestions: string;
}

export function AIHealthSuggestions({ suggestions }: AIHealthSuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Health Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold text-primary mt-6 mb-3 flex items-center gap-2">
                    {children?.toString().includes('Dietary') && <Utensils className="h-4 w-4" />}
                    {children?.toString().includes('Lifestyle') && <Activity className="h-4 w-4" />}
                    {children?.toString().includes('Health') && <Heart className="h-4 w-4" />}
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium text-foreground mt-4 mb-2">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 my-4">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-muted-foreground">
                    {children}
                  </em>
                ),
              }}
            >
              {suggestions}
            </ReactMarkdown>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-warning/20">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Brain className="h-3 w-3" />
              <strong>Disclaimer:</strong> These suggestions are AI-generated and for informational purposes only. 
              Always consult with your healthcare provider before making any changes to your treatment plan.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}