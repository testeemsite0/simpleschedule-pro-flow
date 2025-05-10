
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from './form/RegisterFormSchema';
import { 
  NameField,
  EmailField, 
  ProfessionField, 
  PasswordField, 
  ConfirmPasswordField 
} from './form/FormFields';
import type { RegisterFormValues } from '@/types/auth';

const RegisterForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      profession: '',
      password: '',
      confirmPassword: '',
    }
  });
  
  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    console.log('Registration form submitted:', values);
    
    try {
      const success = await register(
        values.name, 
        values.email, 
        values.password, 
        values.profession
      );
      
      if (success) {
        toast({
          title: 'Cadastro realizado com sucesso',
          description: 'Você será redirecionado para o dashboard',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Atenção',
          description: 'Cadastro iniciado, mas pode ser necessária confirmação por email',
          variant: 'default',
        });
      }
    } catch (error: any) {
      // Handle specific error messages with mais detalhes
      let errorMessage = 'Ocorreu um erro ao processar sua solicitação';
      
      console.error('Registration error details:', error);
      
      if (error.message?.includes('Email') && error.message?.includes('invalid')) {
        errorMessage = 'O endereço de email fornecido não é válido';
      } else if (error.message?.includes('already')) {
        errorMessage = 'Este email já está em uso';
      } else if (error.message?.includes('password')) {
        errorMessage = 'A senha fornecida não atende aos requisitos de segurança';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro ao cadastrar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Cadastre-se para começar a gerenciar seus agendamentos
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <NameField form={form} />
            <EmailField form={form} />
            <ProfessionField form={form} />
            <PasswordField form={form} />
            <ConfirmPasswordField form={form} />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
            <p className="text-center text-sm">
              Já tem uma conta?{' '}
              <a href="/login" className="text-primary hover:underline">
                Entrar
              </a>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default RegisterForm;
