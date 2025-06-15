
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import AuditLogs from '@/components/admin/AuditLogs';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminAudit = () => {
  const { loading, hasAccess, AccessDeniedComponent } = useAdminAccess();

  if (loading) {
    return (
      <DashboardLayout title="Logs de Auditoria">
        <div className="flex items-center justify-center py-8">
          <p>Verificando permissões...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  return (
    <DashboardLayout title="Logs de Auditoria">
      <AuditLogs />
    </DashboardLayout>
  );
};

export default AdminAudit;
