import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'user' | 'doctor' | 'healthworker';

export interface AuthUser extends User {
  role?: UserRole;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getUserRole = async (uid: string): Promise<UserRole> => {
    try {
      console.log('Fetching user role for UID:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role || 'user';
        console.log('Successfully fetched user role:', role);
        return role;
      }
      console.log('User document does not exist, defaulting to user role');
      return 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Don't default to 'user' immediately, let the auth state handle retries
      throw error;
    }
  };

  const setUserRole = async (uid: string, role: UserRole = 'user') => {
    try {
      await setDoc(doc(db, 'users', uid), { role }, { merge: true });
    } catch (error) {
      console.error('Error setting user role:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log('Auth state changed, user found:', firebaseUser.uid);
          const role = await getUserRole(firebaseUser.uid);
          const userWithRole: AuthUser = { ...firebaseUser, role };
          console.log('Setting user with role:', role);
          setUser(userWithRole);
        } catch (error) {
          console.error('Failed to get user role, keeping user without role for now');
          // Set user without role, they'll be redirected to login
          setUser({ ...firebaseUser, role: undefined });
        }
      } else {
        console.log('No authenticated user found');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, role: UserRole = 'user') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setUserRole(result.user.uid, role);
      toast({
        title: "Account Created!",
        description: "Welcome to your healthcare assistant.",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful!",
        description: "Welcome back to your healthcare assistant.",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async (role?: UserRole) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists() && role) {
        // New user - set the provided role
        await setUserRole(result.user.uid, role);
        toast({
          title: "Account Created!",
          description: "Welcome to your healthcare assistant.",
        });
      } else if (userDoc.exists()) {
        // Existing user - just sign them in
        toast({
          title: "Login Successful!",
          description: "Welcome back to your healthcare assistant.",
        });
      }
      
      return result;
    } catch (error: any) {
      toast({
        title: "Google Sign-in Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };
};