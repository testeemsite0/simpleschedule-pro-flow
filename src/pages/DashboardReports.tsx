
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import AppointmentReports from '@/components/dashboard/AppointmentReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DashboardReports = () => {
  return (
    <DashboardLayout title="Relatórios">
      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="finances">Financeiro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments">
          <AppointmentReports />
        </TabsContent>
        
        <TabsContent value="clients">
          <div className="text-center py-10 text-muted-foreground">
            Relatórios de clientes em breve
          </div>
        </TabsContent>
        
        <TabsContent value="finances">
          <div className="text-center py-10 text-muted-foreground">
            Relatórios financeiros em breve
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DashboardReports;
