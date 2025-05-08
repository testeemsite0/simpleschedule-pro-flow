
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types';

export const useServiceManagement = () => {
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

  const openAddServiceDialog = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  return {
    services,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    editingService,
    setEditingService,
    fetchServices,
    handleSaveService,
    handleEditService,
    handleDeleteService,
    handleToggleActive,
    openAddServiceDialog
  };
};
