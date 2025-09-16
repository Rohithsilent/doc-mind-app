import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Make sure this import is present
import { GoogleAuthProvider } from "firebase/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    // This function is unchanged
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // This function is unchanged
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        await signIn(email, password);
        window.location.href = '/dashboard';
      } catch (error) {
        // Error is handled in useAuth hook
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- THIS FUNCTION IS UPDATED WITH DEBUGGING LOGS ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Step 1: Call the signInWithGoogle function
      const result = await signInWithGoogle();
      console.log("1. Login Result:", result); // <-- DEBUG LOG

      if (result) {
        // Step 2: Get the credential from the result
        const credential = GoogleAuthProvider.credentialFromResult(result);
        console.log("2. Credential:", credential); // <-- DEBUG LOG

        // Step 3: Extract the access token
        if (credential?.accessToken) {
          const accessToken = credential.accessToken;
          console.log("3. Access Token Found:", accessToken); // <-- DEBUG LOG
          
          // Step 4: Save the token to session storage
          sessionStorage.setItem('googleFitAccessToken', accessToken);
          console.log("4. Token saved to sessionStorage!");

        } else {
          console.error("ERROR: Access Token not found in credential.");
        }
      } else {
        console.error("ERROR: Google Sign-In did not return a result.");
      }
      
      // Step 5: Redirect to the dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error("ERROR in handleGoogleLogin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ALL THE UI CODE BELOW IS UNCHANGED ---

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/20" />
      
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
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              variants={inputVariants}
            >
              Sign in to your healthcare account
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </motion.div>

              <motion.div 
                className="flex items-center justify-between text-sm"
                variants={inputVariants}
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-input" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div variants={inputVariants}>
                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
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
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? "Signing In..." : "Continue with Google"}
              </Button>
            </motion.div>

            <motion.div 
              className="text-center text-sm"
              variants={inputVariants}
            >
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;