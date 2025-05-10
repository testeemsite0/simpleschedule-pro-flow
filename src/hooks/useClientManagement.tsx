
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/components/clients/ClientList';

export const useClientManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch clients on component mount
  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);
  
  const fetchClients = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('professional_id', user.id)
        .order('name');
        
      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Cliente removido com sucesso',
      });
      
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover o cliente',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  const saveClient = async (
    formData: { name: string; email: string | undefined; phone: string | undefined; notes: string | undefined; },
    clientId?: string
  ) => {
    if (!user) return false;
    
    setIsSubmitting(true);
    
    try {
      if (clientId) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            notes: formData.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso',
        });
        
        // Update local state
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === clientId 
              ? { 
                  ...client, 
                  name: formData.name,
                  email: formData.email || null,
                  phone: formData.phone || null,
                  notes: formData.notes || null
                } 
              : client
          )
        );
      } else {
        // Create new client
        const { data, error } = await supabase
          .from('clients')
          .insert({
            professional_id: user.id,
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            notes: formData.notes || null
          })
          .select();
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Cliente adicionado com sucesso',
        });
        
        if (data && data.length > 0) {
          setClients(prevClients => [...prevClients, data[0] as Client]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o cliente',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    clients,
    loading,
    isSubmitting,
    fetchClients,
    deleteClient,
    saveClient
  };
};
