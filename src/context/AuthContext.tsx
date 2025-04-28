
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Professional } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: Professional | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, profession: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Professional | null>(null);
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (session) {
          // Fetch user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setUser(profile);
          console.log("User profile fetched:", profile);
        } else {
          setUser(null);
          console.log("No session, user set to null");
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      if (session) {
        // Fetch user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUser(profile);
            console.log("Initial user profile:", profile);
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log("Login response:", data?.user?.id, error);
    return !error && !!data.user;
  };
  
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    profession: string
  ): Promise<boolean> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          profession,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        },
      },
    });
    
    return !error;
  };
  
  const logout = async () => {
    console.log("Logout called");
    await supabase.auth.signOut();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
