
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import ServiceForm from '@/components/dashboard/ServiceForm';
import { ServiceList } from '@/components/dashboard/services/ServiceList';
import { useServiceManagement } from '@/hooks/services/useServiceManagement';

const DashboardServices = () => {
  const {
    services,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    editingService,
    handleSaveService,
    handleEditService,
    handleDeleteService,
    handleToggleActive,
    openAddServiceDialog
  } = useServiceManagement();

  return (
    <DashboardLayout title="Gerenciar Serviços">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gerencie os serviços que você oferece aos seus clientes.
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddServiceDialog}>
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
            <ServiceList
              services={services}
              loading={loading}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              onToggleActive={handleToggleActive}
              openAddServiceDialog={openAddServiceDialog}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardServices;
