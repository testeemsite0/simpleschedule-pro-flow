
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast({
        title: 'Email enviado',
        description: 'Verifique seu email para redefinir sua senha.',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar o email de redefinição. Verifique se o email está correto.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Esqueceu sua senha?</CardTitle>
        <CardDescription>
          Digite seu email para receber um link de redefinição de senha.
        </CardDescription>
      </CardHeader>
      
      {success ? (
        <CardContent>
          <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-4">
            <p className="text-green-700 text-sm">
              Se o endereço de email informado estiver registrado, você receberá um link para redefinir sua senha.
              Verifique sua caixa de entrada e caixa de spam.
            </p>
          </div>
          <Button asChild variant="link" className="p-0">
            <a href="/login">Voltar ao login</a>
          </Button>
        </CardContent>
      ) : (
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
            </Button>
            <Button asChild variant="link" className="p-0">
              <a href="/login">Voltar ao login</a>
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default ForgotPasswordForm;
