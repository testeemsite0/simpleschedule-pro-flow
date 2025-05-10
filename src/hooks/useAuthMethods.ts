
import { supabase } from "@/integrations/supabase/client";

// Basic email validation with regex
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const useAuthMethods = () => {
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Login response:", data?.user?.id, error);
      
      if (error) {
        console.error("Login error:", error.message);
        return false;
      }
      
      return !!data.user;
    } catch (error) {
      console.error("Unexpected login error:", error);
      return false;
    }
  };
  
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    profession: string
  ): Promise<boolean> => {
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
      throw error;
    }
  };
  
  const logout = async () => {
    console.log("Logout called");
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return {
    login,
    register,
    logout
  };
};
