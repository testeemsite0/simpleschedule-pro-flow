
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    console.log('Login form submitted:', data.email);
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const success = await login(data.email, data.password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful, redirecting to dashboard');
        toast({
          title: 'Login realizado com sucesso',
          description: 'Você será redirecionado para o dashboard.',
        });
        
        // Use setTimeout to avoid React 18 strict mode issues
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        console.log('Login failed, displaying error');
        setLoginError('Email ou senha incorretos. Por favor, tente novamente.');
        form.reset({ email: data.email, password: '' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError('Ocorreu um erro ao fazer login. Por favor, tente novamente.');
      form.reset({ email: data.email, password: '' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md p-6 shadow-lg">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta</h2>
        <p className="text-gray-600">Insira suas credenciais para acessar sua conta</p>
      </div>
      
      {loginError && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">
          {loginError}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Registre-se
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default LoginForm;
