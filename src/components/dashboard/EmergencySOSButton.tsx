import { Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

export function EmergencySOSButton() {
  const [isPressed, setIsPressed] = useState(false);

  const handleEmergencyCall = () => {
    setIsPressed(true);
    // Simulate emergency call logic
    setTimeout(() => setIsPressed(false), 3000);
    
    // In a real app, this would:
    // - Call emergency services
    // - Send location data
    // - Alert emergency contacts
    // - Record the emergency event
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5 
      }}
    >
      <motion.div
        animate={isPressed ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={handleEmergencyCall}
          disabled={isPressed}
          className={`
            relative h-16 w-16 rounded-full shadow-lg
            ${isPressed 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-destructive hover:bg-destructive/90'
            }
            text-white transition-all duration-300
          `}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-destructive"
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          <motion.div
            animate={isPressed ? { rotate: 360 } : {}}
            transition={{ duration: 0.5 }}
          >
            {isPressed ? (
              <Phone className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </motion.div>
          
          {isPressed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-foreground text-background px-2 py-1 rounded text-xs"
            >
              Calling Emergency...
            </motion.div>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}