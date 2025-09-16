import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { FamilyService } from '@/lib/familyService';
import { 
  Users, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  User,
  Lock
} from 'lucide-react';

const passwordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const inviteToken = searchParams.get('token');

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const validateInvitation = async () => {
      if (!inviteToken) {
        setError('Invalid invitation link. No token provided.');
        setLoading(false);
        return;
      }

      try {
        // TODO: Validate the invitation token and get invite data
        // For now, we'll simulate the validation
        setInviteData({
          patientName: 'John Doe',
          familyRole: 'Spouse',
          email: 'family@example.com'
        });
        
        form.setValue('email', 'family@example.com');
      } catch (error) {
        console.error('Error validating invitation:', error);
        setError('Invalid or expired invitation link.');
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [inviteToken, form]);

  const onSubmit = async (data: PasswordFormData) => {
    if (!inviteToken) return;

    setIsAccepting(true);
    try {
      // Create the family member account
      const result = await signUp(data.email, data.password, 'family');
      
      // Accept the invitation
      await FamilyService.acceptInvitation(inviteToken, result.user.uid);
      
      // Redirect to the family member dashboard
      navigate(`/family-dashboard/${inviteData.patientUid}`);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setError(error.message || 'Failed to accept invitation. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This invitation link is invalid or has expired.'}
            </p>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gradient-card shadow-glow">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Family Invitation</CardTitle>
            <CardDescription>
              You've been invited to access health information for <strong>{inviteData.patientName}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Role:</strong> {inviteData.familyRole} • 
                <strong> Access:</strong> Read-only health information
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Create Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Enter a secure password"
                          className="bg-card"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Confirm your password"
                          className="bg-card"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-accent/20 p-4 rounded-lg text-sm">
                  <h4 className="font-medium mb-2">What you'll get access to:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Secure, read-only access to health information</li>
                    <li>• Role-based permissions as {inviteData.familyRole}</li>
                    <li>• Real-time health updates when available</li>
                    <li>• Your own private, secure account</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary"
                  disabled={isAccepting}
                >
                  {isAccepting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting up your account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Invitation & Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-muted-foreground">
              By accepting this invitation, you agree to our privacy policy 
              and will have secure access to the specified health information.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}