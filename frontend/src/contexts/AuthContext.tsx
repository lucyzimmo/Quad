import { createContext, useContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { User } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userProfile: any;
  refreshUserProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  refreshUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  const refreshUserProfile = async () => {
    try {
      if (!auth.currentUser) return;

      const token = await auth.currentUser.getIdToken(true);
      const response = await fetch("http://localhost:8000/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error("Profile refresh error:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user ? {
        uid: user.uid,
        email: user.email,
        isAdmin: userProfile?.isAdmin || false
      } : null);
      if (user) {
        await refreshUserProfile();
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const value = {
    currentUser,
    userProfile,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
