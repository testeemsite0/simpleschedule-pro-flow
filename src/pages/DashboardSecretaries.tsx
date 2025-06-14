
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';
import { Plus, Mail, User, Calendar, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Secretary {
  id: string;
  name: string;
  email: string;
  created_at: string;
  password_changed: boolean;
}

const DashboardSecretaries = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchSecretaries();
  }, [user]);

  const fetchSecretaries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar todas as secretárias associadas ao profissional
      const { data: assignments, error: assignmentsError } = await supabase
        .from('secretary_assignments')
        .select(`
          secretary_id,
          profiles:secretary_id (
            id,
            name,
            email,
            created_at,
            password_changed
          )
        `)
        .eq('professional_id', user.id)
        .eq('is_active', true);

      if (assignmentsError) {
        console.error('Error fetching secretary assignments:', assignmentsError);
        throw assignmentsError;
      }

      const secretariesData = assignments?.map(assignment => {
        const profile = assignment.profiles as any;
        return {
          id: profile?.id || '',
          name: profile?.name || '',
          email: profile?.email || '',
          created_at: profile?.created_at || '',
          password_changed: profile?.password_changed || false
        };
      }).filter(secretary => secretary.id) || [];

      setSecretaries(secretariesData);
    } catch (error) {
      console.error('Erro ao buscar secretárias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as secretárias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSecretary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          name: formData.name,
          profession: 'Secretária'
        },
        email_confirm: true
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('ID do usuário não encontrado');

      // 2. Criar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: formData.name,
          email: formData.email,
          profession: 'Secretária',
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          password_changed: false
        });

      if (profileError) throw profileError;

      // 3. Adicionar role de secretária
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'secretary'
        });

      if (roleError) throw roleError;

      // 4. Criar assignment com o profissional
      const { error: assignmentError } = await supabase
        .from('secretary_assignments')
        .insert({
          secretary_id: userId,
          professional_id: user.id,
          is_active: true
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: "Sucesso",
        description: "Secretária criada com sucesso!"
      });

      setFormData({ name: '', email: '', password: '' });
      setIsDialogOpen(false);
      fetchSecretaries();

    } catch (error: any) {
      console.error('Erro ao criar secretária:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar secretária.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSecretary = async (secretaryId: string) => {
    try {
      // Desativar o assignment
      const { error: assignmentError } = await supabase
        .from('secretary_assignments')
        .update({ is_active: false })
        .eq('secretary_id', secretaryId)
        .eq('professional_id', user?.id);

      if (assignmentError) throw assignmentError;

      toast({
        title: "Sucesso",
        description: "Secretária removida com sucesso!"
      });

      fetchSecretaries();
    } catch (error: any) {
      console.error('Erro ao remover secretária:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover secretária.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Secretárias">
        <EnhancedLoading type="dashboard" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Secretárias">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Gerencie as secretárias que têm acesso ao seu sistema de agendamentos.
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Secretária
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Secretária</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma nova conta de secretária.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateSecretary} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Digite o email"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Senha Temporária</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite uma senha temporária"
                    required
                    minLength={6}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    A secretária será obrigada a alterar esta senha no primeiro acesso.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Secretária
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {secretaries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma secretária cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Adicione secretárias para ajudar no gerenciamento dos seus agendamentos.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Secretária
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {secretaries.map((secretary) => (
              <Card key={secretary.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      {secretary.name}
                    </CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Secretária</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover {secretary.name} do seu sistema?
                            Esta ação pode ser desfeita reativando o acesso posteriormente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSecretary(secretary.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {secretary.email}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Criado em {new Date(secretary.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={secretary.password_changed ? "default" : "secondary"}>
                      {secretary.password_changed ? "Senha alterada" : "Primeiro acesso"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSecretaries;
