
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClientList, Client } from '@/components/clients/ClientList';
import { ClientForm } from '@/components/clients/ClientForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useClientManagement } from '@/hooks/useClientManagement';

const DashboardClients = () => {
  const { clients, loading, isSubmitting, saveClient, deleteClient } = useClientManagement();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  
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
    
    const success = await deleteClient(clientToDelete);
    
    if (success) {
      setClientToDelete(null);
      setIsAlertDialogOpen(false);
    }
  };
  
  const handleSubmit = async (formData: { name: string; email: string | undefined; phone: string | undefined; notes: string | undefined; }) => {
    const success = await saveClient(formData, selectedClient?.id);
    
    if (success) {
      setIsDialogOpen(false);
      setSelectedClient(null);
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
