
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Professional } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: Professional | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, profession: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set up auth state listener on mount
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        // Avoid immediate Supabase calls inside the callback to prevent authentication deadlocks
        if (session?.user?.id) {
          setIsLoading(true);
          
          // Use setTimeout to defer Supabase calls
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
          console.log("No session, user set to null");
        }
      }
    );

    // Then check current session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session?.user?.id);
        
        if (session?.user?.id) {
          await fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking initial session:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      
      // Use .select().eq().maybeSingle() instead of .select().eq().single()
      // for better handling when no row is found
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        // More detailed log about the error
        console.log("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        setUser(null);
      } else if (!profile) {
        console.log("No profile found for user ID:", userId);
        
        // If no profile exists, create one with user metadata
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser(userId);
          
          if (authUser && authUser.user_metadata) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                name: authUser.user_metadata.name || authUser.email?.split('@')[0] || 'User',
                email: authUser.email || '',
                profession: authUser.user_metadata.profession || 'Não especificado',
                slug: authUser.user_metadata.slug || authUser.email?.split('@')[0]?.toLowerCase() || 'user'
              })
              .select()
              .single();
              
            if (createError) {
              console.error("Error creating user profile:", createError);
              setUser(null);
            } else {
              console.log("Created new profile for user:", newProfile);
              setUser(newProfile);
            }
          } else {
            console.error("Unable to retrieve auth user data for profile creation");
            setUser(null);
          }
        } catch (getUserError) {
          console.error("Error getting user data for profile creation:", getUserError);
          setUser(null);
        }
      } else {
        console.log("User profile fetched:", profile);
        setUser(profile);
      }
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("Login attempt:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Login response:", data?.user?.id, error);
      
      if (error) {
        console.error("Login error:", error.message);
        setIsLoading(false);
        return false;
      }
      
      return !!data.user;
    } catch (error) {
      console.error("Unexpected login error:", error);
      setIsLoading(false);
      return false;
    }
  };
  
  const validateEmail = (email: string): boolean => {
    // Basic email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    profession: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Validate email format before sending to Supabase
      if (!validateEmail(email)) {
        throw new Error("O endereço de email fornecido não é válido");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            profession,
            slug: name.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
          },
        },
      });
      
      if (error) {
        console.error("Registration error:", error.message);
        setIsLoading(false);
        throw error;
      }
      
      // If we got a user ID, registration was successful
      if (data.user?.id) {
        console.log("Registration successful, user ID:", data.user.id);
      } else {
        // Supabase might return a 200 OK status but without a user ID in some cases
        console.log("Registration potentially pending email confirmation:", data);
      }
      
      return true;
    } catch (error: any) {
      console.error("Registration error:", error.message);
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    console.log("Logout called");
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading,
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
