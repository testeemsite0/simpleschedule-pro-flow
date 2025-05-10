
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile, createUserProfile } from "@/services/profileService";
import { AuthState } from "@/types/auth";
import { Professional } from "@/types";
import { toast } from "@/hooks/use-toast";

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
    try {
      console.log("Attempting to fetch user profile for ID:", userId);
      const profile = await fetchUserProfile(userId);
      
      if (profile) {
        console.log("User profile found:", profile.id);
        setUser(profile);
      } else {
        console.log("No profile found, attempting to create new profile for user:", userId);
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            console.log("Auth user data found, creating profile with metadata:", authUser.user_metadata);
            const newProfile = await createUserProfile(userId, authUser.user_metadata || {});
            
            if (newProfile) {
              console.log("Profile created successfully:", newProfile.id);
              setUser(newProfile);
            } else {
              console.warn("Profile creation returned null, using fallback profile");
              // Create a fallback profile for the user session
              const fallbackProfile: Professional = {
                id: userId,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
                email: authUser.email || '',
                profession: authUser.user_metadata?.profession || 'Não especificado',
                slug: authUser.user_metadata?.slug || 
                      (authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'usuario')
                      .toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              };
              setUser(fallbackProfile);
              toast({
                title: "Aviso",
                description: "Perfil temporário criado. Algumas funcionalidades podem estar limitadas.",
                variant: "default", // Changed from "warning" to "default"
              });
            }
          } else {
            console.error("Auth user not found");
            setUser(null);
            toast({
              title: "Erro de autenticação",
              description: "Não foi possível recuperar seus dados de usuário. Tente fazer login novamente.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching auth user or creating profile:", error);
          setUser(null);
          toast({
            title: "Erro de autenticação",
            description: "Ocorreu um problema ao configurar seu perfil. Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in profile handling:", error);
      setUser(null);
      toast({
        title: "Erro de perfil",
        description: "Não foi possível carregar seu perfil. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return { user, isLoading };
};
