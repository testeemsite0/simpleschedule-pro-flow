
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ClientList, Client } from '@/components/clients/ClientList';
import { ClientForm } from '@/components/clients/ClientForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const DashboardClients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleOpenDialog = (client?: Client) => {
    setSelectedClient(client || null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (clientId: string) => {
    setClientToDelete(clientId);
    setIsAlertDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientToDelete);
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Cliente removido com sucesso',
      });
      
      setClients(prevClients => prevClients.filter(client => client.id !== clientToDelete));
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao remover o cliente',
        variant: 'destructive',
      });
    } finally {
      setClientToDelete(null);
      setIsAlertDialogOpen(false);
    }
  };
  
  const handleSubmit = async (formData: { name: string; email: string | undefined; phone: string | undefined; notes: string | undefined; }) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (selectedClient) {
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
          .eq('id', selectedClient.id);
          
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso',
        });
        
        // Update local state
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === selectedClient.id 
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
      
      // Close dialog
      setIsDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o cliente',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout title="Gerenciar Clientes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gerencie todos os clientes do seu consultório
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            
            <ClientForm 
              client={selectedClient}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => setIsDialogOpen(false)}
            />
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Seus Clientes</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientList 
              clients={clients}
              loading={loading}
              onAddNew={() => handleOpenDialog()}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DashboardClients;
