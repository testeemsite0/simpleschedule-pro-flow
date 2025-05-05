
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, Service } from '@/types';
import { Plus, Pencil, Trash2, CheckCircle, XCircle, User, Briefcase } from 'lucide-react';
import TeamMemberForm from '@/components/dashboard/TeamMemberForm';
import TeamMemberServiceForm from '@/components/dashboard/TeamMemberServiceForm';

const DashboardTeam = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isNewMemberDialogOpen, setIsNewMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchTeamMembers();
      fetchServices();
    }
  }, [user]);
  
  const fetchTeamMembers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('professional_id', user.id)
        .order('name');
        
      if (error) throw error;
      
      // Fetch member services
      const members = data || [];
      const membersWithServices = await Promise.all(
        members.map(async (member) => {
          const { data: serviceLinks } = await supabase
            .from('team_member_services')
            .select('service_id')
            .eq('team_member_id', member.id);
            
          if (serviceLinks && serviceLinks.length > 0) {
            const serviceIds = serviceLinks.map(link => link.service_id);
            const { data: memberServices } = await supabase
              .from('services')
              .select('*')
              .in('id', serviceIds);
              
            return { ...member, services: memberServices || [] };
          }
          
          return { ...member, services: [] };
        })
      );
      
      setTeamMembers(membersWithServices as TeamMember[]);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os membros da equipe',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchServices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', user.id)
        .eq('active', true)
        .order('name');
        
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };
  
  const handleSaveTeamMember = async (memberData: Partial<TeamMember>) => {
    if (!user) return;
    
    try {
      if (selectedMember && isEditMemberDialogOpen) {
        // Update existing member
        const { error } = await supabase
          .from('team_members')
          .update({
            name: memberData.name,
            email: memberData.email,
            position: memberData.position,
            active: memberData.active,
          })
          .eq('id', selectedMember.id);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Membro da equipe atualizado com sucesso',
        });
      } else {
        // Create new member
        const { error } = await supabase
          .from('team_members')
          .insert([{
            ...memberData,
            professional_id: user.id,
          }]);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Membro da equipe adicionado com sucesso',
        });
      }
      
      // Close dialogs and refresh data
      setIsNewMemberDialogOpen(false);
      setIsEditMemberDialogOpen(false);
      setSelectedMember(null);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o membro da equipe',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteTeamMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja excluir este membro da equipe?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Membro da equipe removido com sucesso',
      });
      
      // Refresh team members list
      fetchTeamMembers();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover o membro da equipe',
        variant: 'destructive',
      });
    }
  };
  
  const handleToggleActive = async (member: TeamMember) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ active: !member.active })
        .eq('id', member.id);
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: `Membro da equipe ${!member.active ? 'ativado' : 'desativado'} com sucesso`,
      });
      
      // Update local state
      setTeamMembers(prev => prev.map(m => 
        m.id === member.id ? { ...m, active: !m.active } : m
      ));
    } catch (error) {
      console.error('Error toggling team member status:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao alterar o status do membro da equipe',
        variant: 'destructive',
      });
    }
  };
  
  const handleSaveServices = async (teamMemberId: string, selectedServiceIds: string[]) => {
    try {
      // First delete all existing service associations
      const { error: deleteError } = await supabase
        .from('team_member_services')
        .delete()
        .eq('team_member_id', teamMemberId);
        
      if (deleteError) throw deleteError;
      
      // Then insert new associations
      if (selectedServiceIds.length > 0) {
        const serviceAssociations = selectedServiceIds.map(serviceId => ({
          team_member_id: teamMemberId,
          service_id: serviceId,
        }));
        
        const { error: insertError } = await supabase
          .from('team_member_services')
          .insert(serviceAssociations);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Serviços atualizados com sucesso',
      });
      
      setIsServiceDialogOpen(false);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member services:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar os serviços',
        variant: 'destructive',
      });
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
  return (
    <DashboardLayout title="Gerenciar Equipe">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gerencie os profissionais da sua equipe e seus serviços.
          </p>
          
          <Dialog open={isNewMemberDialogOpen} onOpenChange={setIsNewMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Membro</DialogTitle>
              </DialogHeader>
              <TeamMemberForm onSave={handleSaveTeamMember} onCancel={() => setIsNewMemberDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sua Equipe</CardTitle>
            <CardDescription>
              Gerencie os membros da sua equipe e os serviços que cada um oferece
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Carregando membros da equipe...</p>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Você ainda não tem membros na equipe.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsNewMemberDialogOpen(true)}
                >
                  Adicionar seu primeiro membro
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Serviços</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.name} />
                            ) : (
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.position || 'Não especificado'}</TableCell>
                      <TableCell>
                        {(member.services && member.services.length > 0) ? (
                          <div className="flex flex-wrap gap-1">
                            {member.services.slice(0, 2).map(service => (
                              <span key={service.id} className="text-xs bg-secondary rounded-full px-2 py-1">
                                {service.name}
                              </span>
                            ))}
                            {member.services.length > 2 && (
                              <span className="text-xs bg-secondary rounded-full px-2 py-1">
                                +{member.services.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Nenhum serviço</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.active ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle className="mr-1" size={16} />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-500">
                            <XCircle className="mr-1" size={16} />
                            Inativo
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsServiceDialogOpen(true);
                          }}
                          title="Gerenciar serviços"
                        >
                          <Briefcase size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(member)}
                          title={member.active ? 'Desativar' : 'Ativar'}
                        >
                          {member.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsEditMemberDialogOpen(true);
                          }}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeamMember(member.id)}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Member Dialog */}
      <Dialog open={isEditMemberDialogOpen} onOpenChange={setIsEditMemberDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
          </DialogHeader>
          <TeamMemberForm 
            member={selectedMember} 
            onSave={handleSaveTeamMember} 
            onCancel={() => setIsEditMemberDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Services Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Serviços</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <TeamMemberServiceForm 
              teamMember={selectedMember}
              availableServices={services}
              onSave={(selectedServices) => handleSaveServices(selectedMember.id, selectedServices)}
              onCancel={() => setIsServiceDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DashboardTeam;
