
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile, createUserProfile } from "@/services/profileService";
import { AuthState } from "@/types/auth";
import { Professional } from "@/types";

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
            handleProfileFetch(session.user.id);
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
          await handleProfileFetch(session.user.id);
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
  
  const handleProfileFetch = async (userId: string) => {
    const profile = await fetchUserProfile(userId);
    
    if (profile) {
      setUser(profile);
    } else {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser(userId);
        if (authUser) {
          const newProfile = await createUserProfile(userId, authUser.user_metadata || {});
          setUser(newProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching auth user:", error);
        setUser(null);
      }
    }
    
    setIsLoading(false);
  };
  
  return { user, isLoading };
};
