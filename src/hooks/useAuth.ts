import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  // ADD THIS IMPORT
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'user' | 'doctor' | 'healthworker' | 'family';

export interface AuthUser extends User {
  role?: UserRole;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getUserRole = async (uid: string): Promise<UserRole> => {
    // ... (This function remains unchanged)
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
      throw error;
    }
  };

  // const setUserRole = async (uid: string, role: UserRole = 'user') => {
  //   // ... (This function remains unchanged)
  //   try {
  //     await setDoc(doc(db, 'users', uid), { role }, { merge: true });
  //   } catch (error) {
  //     console.error('Error setting user role:', error);
  //   }
  // };

   const setUserData = async (uid: string, email: string | null, role: UserRole = 'user') => {
    try {
      await setDoc(
        doc(db, 'users', uid),
        {
          email,
          role,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  };

  useEffect(() => {
    // ... (This useEffect remains unchanged)
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
    // ... (This function remains unchanged)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // await setUserRole(result.user.uid, role);
      await setUserData(result.user.uid, result.user.email, role);
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
    // ... (This function remains unchanged)
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

  // --- THIS FUNCTION IS UPDATED ---
  const signInWithGoogle = async (role?: UserRole) => {
    try {
      // Add the Google Fit scopes here
      googleProvider.addScope("https://www.googleapis.com/auth/fitness.activity.read");
      googleProvider.addScope("https://www.googleapis.com/auth/fitness.body.read");
      googleProvider.addScope("https://www.googleapis.com/auth/fitness.heart_rate.read");
      googleProvider.addScope("https://www.googleapis.com/auth/fitness.sleep.read");

      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists() && role) {
        // New user - set the provided role
        // await setUserRole(result.user.uid, role);
        await setUserData(result.user.uid, result.user.email, role || 'user');
        toast({
          title: "Account Created!",
          description: "Welcome. Permissions for Google Fit granted.",
        });
      } else if (userDoc.exists()) {
        // Existing user - just sign them in
        toast({
          title: "Login Successful!",
          description: "Welcome back. Permissions for Google Fit updated.",
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

  // --- ADD THIS NEW FUNCTION ---
  const getGoogleFitAccessToken = (result: any): string | null => {
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        return credential.accessToken;
      }
    }
    console.warn("Could not retrieve Google Fit access token.");
    return null;
  };
  
  const logout = async () => {
    // ... (This function remains unchanged)
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
    logout,
    getGoogleFitAccessToken // <-- Expose the new function
  };
};