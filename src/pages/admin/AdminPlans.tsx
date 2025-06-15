
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import SubscriptionPlansManager from '@/components/admin/SubscriptionPlansManager';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminPlans = () => {
  const { loading, hasAccess, AccessDeniedComponent } = useAdminAccess();

  if (loading) {
    return (
      <DashboardLayout title="Planos de Assinatura">
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
    <DashboardLayout title="Planos de Assinatura">
      <SubscriptionPlansManager />
    </DashboardLayout>
  );
};

export default AdminPlans;
