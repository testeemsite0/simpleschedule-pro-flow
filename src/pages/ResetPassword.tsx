
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/ui/Logo';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validLink, setValidLink] = useState(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the URL contains a valid reset token
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (!hashParams.has('type') || hashParams.get('type') !== 'recovery') {
      setValidLink(false);
      toast({
        title: 'Link inválido',
        description: 'Este link de redefinição de senha é inválido ou expirou.',
        variant: 'destructive',
      });
    }
  }, [toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'A nova senha e a confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi redefinida com sucesso. Você será redirecionado para o login.',
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Erro ao redefinir senha',
        description: error.message || 'Ocorreu um erro ao redefinir sua senha. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!validLink) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-4 py-12">
        <div className="mb-8">
          <Logo />
        </div>
        
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Link inválido</CardTitle>
            <CardDescription>
              Este link de redefinição de senha é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/forgot-password">Solicitar novo link</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>
            Escolha uma nova senha para sua conta.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>
            <Button asChild variant="link" className="p-0">
              <a href="/login">Voltar ao login</a>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
