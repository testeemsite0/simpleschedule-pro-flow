
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import WebhookManager from '@/components/admin/WebhookManager';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminWebhooks = () => {
  const { loading, hasAccess, AccessDeniedComponent } = useAdminAccess();

  if (loading) {
    return (
      <DashboardLayout title="Gerenciar Webhooks">
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
    <DashboardLayout title="Gerenciar Webhooks">
      <WebhookManager />
    </DashboardLayout>
  );
};

export default AdminWebhooks;
