
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const DashboardClients = () => {
  return (
    <DashboardLayout title="Clientes">
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Funcionalidade em desenvolvimento</AlertTitle>
          <AlertDescription>
            A seção de gerenciamento de clientes está em desenvolvimento e estará disponível em breve.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nesta seção você poderá gerenciar seus clientes, visualizar histórico de agendamentos
              e acessar informações de contato. Esta funcionalidade estará disponível em uma atualização futura.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardClients;
