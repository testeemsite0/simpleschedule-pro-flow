
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import AuditLogs from '@/components/admin/AuditLogs';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent } from '@/components/ui/card';

const AdminAudit = () => {
  const { isAdmin, loading } = useUserRoles();

  if (loading) {
    return (
      <DashboardLayout title="Logs de Auditoria">
        <div className="flex items-center justify-center py-8">
          <p>Verificando permissões...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout title="Acesso Negado">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Você não tem permissão para acessar esta área.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Logs de Auditoria">
      <AuditLogs />
    </DashboardLayout>
  );
};

export default AdminAudit;
