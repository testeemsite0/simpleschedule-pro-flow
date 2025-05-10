
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
        
        // Fornecer mensagens de erro mais amigáveis
        let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Seu email ainda não foi confirmado. Verifique sua caixa de entrada.";
        }
        
        toast({
          title: "Falha no login",
          description: errorMessage,
          variant: "destructive",
        });
        
        return false;
      }
      
      // Se chegou aqui, a autenticação foi bem sucedida
      console.log("Login successful, session:", data.session?.access_token.substring(0, 10) + "...");
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
        variant: "default",
      });
      
      return !!data.session; // Verifica se há uma sessão válida em vez de apenas o usuário
    } catch (error) {
      console.error("Unexpected login error:", error);
      
      toast({
        title: "Erro de conexão",
        description: "Houve um problema ao conectar com o servidor. Tente novamente mais tarde.",
        variant: "destructive",
      });
      
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
        toast({
          title: "Email inválido",
          description: "O endereço de email fornecido não é válido",
          variant: "destructive",
        });
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
        
        // Fornecer mensagens de erro mais amigáveis
        let errorMessage = "Erro ao criar sua conta.";
        
        if (error.message.includes("already registered")) {
          errorMessage = "Este email já está em uso. Tente fazer login ou recuperar sua senha.";
        } else if (error.message.includes("password")) {
          errorMessage = "A senha fornecida não atende aos requisitos de segurança.";
        }
        
        toast({
          title: "Falha no registro",
          description: errorMessage,
          variant: "destructive",
        });
        
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
        
        toast({
          title: "Registro bem-sucedido",
          description: data.session 
            ? "Sua conta foi criada com sucesso!" 
            : "Sua conta foi criada. Por favor, verifique seu email para confirmar o cadastro.",
          variant: "default",
        });
        
        return true;
      } else {
        console.log("Registration potentially pending email confirmation:", data);
        
        toast({
          title: "Registro iniciado",
          description: "Verifique seu email para confirmar o cadastro.",
          variant: "default",
        });
        
        return false;
      }
    } catch (error: any) {
      console.error("Registration error:", error.message);
      return false;
    }
  };
  
  const logout = async () => {
    console.log("Logout called");
    
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Erro ao sair",
        description: "Houve um problema ao encerrar sua sessão. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  return {
    login,
    register,
    logout
  };
};
