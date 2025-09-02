import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Stethoscope, Shield, Users, Smartphone, Wifi } from "lucide-react";
import heroImage from "@/assets/healthcare-hero.jpg";

const Landing = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: Stethoscope,
      title: "AI-Powered Diagnosis",
      description: "Advanced AI helps assess symptoms and provides preliminary guidance"
    },
    {
      icon: Heart,
      title: "Emergency Aware",
      description: "Recognizes urgent situations and guides you to immediate care"
    },
    {
      icon: Wifi,
      title: "Offline-First",
      description: "Works seamlessly even without internet connectivity"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is encrypted and stays under your control"
    },
    {
      icon: Users,
      title: "Family Care",
      description: "Manage health profiles for your entire family in one place"
    },
    {
      icon: Smartphone,
      title: "Always Available",
      description: "Access your health assistant anytime, anywhere on any device"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-hero"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="text-center lg:text-left"
              variants={fadeInUp}
            >
              <motion.h1 
                className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                variants={fadeInUp}
              >
                Your Offline-First
                <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  AI Healthcare Assistant
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/90 mb-8 leading-relaxed"
                variants={fadeInUp}
              >
                AI-powered, emergency-aware, and always available — even without internet.
                Your comprehensive healthcare companion for the whole family.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                variants={fadeInUp}
              >
                <Link to="/signup">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="medical" size="lg" className="w-full sm:w-auto">
                    Login
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeInUp}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-card">
                <img 
                  src={heroImage} 
                  alt="Healthcare AI Assistant" 
                  className="w-full h-auto"
                />
              </div>
              
              {/* Floating Icons */}
              <motion.div 
                className="absolute top-10 left-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-soft"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-6 h-6 text-primary" />
              </motion.div>
              
              <motion.div 
                className="absolute bottom-20 right-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-soft"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <Shield className="w-6 h-6 text-primary" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.section 
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Healthcare Made
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Simple</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of healthcare with AI-powered assistance that understands your needs
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group p-8 rounded-2xl bg-gradient-card shadow-soft hover:shadow-card transition-all duration-300 text-center"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-primary rounded-2xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-24 bg-gradient-hero relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="relative container mx-auto px-6 text-center">
          <motion.h2 
            className="text-3xl lg:text-5xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Ready to Transform Your Healthcare?
          </motion.h2>
          <motion.p 
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Join thousands of families who trust our AI healthcare assistant for their medical needs
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link to="/signup">
              <Button variant="hero" size="lg" className="text-lg px-12 py-4">
                Start Your Healthcare Journey
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Landing;