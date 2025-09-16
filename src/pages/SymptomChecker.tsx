import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Brain,
  Heart,
  Shield,
  UserCheck,
  FileText,
  Loader2
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

const getLocalizedText = (language: string) => {
  const texts = {
    'en': {
      title: "AI Symptom Checker",
      description: "Describe your symptoms using voice or text for AI-powered medical insights",
      selectLanguage: "Language / भाषा / భాష",
      describeSymptoms: "Describe Your Symptoms",
      describeHint: "Use voice input or type your symptoms in detail",
      voiceInput: "Voice Input",
      stopRecording: "Stop Recording",
      listening: "Listening...",
      speakNow: "Speak now...",
      clearText: "Clear",
      symptomPlaceholder: "Describe your symptoms in detail...",
      analyzeSymptoms: "Analyze Symptoms",
      analyzingSymptoms: "Analyzing Symptoms...",
      medicalAnalysis: "AI Medical Analysis",
      medicalInsight: "AI-powered medical insight based on your symptoms",
      assessment: "Assessment",
      seriousness: "Condition Seriousness",
      recommendedRemedies: "Recommended Remedies",
      importantPrecautions: "Important Precautions",
      specialistConsult: "Specialist to Consult",
      consultationTimeframe: "Consultation Timeframe",
      listen: "Listen",
      stop: "Stop",
      disclaimer: "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment."
    },
    'hi': {
      title: "एआई लक्षण जांचकर्ता",
      description: "एआई-संचालित चिकित्सा अंतर्दृष्टि के लिए आवाज या टेक्स्ट का उपयोग करके अपने लक्षणों का वर्णन करें",
      selectLanguage: "भाषा / Language / భాష",
      describeSymptoms: "अपने लक्षणों का वर्णन करें",
      describeHint: "आवाज इनपुट का उपयोग करें या अपने लक्षणों को विस्तार से टाइप करें",
      voiceInput: "आवाज इनपुट",
      stopRecording: "रिकॉर्डिंग रोकें",
      listening: "सुन रहा है...",
      speakNow: "अब बोलें...",
      clearText: "साफ करें",
      symptomPlaceholder: "अपने लक्षणों को विस्तार से बताएं...",
      analyzeSymptoms: "लक्षणों का विश्लेषण करें",
      analyzingSymptoms: "लक्षणों का विश्लेषण हो रहा है...",
      medicalAnalysis: "एआई चिकित्सा विश्लेषण",
      medicalInsight: "आपके लक्षणों के आधार पर एआई-संचालित चिकित्सा अंतर्दृष्टि",
      assessment: "मूल्यांकन",
      seriousness: "स्थिति की गंभीरता",
      recommendedRemedies: "अनुशंसित उपचार",
      importantPrecautions: "महत्वपूर्ण सावधानियां",
      specialistConsult: "सलाह लेने वाले विशेषज्ञ",
      consultationTimeframe: "परामर्श की समय सीमा",
      listen: "सुनें",
      stop: "रोकें",
      disclaimer: "यह विश्लेषण केवल जानकारी के उद्देश्य से है और पेशेवर चिकित्सा सलाह का विकल्प नहीं होना चाहिए। उचित निदान और उपचार के लिए हमेशा योग्य स्वास्थ्य सेवा प्रदाता से सलाह लें।"
    },
    'te': {
      title: "ఏఐ లక్షణ పరీక్షకం",
      description: "ఏఐ-శక్తితో కూడిన వైద్య అంతర్దృష్టుల కోసం వాయిస్ లేదా టెక్స్ట్ ఉపయోగించి మీ లక్షణాలను వివరించండి",
      selectLanguage: "భాష / Language / भाषा",
      describeSymptoms: "మీ లక్షణాలను వివరించండి",
      describeHint: "వాయిస్ ఇన్‌పుట్ ఉపయోగించండి లేదా మీ లక్షణాలను వివరంగా టైప్ చేయండి",
      voiceInput: "వాయిస్ ఇన్‌పుట్",
      stopRecording: "రికార్డింగ్ ఆపండి",
      listening: "వింటోంది...",
      speakNow: "ఇప్పుడు మాట్లాడండి...",
      clearText: "క్లియర్ చేయండి",
      symptomPlaceholder: "మీ లక్షణాలను వివరంగా వివరించండి...",
      analyzeSymptoms: "లక్షణాలను విశ్లేషించండి",
      analyzingSymptoms: "లక్షణాలను విశ్లేషిస్తోంది...",
      medicalAnalysis: "ఏఐ వైద్య విశ్లేషణ",
      medicalInsight: "మీ లక్షణాల ఆధారంగా ఏఐ-శక్తితో కూడిన వైద్య అంతర్దృష్టి",
      assessment: "అంచనా",
      seriousness: "పరిస్థితి తీవ్రత",
      recommendedRemedies: "సిఫార్సు చేసిన నివారణలు",
      importantPrecautions: "ముఖ్యమైన జాగ్రత్తలు",
      specialistConsult: "సలహా తీసుకోవాల్సిన నిపుణుడు",
      consultationTimeframe: "సంప్రదింపుల కాల వ్యవధి",
      listen: "వినండి",
      stop: "ఆపండి",
      disclaimer: "ఈ విశ్లేషణ కేవలం సమాచార ప్రయోజనాల కోసం మాత్రమే మరియు వృత్తిపరమైన వైద్య సలహా యొక్క ప్రత్యామ్నాయం కాదు. సరైన నిర్ధారణ మరియు చికిత్స కోసం ఎల్లప్పుడూ అర్హత కలిగిన ఆరోగ్య సేవా ప్రదాతలను సంప్రదించండి."
    }
  };
  return texts[language as keyof typeof texts] || texts['en'];
};

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
  
  const texts = getLocalizedText(selectedLanguage.geminiCode);

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

  // Update symptoms field with real-time transcript
  useEffect(() => {
    if (isListening && transcript) {
      setSymptoms(prev => {
        // Replace the previous transcript portion with the new one
        const baseText = prev.replace(/\s*\[Live transcript:.*?\]$/, '').trim();
        return baseText ? `${baseText} [Live transcript: ${transcript}]` : `[Live transcript: ${transcript}]`;
      });
    }
  }, [transcript, isListening]);

  const handleStartListening = () => {
    resetTranscript();
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
    if (transcript) {
      setSymptoms(prev => {
        // Remove the live transcript marker and keep the final transcript
        const baseText = prev.replace(/\s*\[Live transcript:.*?\]$/, '').trim();
        return baseText ? `${baseText} ${transcript}` : transcript;
      });
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
      ${texts.assessment}: ${analysis.assessment}.
      ${texts.seriousness}: ${analysis.seriousness}.
      ${texts.recommendedRemedies}: ${analysis.remedies.join(', ')}.
      ${texts.importantPrecautions}: ${analysis.precautions.join(', ')}.
      ${texts.specialistConsult}: ${analysis.specialistDoctor}.
      ${texts.consultationTimeframe}: ${analysis.timeframe}.
    `;
    
    speak(textToSpeak, selectedLanguage.code);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Navbar />
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
            {texts.title}
          </h1>
          <p className="text-muted-foreground">
            {texts.description}
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
                {texts.describeSymptoms}
              </CardTitle>
              <CardDescription>
                {texts.describeHint}
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
                    {isListening ? texts.stopRecording : texts.voiceInput}
                  </Button>
                )}
                {transcript && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetTranscript}
                  >
                    {texts.clearText}
                  </Button>
                )}
              </div>

              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-primary/10 rounded-lg border border-primary/20"
                >
                  <p className="text-sm text-primary font-medium mb-1">{texts.listening}</p>
                  <p className="text-sm text-muted-foreground">
                    {transcript || texts.speakNow}
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
                placeholder={texts.symptomPlaceholder}
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
                    {texts.analyzingSymptoms}
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    {texts.analyzeSymptoms}
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
                      {texts.medicalAnalysis}
                    </CardTitle>
                    {speechSynthesisSupported && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isSpeaking ? stopSpeaking : handleSpeakResponse}
                        className="flex items-center gap-2"
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        {isSpeaking ? texts.stop : texts.listen}
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    {texts.medicalInsight}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Assessment */}
                  <div>
                    <h3 className="font-semibold mb-2">{texts.assessment}</h3>
                    <p className="text-muted-foreground">{analysis.assessment}</p>
                  </div>

                  <Separator />

                  {/* Seriousness */}
                  <div>
                    <h3 className="font-semibold mb-2">{texts.seriousness}</h3>
                    <Badge className={`${getSeriousnessColor(analysis.seriousness)} flex items-center gap-1 w-fit`}>
                      {getSeriousnessIcon(analysis.seriousness)}
                      {analysis.seriousness.charAt(0).toUpperCase() + analysis.seriousness.slice(1)}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Remedies */}
                  <div>
                    <h3 className="font-semibold mb-2">{texts.recommendedRemedies}</h3>
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
                    <h3 className="font-semibold mb-2">{texts.importantPrecautions}</h3>
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
                      <h3 className="font-semibold mb-2">{texts.specialistConsult}</h3>
                      <Badge variant="outline" className="text-primary">
                        {analysis.specialistDoctor}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{texts.consultationTimeframe}</h3>
                      <Badge variant="outline" className="text-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {analysis.timeframe}
                      </Badge>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Disclaimer:</strong> {texts.disclaimer}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}