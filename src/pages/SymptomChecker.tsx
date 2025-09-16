import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { GeminiService } from "@/lib/geminiService";
import { toast } from "sonner";

interface SymptomAnalysis {
  assessment: string;
  seriousness: 'mild' | 'moderate' | 'serious' | 'emergency';
  remedies: string[];
  precautions: string[];
  specialistDoctor: string;
  timeframe: string;
}

const languages = [
  { code: 'en-US', name: 'English', geminiCode: 'en' },
  { code: 'hi-IN', name: 'हिंदी (Hindi)', geminiCode: 'hi' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)', geminiCode: 'te' }
];

const getSeriousnessColor = (seriousness: string) => {
  switch (seriousness) {
    case 'mild': return 'bg-green-100 text-green-800 border-green-200';
    case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'serious': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSeriousnessIcon = (seriousness: string) => {
  switch (seriousness) {
    case 'mild': return <CheckCircle className="h-4 w-4" />;
    case 'moderate': return <Clock className="h-4 w-4" />;
    case 'serious': return <AlertTriangle className="h-4 w-4" />;
    case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default: return <Stethoscope className="h-4 w-4" />;
  }
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    transcript,
    isListening,
    isSupported: speechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition({
    language: selectedLanguage.code,
    continuous: false,
    interimResults: true
  });

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: speechSynthesisSupported
  } = useSpeechSynthesis();

  const handleStartListening = () => {
    resetTranscript();
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
    if (transcript) {
      setSymptoms(prev => prev ? `${prev} ${transcript}` : transcript);
    }
  };

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await GeminiService.analyzeSymptoms(symptoms, selectedLanguage.geminiCode);
      setAnalysis(result);
      toast.success('Symptom analysis completed');
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeakResponse = () => {
    if (!analysis) return;
    
    const textToSpeak = `
      Assessment: ${analysis.assessment}.
      Seriousness: ${analysis.seriousness}.
      Remedies: ${analysis.remedies.join(', ')}.
      Precautions: ${analysis.precautions.join(', ')}.
      Specialist Doctor: ${analysis.specialistDoctor}.
      Timeframe: ${analysis.timeframe}.
    `;
    
    speak(textToSpeak, selectedLanguage.code);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            AI Symptom Checker
          </h1>
          <p className="text-muted-foreground">
            Describe your symptoms using voice or text for AI-powered medical insights
          </p>
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Language / भाषा / భాష</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedLanguage.code}
                onValueChange={(value) => {
                  const lang = languages.find(l => l.code === value);
                  if (lang) setSelectedLanguage(lang);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {/* Symptom Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Describe Your Symptoms
              </CardTitle>
              <CardDescription>
                Use voice input or type your symptoms in detail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                {speechRecognitionSupported && (
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    size="sm"
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className="flex items-center gap-2"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? 'Stop Recording' : 'Voice Input'}
                  </Button>
                )}
                {transcript && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetTranscript}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-primary/10 rounded-lg border border-primary/20"
                >
                  <p className="text-sm text-primary font-medium mb-1">Listening...</p>
                  <p className="text-sm text-muted-foreground">
                    {transcript || 'Speak now...'}
                  </p>
                </motion.div>
              )}

              {speechError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{speechError}</AlertDescription>
                </Alert>
              )}

              <Textarea
                placeholder="Describe your symptoms in detail..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[120px]"
              />

              <Button
                onClick={handleAnalyzeSymptoms}
                disabled={isAnalyzing || !symptoms.trim()}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      AI Medical Analysis
                    </CardTitle>
                    {speechSynthesisSupported && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isSpeaking ? stopSpeaking : handleSpeakResponse}
                        className="flex items-center gap-2"
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        {isSpeaking ? 'Stop' : 'Listen'}
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    AI-powered medical insight based on your symptoms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Assessment */}
                  <div>
                    <h3 className="font-semibold mb-2">Assessment</h3>
                    <p className="text-muted-foreground">{analysis.assessment}</p>
                  </div>

                  <Separator />

                  {/* Seriousness */}
                  <div>
                    <h3 className="font-semibold mb-2">Condition Seriousness</h3>
                    <Badge className={`${getSeriousnessColor(analysis.seriousness)} flex items-center gap-1 w-fit`}>
                      {getSeriousnessIcon(analysis.seriousness)}
                      {analysis.seriousness.charAt(0).toUpperCase() + analysis.seriousness.slice(1)}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Remedies */}
                  <div>
                    <h3 className="font-semibold mb-2">Recommended Remedies</h3>
                    <ul className="space-y-1">
                      {analysis.remedies.map((remedy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Precautions */}
                  <div>
                    <h3 className="font-semibold mb-2">Important Precautions</h3>
                    <ul className="space-y-1">
                      {analysis.precautions.map((precaution, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{precaution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Specialist & Timeframe */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Specialist to Consult</h3>
                      <Badge variant="outline" className="text-primary">
                        {analysis.specialistDoctor}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Consultation Timeframe</h3>
                      <Badge variant="outline" className="text-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {analysis.timeframe}
                      </Badge>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Disclaimer:</strong> This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}