
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profession, setProfession] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Erro na senha',
        description: 'As senhas não conferem',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register(name, email, password, profession);
      
      if (success) {
        toast({
          title: 'Cadastro realizado com sucesso',
          description: 'Você será redirecionado para o dashboard',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Ocorreu um erro ao processar sua solicitação',
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
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profession">Profissão</Label>
            <Select
              value={profession}
              onValueChange={setProfession}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua profissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="psicologo">Psicólogo(a)</SelectItem>
                <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                <SelectItem value="advogado">Advogado(a)</SelectItem>
                <SelectItem value="nutricionista">Nutricionista</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
    </Card>
  );
};

export default RegisterForm;
