
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setName(user.name || '');
      setProfession(user.profession || '');
      setBio(user.bio || '');
      setSlug(user.slug || '');
      setEmail(user.email || '');
    }
  }, [user, isAuthenticated, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !profession) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e profissão são campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          profession,
          bio,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        })
        .eq('id', user?.id);
        
      if (error) throw error;
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro ao atualizar seu perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'A nova senha e a confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi atualizada com sucesso.',
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message || 'Ocorreu um erro ao atualizar sua senha.',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <DashboardLayout title="Perfil">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <form onSubmit={handleUpdateProfile}>
              <CardHeader>
                <CardTitle>Perfil Profissional</CardTitle>
                <CardDescription>
                  Atualize suas informações profissionais e pessoais aqui.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo*</Label>
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">O email não pode ser alterado.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profession">Profissão*</Label>
                  <Input 
                    id="profession" 
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Sua profissão"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Input 
                    id="bio" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Uma breve descrição sobre você"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug personalizado</Label>
                  <Input 
                    id="slug" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="seu-nome"
                  />
                  <p className="text-xs text-gray-500">
                    Este será o endereço personalizado para seu link de agendamento: example.com/booking/seu-slug
                  </p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <form onSubmit={handleUpdatePassword}>
              <CardHeader>
                <CardTitle>Segurança e Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha e configurações de segurança aqui.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
              
              <CardFooter>
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? 'Atualizando...' : 'Atualizar senha'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Profile;
