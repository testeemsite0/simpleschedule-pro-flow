
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, Users, Shield } from 'lucide-react';

interface Secretary {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface SecretaryAssignment {
  id: string;
  secretary_id: string;
  professional_id: string;
  is_active: boolean;
  secretary_name: string;
  professional_name: string;
}

const DashboardSecretaries = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [assignments, setAssignments] = useState<SecretaryAssignment[]>([]);
  const [professionals, setProfessionals] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newSecretaryEmail, setNewSecretaryEmail] = useState('');
  const [newSecretaryName, setNewSecretaryName] = useState('');
  const [selectedSecretary, setSelectedSecretary] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First, fetch user roles that are secretaries
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'secretary');

      if (rolesError) throw rolesError;

      // Then fetch profiles for those users
      const secretaryIds = userRoles?.map(role => role.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', secretaryIds);

      if (profilesError) throw profilesError;

      const secretaryList = profilesData?.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: 'secretary',
        created_at: new Date().toISOString()
      })) || [];

      setSecretaries(secretaryList);

      // Fetch professionals
      const { data: professionalData, error: professionalError } = await supabase
        .from('profiles')
        .select('id, name, display_name');

      if (professionalError) throw professionalError;

      const professionalList = professionalData?.map(p => ({
        id: p.id,
        name: p.display_name || p.name
      })) || [];

      setProfessionals(professionalList);

      // Fetch assignments with manual joins
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('secretary_assignments')
        .select('id, secretary_id, professional_id, is_active');

      if (assignmentError) throw assignmentError;

      // Manually join with profiles data
      const assignmentList = assignmentData?.map(assignment => {
        const secretary = profilesData?.find(p => p.id === assignment.secretary_id);
        const professional = professionalData?.find(p => p.id === assignment.professional_id);
        
        return {
          id: assignment.id,
          secretary_id: assignment.secretary_id,
          professional_id: assignment.professional_id,
          is_active: assignment.is_active,
          secretary_name: secretary?.name || 'Nome não encontrado',
          professional_name: professional?.display_name || professional?.name || 'Nome não encontrado'
        };
      }) || [];

      setAssignments(assignmentList);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das secretárias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSecretary = async () => {
    if (!newSecretaryEmail || !newSecretaryName) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newSecretaryEmail)
        .single();

      if (!existingUser) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado. O usuário deve se registrar primeiro na plataforma.",
          variant: "destructive"
        });
        return;
      }

      // Create secretary role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: existingUser.id,
          role: 'secretary'
        });

      if (roleError) throw roleError;

      toast({
        title: "Sucesso",
        description: "Secretária criada com sucesso!"
      });

      setNewSecretaryEmail('');
      setNewSecretaryName('');
      fetchData();

    } catch (error: any) {
      console.error('Error creating secretary:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar secretária.",
        variant: "destructive"
      });
    }
  };

  const createAssignment = async () => {
    if (!selectedSecretary || !selectedProfessional) {
      toast({
        title: "Erro",
        description: "Selecione a secretária e o profissional.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('secretary_assignments')
        .insert({
          secretary_id: selectedSecretary,
          professional_id: selectedProfessional,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Atribuição criada com sucesso!"
      });

      setSelectedSecretary('');
      setSelectedProfessional('');
      fetchData();

    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar atribuição.",
        variant: "destructive"
      });
    }
  };

  const toggleAssignment = async (assignmentId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('secretary_assignments')
        .update({ is_active: !isActive })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Atribuição ${!isActive ? 'ativada' : 'desativada'} com sucesso!`
      });

      fetchData();

    } catch (error: any) {
      console.error('Error toggling assignment:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da atribuição.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Gerenciar Secretárias">
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gerenciar Secretárias">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gerenciamento de Secretárias</h1>
        </div>

        <Tabs defaultValue="secretaries" className="space-y-6">
          <TabsList>
            <TabsTrigger value="secretaries" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Secretárias ({secretaries.length})
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Atribuições ({assignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="secretaries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Adicionar Nova Secretária
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="secretary-name">Nome</Label>
                    <Input
                      id="secretary-name"
                      value={newSecretaryName}
                      onChange={(e) => setNewSecretaryName(e.target.value)}
                      placeholder="Nome da secretária"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secretary-email">Email</Label>
                    <Input
                      id="secretary-email"
                      type="email"
                      value={newSecretaryEmail}
                      onChange={(e) => setNewSecretaryEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <Button onClick={createSecretary} className="w-full md:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Secretária
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Secretárias</CardTitle>
              </CardHeader>
              <CardContent>
                {secretaries.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    Nenhuma secretária cadastrada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {secretaries.map(secretary => (
                      <div key={secretary.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{secretary.name}</p>
                          <p className="text-sm text-muted-foreground">{secretary.email}</p>
                        </div>
                        <Badge variant="outline">Secretária</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Atribuição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Secretária</Label>
                    <Select value={selectedSecretary} onValueChange={setSelectedSecretary}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma secretária" />
                      </SelectTrigger>
                      <SelectContent>
                        {secretaries.map(secretary => (
                          <SelectItem key={secretary.id} value={secretary.id}>
                            {secretary.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Profissional</Label>
                    <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map(professional => (
                          <SelectItem key={professional.id} value={professional.id}>
                            {professional.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={createAssignment} className="w-full md:w-auto">
                  Criar Atribuição
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atribuições Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    Nenhuma atribuição criada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignments.map(assignment => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{assignment.secretary_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Gerencia: {assignment.professional_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.is_active ? "default" : "secondary"}>
                            {assignment.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAssignment(assignment.id, assignment.is_active)}
                          >
                            {assignment.is_active ? "Desativar" : "Ativar"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSecretaries;
