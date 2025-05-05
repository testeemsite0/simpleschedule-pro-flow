
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const DashboardPreferences = () => {
  return (
    <DashboardLayout title="Preferências">
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Funcionalidade em desenvolvimento</AlertTitle>
          <AlertDescription>
            A seção de preferências está em desenvolvimento e estará disponível em breve.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Preferências do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nesta seção você poderá configurar suas preferências de notificação, aparência e outras
              configurações do sistema. Esta funcionalidade estará disponível em uma atualização futura.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPreferences;
