
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
      
      // Se chegou aqui, a autenticação foi bem sucedida
      console.log("Login successful, session:", data.session?.access_token.substring(0, 10) + "...");
      return !!data.session; // Verifica se há uma sessão válida em vez de apenas o usuário
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
      
      // Log para verificar que dados estão sendo enviados
      console.log("Registering user:", { name, email, profession });
      
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
      
      // Verificação mais completa do estado de registro
      console.log("Registration response:", {
        userId: data.user?.id,
        emailConfirmed: data.user?.email_confirmed_at,
        session: !!data.session,
      });
      
      // Se o usuário for criado, consideramos o registro bem-sucedido
      if (data.user?.id) {
        console.log("Registration successful, user ID:", data.user.id);
        return true;
      } else {
        console.log("Registration potentially pending email confirmation:", data);
        return false;
      }
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
