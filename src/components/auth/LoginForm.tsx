
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting to login with:", email);
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: 'Login realizado com sucesso',
          description: 'Você será redirecionado para o dashboard',
        });
        
        // Verificar se o usuário está realmente autenticado
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session) {
          console.log("User authenticated, redirecting to dashboard");
          navigate('/dashboard');
        } else {
          console.error("Session not found after successful login");
          toast({
            title: 'Erro de autenticação',
            description: 'Falha ao iniciar sessão. Por favor, tente novamente.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      } else {
        console.error("Login failed");
        toast({
          title: 'Erro ao fazer login',
          description: 'Email ou senha incorretos',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: 'Erro ao fazer login',
        description: 'Ocorreu um erro ao processar sua solicitação',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para gerenciar seus agendamentos
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <a href="/forgot-password" className="text-xs text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className="text-center text-sm">
            Não tem uma conta?{' '}
            <a href="/register" className="text-primary hover:underline">
              Cadastre-se
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
