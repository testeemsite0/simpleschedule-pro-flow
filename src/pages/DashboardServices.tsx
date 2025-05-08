
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import ServiceForm from '@/components/dashboard/ServiceForm';

const DashboardServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setServices(data as Service[]);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (serviceData: Omit<Service, 'id' | 'professional_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update({
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            duration_minutes: serviceData.duration_minutes,
            active: serviceData.active,
          })
          .eq('id', editingService.id);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Serviço atualizado com sucesso',
        });
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert([{
            ...serviceData,
            professional_id: user.id,
          }]);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Serviço criado com sucesso',
        });
      }
      
      // Refresh services list
      fetchServices();
      
      // Close dialog and reset editing state
      setIsDialogOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o serviço',
        variant: 'destructive',
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }
    
    try {
      // Verificar se o serviço está sendo usado em algum agendamento
      const { data: appointmentsWithService, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('service_id', serviceId)
        .limit(1);
        
      if (appointmentsError) throw appointmentsError;
      
      // Se encontramos agendamentos usando este serviço, não permitir a exclusão
      if (appointmentsWithService && appointmentsWithService.length > 0) {
        toast({
          title: 'Não é possível excluir',
          description: 'Este serviço está vinculado a agendamentos existentes e não pode ser excluído.',
          variant: 'destructive',
        });
        return;
      }
      
      // Verificar se o serviço está vinculado a algum profissional
      const { data: teamMemberServices, error: teamMemberServicesError } = await supabase
        .from('team_member_services')
        .select('id')
        .eq('service_id', serviceId)
        .limit(1);
        
      if (teamMemberServicesError) throw teamMemberServicesError;
      
      // Se encontramos vínculos com profissionais, não permitir a exclusão
      if (teamMemberServices && teamMemberServices.length > 0) {
        toast({
          title: 'Não é possível excluir',
          description: 'Este serviço está vinculado a profissionais da equipe e não pode ser excluído.',
          variant: 'destructive',
        });
        return;
      }
      
      // Se não há vínculos, proceder com a exclusão
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
        
      if (error) throw error;
      
      // Update local state
      setServices(services.filter(service => service.id !== serviceId));
      
      toast({
        title: 'Sucesso',
        description: 'Serviço excluído com sucesso',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir o serviço',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !service.active })
        .eq('id', service.id);
        
      if (error) throw error;
      
      // Update local state
      setServices(services.map(s => 
        s.id === service.id ? { ...s, active: !s.active } : s
      ));
      
      toast({
        title: 'Sucesso',
        description: `Serviço ${!service.active ? 'ativado' : 'desativado'} com sucesso`,
      });
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao alterar o status do serviço',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <DashboardLayout title="Gerenciar Serviços">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gerencie os serviços que você oferece aos seus clientes.
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingService(null)}>
                <Plus className="mr-2" size={16} />
                Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              
              <ServiceForm 
                service={editingService}
                onSave={handleSaveService}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Seus Serviços</CardTitle>
            <CardDescription>
              Gerencie os serviços oferecidos aos seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Carregando serviços...</p>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Você ainda não tem serviços cadastrados.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Adicionar seu primeiro serviço
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{formatPrice(service.price)}</TableCell>
                      <TableCell>{service.duration_minutes} minutos</TableCell>
                      <TableCell>
                        {service.active ? (
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
                          onClick={() => handleToggleActive(service)}
                          title={service.active ? 'Desativar' : 'Ativar'}
                        >
                          {service.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditService(service)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
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
    </DashboardLayout>
  );
};

export default DashboardServices;
