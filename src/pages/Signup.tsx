import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Mail, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    confirmPassword?: string 
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { 
      email?: string; 
      password?: string; 
      confirmPassword?: string 
    } = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and numbers";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        await signUp(formData.email, formData.password);
        navigate('/dashboard');
      } catch (error) {
        // Error is handled in useAuth hook
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z\d]/.test(password)) strength++;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        {/* Back Button */}
        <motion.div 
          className="mb-6"
          variants={inputVariants}
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-card border-0">
          <CardHeader className="text-center pb-4">
            <motion.h1 
              className="text-2xl font-bold text-foreground"
              variants={inputVariants}
            >
              Create Account
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              variants={inputVariants}
            >
              Join us to start your healthcare journey
            </motion.p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div 
                className="space-y-2"
                variants={inputVariants}
              >
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className={`transition-all duration-300 ${errors.email ? 'border-destructive' : 'border-input focus:border-primary'}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                variants={inputVariants}
              >
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    className={`transition-all duration-300 pr-10 ${errors.password ? 'border-destructive' : 'border-input focus:border-primary'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            level <= passwordStrength 
                              ? strengthColors[passwordStrength - 1] || "bg-gray-300"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: {strengthLabels[passwordStrength - 1] || "Very Weak"}
                    </p>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </motion.div>

              <motion.div 
                className="space-y-2"
                variants={inputVariants}
              >
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`transition-all duration-300 pr-10 ${errors.confirmPassword ? 'border-destructive' : 'border-input focus:border-primary'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    Passwords match
                  </div>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </motion.div>

              <motion.div 
                className="text-sm"
                variants={inputVariants}
              >
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-input mt-0.5" required />
                  <span className="text-muted-foreground">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </motion.div>

              <motion.div variants={inputVariants}>
                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </motion.div>
            </form>

            <motion.div 
              className="relative"
              variants={inputVariants}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-muted-foreground">Or continue with</span>
              </div>
            </motion.div>

            <motion.div variants={inputVariants}>
              <Button
                type="button"
                variant="medical"
                className="w-full"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? "Signing Up..." : "Continue with Google"}
              </Button>
            </motion.div>

            <motion.div 
              className="text-center text-sm"
              variants={inputVariants}
            >
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;